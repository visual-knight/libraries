export default function scrollbars(enabled: boolean) {
  const docElement = document.documentElement as HTMLElement;
  if (enabled) {
    docElement.style.overflow = "";
  } else {
    docElement.style.overflow = "hidden";
  }
}
