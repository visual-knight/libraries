// import debug from "debug";

import afterScreenshot from './afterScreenshot';
import beforeScreenshot from './beforeScreenshot';
import makeAreaScreenshot from './makeAreaScreenshot';

import { IBrowserDriverContext } from './browser-context.interface';
import { IMakeScreenshotOptions } from './makeScreenshot.interface';
import { getScreenDimensions } from './scripts/getScreenDimensions';
import { ScreenDimensions } from './utils/ScreenDimension';

// const log = debug("visual-knight-core:makeDocumentScreenshot");

export async function makeDocumentScreenshot(browser: IBrowserDriverContext, options: IMakeScreenshotOptions = {}) {
  // log("start document screenshot");

  // hide scrollbars, scroll to start, hide & remove elements, wait for render
  await beforeScreenshot(browser, options);

  // get screen dimisions to determine document height & width
  const screenDimensions = (await browser.executeScript(getScreenDimensions));
  const screenDimension = new ScreenDimensions(screenDimensions, browser);

  // make screenshot of area
  const base64Image = await makeAreaScreenshot(
    browser,
    0,
    0,
    screenDimension.getDocumentWidth(),
    screenDimension.getDocumentHeight()
  );

  // show scrollbars, show & add elements
  await afterScreenshot(browser, options);

  // log("end document screenshot");

  return base64Image;
}
