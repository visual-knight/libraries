const Helper = codecept_helper;
import {
  afterScreenshot,
  Base64,
  beforeScreenshot,
  IBrowserDriverContext,
  makeDocumentScreenshot,
  makeElementScreenshot,
  VisualKnightCore
} from '@visual-knight/core';
import * as wdioScreenshot from 'wdio-screenshot';
import {
  CODECEPTJS_HELPER,
  ICompareScreenshotOptions,
  ICompareScreenshotOptionsUser,
  IProcessCodeceptJsOptions
} from './codeceptjs.interfaces';

class VisualKnight extends Helper {
  private visualKnightCore: VisualKnightCore;
  private helpers: any;

  constructor(private config: IProcessCodeceptJsOptions) {
    super(config);

    this._validateConfig(config);
    this.visualKnightCore = new VisualKnightCore(config);
  }

  public _validateConfig(config: IProcessCodeceptJsOptions) {
    if (!config.project && !config.key && !config.useHelper) {
      throw new Error(`
        Visual Knight requires a project and a key to be set. Also you need to define which helper you are using.
        Check your codeceptjs config file to ensure these are set properly
          {
            "helpers": {
              "VisualKnight": {
                "key": "YOUR_KEY",
                "project": "YOUR_PROJECT",
                "useHelper": "Puppeteer"
              }
            }
          }
      `);
    }

    return config;
  }

  /**
   * Hook executed before each test.
   */
  public _before() {
    if (this.config.useHelper === CODECEPTJS_HELPER.WebdrvierIO) {
      wdioScreenshot.init(this.helpers[this.config.useHelper].browser, this.config);
    }
  }

  public async compareFullpageScreenshot(testName: string, options: ICompareScreenshotOptionsUser) {
    return this.compareScreenshot(testName, options);
  }

  public async compareViewportScreenshot(testName: string, options: ICompareScreenshotOptionsUser) {
    return this.compareScreenshot(testName, {
      ...options,
      viewport: true
    });
  }

  public async compareElementScreenshot(
    elementSelector: string,
    testName: string,
    options: ICompareScreenshotOptionsUser
  ) {
    return this.compareScreenshot(testName, {
      ...options,
      element: elementSelector
    });
  }

  private async compareScreenshot(testName: string, options: ICompareScreenshotOptions = {}) {
    let screenshot;
    const helper = this.helpers[this.config.useHelper];

    const browserContext: IBrowserDriverContext = {
      executeScript: helper.executeScript.bind(helper),
      selectorExecuteScript: async (selector, script, ...args) => helper.executeScript(script, selector, ...args),
      desiredCapabilities: helper.desiredCapabilities,
      pause: async time => helper.wait(time / 1000),
      screenshot: () => {
        throw new Error('implement me');
      }
    };

    switch (this.config.useHelper) {
      case CODECEPTJS_HELPER.WebdrvierIO:
        screenshot = await this.webdriverIOMakeScreenshot(browserContext, options);
        break;

      case CODECEPTJS_HELPER.Protractor:
        screenshot = await this.protractorMakeScreenshot(browserContext, options);
        break;

      case CODECEPTJS_HELPER.Nightmare:
        screenshot = await this.nightmareMakeScreenshot(browserContext, options);
        break;

      case CODECEPTJS_HELPER.Puppeteer:
        this.visualKnightCore.options.browserName = 'Chrome';
        this.visualKnightCore.options.deviceName = 'Puppeteer';
        screenshot = await this.puppeteerMakeScreenshot(browserContext, options);
        break;

      default:
        throw new Error('Unkown Helper configured');
    }

    return this.visualKnightCore.processScreenshot(testName, screenshot, options.additional);
  }

  private async protractorMakeScreenshot(
    browserContext: IBrowserDriverContext,
    options: ICompareScreenshotOptions
  ): Promise<Base64> {
    const browser = this.helpers[this.config.useHelper].browser;
    browserContext.screenshot = browser.takeScreenshot;

    if (options.viewport) {
      await beforeScreenshot(browserContext, options);
      const screenshot = await browser.takeScreenshot();
      await afterScreenshot(browserContext, options);
      return screenshot;
    }
    if (options.element) {
      return makeElementScreenshot(browserContext, options.element);
    }
    return makeDocumentScreenshot(browserContext, {
      hide: options.hide,
      remove: options.remove
    });
  }

  private async puppeteerMakeScreenshot(
    browserContext: IBrowserDriverContext,
    options: ICompareScreenshotOptions
  ): Promise<Base64> {
    const page = this.helpers[this.config.useHelper].page;

    await beforeScreenshot(browserContext, options);
    let screenshot;
    if (options.viewport) {
      screenshot = await page.screenshot({ encoding: 'base64' });
    }
    if (options.element) {
      const element = await page.$(options.element);
      screenshot = await element.screenshot({ encoding: 'base64' });
    }
    screenshot = await page.screenshot({
      fullPage: true,
      encoding: 'base64'
    });

    await afterScreenshot(browserContext, options);
    return screenshot;
  }

  private async webdriverIOMakeScreenshot(browserContext: IBrowserDriverContext, options: ICompareScreenshotOptions) {
    const browser = this.helpers[this.config.useHelper].browser;
    browserContext.screenshot = async () => {
      return (await browser.screenshot()).value;
    };

    if (options.viewport) {
      await beforeScreenshot(browserContext, options);
      const screenshot = (await browser.screenshot()).value;
      await afterScreenshot(browserContext, options);
      return screenshot;
    }
    if (options.element) {
      return makeElementScreenshot(browserContext, options.element);
    }
    return makeDocumentScreenshot(browserContext, {
      hide: options.hide,
      remove: options.remove
    });
  }

  private async nightmareMakeScreenshot(browserContext: IBrowserDriverContext, options: ICompareScreenshotOptions) {
    const browser = this.helpers[this.config.useHelper].browser;
    browserContext.screenshot = async () => {
      return (await browser.screenshot()).toString('base64');
    };

    if (options.viewport) {
      await beforeScreenshot(browserContext, options);
      const screenshot = (await browser.screenshot()).toString('base64');
      await afterScreenshot(browserContext, options);
      return screenshot;
    }
    if (options.element) {
      return makeElementScreenshot(browserContext, options.element);
    }
    return makeDocumentScreenshot(browserContext, {
      hide: options.hide,
      remove: options.remove
    });
  }
}

export = VisualKnight;
