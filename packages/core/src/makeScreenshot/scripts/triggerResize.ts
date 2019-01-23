// tslint:disable:no-var-keyword
// tslint:disable:prefer-const
// tslint:disable:only-arrow-functions
// tslint:disable:prefer-for-of
/**
 * trigger window.resize to relayout js components
 */
export default function triggerResize() {
  var evt = window.document.createEvent('UIEvents');
  evt.initUIEvent('resize', true, false, window, 0);
  window.dispatchEvent(evt);
}
