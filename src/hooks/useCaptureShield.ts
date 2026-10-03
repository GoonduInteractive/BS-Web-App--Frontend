"use client";

import { useEffect, useState } from "react";

/**
 * Covers the comic pages whenever they are likely being captured, and is
 * true while they should stay covered.
 *
 * A WEB PAGE CANNOT BLOCK SCREENSHOTS OR SCREEN RECORDING. The operating
 * system captures the screen below the browser, and no browser API stops it
 * (DRM exists for video only). This is deterrence, not protection:
 *
 * - The window losing focus or the tab being hidden covers the pages. Opening
 *   Windows' Snipping Tool (Win+Shift+S), macOS's screenshot bar, or switching
 *   to a capture app all do this, so most quick captures get the cover.
 * - Print Screen, and macOS's Cmd+Shift+3/4/5, cover the pages for a moment,
 *   and the clipboard is emptied where the browser allows it. Often the OS has
 *   already taken the picture by the time the page hears the key.
 * - It does nothing about a recording started before the page opened, a
 *   second screen, or a phone camera.
 */
export function useCaptureShield(): boolean {
  const [away, setAway] = useState(false);
  const [flash, setFlash] = useState(false);

  useEffect(() => {
    let timer: number | undefined;
    const cover = () => {
      setFlash(true);
      window.clearTimeout(timer);
      timer = window.setTimeout(() => setFlash(false), 1500);
    };
    const emptyClipboard = () => {
      // Best effort: some browsers refuse without a user gesture, and that's fine.
      navigator.clipboard?.writeText("").catch(() => {});
    };

    const onBlur = () => setAway(true);
    const onFocus = () => setAway(false);
    const onVisibility = () => setAway(document.visibilityState === "hidden");
    const onKey = (event: KeyboardEvent) => {
      const macCapture = event.metaKey && event.shiftKey && ["3", "4", "5"].includes(event.key);
      if (event.key === "PrintScreen" || macCapture) {
        cover();
        emptyClipboard();
      }
      // Save and Print from the keyboard; printing is also hidden by CSS.
      if ((event.ctrlKey || event.metaKey) && ["s", "p"].includes(event.key.toLowerCase())) {
        event.preventDefault();
        cover();
      }
    };

    window.addEventListener("blur", onBlur);
    window.addEventListener("focus", onFocus);
    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("keydown", onKey);
    window.addEventListener("keyup", onKey);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("blur", onBlur);
      window.removeEventListener("focus", onFocus);
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("keyup", onKey);
    };
  }, []);

  return away || flash;
}
