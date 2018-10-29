import * as debug from 'debug';

import afterScreenshot from './afterScreenshot';
import beforeScreenshot from './beforeScreenshot';
import makeAreaScreenshot from './makeAreaScreenshot';

import { IBrowserDriverContext } from './browser-context.interface';
import { IMakeScreenshotOptions } from './makeScreenshot.interface';
import getBoundingRects from './scripts/getBoundingRects';
import groupBoundingRect from './utils/groupBoundingRect';

const log = debug('visual-knight-core:makeElementScreenshot');

export async function makeElementScreenshot(
  browser: IBrowserDriverContext,
  elementSelector: string,
  options: IMakeScreenshotOptions = {}
) {
  log('start element screenshot');

  // hide scrollbars, scroll to start, hide & remove elements, wait for render
  await beforeScreenshot(browser, options);

  // get bounding rect of elements
  const boundingRects = await browser.selectorExecuteScript!(elementSelector, getBoundingRects);
  const boundingRect = groupBoundingRect(boundingRects);

  // make screenshot of area
  const base64Image = await makeAreaScreenshot(
    browser,
    boundingRect.left,
    boundingRect.top,
    boundingRect.right,
    boundingRect.bottom
  );

  // show scrollbars, show & add elements
  await afterScreenshot(browser, options);

  log('end element screenshot');

  return base64Image;
}
