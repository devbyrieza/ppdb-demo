/**
 * Navigation Scroll Restoration Utility
 * Handles scroll position storage and restoration for smooth back navigation
 * Compatible with all major browsers including iOS Safari
 *
 * KEY BEHAVIOR:
 * - Refresh: Always scroll to top (fresh session)
 * - Back navigation: Restore exact scroll position
 * - New tab: Always scroll to top (fresh session)
 */

// Storage key prefix
const STORAGE_KEY_PREFIX = "scroll_position_";

// Session marker to detect if user navigated away
const SESSION_MARKER_KEY = "navigation_session_active";

// Section ID mapping for inner pages
export const SECTION_MAPPING: Record<string, string> = {
  "/tentang": "#about",
  "/program": "#program",
  "/fasilitas": "#fasilitas",
  "/kegiatan": "#kegiatan",
  "/galeri": "#gallery",
  "/kontak": "#kontak",
};

/**
 * Check if this is a back/forward navigation (not refresh)
 * Uses Performance Navigation API when available
 */
function isBackForwardNavigation(): boolean {
  // Check performance navigation API
  if (typeof performance !== "undefined" && performance.navigation) {
    // type 2 = back/forward navigation
    return performance.navigation.type === 2;
  }

  // Fallback: check if we have session marker from previous page
  return sessionStorage.getItem(SESSION_MARKER_KEY) === "true";
}

/**
 * Save scroll position for a specific page
 */
export function saveScrollPosition(pagePath: string, position: number): void {
  try {
    const key = `${STORAGE_KEY_PREFIX}${pagePath}`;
    sessionStorage.setItem(key, position.toString());
    // Mark that user navigated away from this page
    sessionStorage.setItem(SESSION_MARKER_KEY, "true");
  } catch (error) {
    console.warn("Failed to save scroll position:", error);
  }
}

/**
 * Get saved scroll position for a specific page
 */
export function getScrollPosition(pagePath: string): number | null {
  try {
    const key = `${STORAGE_KEY_PREFIX}${pagePath}`;
    const position = sessionStorage.getItem(key);
    return position ? parseInt(position, 10) : null;
  } catch (error) {
    console.warn("Failed to get scroll position:", error);
    return null;
  }
}

/**
 * Clear saved scroll position for a specific page
 */
export function clearScrollPosition(pagePath: string): void {
  try {
    const key = `${STORAGE_KEY_PREFIX}${pagePath}`;
    sessionStorage.removeItem(key);
  } catch (error) {
    console.warn("Failed to clear scroll position:", error);
  }
}

/**
 * Navigate to a detail page and save current scroll position
 */
export function navigateToDetail(
  detailPath: string,
  homeSectionId?: string,
): void {
  // Save current scroll position before navigation
  const currentScroll = window.scrollY;
  saveScrollPosition("/", currentScroll);

  // If we have a section ID, store it for restoration
  if (homeSectionId) {
    sessionStorage.setItem("return_section_id", homeSectionId);
  }

  // Navigate to detail page
  window.location.href = detailPath;
}

/**
 * Navigate back to homepage with scroll restoration
 */
export function navigateBackToHome(sectionId?: string): void {
  const homePath = "/";

  // Clear any existing return section
  sessionStorage.removeItem("return_section_id");

  // If section ID provided, navigate with hash
  if (sectionId) {
    // Save that we want to scroll to a section
    sessionStorage.setItem("scroll_to_section", sectionId);
    sessionStorage.setItem(SESSION_MARKER_KEY, "true");
    window.location.href = `/${sectionId}`;
  } else {
    // Try to restore previous position
    const savedPosition = getScrollPosition(homePath);
    if (savedPosition !== null) {
      sessionStorage.setItem("scroll_to_position", savedPosition.toString());
      sessionStorage.setItem(SESSION_MARKER_KEY, "true");
    }
    window.location.href = homePath;
  }
}

/**
 * Restore scroll position on page load
 * Should be called in useEffect on homepage
 *
 * CRITICAL: Only restore on back navigation, NOT on refresh
 */
export function restoreScrollPosition(): void {
  // Check if this is a back/forward navigation
  const isBackNav = isBackForwardNavigation();

  if (!isBackNav) {
    // This is a refresh or new session - clear all navigation state
    sessionStorage.removeItem("scroll_to_section");
    sessionStorage.removeItem("scroll_to_position");
    sessionStorage.removeItem("return_section_id");
    sessionStorage.removeItem(SESSION_MARKER_KEY);
    // Scroll to top (default behavior)
    window.scrollTo(0, 0);
    return;
  }

  // This is back navigation - restore position

  // Check if we have a section to scroll to
  const sectionId = sessionStorage.getItem("scroll_to_section");
  if (sectionId) {
    sessionStorage.removeItem("scroll_to_section");
    sessionStorage.removeItem(SESSION_MARKER_KEY);

    // Scroll to section after a short delay to ensure DOM is ready
    setTimeout(() => {
      const element = document.querySelector(sectionId);
      if (element) {
        const offset = 100; // Account for fixed navbar
        const elementPosition =
          element.getBoundingClientRect().top + window.scrollY;

        // Check for reduced motion preference
        const prefersReducedMotion = window.matchMedia(
          "(prefers-reduced-motion: reduce)",
        ).matches;
        if (prefersReducedMotion) {
          window.scrollTo(0, elementPosition - offset);
        } else {
          window.scrollTo({
            top: elementPosition - offset,
            behavior: "smooth",
          });
        }
      }
    }, 150);
    return;
  }

  // Check if we have a specific position to scroll to
  const savedPosition = sessionStorage.getItem("scroll_to_position");
  if (savedPosition) {
    sessionStorage.removeItem("scroll_to_position");
    sessionStorage.removeItem(SESSION_MARKER_KEY);
    const position = parseInt(savedPosition, 10);

    // Scroll after a short delay to ensure content is loaded
    setTimeout(() => {
      // Check for reduced motion preference
      const prefersReducedMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;
      if (prefersReducedMotion) {
        window.scrollTo(0, position);
      } else {
        window.scrollTo({
          top: position,
          behavior: "smooth",
        });
      }
    }, 150);
  }
}

/**
 * Get the return section ID (for inner pages to know where to return to)
 */
export function getReturnSectionId(): string | null {
  return sessionStorage.getItem("return_section_id");
}

/**
 * Clear return section ID
 */
export function clearReturnSectionId(): void {
  sessionStorage.removeItem("return_section_id");
}

/**
 * Handle smooth scroll to section (for navbar links)
 */
export function scrollToSection(sectionId: string, offset: number = 100): void {
  const element = document.querySelector(sectionId);
  if (element) {
    const elementPosition =
      element.getBoundingClientRect().top + window.scrollY;

    // Check for reduced motion preference
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (prefersReducedMotion) {
      window.scrollTo(0, elementPosition - offset);
    } else {
      window.scrollTo({
        top: elementPosition - offset,
        behavior: "smooth",
      });
    }
  }
}

/**
 * Scroll to top of page
 */
export function scrollToTop(): void {
  // Check for reduced motion preference
  const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;
  if (prefersReducedMotion) {
    window.scrollTo(0, 0);
  } else {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }
}
