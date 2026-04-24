import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Smoothly scroll to an element id (e.g. "#scan") with a fixed duration and
 * ease-in-out timing. Automatically accounts for a sticky header if present.
 */
export function smoothScrollToId(idOrHash: string, duration = 800) {
  if (!globalThis.document) return;
  const id = idOrHash.startsWith("#") ? idOrHash.slice(1) : idOrHash;
  if (id === "" || id === "top") {
    // Scroll to top
    smoothScrollTo(window.scrollY || window.pageYOffset, 0, duration);
    return;
  }

  const el = document.getElementById(id);
  if (!el) return;

  // Try to account for a sticky header if one exists
  const header = document.querySelector("header.sticky") || document.querySelector("header");
  const headerHeight = header ? (header as HTMLElement).offsetHeight : 0;

  const targetY = el.getBoundingClientRect().top + window.pageYOffset - headerHeight - 8;
  smoothScrollTo(window.scrollY || window.pageYOffset, Math.max(0, Math.floor(targetY)), duration);
}

function smoothScrollTo(startY: number, targetY: number, duration: number) {
  const diff = targetY - startY;
  if (diff === 0) return;
  let startTime: number | null = null;

  function easeInOutQuad(t: number) {
    return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
  }

  function step(ts: number) {
    if (startTime === null) startTime = ts;
    const elapsed = ts - startTime;
    const progress = Math.min(1, elapsed / duration);
    const eased = easeInOutQuad(progress);
    window.scrollTo(0, Math.floor(startY + diff * eased));
    if (elapsed < duration) requestAnimationFrame(step);
  }

  requestAnimationFrame(step);
}
