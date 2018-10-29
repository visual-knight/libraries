import { IBrowserDriverContext } from '../browser-context.interface';

export class ScreenDimensions {
  private isIOS: any;
  private viewportWidth: number;
  private viewportHeight: number;
  private documentWidth: number;
  private documentHeight: number;
  private screenWidth: number;
  private screenHeight: number;
  private innerWidth: number;
  private innerHeight: number;
  private pixelRatio: any;
  private orientation: any;

  constructor(options: IScreenDimensionOptions, browser: IBrowserDriverContext) {
    const { html, body, window } = options;

    const { isIOS } = browser!;

    this.isIOS = isIOS;
    this.viewportWidth = window.innerWidth || html.clientWidth || 0;
    this.viewportHeight = window.innerHeight || html.clientHeight || 0;

    this.documentWidth = html.scrollWidth;
    this.documentHeight = Math.max(
      body.scrollHeight,
      body.offsetHeight,
      html.clientHeight,
      html.scrollHeight,
      html.offsetHeight
    );

    const screenMax = Math.max(window.screenWidth, window.screenHeight);
    const screenMin = Math.min(window.screenWidth, window.screenHeight);

    this.screenWidth = this.isLandscape() ? screenMax : screenMin;
    this.screenHeight = this.isLandscape() ? screenMin : screenMax;

    const innerMax = Math.max(window.innerWidth, window.innerHeight);
    const innerMin = Math.min(window.innerWidth, window.innerHeight);

    this.innerWidth = this.isLandscape() ? innerMax : innerMin;
    this.innerHeight = this.isLandscape() ? innerMin : innerMax;

    this.pixelRatio = window.pixelRatio;
    this.orientation = window.orientation;

    if (this.isIOS && this.isLandscape() && this.getViewportHeight() - 20 === this.getInnerHeight()) {
      // iOS 7 has a 20px bug in landscape mode
      this.viewportHeight = this.getInnerHeight();
    }

    if (this.isIOS && this.isLandscape() && this.getDocumentHeight() - 20 === this.getInnerHeight()) {
      // iOS 7 has a 20px bug in landscape mode
      this.documentHeight = this.getInnerHeight();
    }
  }

  public getViewportWidth() {
    return this.viewportWidth;
  }

  public getViewportHeight() {
    return this.viewportHeight;
  }

  public isLandscape() {
    return this.getViewportWidth() > this.getViewportHeight();
  }

  public getDocumentWidth() {
    return this.documentWidth;
  }

  public getDocumentHeight() {
    return this.documentHeight;
  }

  public getScreenWidth() {
    return this.screenWidth;
  }

  public getScreenHeight() {
    return this.screenHeight;
  }

  public getInnerWidth() {
    return this.innerWidth;
  }

  public getInnerHeight() {
    return this.innerHeight;
  }

  public getPixelRatio() {
    return this.pixelRatio;
  }

  public getOrientation() {
    return this.orientation;
  }

  public getScale() {
    if (this.isIOS) {
      return this.getScreenWidth() / this.getViewportWidth();
    }
    return 1;
  }

  public applyScaleFactor(widthOrHeight: number) {
    return Math.round(widthOrHeight * this.getScale());
  }
}

export interface IScreenDimensionOptions {
  window: {
    innerWidth: number;
    innerHeight: number;
    pixelRatio: number;
    orientation: number;
    screenWidth: number;
    screenHeight: number;
  };
  body: {
    scrollHeight: number;
    offsetHeight: number;
  };
  html: {
    clientWidth: number;
    scrollWidth: number;
    clientHeight: number;
    scrollHeight: number;
    offsetHeight: number;
  };
}
