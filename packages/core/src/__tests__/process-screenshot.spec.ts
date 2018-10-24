import { get, post, put } from "../__mocks__/request-promise";
import { VisualKnightCore } from "../process-screenshot";

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

  it("should return positive feedback", (done) => {
    get.mockResolvedValueOnce({
      misMatchPercentage: 1,
      isSameDimensions: true,
      link: "some link",
    });

    post.mockResolvedValueOnce({
      url: "Some presigned url",
      testSessionId: "Some testSessionId",
    });

    visualKnightCore.processScreenshot("testname", "SCREENSHOT").then(() => {
      done();
    });
  });

  it("should upload image to the url from api", (done) => {
    get.mockResolvedValueOnce({
      misMatchPercentage: 1,
      isSameDimensions: true,
      link: "some link",
    });

    post.mockResolvedValueOnce({
      url: "Some presigned url",
      testSessionId: "Some testSessionId",
    });

    expect.assertions(1);

    visualKnightCore.processScreenshot("testname", "SCREENSHOT").then(() => {
      expect(put).toBeCalledWith("Some presigned url", {
        body: new Buffer("SCREENSHOT", "base64"),
        headers: { "Content-Type": "image/png" },
      });
      done();
    });
  });

  it("should reject with an error if the dimensions are not correct", (done) => {
    get.mockResolvedValueOnce({
      misMatchPercentage: 1,
      isSameDimensions: false,
      link: "some link",
    });

    post.mockResolvedValueOnce({
      url: "Some presigned url",
      testSessionId: "Some testSessionId",
    });

    expect.assertions(1);

    visualKnightCore.processScreenshot("testname", "SCREENSHOT").catch((error: Error) => {
      expect(error.name).toBe("IsSameDimensionsError");
      done();
    });
  });

  it("should reject with an error if the misMatchPercentage is smaller then the misMatchTolerance", (done) => {
    get.mockResolvedValueOnce({
      misMatchPercentage: 2,
      isSameDimensions: true,
      link: "some link",
    });

    post.mockResolvedValueOnce({
      url: "Some presigned url",
      testSessionId: "Some testSessionId",
    });

    expect.assertions(1);

    visualKnightCore.processScreenshot("testname", "SCREENSHOT").catch((error: Error) => {
      expect(error.name).toBe("MisMatchPercentageError");
      done();
    });
  });

  it("should reject with an error if there is no baseline", (done) => {
    get.mockResolvedValueOnce({
      misMatchPercentage: null,
      isSameDimensions: true,
      link: "some link",
    });

    post.mockResolvedValueOnce({
      url: "Some presigned url",
      testSessionId: "Some testSessionId",
    });

    expect.assertions(1);

    visualKnightCore.processScreenshot("testname", "SCREENSHOT").catch((error: Error) => {
      expect(error.name).toBe("NoBaselineError");
      done();
    });
  });

  it("should reject with an error if the upload of the image does not have all fields", (done) => {
    post.mockRejectedValueOnce({ statusCode: 400 });

    expect.assertions(1);

    visualKnightCore.processScreenshot("testname", "SCREENSHOT").catch((error: Error) => {
      expect(error).toEqual(new Error("Not all required fields are set."));
      done();
    });
  });

  it("should reject with an error if the upload is not authorized", (done) => {
    post.mockRejectedValueOnce({ statusCode: 403 });

    expect.assertions(1);

    visualKnightCore.processScreenshot("testname", "SCREENSHOT").catch((error: Error) => {
      expect(error).toEqual(new Error("Not Authorized! Check if your key is set correct."));
      done();
    });
  });

  it("should reject with the server error response if it is an unknown code", (done) => {
    post.mockRejectedValueOnce({ unknown: true });

    expect.assertions(1);

    visualKnightCore.processScreenshot("testname", "SCREENSHOT").catch((error: Error) => {
      expect(error).toEqual({ unknown: true });
      done();
    });
  });

  it("should append the additional data to the body", (done) => {
    get.mockResolvedValueOnce({
      misMatchPercentage: 1,
      isSameDimensions: true,
      link: "some link",
    });

    post.mockResolvedValueOnce({
      url: "Some presigned url",
      testSessionId: "Some testSessionId",
    });

    expect.assertions(1);

    visualKnightCore.processScreenshot("testname", "SCREENSHOT", { someAdditionalData: true }).then(() => {
      expect(post).toBeCalledWith("https://api-screenshot.visual-knight.io/v1", {
        body: {
          browserName: "Some Browser",
          deviceName: "Some Device",
          misMatchTolerance: 0.01,
          project: "Some Project",
          test: "testname",
          additional: { someAdditionalData: true },
          autoBaseline: false,
        },
        headers: { "Content-Type": "application/json", "x-api-key": "Some Key" },
        json: true,
        method: "POST",
      });
      done();
    });
  });

  it("should set autoBaseline to false as default to the body", (done) => {
    get.mockResolvedValueOnce({
      misMatchPercentage: 1,
      isSameDimensions: true,
      link: "some link",
    });

    post.mockResolvedValueOnce({
      url: "Some presigned url",
      testSessionId: "Some testSessionId",
    });

    expect.assertions(1);

    visualKnightCore.processScreenshot("testname", "SCREENSHOT", { someAdditionalData: true }).then(() => {
      expect(post).toBeCalledWith("https://api-screenshot.visual-knight.io/v1", {
        body: {
          browserName: "Some Browser",
          deviceName: "Some Device",
          misMatchTolerance: 0.01,
          project: "Some Project",
          test: "testname",
          additional: { someAdditionalData: true },
          autoBaseline: false,
        },
        headers: { "Content-Type": "application/json", "x-api-key": "Some Key" },
        json: true,
        method: "POST",
      });
      done();
    });
  });
});
