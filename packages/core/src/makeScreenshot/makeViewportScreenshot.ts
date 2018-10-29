import * as debug from 'debug';

import afterScreenshot from './afterScreenshot';
import beforeScreenshot from './beforeScreenshot';
import makeAreaScreenshot from './makeAreaScreenshot';

import { IBrowserDriverContext } from './browser-context.interface';
import { IMakeScreenshotOptions } from './makeScreenshot.interface';
import { getScreenDimensions } from './scripts/getScreenDimensions';
import getScrollPosition from './scripts/getScrollPosition';
import scroll from './scripts/scroll';
import { ScreenDimensions } from './utils/ScreenDimension';

const log = debug('visual-knight-core:makeViewportScreenshot');

// Note: function name must be async to signalize WebdriverIO that this function returns a promise
export async function makeViewportScreenshot(browser: IBrowserDriverContext, options: IMakeScreenshotOptions = {}) {
  log('start viewport screenshot');

  // get current scroll position
  const [startX, startY] = await browser.executeScript(getScrollPosition);

  // hide scrollbars, scroll to start, hide & remove elements, wait for render
  await beforeScreenshot(browser, options);

  // get screen dimisions to determine viewport height & width
  const screenDimensions = await browser.executeScript(getScreenDimensions);
  const screenDimension = new ScreenDimensions(screenDimensions, browser);

  // make screenshot of area
  const base64Image = await makeAreaScreenshot(
    browser,
    startX,
    startY,
    screenDimension.getViewportWidth(),
    screenDimension.getViewportHeight()
  );

  // show scrollbars, show & add elements
  await afterScreenshot(browser, options);

  // scroll back to original position
  await browser.executeScript(scroll, startX, startY);

  log('end viewport screenshot');

  return base64Image;
}
