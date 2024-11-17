import { GENERATE_SLUG_FROM_TITLE } from '../config'

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
  let processed = body
    .split('\n\n')[0]
    .replace(/[\*>]|\[\^[0-9]+\]/g, "")
    .replaceAll('\n', '')
    .replaceAll('  ', ' / ')
    .replaceAll(/[,:.!?] \//g, ' /')
    .trim();

  const punct = [',', '?', '!', '.', ':', '/']
  const max_size = 120
  const max_size_small = 80
  const max_puncts = 4
  let seen_puncts = 0;
  for (let i = 0; i < processed.length; i++) {
    if (punct.includes(processed[i])) {
      seen_puncts += 1;
      if (i >= max_size || (processed[i] == '.' && i >= max_size_small) || seen_puncts >= max_puncts) {
        processed = processed.substring(0, i).trimEnd() + '.';
        break;
      }
    }
  }

  processed = processed.trimEnd();

  if (processed.endsWith('.')) {
    return processed;
  } else if (punct.includes(processed[processed.length - 1])) {
    return processed.substring(0, processed.length - 1).trimEnd() + '.';
  } else {
    return processed + '.';
  }
}