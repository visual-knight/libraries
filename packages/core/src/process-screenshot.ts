import axios from 'axios';

export class VisualKnightCore {
  public options: IProcessScreenshotOptions;
  private headers: any;

  constructor(options: IProcessScreenshotOptionsUser) {
    this.options = {
      ...{
        apiEndpoint: `https://api.visual-knight.io/v1`,
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
    const testSessionId = await this.invokeTestSession(testname, additional);
    this.debug(`Test session id: ${testSessionId}`);

    this.debug('Uploading image');
    await this.uploadScreenshot(new Buffer(screenshot, 'base64'), testSessionId);
    this.debug('Uploading image done');

    // add error handling
    this.debug('Requesting test session result');
    const testSessionData = await this.getTestSessionState(testSessionId);
    console.log(testSessionData);
    this.debug('RESULT:');
    this.debug(`   set mismatch tolerance: ${testSessionData.misMatchTolerance}`);
    this.debug(`   calculated mismatch in % : ${testSessionData.misMatchPercentage}`);
    this.debug(`   is same dimension: ${testSessionData.isSameDimensions}`);

    return this.processTestSessionResult(testSessionData);
  }

  private async invokeTestSession(testname: string, additional: any = {}) {
    additional.capabilities = additional.capabilities || {};
    const data = {
      query: `
        mutation invokeTestSession(
          $autoBaseline: Boolean!
          $capabilities: JSON!
          $misMatchTolerance: Float!
          $project: String!
          $testname: String!
        ) {
          invokeTestSession(
            autoBaseline: $autoBaseline
            capabilities: $capabilities
            misMatchTolerance: $misMatchTolerance
            project: $project
            testname: $testname
          )
        }
      `,
      operationName: 'invokeTestSession',
      variables: {
        testname,
        project: this.options.project,
        misMatchTolerance: this.options.misMatchTolerance,
        autoBaseline: this.options.autoBaseline,
        capabilities: additional.capabilities
        // TODO: add additional information
      }
    };

    try {
      const response = await axios.post<
        string,
        {
          data: { data: { invokeTestSession: string } };
        }
      >(this.options.apiEndpoint, data, {
        headers: this.headers
      });
      return response.data.data.invokeTestSession;
    } catch (error) {
      this.debug(error);
      switch (error.statusCode) {
        case 400:
          throw new Error('Not all required fields are set.');
        case 403:
          throw new Error('Not Authorized! Check if your key is set correct.');

        default:
          throw error;
      }
    }
  }

  private async uploadScreenshot(decodedScreenshot: Buffer, testSessionId: string) {
    const data = {
      query: `
          mutation uploadScreenshot($testSessionId: String!, $base64Image: String!) {
            uploadScreenshot(
              testSessionId: $testSessionId
              base64Image: $base64Image
            )
          }
        `,
      operationName: 'uploadScreenshot',
      variables: { testSessionId, base64Image: decodedScreenshot.toString('base64') }
    };

    try {
      return (await axios.post<
        string,
        {
          data: { data: { uploadScreenshot: boolean } };
        }
      >(this.options.apiEndpoint, data, { headers: this.headers })).data.data.uploadScreenshot;
    } catch (error) {
      throw error;
    }
  }

  private async getTestSessionState(testSessionId: string) {
    const data = {
      query: `
        query testSessionWatch($testSessionId: String!) {
          testSessionWatch(testSessionId: $testSessionId) {
            misMatchPercentage
            misMatchTolerance
            isSameDimensions
            link
          }
        }
      `,
      operationName: 'testSessionWatch',
      variables: { testSessionId }
    };

    try {
      return (await axios.post<
        string,
        {
          data: { data: { testSessionWatch: ITestSessionResponseData } };
        }
      >(this.options.apiEndpoint, data, { headers: this.headers })).data.data.testSessionWatch;
    } catch (error) {
      throw error;
    }
  }

  private processTestSessionResult(result: ITestSessionResponseData) {
    const { misMatchPercentage, isSameDimensions, link } = result;
    const { misMatchTolerance } = this.options;

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
      error.message = `Mismatch of ${this.round(misMatchPercentage, 3)} % is greater than the tolerance ${this.round(
        misMatchTolerance,
        3
      )} %! -> ${link}`;
      error.name = 'MisMatchPercentageError';
      throw error;
    }

    // this.debugSection("Visual Knight", `Image is within tolerance or the same`);
  }

  private round(value: number, decimals: number) {
    return Number(Math.round(Number(`${value}e${decimals}`)) + `e-${decimals}`);
  }
}

export interface ITestSessionResponseData {
  misMatchPercentage: number;
  misMatchTolerance: number;
  isSameDimensions: boolean;
  link: string;
}

interface IProcessScreenshotOptions extends IProcessScreenshotOptionsUser {
  apiEndpoint: string;
  misMatchTolerance: number;
  liveResult: boolean;
  debugLogger: (message: string) => void;
}

export interface IProcessScreenshotOptionsUser {
  key: string;
  project: string;
  autoBaseline?: boolean;
  apiEndpoint?: string;
  misMatchTolerance?: number;
  liveResult?: boolean;
}

export type Base64 = string;
