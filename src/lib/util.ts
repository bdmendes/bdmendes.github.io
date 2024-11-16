import { GENERATE_SLUG_FROM_TITLE } from '../config'

export function createSlug(title: string, staticSlug: string = title) {
  return (
    !GENERATE_SLUG_FROM_TITLE ? staticSlug : title
      .trim()
      .toLowerCase()
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
  return body
    .split('\n\n')[0]
    .replaceAll('\n', '')
    .replace(/[^\w\s\-,.!?;:()"'`]/g, '')
    .replaceAll('  ', ' / ');
}