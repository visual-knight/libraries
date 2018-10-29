const Helper = codecept_helper;
import {
  IBrowserDriverContext,
  makeDocumentScreenshot,
  makeElementScreenshot,
  makeViewportScreenshot,
  VisualKnightCore
} from '@visual-knight/core';
import * as requireg from 'requireg';
import * as wdioScreenshot from 'wdio-screenshot';
import { CODECEPTJS_HELPER, ICompareScreenshotOptions, IProcessCodeceptJsOptions } from './codeceptjs.interfaces';

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

  public async compareFullpageScreenshot(testName: string, additional: any) {
    return this.compareScreenshot(testName, {}, additional);
  }

  public async compareViewportScreenshot(testName: string, additional: any) {
    return this.compareScreenshot(
      testName,
      {
        viewport: true
      },
      additional
    );
  }

  public async compareElementScreenshot(elementSelector: string, testName: string, additional: any) {
    return this.compareScreenshot(
      testName,
      {
        element: elementSelector
      },
      additional
    );
  }

  private async compareScreenshot(testName: string, options: ICompareScreenshotOptions, additional: any) {
    let screenshot;
    switch (this.config.useHelper) {
      case CODECEPTJS_HELPER.WebdrvierIO:
        screenshot = await this.webdriverIOMakeScreenshot(options);
        break;

      case CODECEPTJS_HELPER.Protractor:
        screenshot = await this.protractorMakeScreenshot(options);
        break;

      case CODECEPTJS_HELPER.Puppeteer:
        this.visualKnightCore.options.browserName = 'Chrome';
        this.visualKnightCore.options.deviceName = 'Puppeteer';
        screenshot = await this.puppeteerMakeScreenshot(options);
        break;

      default:
        throw new Error('Unkown Helper configured');
    }

    return this.visualKnightCore.processScreenshot(testName, screenshot, additional);
  }

  private async protractorMakeScreenshot(options: ICompareScreenshotOptions) {
    const ProtractorBy = requireg('protractor').ProtractorBy;
    const browserContext: IBrowserDriverContext = {
      executeScript: this.helpers[this.config.useHelper].browser.executeScript,
      selectorExecuteScript: async (selector, script) => {
        return this.helpers[this.config.useHelper].browser.executeScript(script, selector);
      },
      desiredCapabilities: this.helpers[this.config.useHelper].desiredCapabilities,
      pause: this.helpers[this.config.useHelper].browser.sleep,
      screenshot: this.helpers[this.config.useHelper].browser.takeScreenshot
    };
    if (options.viewport) {
      return makeViewportScreenshot(browserContext);
    }
    if (options.element) {
      return makeElementScreenshot(browserContext, options.element);
    }
    return makeDocumentScreenshot(browserContext);
  }

  private async puppeteerMakeScreenshot(options: ICompareScreenshotOptions) {
    return this.helpers[this.config.useHelper].page.screenshot({
      fullPage: true
    });
  }

  private async webdriverIOMakeScreenshot(options: ICompareScreenshotOptions) {
    return this.helpers[this.config.useHelper].browser.saveDocumentScreenshot();
  }
}

export = VisualKnight;
