// tslint:disable:no-var-keyword
// tslint:disable:prefer-const
// tslint:disable:prefer-for-of
export default function modifyElements() {
  var args = Array.prototype.slice.call(arguments).filter((n: string) => {
    return !!n || n === '';
  });
  var style = args[args.length - 2];
  var value = args[args.length - 1];

  args.splice(-2);
  for (let i = 0; i < args.length; ++i) {
    for (let j = 0; j < args[i].length; ++j) {
      var elements = document.querySelectorAll(args[i][j]);
      for (var k = 0; k < elements.length; k++) {
        var element = elements[k];
        try {
          element.style.setProperty(style, value, 'important');
        } catch (error) {
          element.setAttribute('style', element.style.cssText + style + ':' + value + '!important;');
        }
      }
    }
  }
}
