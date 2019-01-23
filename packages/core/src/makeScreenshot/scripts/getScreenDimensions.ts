// tslint:disable:no-var-keyword
// tslint:disable:prefer-const
import { IScreenDimensionOptions } from '../utils/ScreenDimension';

export function getScreenDimensions(): IScreenDimensionOptions {
  var body = document.body;
  var html = document.documentElement as HTMLElement;

  return {
    window: {
      innerWidth: window.innerWidth,
      innerHeight: window.innerHeight,
      pixelRatio: typeof window.devicePixelRatio === 'undefined' ? 1 : window.devicePixelRatio,
      orientation: typeof window.orientation === 'undefined' ? 0 : Math.abs(window.orientation as number),
      screenWidth: window.screen.width,
      screenHeight: window.screen.height
    },
    body: {
      scrollHeight: body.scrollHeight,
      offsetHeight: body.offsetHeight
    },
    html: {
      clientWidth: html.clientWidth,
      scrollWidth: html.scrollWidth,
      clientHeight: html.clientHeight,
      scrollHeight: html.scrollHeight,
      offsetHeight: html.offsetHeight
    }
  };
}
