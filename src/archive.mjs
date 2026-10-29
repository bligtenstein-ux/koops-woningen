// Houdt per site een eigen archief bij (data/<site>.json). Zo blijven verhuurde en verkochte
// woningen zichtbaar, ook als de bron ze ooit niet meer toont.
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import path from 'node:path';

export async function readArchive(file) {
  try {
    return JSON.parse(await readFile(file, 'utf8'));
  } catch {
    return { listings: {} };
  }
}

export async function writeArchive(file, archive) {
  await mkdir(path.dirname(file), { recursive: true });
  await writeFile(file, JSON.stringify(archive, null, 1) + '\n');
}

export function merge(archive, incoming, today) {
  const prevActive = Object.values(archive.listings).filter((l) => l.active && !l.withdrawn).length;
  const seen = new Set();
  for (const l of incoming) {
    seen.add(l.id);
    const old = archive.listings[l.id];
    const merged = { ...old, ...l, firstSeen: old?.firstSeen || today, lastSeen: today, withdrawn: false };
    // Doorlooptijd zelf meten: eerste dag dat we een woning die we eerder vrij zagen onder voorbehoud of afgerond zien.
    const dealNow = l.status === 5 || l.status === 2;
    const wasFree = old && [0, 1, 6, 7].includes(old.status) && !old.withdrawn;
    if (dealNow && wasFree && !old.dealOn) merged.dealOn = today;
    if ([0, 1, 6, 7].includes(l.status)) delete merged.dealOn; // deal ging niet door

    if (!l.active) {
      // Datum van verhuur/verkoop: eerste keer dat wij hem afgerond zagen, of de wijzigingsdatum in de bron.
      merged.closedOn = old?.closedOn || (old && old.active ? today : l.updated || today);
    } else {
      delete merged.closedOn;
    }
    archive.listings[l.id] = merged;
  }
  // Woningen die uit de bron verdwijnen: afgeronde houden we in het archief, actieve markeren we als ingetrokken.
  for (const [id, l] of Object.entries(archive.listings)) {
    if (seen.has(id)) continue;
    if (l.active) {
      l.active = false;
      l.withdrawn = true;
      l.withdrawnOn = today;
    }
  }
  const nowActive = incoming.filter((l) => l.active).length;
  return { prevActive, nowActive };
}
