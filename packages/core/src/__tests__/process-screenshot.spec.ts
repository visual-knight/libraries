import axios from 'axios';
import {
  IDesiredCapabilities,
  IProcessScreenshotOptionsUser,
  ITestSessionResponseData,
  VisualKnightCore
} from '../process-screenshot';

describe('process-screenshot', () => {
  const options: IProcessScreenshotOptionsUser = {
    key: 'Some Key',
    project: 'Some Project',
    apiEndpoint: 'Some url',
    autoBaseline: true,
    misMatchTolerance: 0.15
  };
  let visualKnightCore: VisualKnightCore;

  beforeEach(() => {
    visualKnightCore = new VisualKnightCore(options);
  });

  describe('processTestSessionResult', () => {
    const successTestSessionResult: ITestSessionResponseData = {
      misMatchTolerance: 0.01,
      misMatchPercentage: 0,
      isSameDimensions: true,
      link: 'url'
    };

    it('should return undefined if no errors', () => {
      const testSessionResult = successTestSessionResult;

      const result = visualKnightCore['processTestSessionResult'](testSessionResult);

      expect(result).toBe(undefined);
    });

    it('should throw error if no baseline', () => {
      const testSessionResult = {
        ...successTestSessionResult,
        misMatchPercentage: null
      };
      const expectedError = new Error();
      expectedError.message = `For this image is no baseline defined! -> ${testSessionResult.link}`;
      expectedError.name = 'NoBaselineError';

      expect(() => visualKnightCore['processTestSessionResult'](testSessionResult)).toThrowError(expectedError);
    });

    it('should throw error if not the same dimension', () => {
      const testSessionResult = {
        ...successTestSessionResult,
        isSameDimensions: false
      };
      const expectedError = new Error();
      expectedError.message = `Compared Screenshots are not in the same dimension! -> ${testSessionResult.link}`;
      expectedError.name = 'IsSameDimensionsError';

      expect(() => visualKnightCore['processTestSessionResult'](testSessionResult)).toThrowError(expectedError);
    });

    it('should throw error if mismatch > tollerance', () => {
      const testSessionResult = {
        ...successTestSessionResult,
        misMatchPercentage: 0.02,
        misMatchTolerance: 0.01
      };
      const expectedError = new Error();
      expectedError.message = `Mismatch of ${testSessionResult.misMatchPercentage} % is greater than the tolerance ${testSessionResult.misMatchTolerance} %! -> ${testSessionResult.link}`;
      expectedError.name = 'MisMatchPercentageError';

      expect(() => visualKnightCore['processTestSessionResult'](testSessionResult)).toThrowError(expectedError);
    });
  });

  describe('uploadScreenshot', () => {
    const successTestSessionResult: ITestSessionResponseData = {
      misMatchTolerance: 0.01,
      misMatchPercentage: 0,
      isSameDimensions: true,
      link: 'url'
    };

    it('should upload with success', async () => {
      const image = new Buffer('SCREENSHOT');
      const testSessionId = 'Some testSessionId';
      axios.post = jest.fn().mockResolvedValueOnce({
        data: {
          data: { uploadScreenshot: successTestSessionResult }
        }
      });

      const result = await visualKnightCore['uploadScreenshot'](image, testSessionId);

      expect(result).toBe(successTestSessionResult);
      expect(axios.post).toHaveBeenCalledWith(
        options.apiEndpoint,
        {
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
          variables: { testSessionId, base64Image: image.toString('base64') }
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': options.key
          }
        }
      );
    });

    it('should throw error', async () => {
      const image = new Buffer('SCREENSHOT');
      const testSessionId = 'Some testSessionId';
      axios.post = jest.fn().mockRejectedValueOnce(new Error('Some error'));

      await expect(visualKnightCore['uploadScreenshot'](image, testSessionId)).rejects.toThrowError(
        new Error('Some error')
      );
    });
  });

  describe('invokeTestSession', () => {
    const testname = 'Some name';
    const capabilities: IDesiredCapabilities = {
      os: 'Windows',
      browserName: 'Chrome'
    };

    it('should invoke test session', async () => {
      const expectedTestSession = 'Some testSession';
      axios.post = jest.fn().mockResolvedValueOnce({
        data: {
          data: { invokeTestSession: expectedTestSession }
        }
      });

      const result = await visualKnightCore['invokeTestSession'](testname, capabilities);

      expect(result).toBe(expectedTestSession);
      expect(axios.post).toHaveBeenCalledWith(
        options.apiEndpoint,
        {
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
            project: options.project,
            misMatchTolerance: options.misMatchTolerance,
            autoBaseline: options.autoBaseline,
            capabilities
          }
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': options.key
          }
        }
      );
    });

    it('should throw error for code 400', async () => {
      axios.post = jest.fn().mockRejectedValueOnce({
        statusCode: 400
      });

      await expect(visualKnightCore['invokeTestSession'](testname, capabilities)).rejects.toThrowError(
        new Error('Not all required fields are set.')
      );
    });

    it('should throw error for code 403', async () => {
      axios.post = jest.fn().mockRejectedValueOnce({
        statusCode: 403
      });

      await expect(visualKnightCore['invokeTestSession'](testname, capabilities)).rejects.toThrowError(
        new Error('Not Authorized! Check if your key is set correct.')
      );
    });

    it('should throw error for unknown code', async () => {
      axios.post = jest.fn().mockRejectedValueOnce({
        message: 'Not found',
        statusCode: 404
      });

      await expect(visualKnightCore['invokeTestSession'](testname, capabilities)).rejects.toThrowError(
        new Error('Not found')
      );
    });
  });

  describe('processScreenshot', () => {
    const successTestSessionResult: ITestSessionResponseData = {
      misMatchTolerance: 0.01,
      misMatchPercentage: 0,
      isSameDimensions: true,
      link: 'url'
    };
    it('shpuld process screenshot', async () => {
      const testname = 'Some name';
      const capabilities: IDesiredCapabilities = {
        os: 'Windows',
        browserName: 'Chrome'
      };
      const screenshot = 'screenshot';
      const testSessionId = 'Some test session id';
      const testSessionResult = successTestSessionResult;
      visualKnightCore['invokeTestSession'] = jest.fn().mockResolvedValueOnce(testSessionId);
      visualKnightCore['uploadScreenshot'] = jest.fn().mockResolvedValueOnce(testSessionResult);
      visualKnightCore['processTestSessionResult'] = jest.fn();

      await visualKnightCore.processScreenshot(testname, screenshot, capabilities);

      expect(visualKnightCore['invokeTestSession']).toHaveBeenCalledWith(testname, capabilities);
      expect(visualKnightCore['uploadScreenshot']).toHaveBeenCalledWith(
        Buffer.from(screenshot, 'base64'),
        testSessionId
      );
      expect(visualKnightCore['processTestSessionResult']).toHaveBeenCalledWith(testSessionResult);
    });
  });
});
