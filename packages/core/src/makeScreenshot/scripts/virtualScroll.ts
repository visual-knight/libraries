export default function virtualScroll(x: number, y: number, remove: boolean) {
  const w = x === 0 ? 0 : -1 * x;
  const h = y === 0 ? 0 : -1 * y;

  const translate = remove ? 'none' : `translate(${w}px,${h}px)`;
  const html = document.documentElement as HTMLElement;
  const style = html.style as any;

  style.webkitTransform = translate;
  style.mozTransform = translate;
  style.msTransform = translate;
  style.oTransform = translate;
  style.transform = translate;
}
