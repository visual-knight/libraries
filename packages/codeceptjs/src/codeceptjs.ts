const Helper = codecept_helper;
import { VisualKnightCore } from "@visual-knight/core";
import * as wdioScreenshot from "wdio-screenshot";
import { CODECEPTJS_HELPER, IProcessCodeceptJsOptions } from "./codeceptjs.interfaces";

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

  public async compareScreenshot(testName: string, additional: any) {
    let screenshot;
    switch (this.config.useHelper) {
      case CODECEPTJS_HELPER.WebdrvierIO:
        screenshot = await this.helpers[this.config.useHelper].browser.saveDocumentScreenshot();
        break;

      case CODECEPTJS_HELPER.Protractor:
        screenshot = await this.helpers[this.config.useHelper].browser.takeScreenshot();
        break;

      case CODECEPTJS_HELPER.Puppeteer:
        this.visualKnightCore.options.browserName = "Chrome";
        this.visualKnightCore.options.deviceName = "Puppeteer";
        screenshot = await this.helpers[this.config.useHelper].page.screenshot({
          fullPage: true,
        });
        break;

      default:
        throw new Error("Unkown Helper configured");
    }

    return this.visualKnightCore.processScreenshot(testName, screenshot, additional);
  }
}

export = VisualKnight;
