import { CropDimension } from "../CropDimension";

export abstract class BaseStrategy {
  protected area!: {
    startX: number;
    startY: number;
    endX: number;
    endY: number;
  };
  protected index: { x: number; y: number };

  constructor(protected screenDimensions: any) {
    this.index = {
      x: 0,
      y: 0,
    };

    this.setScrollArea(0, 0, this.screenDimensions.getDocumentWidth(), this.screenDimensions.getDocumentHeight());
  }

  public setScrollArea(startX: number, startY: number, endX: number, endY: number) {
    const documentWidth = this.screenDimensions.getDocumentWidth();
    const documentHeight = this.screenDimensions.getDocumentHeight();

    if (startX >= documentWidth) {
      throw new Error("startX is out of range");
    } else if (startY >= documentHeight) {
      throw new Error("startY is out of range");
    } else if (endX > documentWidth) {
      throw new Error("endX is out of range");
    } else if (endY > documentHeight) {
      throw new Error("endY is out of range");
    }

    this.area = {
      startX,
      startY,
      endX,
      endY,
    };
  }

  public moveToNextScrollPosition() {
    if (this.hasNextHorizontalScrollPosition()) {
      this.index.x++;
    } else if (this.hasNextVerticalScrollPosition()) {
      this.index.x = 0;
      this.index.y++;
    }
  }

  public hasNextScrollPosition() {
    return this.hasNextHorizontalScrollPosition() || this.hasNextVerticalScrollPosition();
  }

  public abstract hasNextHorizontalScrollPosition(): boolean;
  public abstract hasNextVerticalScrollPosition(): boolean;

  public getScrollPosition() {
    throw new Error("not implemented, override it");
  }

  public getCropDimensions() {
    throw new Error("not implemented, override it");
  }

  public createCropDimensions(width: number, height: number, x: number, y: number, top: boolean, rotation: number) {
    const adjustedWidth = this.screenDimensions.applyScaleFactor(width);
    const adjustedHeight = this.screenDimensions.applyScaleFactor(height);
    return new CropDimension(adjustedWidth, adjustedHeight, x, y, top, rotation);
  }
}
