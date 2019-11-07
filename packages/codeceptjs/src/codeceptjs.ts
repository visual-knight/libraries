const Helper = codecept_helper;
import {
  afterScreenshot,
  Base64,
  beforeScreenshot,
  IBrowserDriverContext,
  IProcessScreenshotOptionsUser,
  makeDocumentScreenshot,
  makeElementScreenshot,
  VisualKnightCore
} from '@visual-knight/core';
import { unlink } from 'fs';
import { join } from 'path';
import { CODECEPTJS_HELPER, ICompareScreenshotOptions, ICompareScreenshotOptionsUser } from './codeceptjs.interfaces';

class VisualKnight extends Helper {
  private visualKnightCore: VisualKnightCore;
  private helpers: any;
  private helper: any;

  constructor(config: IProcessScreenshotOptionsUser) {
    super(config);

    this._validateConfig(config);
    this.visualKnightCore = new VisualKnightCore(config);
  }

  public _validateConfig(config: IProcessScreenshotOptionsUser) {
    if (!config.project && !config.key) {
      throw new Error(`
        Visual Knight requires a project and a key to be set.
        Check your codeceptjs config file to ensure these are set properly
          {
            "helpers": {
              "VisualKnight": {
                "require": "@visual-knight/codeceptjs",
                "key": "YOUR_KEY",
                "project": "YOUR_PROJECT"
              }
            }
          }
      `);
    }

    return config;
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
    this.setHelper();
    if (!options.additional) {
      options.additional = {};
    }
    options.additional.capabilities = this.helper.config.capabilities || this.helper.config.desiredCapabilities;

    const browserContext: IBrowserDriverContext = {
      executeScript: this.helper.executeScript.bind(this.helper),
      selectorExecuteScript: async (selector, script, ...args) => this.helper.executeScript(script, selector, ...args),
      desiredCapabilities: this.helper.desiredCapabilities,
      pause: async time => this.helper.wait(time / 1000),
      screenshot: () => {
        throw new Error('implement me');
      }
    };

    const screenshot = await this.makeScreenshot(browserContext, options);

    return this.visualKnightCore.processScreenshot(testName, screenshot, options.additional);
  }

  private setHelper() {
    if (this.helpers[CODECEPTJS_HELPER.Puppeteer]) {
      this.helper = this.helpers[CODECEPTJS_HELPER.Puppeteer];
      this.helper.config.capabilities = this.helper.config.capabilities || this.helper.config.desiredCapabilities || {};
      this.helper.config.capabilities = {
        browserName: 'Chrome',
        platform: 'Puppeteer',
        ...this.helper.config.capabilities
      };
      return;
    }
    if (this.helpers[CODECEPTJS_HELPER.Webdriver]) {
      this.helper = this.helpers[CODECEPTJS_HELPER.Webdriver];
      return;
    }
    if (this.helpers[CODECEPTJS_HELPER.WebdriverIO]) {
      this.helper = this.helpers[CODECEPTJS_HELPER.WebdriverIO];
      return;
    }
    if (this.helpers[CODECEPTJS_HELPER.Protractor]) {
      this.helper = this.helpers[CODECEPTJS_HELPER.Protractor];
      return;
    }
    if (this.helpers[CODECEPTJS_HELPER.Nightmare]) {
      this.helper = this.helpers[CODECEPTJS_HELPER.Nightmare];
      return;
    }

    throw new Error(
      `Supported Helpers are: ${CODECEPTJS_HELPER.Webdriver}, ${CODECEPTJS_HELPER.Puppeteer}, ${CODECEPTJS_HELPER.Protractor}, ${CODECEPTJS_HELPER.Nightmare}`
    );
  }

  private async makeScreenshot(browserContext: IBrowserDriverContext, options: ICompareScreenshotOptions) {
    if (this.helpers[CODECEPTJS_HELPER.Puppeteer]) {
      return await this.puppeteerMakeScreenshot(browserContext, options);
    }
    if (this.helpers[CODECEPTJS_HELPER.Webdriver] || this.helpers[CODECEPTJS_HELPER.WebdriverIO]) {
      return await this.webdriverMakeScreenshot(browserContext, options);
    }
    if (this.helpers[CODECEPTJS_HELPER.Protractor]) {
      return await this.protractorMakeScreenshot(browserContext, options);
    }
    if (this.helpers[CODECEPTJS_HELPER.Nightmare]) {
      return await this.nightmareMakeScreenshot(browserContext, options);
    }
  }

  private async protractorMakeScreenshot(
    browserContext: IBrowserDriverContext,
    options: ICompareScreenshotOptions
  ): Promise<Base64> {
    const browser = this.helper.browser;
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
    const page = this.helper.page;

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

  private async webdriverMakeScreenshot(browserContext: IBrowserDriverContext, options: ICompareScreenshotOptions) {
    const browser = this.helper.browser;
    browserContext.screenshot = async () => {
      return this.makeScreenshotForWebdriverIO(browser);
    };

    if (options.viewport) {
      await beforeScreenshot(browserContext, options);
      const screenshot = await this.makeScreenshotForWebdriverIO(browser);
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

  private async makeScreenshotForWebdriverIO(context: any) {
    const filename = `temp_${Date.now()}.png`;
    const filepath = join(__dirname, filename);
    const screenshot = await context.saveScreenshot(filepath);
    return new Promise(resolve => {
      unlink(filepath, () => {
        resolve(screenshot);
      });
    });
  }

  private async nightmareMakeScreenshot(browserContext: IBrowserDriverContext, options: ICompareScreenshotOptions) {
    const browser = this.helper.browser;
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
