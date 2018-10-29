export default function getBoundingRect(elems: HTMLElement[] | string) {
  if (typeof elems === 'string') {
    const boundingRects: any[] = [];
    window.document.querySelectorAll<HTMLElement>(elems).forEach(elem => {
      const boundingRect = elem.getBoundingClientRect();
      boundingRects.push({
        top: boundingRect.top,
        right: boundingRect.right,
        bottom: boundingRect.bottom,
        left: boundingRect.left
      });
    });
    return boundingRects;
  } else {
    return elems.map(elem => {
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
