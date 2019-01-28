import { get, post, put, RequestPromiseOptions } from 'request-promise';

export class VisualKnightCore {
  public options: IProcessScreenshotOptions;
  private headers: any;

  constructor(options: IProcessScreenshotOptionsUser) {
    this.options = {
      ...{
        apiScreenshot: `https://api-screenshot.visual-knight.io/v1`,
        apiTestsessionState: `https://api-testsession.visual-knight.io/v1`,
        liveResult: true,
        misMatchTolerance: 0.01,
        autoBaseline: false,
        debugLogger() {
          // do nothing
        }
      },
      ...options
    };

    this.headers = {
      'Content-Type': 'application/json', // Is set automatically
      'x-api-key': this.options.key
    };
  }

  public debug(message: string) {
    this.options.debugLogger('Visual Knight: ' + message);
  }

  public async processScreenshot(testname: string, screenshot: Base64, additional?: any) {
    // add error handling
    this.debug('Requesting signed url');
    const { url, testSessionId } = await this.getPresignedUrl(testname, additional);
    this.debug(`URL: ${url}`);
    this.debug(`Test session id: ${testSessionId}`);

    this.debug('Uploading image');
    await this.uploadScreenshot(url, new Buffer(screenshot, 'base64'));
    this.debug('Uploading image done');

    // add error handling
    this.debug('Requesting test session result');
    const testSessionData = await this.getTestSessionState(testSessionId);
    this.debug('RESULT:');
    this.debug(`   set mismatch tolerance: ${testSessionData.misMatchTolerance}`);
    this.debug(`   calculated mismatch in % : ${testSessionData.misMatchPercentage}`);
    this.debug(`   is same dimension: ${testSessionData.isSameDimensions}`);

    return this.processTestSessionResult(testSessionData);
  }

  private async getPresignedUrl(testname: string, additional: any = {}) {
    additional.capabilities = additional.capabilities || {};
    if (this.options.browserName) {
      additional.capabilities.browserName = this.options.browserName;
    }
    if (this.options.deviceName) {
      additional.capabilities.deviceName = this.options.deviceName;
    }

    const options: RequestPromiseOptions = {
      method: 'POST',
      body: {
        test: testname,
        project: this.options.project,
        misMatchTolerance: this.options.misMatchTolerance,
        autoBaseline: this.options.autoBaseline,
        additional
      },
      headers: this.headers,
      json: true
    };

    return post(this.options.apiScreenshot, options)
      .then((data: IPresigendUrlResponseData) => {
        return data;
      })
      .catch(errorResponse => {
        switch (errorResponse.statusCode) {
          case 400:
            throw new Error('Not all required fields are set.');
          case 403:
            throw new Error('Not Authorized! Check if your key is set correct.');

          default:
            throw errorResponse;
        }
      });
  }

  private async uploadScreenshot(presigendUrl: string, decodeedScreenshot: Buffer) {
    return put(presigendUrl, {
      body: decodeedScreenshot,
      headers: {
        'Content-Type': 'image/png'
      }
    });
  }

  private async getTestSessionState(testSessionId: string) {
    return get(`${this.options.apiTestsessionState}?testSessionId=${testSessionId}`, {
      headers: this.headers,
      json: true
    }).then((data: ITestSessionResponseData) => {
      return data;
    });
  }

  private processTestSessionResult(result: ITestSessionResponseData) {
    const { misMatchPercentage, isSameDimensions, link } = result;
    const misMatchTolerance = this.options.misMatchTolerance * 100;

    const error = new Error();

    if (result && misMatchPercentage === null && isSameDimensions !== false) {
      this.debug('No baseline defined');
      error.message = `For this image is no baseline defined! -> ${link}`;
      error.name = 'NoBaselineError';
      throw error;
    }

    if (!isSameDimensions) {
      error.message = `Compared Screenshots are not in the same dimension! -> ${link}`;
      error.name = 'IsSameDimensionsError';
      throw error;
    }

    // this.debugSection("Visual Knight", `Image is different! ${misMatchPercentage}%`);
    if (misMatchPercentage && misMatchPercentage > misMatchTolerance) {
      error.message = `Mismatch is greater than the tolerance! -> ${link}`;
      error.name = 'MisMatchPercentageError';
      throw error;
    }

    // this.debugSection("Visual Knight", `Image is within tolerance or the same`);
  }
}

export interface IPresigendUrlResponseData {
  url: string;
  testSessionId: string;
}

export interface ITestSessionResponseData {
  misMatchPercentage: number;
  misMatchTolerance: number;
  isSameDimensions: boolean;
  link: string;
}

interface IProcessScreenshotOptions extends IProcessScreenshotOptionsUser {
  apiScreenshot: string;
  apiTestsessionState: string;
  misMatchTolerance: number;
  liveResult: boolean;
  debugLogger: (message: string) => void;
}

export interface IProcessScreenshotOptionsUser {
  key: string;
  project: string;
  browserName?: string;
  deviceName?: string;
  autoBaseline?: boolean;
  apiScreenshot?: string;
  apiTestsessionState?: string;
  misMatchTolerance?: number;
  liveResult?: boolean;
}

export type Base64 = string;
