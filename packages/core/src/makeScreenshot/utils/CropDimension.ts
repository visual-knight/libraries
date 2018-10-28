export class CropDimension {
  constructor(
    private width: number,
    private height: number,
    private x: number,
    private y: number,
    private top = true,
    private rotation = 0
  ) {}

  public getWidth() {
    return this.width;
  }

  public getHeight() {
    return this.height;
  }

  public getX() {
    return this.x;
  }

  public getY() {
    return this.y;
  }

  public getGravity() {
    return this.top ? 'NorthWest' : 'SouthWest';
  }

  public getRotation() {
    return this.rotation;
  }
}
