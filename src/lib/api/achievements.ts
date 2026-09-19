import type { Achievement } from "@/types/achievement";

/**
 * Achievements, behind a typed contract. The Competition frame's four, with the
 * emblems Design delivered as `earn-1` to `earn-4`. NO BACKEND: nothing here
 * knows whether a player has earned anything, and the cards do not claim to.
 */
const ACHIEVEMENTS: readonly Achievement[] = [
  {
    slug: "arena-conqueror",
    copyKey: "arenaConqueror",
    badge: { src: "/assets/competition/earn-1.png", width: 114, height: 129 },
  },
  {
    slug: "path-of-the-ascendant",
    copyKey: "pathOfTheAscendant",
    badge: { src: "/assets/competition/earn-2.png", width: 114, height: 139 },
  },
  {
    slug: "fall-of-the-mighty",
    copyKey: "fallOfTheMighty",
    badge: { src: "/assets/competition/earn-3.png", width: 114, height: 139 },
  },
  {
    slug: "master-of-chi",
    copyKey: "masterOfChi",
    badge: { src: "/assets/competition/earn-4.png", width: 114, height: 139 },
  },
];

export async function getAchievements(): Promise<readonly Achievement[]> {
  return ACHIEVEMENTS;
}
