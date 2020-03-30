import axios from 'axios';

export class VisualKnightCore {
  public options: IProcessScreenshotOptions;
  private headers: any;

  constructor(options: IProcessScreenshotOptionsUser) {
    this.options = {
      ...{
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

  public async processScreenshot(
    testname: string,
    screenshot: Base64,
    capabilities: IDesiredCapabilities
  ) {
    // add error handling
    this.debug('Requesting signed url');
    const testSessionId = await this.invokeTestSession(testname, capabilities);
    this.debug(`Test session id: ${testSessionId}`);

    this.debug('Uploading image and get test data');
    const testSessionData = await this.uploadScreenshot(
      Buffer.from(screenshot, 'base64'),
      testSessionId
    );

    this.debug('RESULT:');
    this.debug(
      `   set mismatch tolerance: ${testSessionData.misMatchTolerance}`
    );
    this.debug(
      `   calculated mismatch in % : ${testSessionData.misMatchPercentage}`
    );
    this.debug(`   is same dimension: ${testSessionData.isSameDimensions}`);

    return this.processTestSessionResult(testSessionData);
  }

  private async invokeTestSession(
    testname: string,
    capabilities: IDesiredCapabilities
  ) {
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
        capabilities
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
          throw new Error(error.message);
      }
    }
  }

  private async uploadScreenshot(
    decodedScreenshot: Buffer,
    testSessionId: string
  ) {
    const data = {
      query: `
          mutation uploadScreenshot($testSessionId: String!, $base64Image: String!) {
            uploadScreenshot(
              testSessionId: $testSessionId
              base64Image: $base64Image
            ) {
              misMatchPercentage
              misMatchTolerance
              isSameDimensions
              link
            }
          }
        `,
      operationName: 'uploadScreenshot',
      variables: {
        testSessionId,
        base64Image: decodedScreenshot.toString('base64')
      }
    };

    return axios
      .post<
        string,
        {
          data: { data: { uploadScreenshot: ITestSessionResponseData } };
        }
      >(this.options.apiEndpoint, data, { headers: this.headers })
      .then(result => result.data.data.uploadScreenshot)
      .catch(error => {
        this.debug(error);
        throw error;
      });
  }

  private processTestSessionResult(result: ITestSessionResponseData) {
    const {
      misMatchPercentage,
      isSameDimensions,
      link,
      misMatchTolerance
    } = result;

    const error = new Error();

    if (!isSameDimensions) {
      error.message = `Compared Screenshots are not in the same dimension! -> ${link}`;
      error.name = 'IsSameDimensionsError';
      throw error;
    }

    if (misMatchPercentage === null) {
      error.message = `For this image is no baseline defined! -> ${link}`;
      error.name = 'NoBaselineError';
      throw error;
    }

    if (misMatchPercentage > misMatchTolerance) {
      error.message = `Mismatch of ${misMatchPercentage} % is greater than the tolerance ${misMatchTolerance} %! -> ${link}`;
      error.name = 'MisMatchPercentageError';
      throw error;
    }
  }
}

export interface ITestSessionResponseData {
  misMatchPercentage: number | null;
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
  apiEndpoint: string;
  autoBaseline?: boolean;
  misMatchTolerance?: number;
  liveResult?: boolean;
}

export interface IDesiredCapabilities {
  device?: string;
  browserName?: string;
  deviceName?: string;
  platformName?: string;
  platformVersion?: string;
  platform?: string;
  os?: string;
  os_version?: string;
  version?: string;
}

export type Base64 = string;
