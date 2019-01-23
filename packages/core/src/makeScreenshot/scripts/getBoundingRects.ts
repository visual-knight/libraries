// tslint:disable:no-var-keyword
// tslint:disable:prefer-const
// tslint:disable:only-arrow-functions
// tslint:disable:prefer-for-of
export default function getBoundingRect(elems: HTMLElement[] | string) {
  if (typeof elems === 'string') {
    const boundingRects: any[] = [];
    var elements = window.document.querySelectorAll(elems);
    for (var i = 0; i < elements.length; i++) {
      var element = elements[i];
      const boundingRect = element.getBoundingClientRect();
      boundingRects.push({
        top: boundingRect.top,
        right: boundingRect.right,
        bottom: boundingRect.bottom,
        left: boundingRect.left
      });
    }
    return boundingRects;
  } else {
    return elems.map(function(elem) {
      const boundingRect = elem.getBoundingClientRect();
      return {
        top: boundingRect.top,
        right: boundingRect.right,
        bottom: boundingRect.bottom,
        left: boundingRect.left
      };
    });
  }
}
