import { BaseStrategy } from './BaseStrategy';

export class FullpageScreenshotStrategy extends BaseStrategy {
  public hasNextHorizontalScrollPosition() {
    return false;
  }

  public hasNextVerticalScrollPosition() {
    return false;
  }

  public getScrollPosition() {
    return {
      x: this.area.startX,
      y: this.area.startY,
      indexX: this.index.x,
      indexY: this.index.y
    };
  }

  public getCropDimensions() {
    const { startX, startY, endX, endY } = this.area;

    const width = endX - startX;
    const height = endY - startY;

    return this.createCropDimensions(width, height, 0, 0, true, 0);
  }
}
