// import debug from 'debug';

import { IBrowserDriverContext } from '../browser-context.interface';
import { FullpageScreenshotStrategy } from './strategies/FullpageScreenshotStrategy';
import { MergeScreenshotStrategy } from './strategies/MergeScreenshotStrategy';
import { TrimAndMergeScreenshotStrategy } from './strategies/TrimAndMergeScreenshotStrategy';

const regexPhantomjs = /phantomjs/i;

// const log = debug("visual-knight-core:ScreenshotStrategyManager");

function matchBrowserName(browser: IBrowserDriverContext, regex: RegExp) {
  return (
    browser.desiredCapabilities &&
    browser.desiredCapabilities.browserName &&
    regex.test(browser.desiredCapabilities.browserName)
  );
}

function isPhantomjs(browser: IBrowserDriverContext) {
  return matchBrowserName(browser, regexPhantomjs);
}

export class ScreenshotStrategyManager {
  public static getStrategy(browser: IBrowserDriverContext, screenDimensions: any) {
    if (isPhantomjs(browser)) {
      // log("use full page strategy");
      return new FullpageScreenshotStrategy(screenDimensions);
    }

    const { isIOS } = browser;
    if (isIOS) {
      // log("use iOS Trim and Merge viewport strategy");
      return new TrimAndMergeScreenshotStrategy(screenDimensions);
    }

    // log("use merge viewport strategy");
    return new MergeScreenshotStrategy(screenDimensions);
  }
}
