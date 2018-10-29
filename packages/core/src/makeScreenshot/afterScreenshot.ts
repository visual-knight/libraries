import * as debug from 'debug';

import { IBrowserDriverContext } from './browser-context.interface';
import modifyElements from './scripts/modifyElements';
import scrollbars from './scripts/scrollbars';

const log = debug("visual-knight-core:afterScreenshot");

export default async function afterScreenshot(browser: IBrowserDriverContext, options: any) {
  // show elements
  if (Array.isArray(options.hide) && options.hide.length) {
    log("show the following elements again: %s", options.hide.join(", "));
    await browser.selectorExecuteScript!(options.hide, modifyElements, 'opacity', '');
  }

  // add elements again
  if (Array.isArray(options.remove) && options.remove.length) {
    log("add the following elements again: %s", options.remove.join(", "));
    await browser.selectorExecuteScript!(options.remove, modifyElements, 'display', '');
  }

  // show scrollbars
  log("show scrollbars again");
  await browser.executeScript(scrollbars, true);
}
