// import debug from "debug";

import afterScreenshot from "./afterScreenshot";
import beforeScreenshot from "./beforeScreenshot";
import makeAreaScreenshot from "./makeAreaScreenshot";

import getBoundingRects from "./scripts/getBoundingRects";
import groupBoundingRect from "./utils/groupBoundingRect";

// const log = debug("wdio-screenshot:makeElementScreenshot");

export default async function makeElementScreenshot(browser: any, elementSelector: string, options = {}) {
  // log("start element screenshot");

  // hide scrollbars, scroll to start, hide & remove elements, wait for render
  await beforeScreenshot(browser, options);

  // get bounding rect of elements
  const boundingRects = await browser.selectorExecute(elementSelector, getBoundingRects);
  const boundingRect = groupBoundingRect(boundingRects);

  // make screenshot of area
  const base64Image = await makeAreaScreenshot(
    browser,
    boundingRect.left,
    boundingRect.top,
    boundingRect.right,
    boundingRect.bottom,
  );

  // show scrollbars, show & add elements
  await afterScreenshot(browser, options);

  // log("end element screenshot");

  return base64Image;
}
