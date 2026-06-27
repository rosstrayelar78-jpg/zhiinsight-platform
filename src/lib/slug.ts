export function createSlug(input: string, fallback = "content") {
  const ascii = input
    .toLowerCase()
    .trim()
    .replace(/['"]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  if (ascii) return ascii.slice(0, 120);

  const encoded = Buffer.from(input).toString("hex").slice(0, 32);
  return `${fallback}-${encoded || Date.now()}`;
}

