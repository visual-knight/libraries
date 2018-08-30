import "jasmine";
import * as request from "request-promise";
import { VisualKnightCore } from "./process-screenshot";

describe("process-screenshot", () => {
  let visualKnightCore: VisualKnightCore;

  beforeEach(() => {
    visualKnightCore = new VisualKnightCore({
      key: "Some Key",
      project: "Some Project",
      browserName: "Some Browser",
      deviceName: "Some Device",
    });
  });

  it("find a way to mock request-promise", (done) => {
    visualKnightCore
      .processScreenshot("testname", "SCREENSHOT")
      .then(() => {
        done();
      })
      .catch((error) => {
        done();
      });
  });
});
