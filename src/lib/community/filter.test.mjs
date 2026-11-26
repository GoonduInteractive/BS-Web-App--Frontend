/**
 * The community wall filter against product's list. `npm run test:filter`.
 *
 * GUIDE is the guide's own test table, word for word; READINGS are the cases
 * behind the choices noted at the top of `filter.ts`. Shared with the backend
 * so the server check passes the same table.
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

import { checkNote, compileWallFilter } from "./filter.ts";

// Product's v1.0.3 as delivered: a fixed list, so the table tests the engine, not whatever the API serves today.
const list = JSON.parse(readFileSync(new URL("./fixtures/community-wall-filter.json", import.meta.url), "utf8"));
const filter = compileWallFilter(list);

/** [note, the warning it should get, or null to pass] */
const GUIDE = [
  ["This class is fire", null],
  ["F*ck this boss fight", "profanity"],
  ["fuuuuuck", "profanity"],
  ["f u c k", "profanity"],
  ["Wèrè ni ẹ", "profanity"],
  ["Igbo kwenu! Enugu players stand up", null],
  ["Who get loud make we smoke", "drugs"],
  ["The chief priest's juju in chapter one is mad", null],
  ["I go use juju finish you for your village", "violence_threats"],
  ["Someone hacked my account, help", null],
  ["Free skins generator, DM me", "scam_fraud"],
  ["Check beyondservicegame.com for the new comic", null],
  ["Join my group: chat.whatsapp.com/abc", "contact"],
  ["Call me on zero eight zero one two three four five six seven eight", "contact"],
  ["Obi is my favourite character", null],
  ["Obi for president 2027", "political"],
  ["God abeg make I top the leaderboard this week", null],
  ["Inshallah I win this tournament", "religious"],
  ["I'm 16 and I love this game", "underage"],
  ["Beyond Service clears Free Fire anyday", "competitor_brands"],
  ["Cum must not block cucumber", "sexual_content"],
  ["I love cucumber", null],
];

const READINGS = [
  ["F*ck!", "profanity"],
  ["sh1t!", "profanity"],
  ["f.u.c.k", "profanity"],
  ["fuсk", "profanity"], // Cyrillic с
  ["fu​ck", "profanity"],
  ["fvck", "profanity"],
  ["phuck", "profanity"],
  ["bitches everywhere", "profanity"],
  ["pls dmme", "contact"],
  ["shutup", "profanity"],
  ["I’m 16 and I love this game", "underage"],
  ["isn't me who lost", null],
  ["I lost all my xp", null],
  ["Plug in your headphones for the soundtrack", null],
  ["Follow @goondugames for updates", null],
  ["@goondugamesfake is giving away seeds", "contact"],
  ["beyondservicegame.com.evil.xyz", "contact"],
  ["I want to die", "self_harm"],
  ["kill myself and fuck it", "self_harm"],
  // Stretched letters in a phrase that has a real double letter of its own.
  ["mkpuuuru mmiri dey sell", "drugs"],
  ["kiss my aaaass", "profanity"],
  // Stretching an ordinary word stays ordinary.
  ["sooooo good, I loooove this game", null],
  // A misspelling isn't the entry: the list has "mkpuru mmiri" (the human's test, 2026-11-20).
  ["mmpuru mmiri", null],
];

for (const [note, rule] of [...GUIDE, ...READINGS]) {
  test(`${JSON.stringify(note)} → ${rule ?? "pass"}`, () => {
    const result = checkNote(filter, note);
    assert.equal(result.rule, rule, `hits: ${JSON.stringify(result.hits)}`);
  });
}

test("a blocked note lists what it broke, for the server and the admin", () => {
  const { hits } = checkNote(filter, "Who get loud make we smoke");
  assert.deepEqual(hits, [{ category: "drugs", entry: "loud + smoke" }]);
});
