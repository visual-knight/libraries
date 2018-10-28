export default function modifyElements() {
  const args = Array.prototype.slice.call(arguments).filter((n: string) => {
    return !!n || n === "";
  });
  const style = args[args.length - 2];
  const value = args[args.length - 1];

  args.splice(-2);
  // tslint:disable-next-line:prefer-for-of
  for (let i = 0; i < args.length; ++i) {
    // tslint:disable-next-line:prefer-for-of
    for (let j = 0; j < args[i].length; ++j) {
      const element = args[i][j];

      try {
        element.style.setProperty(style, value, "important");
      } catch (error) {
        element.setAttribute("style", element.style.cssText + style + ":" + value + "!important;");
      }
    }
  }
}
