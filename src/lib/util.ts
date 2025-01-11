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

export function sortedByDate(entry: any) {
  return entry.sort((a, b) => extractDate(b.id).valueOf() - extractDate(a.id).valueOf());
}

export function buildChessMetaTags(round?: number, board?: number) {
  let metaTags: string[] = [];
  if (round != null) {
    metaTags.push("Round " + round!.toString());
  }
  if (board != null) {
    metaTags.push("Board " + board!.toString());
  }
  return metaTags;
}

export function createChessSlug(game: any) {
  return `${game.id.split("-").slice(0, 3).join("-")}_${game.data.white ?? ""}_${game.data.black ?? ""}`
    .toLowerCase()
    .replace(/\s+/g, "_")
    .split("/")[1];
}

export function createChessDescription(game: any) {
  return `Chess game played between ${game.data.white ?? "Bruno Mendes"} and ${game.data.black ?? "Bruno Mendes"}.`;
}

export function createChessTitle(game: any) {
  return `${game.data.white ?? "Bruno Mendes"} ${game.data.whiteElo ? `(${game.data.whiteElo})` : ""} 
    ${game.data.result} ${game.data.black ?? "Bruno Mendes"} ${game.data.blackElo ? `(${game.data.blackElo})` : ""}`;
}

export function capitalize(val: string) {
  return String(val).charAt(0).toUpperCase() + String(val).slice(1);
}

export function extractDate(path: string): Date {
  const regex = /(\d{4}-\d{2}-\d{2})/;
  const match = path.match(regex) ?? ['1980-01-01'];
  return new Date(match[0])
}

export function augmentTagsWithDate(tags: string[] | undefined, path: string) {
  return (tags ?? []).concat([extractDate(path).getFullYear().toString()]);
}

export function extractDescription(body: string) {
  let processed = body
    .split('\n\n')
    .filter(s => s.trimStart()[0] !== ">" && s.trimStart()[0] !== "#") // Exclude quotes and headers
    .map(s => s.replace(/[\*>]|\[\^[0-9]+\]/g, "")) // Clean markdown elements
    .join(' ') // Combine paragraphs
    .replace(/\n/g, '') // Remove newlines
    .replace(/ {2,}/g, ' / ') // Replace multiple spaces with slashes
    .replace(/[,:.!?] \//g, ' /') // Tidy up spacing around slashes
    .trim();

  const end_punct = ['?', '!', '.', '/']
  const punct = [',', ':', ')'].concat(end_punct)
  const min_length = 150
  const min_length_small = 100

  let par_count = 0
  for (let i = 0; i < processed.length; i++) {
    if (processed[i] == '(') {
      par_count += 1;
    } else if (processed[i] == ')') {
      par_count -= 1;
    }

    if (par_count == 0 && punct.includes(processed[i])) {
      if (i >= min_length || (end_punct.includes(processed[i]) && i >= min_length_small)) {
        processed = !['?', '!'].includes(processed[i])
          ? processed.substring(0, i).trimEnd() + '.'
          : processed.substring(0, i + 1);
        break;
      }
    }
  }

  return processed;
}
