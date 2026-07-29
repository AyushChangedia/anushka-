import { cn } from "@/lib/utils";

/**
 * Generated hero art.
 *
 * Rather than shipping stock photography that rarely matches the dish, each
 * recipe gets a deterministic abstract composition derived from its `heroHue`
 * (which the model picks to evoke the food) and its title. Same recipe, same
 * art, every time — and no image requests, no layout shift, no licensing.
 */
export function RecipeHeroArt({
  hue,
  title,
  className,
  priority = false,
}: {
  hue: number;
  title: string;
  className?: string;
  priority?: boolean;
}) {
  // Derive stable blob placement from the title so two recipes sharing a hue
  // still look distinct.
  const seed = [...title].reduce((acc, char) => acc + char.charCodeAt(0), 0);

  // Both accent hues stay within a narrow band of the base. Drifting further
  // reads as a different ingredient entirely — a warm amber dish rendered with
  // a +60° partner turns olive, which looks like spoiled food rather than
  // caramelised onion.
  const hueWarm = (hue + 10 + (seed % 8)) % 360;
  const hueDeep = (hue - 12 - (seed % 6) + 360) % 360;

  const x1 = 22 + (seed % 34);
  const y1 = 20 + ((seed >> 2) % 30);
  const x2 = 58 + ((seed >> 3) % 28);
  const y2 = 55 + ((seed >> 4) % 26);

  return (
    <div
      className={cn("relative overflow-hidden bg-surface-muted", className)}
      style={{
        backgroundImage: `
          radial-gradient(circle at ${x1}% ${y1}%, hsl(${hueWarm} 92% 66% / 0.95), transparent 60%),
          radial-gradient(circle at ${x2}% ${y2}%, hsl(${hueDeep} 84% 46% / 0.9), transparent 58%),
          linear-gradient(145deg, hsl(${hue} 80% 56%), hsl(${hueDeep} 74% 36%))
        `,
      }}
      // The art carries no information the title does not already convey.
      role="presentation"
      aria-hidden
    >
      {/* Fine grain, so large flat areas do not band on wide gradients. Kept
          light — heavier noise desaturates the whole panel into mud. */}
      <div
        className="absolute inset-0 opacity-[0.07] mix-blend-overlay"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='140' height='140'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3'/%3E%3C/filter%3E%3Crect width='140' height='140' filter='url(%23n)'/%3E%3C/svg%3E\")",
        }}
      />
      {/* Bottom scrim so overlaid white text stays legible on pale hues. */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-transparent" />
      {priority && <span className="sr-only">{title}</span>}
    </div>
  );
}
