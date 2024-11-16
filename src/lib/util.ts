import { GENERATE_SLUG_FROM_TITLE } from '../config'

export function createSlug(title: string, staticSlug: string = title) {
  return (
    !GENERATE_SLUG_FROM_TITLE ? staticSlug : title
      .trim()
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/\s+/g, '-')
      .replace(/[^\w-]/g, '')
      .replace(/^-+|-+$/g, '')
  )
}

export function extractDate(path: string) {
  // Regex to match the YYYY-MM-DD pattern
  const regex = /(\d{4}-\d{2}-\d{2})/;
  const match = path.match(regex) ?? ['1980-01-01'];
  return new Date(match[0])
}

export function extractDescription(body: string) {
  let processed = body
    .split('\n\n')[0]
    .split('.')[0]
    .replace(/\*/g, "")
    .replace(/\>/g, "")
    .replaceAll('\n', '')
    .replaceAll('  ', ' / ')
    .trim();

  if (processed.endsWith('/')) {
    processed = processed.substring(0, processed.length - 1);
  }

  for (let punct of [',', '?', '!', '.']) {
    const max = punct == ',' ? 4 : 2;
    if (processed.split(punct).length > max) {
      processed = processed.split(punct).slice(0, max).join(punct);
    }
  }

  processed = processed.trimEnd();

  if (processed.endsWith('?') || processed.endsWith('!')) {
    return processed;
  } else {
    return processed + '.';
  }
}