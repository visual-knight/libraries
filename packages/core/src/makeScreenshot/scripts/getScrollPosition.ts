export default function getScrollPosition() {
  const docElement = document.documentElement as HTMLElement;
  if (typeof window.pageYOffset !== "undefined") {
    return [window.pageXOffset, window.pageYOffset];
  } else if (typeof docElement.scrollTop !== "undefined" && docElement.scrollTop > 0) {
    return [docElement.scrollLeft, docElement.scrollTop];
  } else if (typeof document.body.scrollTop !== "undefined") {
    return [document.body.scrollLeft, document.body.scrollTop];
  }
  return [0, 0];
}
