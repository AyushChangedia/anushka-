import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { getDb } from "@/lib/db";

/** POST /api/register — create an email + password account. */

export const runtime = "nodejs";

const registerSchema = z.object({
  name: z.string().min(1).max(80).optional(),
  email: z.string().email(),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(200),
});

export async function POST(request: Request) {
  const db = getDb();
  if (!db) {
    return NextResponse.json(
      { error: "Accounts are not available in this deployment." },
      { status: 501 },
    );
  }

  const parsed = registerSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid details." },
      { status: 400 },
    );
  }

  const { name, email, password } = parsed.data;
  const normalizedEmail = email.toLowerCase();

  const existing = await db.user.findUnique({ where: { email: normalizedEmail } });
  if (existing) {
    // Deliberately vague: confirming which addresses are registered would let
    // anyone enumerate the user list.
    return NextResponse.json(
      { error: "That email cannot be used to register." },
      { status: 409 },
    );
  }

  await db.user.create({
    data: {
      email: normalizedEmail,
      name: name ?? null,
      passwordHash: await bcrypt.hash(password, 12),
    },
  });

  return NextResponse.json({ ok: true }, { status: 201 });
}
