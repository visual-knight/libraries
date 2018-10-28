const Jimp = require('jimp');
import { Base64 } from '../../../process-screenshot';
import { CropDimension } from '../CropDimension';

/**
 * Crops an image
 * @param  {string} base64Screenshot image to crop
 * @param  {CropDimension} cropDimensions   dimensions
 * @return {string}                  cropped image
 */
export async function cropImage(base64Screenshot: Base64, cropDimensions: CropDimension): Promise<Base64> {
  if (!(cropDimensions instanceof CropDimension)) {
    throw new Error('Please provide a valid instance of CropDimension!');
  }

  const image = await Jimp.read(new Buffer(base64Screenshot, 'base64'));

  if (cropDimensions.getRotation() !== 0) {
    image.rotate(cropDimensions.getRotation());
  }

  const { height } = image.bitmap;

  const x = cropDimensions.getX();
  let y = cropDimensions.getY();

  if (cropDimensions.getGravity() === 'SouthWest') {
    const diffHeight = height - y - cropDimensions.getHeight();
    y = diffHeight;
  }

  // image.gravity(cropDimensions.getGravity());
  image.crop(x, y, cropDimensions.getWidth(), cropDimensions.getHeight());

  return new Promise<Base64>((resolve, reject) => {
    image.getBuffer(Jimp.MIME_PNG, (err: Error, buffer: Buffer) => {
      if (err) {
        return reject(err);
      }
      return resolve(buffer.toString('base64'));
    });
  });
}

/**
 * Scales an image down or up
 * @param base64Screenshot  image to scale
 * @param scaleFactor       scale factor, e.g. 0.5 for downscale or 1.5 for upscale
 * @returns {string}        screenshot
 */
export async function scaleImage(base64Screenshot: Base64, scaleFactor: number) {
  const image = await Jimp.read(new Buffer(base64Screenshot, 'base64'));
  image.scale(scaleFactor);

  return new Promise((resolve, reject) => {
    image.getBuffer(Jimp.MIME_PNG, (err: Error, buffer: Buffer) => {
      if (err) {
        return reject(err);
      }
      return resolve(buffer.toString('base64'));
    });
  });
}

/**
 * Merges mulidimensional array of images to a single image:
 * @param  {string[][]} images array of images
 * @return {string}        screenshot
 */
export async function mergeImages(images: any[]): Promise<Base64> {
  let imageWidth = 0;
  let imageHeight = 0;

  // merge horizontal
  const rowImagePromises = images.map(async row => {
    let width = 0;
    let height = 0;

    const colImagesPromises: Array<Promise<any>> = row.map(
      async (colImage: any): Promise<any> => {
        const readImage = await Jimp.read(colImage);
        width += readImage.bitmap.width;
        height = readImage.bitmap.height;

        return readImage;
      }
    );

    const colImages = await Promise.all(colImagesPromises);
    const newImage = await new Jimp(width, height);

    let x = 0;
    for (const colImage of colImages) {
      newImage.blit(colImage, x, 0);
      x += colImage.bitmap.width;
    }

    imageWidth = newImage.bitmap.width;
    imageHeight += newImage.bitmap.height;

    return newImage;
  });

  const rowImages = await Promise.all(rowImagePromises);

  // merge vertical
  const image = await new Jimp(imageWidth, imageHeight);

  let y = 0;
  for (const rowImage of rowImages) {
    image.blit(rowImage, 0, y);
    y += rowImage.bitmap.height;
  }

  // finally get screenshot
  const base64Screenshot = await new Promise<Base64>((resolve, reject) => {
    image.getBuffer(Jimp.MIME_PNG, (err: Error, buffer: Buffer) => {
      if (err) {
        return reject(err);
      }
      return resolve(buffer.toString('base64'));
    });
  });
  return base64Screenshot;
}
