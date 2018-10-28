import { ensureDir, remove } from 'fs-extra';
import * as gm from 'gm';
import { join } from 'path';

import { Base64 } from '../../../process-screenshot';
import { CropDimension } from '../CropDimension';
import { generateUUID } from '../generateUUID';

const tmpDir = join(__dirname, '../../../.tmp');

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

  const image = gm(new Buffer(base64Screenshot, 'base64'));

  if (cropDimensions.getRotation() !== 0) {
    image.rotate('white', cropDimensions.getRotation());
  }

  image.gravity(cropDimensions.getGravity());
  image.crop(cropDimensions.getWidth(), cropDimensions.getHeight(), cropDimensions.getX(), cropDimensions.getY());

  return new Promise<Base64>((resolve, reject) => {
    image.toBuffer('PNG', (err: Error, buffer: Buffer) => {
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
  const image = gm(new Buffer(base64Screenshot, 'base64'));

  const percent = scaleFactor * 100;
  image.filter('Box'); // to produce equal images as Jimp
  // image.filter('Sinc'); // works also but was slower in tests
  image.resize(percent, percent, '%');

  return new Promise((resolve, reject) => {
    image.toBuffer('PNG', (err: Error, buffer: Buffer) => {
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
export async function mergeImages(images: any[][]): Promise<Base64> {
  const uuid = generateUUID();
  const dir = join(tmpDir, uuid);

  try {
    await ensureDir(dir);

    // merge all horizintal screens
    const rowImagesPromises = images.map((colImages, key) => {
      const firstImage = colImages.shift();
      const rowImage = gm(firstImage);

      if (colImages.length) {
        colImages.push(true);
        rowImage.append.apply(rowImage, colImages);
      }

      return new Promise((resolve, reject) => {
        const file = join(dir, `${key}.png`);
        rowImage.write(file, (err: Error) => {
          if (err) {
            return reject(err);
          }
          return resolve(file);
        });
      });
    });

    // merge all vertical screens
    const base64Screenshot = await Promise.all(rowImagesPromises).then((rowImages: any[]) => {
      const firstImage = rowImages.shift();
      const mergedImage = gm(firstImage);

      if (rowImages.length) {
        mergedImage.append.apply(mergedImage, rowImages);
      }

      return new Promise<Base64>((resolve, reject) => {
        mergedImage.toBuffer('PNG', (err: Error, buffer: Buffer) => {
          if (err) {
            return reject(err);
          }
          return resolve(buffer.toString('base64'));
        });
      });
    });

    await remove(dir);
    return base64Screenshot;
  } catch (e) {
    try {
      await remove(dir);
      // tslint:disable-next-line:no-empty
    } catch (e) {}

    throw e;
  }
}
