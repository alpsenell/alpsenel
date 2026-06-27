/**
 * Prepares the raw content of content/about.md for storage as the assistant's
 * `facts`. Strips HTML comments (so you can keep editing notes in the file that
 * the AI never sees), collapses runs of blank lines, and trims the ends.
 */
export function prepareAbout(raw: string): string {
  return raw
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}
