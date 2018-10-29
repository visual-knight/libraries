import * as debug from 'debug';

import { IBrowserDriverContext } from './browser-context.interface';
import modifyElements from './scripts/modifyElements';
import scroll from './scripts/scroll';
import scrollbars from './scripts/scrollbars';
import triggerResize from './scripts/triggerResize';

const log = debug('visual-knight-core:beforeScreenshot');

export default async function beforeScreenshot(browser: IBrowserDriverContext, options: any) {
  // hide scrollbars
  log('hide scrollbars');
  await browser.executeScript(scrollbars, false);

  log('trigger resize event to allow js components to resize properly');
  await browser.executeScript(triggerResize);

  // hide elements
  if (Array.isArray(options.hide) && options.hide.length) {
    log('hide the following elements: %s', options.hide.join(', '));
    await browser.selectorExecuteScript!(options.hide, modifyElements, 'opacity', '0');
  }

  // remove elements
  if (Array.isArray(options.remove) && options.remove.length) {
    log('remove the following elements: %s', options.remove.join(', '));
    await browser.selectorExecuteScript!(options.remove, modifyElements, 'display', 'none');
  }

  // scroll back to start
  const x = 0;
  const y = 0;
  log('scroll back to start x: %s, y: %s', x, y);
  await browser.executeScript(scroll, x, y);

  // wait a bit for browser render
  const pause = 200;
  log('wait %s ms for browser render', pause);
  await browser.pause(pause);
}
