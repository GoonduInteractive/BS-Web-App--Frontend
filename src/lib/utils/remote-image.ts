/**
 * Whether an image is a full URL from the game backend's storage (an avatar,
 * a product shot) rather than one of the site's own files. next/image draws
 * those `unoptimized`: the storage host isn't one next.config lists, and the
 * API serves them already sized.
 */
export function isRemoteImage(src: string): boolean {
  return /^https?:\/\//.test(src);
}
