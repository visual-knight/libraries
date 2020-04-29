package agent_java_core;

import org.testng.Assert;
import org.testng.annotations.BeforeSuite;
import org.testng.annotations.DataProvider;
import org.testng.annotations.Test;

import java.net.MalformedURLException;

public class Example {
    VisualKnightOptions visualKnightOptions;
    VisualKnightCore core;

    @BeforeSuite
    public void setUp() throws MalformedURLException {
        visualKnightOptions = VisualKnightOptions.builder()
                .apiEndpoint("http://localhost:3333/graphql")
                .build();

        core = new VisualKnightCore(visualKnightOptions);
    }
//
//    @Test
//    public void asd() throws MalformedURLException {
//        VisualKnightCapabilities visualKnightCapabilities = VisualKnightCapabilities.builder().browserName("Chrome").os("Windows").build();
//        VisualKnightOptions visualKnightOptions = VisualKnightOptions.builder()
//                .apiEndpoint("http://localhost:3333/graphql")
//                .apiKey("asdasd")
//                .project("test")
//                .visualKnightCapabilities(visualKnightCapabilities)
//                .build();
//
//        VisualKnightCore core = new VisualKnightCore(visualKnightOptions);
//
////        core.invokeTestSession("test", capabilities);
//
//        System.out.println("END");
//    }
//
//    @Test
//    public void uploadScreenshot() throws IOException {
//        VisualKnightCapabilities visualKnightCapabilities = VisualKnightCapabilities.builder().browserName("Chrome").os("Windows").build();
//        VisualKnightOptions visualKnightOptions = VisualKnightOptions.builder()
//                .apiEndpoint("http://localhost:3333/graphql")
//                .apiKey("asdasd")
//                .project("test")
//                .visualKnightCapabilities(visualKnightCapabilities)
//                .build();
//
//        VisualKnightCore core = new VisualKnightCore(visualKnightOptions);
//
////        byte[] fileContent = FileUtils.readFileToByteArray(new File(getClass().getResource("large.png").getFile()));
////        core.uploadScreenshot("ck8t908ie000111pjg8z2x58o", Base64.getEncoder().encodeToString(fileContent));
//        core.uploadScreenshot("ck8t908ie000111pjg8z2x58o", "asdsfgsdf");
//
//        System.out.println("END");
//    }

    @DataProvider(name = "processTestSessionResultCases")
    public Object[][] complexParamsDataProvider() {
        return new Object[][]{
                {
                        UploadScreenshotMutation.builder()
                                .misMatchPercentage(null)
                                .misMatchTolerance(0.01f)
                                .isSameDimensions(null)
                                .link("http://google.com")
                                .build(),
                        "For this image is no baseline defined! -> http://google.com",
                },
                {
                        UploadScreenshotMutation.builder()
                                .misMatchPercentage(null)
                                .misMatchTolerance(0.01f)
                                .isSameDimensions(true)
                                .link("http://google.com")
                                .build(),
                        "For this image is no baseline defined! -> http://google.com",
                },
                {
                        UploadScreenshotMutation.builder()
                                .misMatchPercentage(null)
                                .misMatchTolerance(0.01f)
                                .isSameDimensions(false)
                                .link("http://google.com")
                                .build(),
                        "Compared Screenshots are not in the same dimension! -> http://google.com",
                },
                {
                        UploadScreenshotMutation.builder()
                                .misMatchPercentage(0.02f)
                                .misMatchTolerance(0.01f)
                                .isSameDimensions(true)
                                .link("http://google.com")
                                .build(),
                        "Mismatch of 0.02 is greater than the tolerance 0.01 -> http://google.com",
                },
        };
    }

    @Test(dataProvider = "processTestSessionResultCases")
    public void processTestSessionResult(UploadScreenshotMutation testSessionResult, String expectedMessage) {
        String actualMessage = "";
        try {
            core.processTestSessionResult(testSessionResult);
        } catch (ImageProcessException exception) {
            actualMessage = exception.getMessage();
        }
        Assert.assertEquals(actualMessage, expectedMessage);
    }
}
