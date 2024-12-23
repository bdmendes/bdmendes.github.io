export function createSlug(title: string) {
  return title
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, '-')
    .replace(/[^\w-]/g, '')
    .replace(/^-+|-+$/g, '')
}

export function extractDate(path: string) {
  const regex = /(\d{4}-\d{2}-\d{2})/;
  const match = path.match(regex) ?? ['1980-01-01'];
  return new Date(match[0])
}

export function extractDescription(body: string) {
  let processed = (body
    .split('\n\n')
    .filter(s => s.trimStart()[0] !== ">" && s.trimStart()[0] !== "#") // Exclude quotes and headers
    .map(s => s.replace(/[\*>]|\[\^[0-9]+\]/g, "")) // Clean markdown elements
    .join(' ') // Combine paragraphs
    .replace(/\n/g, '') // Remove newlines
    .replace(/ {2,}/g, ' / ') // Replace multiple spaces with slashes
    .replace(/[,:.!?] \//g, ' /') // Tidy up spacing around slashes
    .trim());

  const punct = [',', '?', '!', '.', ':', '/']
  const min_length = 140
  const min_length_small = 100

  for (let i = 0; i < processed.length; i++) {
    if (punct.includes(processed[i])) {
      if (i >= min_length || (processed[i] == '.' && i >= min_length_small)) {
        processed = !['?', '!'].includes(processed[i])
          ? processed.substring(0, i).trimEnd() + '.'
          : processed.substring(0, i + 1);
        break;
      }
    }
  }

  return processed;
}
