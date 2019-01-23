// tslint:disable:no-var-keyword
// tslint:disable:prefer-const
export default function virtualScroll(x: number, y: number, remove: boolean) {
  var w = x === 0 ? 0 : -1 * x;
  var h = y === 0 ? 0 : -1 * y;

  var translate = remove ? 'none' : 'translate(' + w + 'px,' + h + 'px)';
  var html = document.documentElement as HTMLElement;
  var style = html.style as any;

  style.webkitTransform = translate;
  style.mozTransform = translate;
  style.msTransform = translate;
  style.oTransform = translate;
  style.transform = translate;
}
