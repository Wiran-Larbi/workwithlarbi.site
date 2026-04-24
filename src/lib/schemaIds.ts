/** Stable @id values for JSON-LD graph (Person / WebSite). */
export function schemaPersonId(siteOrigin: string): string {
  const base = siteOrigin.replace(/\/$/, '');
  return `${base}/#person`;
}

export function schemaWebsiteId(siteOrigin: string): string {
  const base = siteOrigin.replace(/\/$/, '');
  return `${base}/#website`;
}
