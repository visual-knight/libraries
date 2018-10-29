import * as sizeOf from 'image-size';
import { Base64 } from '../../process-screenshot';

export function getBase64ImageSize(base64Screenshot: Base64) {
  const buffer = new Buffer(base64Screenshot, 'base64');
  return sizeOf(buffer);
}
