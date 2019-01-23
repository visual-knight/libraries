// tslint:disable:no-var-keyword
// tslint:disable:prefer-const
export default function scrollbars(enabled: boolean) {
  var docElement = document.documentElement as HTMLElement;
  if (enabled) {
    docElement.style.overflow = '';
  } else {
    docElement.style.overflow = 'hidden';
  }
}
