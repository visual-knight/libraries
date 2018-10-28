// import debug from "debug";
import fsExtra from "fs-extra";
import path from "path";

import { Base64 } from "../process-screenshot";
import { IBrowserDriverContext } from "./browser-context.interface";
import { getScreenDimensions } from "./scripts/getScreenDimensions";
import pageHeight from "./scripts/pageHeight";
import virtualScroll from "./scripts/virtualScroll";
import { CropDimension } from "./utils/CropDimension";
import { generateUUID } from "./utils/generateUUID";
import { cropImage, mergeImages } from "./utils/image";
import normalizeScreenshot from "./utils/normalizeScreenshot";
import saveBase64Image from "./utils/saveBase64Image";
import { ScreenDimensions } from "./utils/ScreenDimension";
import { ScreenshotStrategyManager } from "./utils/ScreenshotStrategyManager";

// const log = debug("visual-knight-core:makeAreaScreenshot");
const tmpDir = path.join(__dirname, "..", "..", ".tmp");

async function storeScreenshot(
  browser: IBrowserDriverContext,
  screenDimensions: ScreenDimensions,
  cropDimensions: CropDimension,
  base64Screenshot: Base64,
  filePath: string,
) {
  const normalizedBase64Screenshot = await normalizeScreenshot(browser, screenDimensions, base64Screenshot);
  // log(
  //   "crop screenshot with width: %s, height: %s, offsetX: %s, offsetY: %s",
  //   cropDimensions.getWidth(),
  //   cropDimensions.getHeight(),
  //   cropDimensions.getX(),
  //   cropDimensions.getY(),
  // );

  const croppedBase64Screenshot = (await cropImage(normalizedBase64Screenshot, cropDimensions)) as Base64;

  await saveBase64Image(filePath, croppedBase64Screenshot);
}

export default async function makeAreaScreenshot(
  browser: IBrowserDriverContext,
  startX: number,
  startY: number,
  endX: number,
  endY: number,
) {
  // log("requested a screenshot for the following area: %j", { startX, startY, endX, endY });

  const screenDimensions = (await browser.executeScript(getScreenDimensions)).value;
  // log("detected screenDimensions %j", screenDimensions);
  const screenDimension = new ScreenDimensions(screenDimensions, browser);

  const screenshotStrategy = ScreenshotStrategyManager.getStrategy(browser, screenDimension);
  screenshotStrategy.setScrollArea(startX, startY, endX, endY);

  const uuid = generateUUID();

  const dir = path.join(tmpDir, uuid);

  try {
    await fsExtra.ensureDir(dir);

    const cropImages: any = [];
    const screenshotPromises: any = [];

    // log("set page height to %s px", screenDimension.getDocumentHeight());
    await browser.executeScript(pageHeight, `${screenDimension.getDocumentHeight()}px`);

    let loop = false;
    do {
      const { x, y, indexX, indexY } = screenshotStrategy.getScrollPosition();
      // log("scroll to coordinates x: %s, y: %s for index x: %s, y: %s", x, y, indexX, indexY);

      await browser.executeScript(virtualScroll, x, y, false);
      await browser.pause(100);

      // log("take screenshot");
      const base64Screenshot = (await browser.screenshot()).value;
      const cropDimensions = screenshotStrategy.getCropDimensions();
      const filePath = path.join(dir, `${indexY}-${indexX}.png`);

      screenshotPromises.push(storeScreenshot(browser, screenDimension, cropDimensions, base64Screenshot, filePath));

      if (!Array.isArray(cropImages[indexY])) {
        cropImages[indexY] = [];
      }

      cropImages[indexY][indexX] = filePath;

      loop = screenshotStrategy.hasNextScrollPosition();
      screenshotStrategy.moveToNextScrollPosition();
    } while (loop);

    const [mergedBase64Screenshot] = await Promise.all([
      Promise.resolve().then(async () => {
        await Promise.all(screenshotPromises);
        // log("merge images togehter");
        // tslint:disable-next-line:no-shadowed-variable
        const mergedBase64Screenshot = await mergeImages(cropImages);
        // log("remove temp dir");
        await fsExtra.remove(dir);
        return mergedBase64Screenshot;
      }),
      Promise.resolve().then(async () => {
        // log("reset page height");
        await browser.executeScript(pageHeight, "");

        // log("revert scroll to x: %s, y: %s", 0, 0);
        await browser.executeScript(virtualScroll, 0, 0, true);
      }),
    ]);

    return mergedBase64Screenshot;
  } catch (e) {
    try {
      await fsExtra.remove(dir);
      // tslint:disable-next-line:no-empty
    } catch (e) {}

    throw e;
  }
}
