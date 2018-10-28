import sizeOf from "image-size";
import { Base64 } from "../../process-screenshot";

export default function getBase64ImageSize(base64Screenshot: Base64) {
  const buffer = new Buffer(base64Screenshot, "base64");
  const size = sizeOf(buffer);
  return size;
}
