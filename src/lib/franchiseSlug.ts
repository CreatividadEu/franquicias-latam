export function slugifyFranchiseName(name: string): string {
  return name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function buildFranchiseSlug(name: string, id: string): string {
  const baseSlug = slugifyFranchiseName(name) || "franquicia";
  const idPrefix = id.slice(0, 8).toLowerCase();
  return `${baseSlug}-${idPrefix}`;
}

export function matchesFranchiseSlug(
  franchise: { id: string; name: string },
  requestedSlug: string
): boolean {
  const normalizedSlug = requestedSlug.trim().toLowerCase();
  return (
    buildFranchiseSlug(franchise.name, franchise.id) === normalizedSlug ||
    slugifyFranchiseName(franchise.name) === normalizedSlug
  );
}
