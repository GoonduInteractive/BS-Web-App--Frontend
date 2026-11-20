import { z } from "zod";

import type { WallFilterList } from "@/lib/community/filter";

import { apiGet } from "./client";

/**
 * The community wall filter's list: product's rule pack, as the API serves it
 * at `GET /v1/moderation/rules` (public; live since 2026-11-20, the same
 * version-stamped JSON as product's `community-wall-filter.json`). The server's
 * own check reads the same list.
 *
 * NEVER IN THE BUNDLE. The guide: the server serves the latest list from one
 * endpoint, the client fetches it and keeps it by `version`, and a list update
 * needs no release. This browser keeps the last copy it saw, so the sheet has a
 * list the moment it opens; the API is asked for a newer one behind it.
 *
 * NOT WAITED ON FOR LONG. The API sleeps when idle and can take a minute to
 * wake; a first-ever post doesn't wait that long for the list: past `WAIT_MS`
 * the note goes unchecked and the server's check has the final word.
 */
const PATH = "/v1/moderation/rules";
const KEPT = "bs.wallFilter";
const WAIT_MS = 10_000;

const listSchema = z
  .object({
    version: z.string(),
    allowlist: z.array(z.string()),
    url_and_number_patterns: z.array(z.string()),
  })
  .catchall(z.union([z.string(), z.array(z.string())]));

function readKept(): WallFilterList | null {
  try {
    const raw = localStorage.getItem(KEPT);
    return raw ? listSchema.parse(JSON.parse(raw)) : null;
  } catch {
    return null;
  }
}

function keep(list: WallFilterList) {
  try {
    localStorage.setItem(KEPT, JSON.stringify(list));
  } catch {
    // Private window or full storage: the list is fetched again next time.
  }
}

function fetchList(): Promise<WallFilterList> {
  const late = new Promise<never>((_, reject) => setTimeout(() => reject(new Error(`${PATH}: no list within ${WAIT_MS}ms`)), WAIT_MS));
  return Promise.race([apiGet(PATH, listSchema), late]);
}

/**
 * The newest list this browser can have: the kept copy at once (a newer
 * version, if the source has one, is kept for next time), else the source.
 * Throws when there is neither; the sheet then posts unchecked and the
 * server's check has the final word.
 */
export async function getWallFilterList(): Promise<WallFilterList> {
  const kept = readKept();
  const fresh = fetchList().then((list) => {
    if (list.version !== kept?.version) keep(list);
    return list;
  });
  if (!kept) return fresh;
  fresh.catch(() => undefined);
  return kept;
}
