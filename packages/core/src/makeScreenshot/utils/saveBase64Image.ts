import { outputFile } from "fs-extra";
import { Base64 } from "../../process-screenshot";

export default async function saveBase64Image(filePath: string, base64Screenshot: Base64) {
  return outputFile(filePath, base64Screenshot, "base64");
}
