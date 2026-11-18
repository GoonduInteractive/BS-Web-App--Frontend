import axios from "axios";
import { z } from "zod";

import type { WallFilterList } from "@/lib/community/filter";

/**
 * The community wall filter's list, product's `community-wall-filter.json`.
 *
 * NEVER IN THE BUNDLE. The guide: the server serves the latest list from one
 * endpoint, the client fetches it and keeps it by `version`, and a list update
 * needs no release. This browser keeps the last copy it saw, so the sheet has a
 * list the moment it opens; the source is asked for a newer one behind it.
 *
 * THE ENDPOINT DOESN'T EXIST YET (not in the API spec as of 2026-11-18), so
 * the source is the file as product delivered it, served from `public/`. When
 * the backend's endpoint lands, `fetchList` reads it through `apiGet` instead
 * and the copy in `public/` goes. FLAGGED.
 */
const SOURCE = "/community-wall-filter.json";
const KEPT = "bs.wallFilter";

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

async function fetchList(): Promise<WallFilterList> {
  const { data } = await axios.get<unknown>(SOURCE, { timeout: 10_000 });
  return listSchema.parse(data);
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
