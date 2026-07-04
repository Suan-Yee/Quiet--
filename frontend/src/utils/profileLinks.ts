export function getAuthorSlug(name: string) {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

export function getAuthorProfilePath(name: string) {
  return `/profile/${getAuthorSlug(name)}`
}
