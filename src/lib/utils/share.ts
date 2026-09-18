/**
 * Share endpoints, deliberately narrow.
 *
 * Plain URLs to each service's public share page carrying the current address
 * and nothing else — no SDK, no pixel, no third-party script, so nothing loads
 * that could watch the reader. Used by the comic reader's bar and by the SHARE
 * THIS COMIC block under the pages, so the two cannot drift apart.
 *
 * Reads `window.location` at call time, because the pages that use this are
 * prerendered and there is no request URL at build.
 */
export type ShareNetwork = "facebook" | "whatsapp" | "x";

export function shareUrl(network: ShareNetwork, title: string): string {
  const url = encodeURIComponent(window.location.href);
  const text = encodeURIComponent(title);
  switch (network) {
    case "facebook":
      return `https://www.facebook.com/sharer/sharer.php?u=${url}`;
    case "whatsapp":
      return `https://api.whatsapp.com/send?text=${text}%20${url}`;
    case "x":
      return `https://x.com/intent/post?text=${text}&url=${url}`;
  }
}

export function openShare(network: ShareNetwork, title: string) {
  window.open(shareUrl(network, title), "_blank", "noopener,noreferrer");
}
