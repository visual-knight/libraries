import { BaseStrategy } from './BaseStrategy';

export class MergeScreenshotStrategy extends BaseStrategy {
  public hasNextHorizontalScrollPosition() {
    const width = this.area.endX - this.area.startX;
    return width > this.index.x * this.screenDimensions.getViewportWidth() + this.screenDimensions.getViewportWidth();
  }

  public hasNextVerticalScrollPosition() {
    const height = this.area.endY - this.area.startY;
    return (
      height > this.index.y * this.screenDimensions.getViewportHeight() + this.screenDimensions.getViewportHeight()
    );
  }

  public getScrollPosition() {
    const viewportWidth = this.screenDimensions.getViewportWidth();
    const viewportHeight = this.screenDimensions.getViewportHeight();

    return {
      x: this.area.startX + this.index.x * viewportWidth,
      y: this.area.startY + this.index.y * viewportHeight,
      indexX: this.index.x,
      indexY: this.index.y
    };
  }

  public getCropDimensions() {
    const viewportWidth = this.screenDimensions.getViewportWidth();
    const viewportHeight = this.screenDimensions.getViewportHeight();

    const { startX, startY, endX, endY } = this.area;

    const { x, y } = this.index;

    const wantedWidth = endX - startX - x * viewportWidth;
    const width = wantedWidth > viewportWidth ? viewportWidth : wantedWidth;

    const wantedHeight = endY - startY - y * viewportHeight;
    const height = wantedHeight > viewportHeight ? viewportHeight : wantedHeight;

    return this.createCropDimensions(width, height, 0, 0, true, 0);
  }
}
