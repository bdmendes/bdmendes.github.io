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
    .find(s => s.trimStart()[0] != ">" && s.trimStart()[0] != "#") ?? "")
    .replace(/[\*>]|\[\^[0-9]+\]/g, "")
    .replaceAll('\n', '')
    .replaceAll('  ', ' / ')
    .replaceAll(/[,:.!?] \//g, ' /')
    .trim();

  const punct = [',', '?', '!', '.', ':', '/']
  const max_size = 140
  const max_size_small = 80
  for (let i = 0; i < processed.length; i++) {
    if (punct.includes(processed[i])) {
      if (i >= max_size || (processed[i] == '.' && i >= max_size_small)) {
        processed = !['?', '!'].includes(processed[i]) ? processed.substring(0, i).trimEnd() + '.' : processed;
        break;
      }
    }
  }

  processed = processed.trimEnd();

  if (['?', '!', '.'].includes(processed[processed.length - 1])) {
    return processed;
  } else if (['/', ','].includes(processed[processed.length - 1])) {
    return processed.substring(0, processed.length - 1).trimEnd() + '.';
  } else {
    return processed + '.';
  }
}
