# Recipe Maker AI

Enter the ingredients sitting in your kitchen and get recipes you can cook right
now — ranked by how much of each one you already have, with anything missing
called out up front.

Built with Next.js 15, React 19, TypeScript, Tailwind CSS v4, and Claude.

---

## Quick start

```bash
npm install
cp .env.example .env.local     # optional — see below
npm run dev
```

Open https://anushka-plum.vercel.app/

**It works with zero configuration.** With no environment variables set, the app
serves a hand-authored corpus of 10 complete recipes, ranked against whatever
ingredients you enter. Pantry, saved recipes and shopping list live in local
storage. Every screen, filter and interaction is explorable straight away.

Each environment variable turns on one additional capability:

| Variable | Unlocks | Without it |
|---|---|---|
| `ANTHROPIC_API_KEY` | Claude writes recipes for your exact ingredients | Sample corpus, ranked against your pantry |
| `DATABASE_URL` | Durable recipe URLs, accounts, cross-device sync | Local storage only |
| `AUTH_SECRET` + a provider | Sign-in | Guest mode (fully functional) |
| `NEXT_PUBLIC_SITE_URL` | Correct canonical URLs, OG tags, sitemap | Defaults to `localhost:3000` |

See [`.env.example`](.env.example) for the full annotated list.

---

## How it works

The interesting design decision is the split between what the model does and
what the code does.

**Claude proposes. The code decides.**

Claude generates candidate recipes. It never decides what you have, what you are
missing, or what order results appear in — that is done afterwards, in
[`src/lib/recipes/matching.ts`](src/lib/recipes/matching.ts), by deterministic
code. This matters because:

- **Ranking is reproducible.** The same pantry produces the same order every
  time, which a model call cannot guarantee.
- **Ranking is testable.** It is pure functions over plain data, covered by the
  test suite.
- **Filtering is instant.** Toggling "Vegetarian" re-filters results already in
  memory. No second API call, no spinner.

```
ingredients ──▶ Claude (structured output) ──▶ recipes
                                                 │
      pantry ──────────────────────────────────▶ rankRecipes()
                                                 │
                                    ranked, annotated recipes ──▶ UI
```

### Structured outputs, not prompt-and-pray

The model is constrained to a JSON Schema server-side via
`output_config.format` ([`src/lib/ai/schema.ts`](src/lib/ai/schema.ts)). It
physically cannot return a malformed recipe, so there is no JSON repair, no
retry loop, and no "please respond with valid JSON" in the prompt. The response
is then validated with Zod, which catches values that are structurally correct
but semantically wrong (400 servings, an empty steps array).

The request uses adaptive thinking so the model can reason about ingredient
coverage and recipe variety before committing, and streams so a large batch
never hits an HTTP timeout. The system prompt is byte-stable across requests and
carries a cache breakpoint, so every generation after the first reads it from
cache rather than re-billing it.

### Ingredient matching

Free-text ingredients are normalised before comparison — quantities, units,
preparation notes and grade adjectives are stripped, plurals are folded, and
regional synonyms are mapped to one token:

```
"2 large Roma Tomatoes, finely diced"  ──▶  "roma tomato"  ──▶ matches pantry "Tomatoes"
"1 tbsp extra virgin olive oil"        ──▶  "olive oil"
"cilantro"                             ──▶  "coriander"
```

Pantry staples (salt, pepper, water, oil) are assumed present, because listing
"water" as a missing ingredient reads as a bug.

Ranking weights are chosen so the criteria cannot leapfrog each other: match
score is worth up to 100, each missing ingredient costs 12, and cooking time can
only ever shave off 10. A fully-stocked 90-minute recipe therefore still
outranks a 15-minute one you would have to shop for — which is the entire
premise of the product.

### Graceful degradation

Every external dependency is optional, and each one has a defined behaviour when
absent rather than an error screen:

- **No API key** → deterministic sample generator, with a visible notice.
- **Generation fails or is refused** → same fallback, clearly labelled.
- **No database** → local storage; recipe pages still resolve from the built-in
  corpus.
- **Not signed in** → everything works; saves just stay on the device.

---

## Features

**Ingredients** — type-ahead autocomplete, chips you can click to edit in place,
paste a comma-separated list, `Backspace` to remove the last one, voice input
where the browser supports it.

**Recipes** — 8 per batch, sorted by pantry match. Each card shows the match
percentage, total time, servings, difficulty and exactly what you are missing.

**Detail pages** — generated hero art, prep/cook/total times, ingredients ticked
against your pantry, 8–15 detailed steps with doneness cues, per-step timers,
1×/2×/4× quantity scaling, tips, substitutions, and per-serving nutrition.

**Filters and search** — diet, cuisine, meal type and max time, plus free-text
search. All client-side and instant.

**Collections** — favourites, recently viewed, and a shopping list that accepts
a recipe's missing ingredients in one click and can push them back into your
pantry once you have shopped.

**Everywhere** — light and dark mode, responsive from 360px up, print
stylesheet, keyboard navigable, screen-reader labelled, `prefers-reduced-motion`
respected.

---

## Project structure

```
src/
├── app/
│   ├── api/
│   │   ├── recipes/generate/   POST — generate + rank
│   │   ├── recipes/[id]/       GET  — single recipe
│   │   ├── saved/              CRUD — server-side favourites
│   │   ├── register/           POST — create an account
│   │   └── auth/[...nextauth]/ Auth.js handlers
│   ├── recipe/[id]/            Server-rendered detail page + JSON-LD
│   ├── saved/, shopping-list/, sign-in/
│   └── sitemap.ts, robots.ts, manifest.ts
├── components/
│   ├── ui/                     Primitives (button, badge, card, …)
│   └── recipe-detail/          Detail page composition
├── lib/
│   ├── ai/                     Claude client, prompts, JSON Schema, fallback
│   ├── recipes/                Matching, ranking, persistence
│   ├── schemas/                Zod schemas — the app's source of truth
│   └── data/                   Sample corpus, ingredient vocabulary
└── store/                      Zustand stores (pantry, collection)
```

The Zod schema in [`src/lib/schemas/recipe.ts`](src/lib/schemas/recipe.ts) is the
single source of truth: it defines the AI contract, validates the wire format,
and generates the TypeScript types used throughout.

---

## Database (optional)

```bash
# 1. Point DATABASE_URL at any Postgres instance
# 2. Create the tables
npm run db:push          # or: npm run db:migrate

# 3. Load the sample recipes
npm run db:seed
```

Schema: [`prisma/schema.prisma`](prisma/schema.prisma). Recipes are stored as
validated JSON — they are always read and written whole, so normalising steps
and ingredients into their own tables would buy nothing but joins. Frequently
filtered fields (`totalMinutes`, `cuisine`) are denormalised and indexed.

## Authentication (optional)

Sign-in appears once `AUTH_SECRET` and at least one provider are configured.
Email + password additionally needs `DATABASE_URL`. Providers are registered
conditionally, so a missing OAuth secret cannot crash the app at boot.

```bash
openssl rand -base64 32     # AUTH_SECRET
```

---

## Testing

```bash
npm test           # 56 tests
npm run typecheck
npm run lint
```

Tests cover the logic where a bug would be invisible — results would still
render, just wrong: ingredient normalisation and synonym folding, pantry
matching, the ranking weights, filter and search predicates, quantity
formatting, and schema validation of the sample corpus (including a check that
nothing tagged Vegan lists animal products).

---

## Deploying to Vercel

1. Push the repository and import it in Vercel.
2. Add whichever environment variables you want (all optional — it deploys and
   runs with none).
3. Deploy.

`npm run build` runs `prisma generate` first, so the client is always in sync
with the schema. `/api/recipes/generate` sets `maxDuration = 120` to allow for a
full streamed batch.

---

## Notes and limitations

- **Nutrition figures are estimates**, both in the sample corpus and from the
  model. They are labelled as such in the UI and should not be relied on for
  medical or dietary decisions.
- **Recipe hero images are generated gradients**, not photographs — deterministic
  from each recipe's hue and title. No image requests, no layout shift, no
  licensing, and they never show the wrong dish.
- **Voice input** uses the Web Speech API, which is unsupported in Firefox. The
  button is hidden rather than shown-and-broken where it is unavailable.
- **There is no root `loading.tsx`.** Adding one makes Next.js stream the
  response, which commits a `200` before `notFound()` can run — turning every
  unknown recipe URL into a soft 404 that search engines index. Loading states
  live inside the pages instead, which is also where users actually see them.

### Not implemented

Scoped out to keep what shipped fully working rather than half-building
everything: OCR ingredient detection from photos, barcode scanning, the AI meal
planner and weekly plans, recipe ratings and reviews, multi-language support,
and full offline PWA support (a manifest is included, but there is no service
worker).
