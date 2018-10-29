import * as debug from 'debug';
import { sync } from 'which';
import * as gm from './gm';
import * as jimp from './jimp';
const log = debug('visual-knight-core:image');

let gmInstalled = false;

try {
  gmInstalled = !!sync('gm');
  // tslint:disable-next-line:no-empty
} catch (e) {}

log(`Use image processing library: ${gmInstalled ? 'GraphicsMagick' : 'Jimp'}`);

const { cropImage, mergeImages, scaleImage } = gmInstalled ? gm : jimp;
export { cropImage, scaleImage, mergeImages };
