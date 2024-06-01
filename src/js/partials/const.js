export const speed = 1000;
export const media = {
  TABLET: 768,
  DESKTOP: 1366,
};
export const isMobile = window.matchMedia(
  `(max-width: ${media.TABLET - 1}px)`
).matches;
export const isTablet = window.matchMedia(
  `(min-width: ${media.TABLET}px)`
).matches;
export const isDesktop = window.matchMedia(
  `(min-width: ${media.DESKTOP}px)`
).matches;
export const isTouch = window.matchMedia(
  `(max-width: ${media.DESKTOP - 1}px)`
).matches;
