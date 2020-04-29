package agent_java_core;

import io.aexp.nodes.graphql.*;
import io.aexp.nodes.graphql.annotations.GraphQLArgument;
import io.aexp.nodes.graphql.annotations.GraphQLProperty;

import java.net.MalformedURLException;
import java.util.HashMap;
import java.util.Map;


public class VisualKnightCore {
    VisualKnightOptions visualKnightOptions;
    Map<String, String> headers = new HashMap<>();
    GraphQLRequestEntity.RequestBuilder graphQLRequestBuilder;

    public VisualKnightCore(VisualKnightOptions visualKnightOptions) throws MalformedURLException {
        this.visualKnightOptions = visualKnightOptions;
        this.headers.put("x-api-key", visualKnightOptions.apiKey);
        this.graphQLRequestBuilder = GraphQLRequestEntity.Builder()
                .url(visualKnightOptions.apiEndpoint)
                .headers(this.headers);
    }

    public void processScreenshot(String testName, String base64Image, VisualKnightCapabilities capabilities) {

        String testSessionId = this.invokeTestSession(testName, capabilities);

        UploadScreenshotMutation uploadResult = this.uploadScreenshot(testSessionId, base64Image);

        this.processTestSessionResult(uploadResult);
    }

    void processTestSessionResult(UploadScreenshotMutation uploadResult) {
        if (uploadResult.misMatchPercentage == null && (uploadResult.isSameDimensions == null || uploadResult.isSameDimensions)) {
            throw new ImageProcessException("For this image is no baseline defined! -> " + uploadResult.link);
        }

        if (!uploadResult.isSameDimensions) {
            throw new ImageProcessException("Compared Screenshots are not in the same dimension! -> " + uploadResult.link);
        }

        if (uploadResult.misMatchPercentage > visualKnightOptions.misMatchTolerance) {
            throw new ImageProcessException("Mismatch of " + uploadResult.misMatchPercentage + " " +
                    "is greater than the tolerance " + visualKnightOptions.misMatchTolerance + " " +
                    "-> " + uploadResult.link);
        }
    }

    String invokeTestSession(String testName, VisualKnightCapabilities capabilities) {
        @GraphQLProperty(name = "invokeTestSession", arguments = {
                @GraphQLArgument(name = "project", type = "String!"),
                @GraphQLArgument(name = "testname", type = "String!"),
                @GraphQLArgument(name = "autoBaseline", type = "Boolean!"),
                @GraphQLArgument(name = "capabilities", type = "JSON!"),
                @GraphQLArgument(name = "misMatchTolerance", type = "Float!"),
        })
        class InvokeTestSession {
        }

        GraphQLRequestEntity requestEntity = this.graphQLRequestBuilder
                .request(InvokeTestSession.class)
                .arguments(
                        new Arguments("invokeTestSession",
                                new Argument<String>("project", visualKnightOptions.project),
                                new Argument<String>("testname", testName),
                                new Argument<Boolean>("autoBaseline", visualKnightOptions.autoBaseline),
                                new Argument<Object>("capabilities", new InputObject.Builder<Object>()
                                        .put("os", capabilities.os)
                                        .put("browserName", capabilities.browserName)
                                        .build()),
                                new Argument<Double>("misMatchTolerance", visualKnightOptions.misMatchTolerance)
                        )
                )
                .requestMethod(GraphQLTemplate.GraphQLMethod.MUTATE)
                .build();

        GraphQLResponseEntity<Map> responseEntity = new GraphQLTemplate().mutate(requestEntity, Map.class);
        return responseEntity.getResponse().get("invokeTestSession").toString();
    }

    UploadScreenshotMutation uploadScreenshot(String testSessionId, String base64Image) {
        GraphQLRequestEntity requestEntity = graphQLRequestBuilder
                .request(UploadScreenshotMutation.class)
                .arguments(
                        new Arguments("uploadScreenshot",
                                new Argument<String>("testSessionId", testSessionId),
                                new Argument<String>("base64Image", base64Image)
                        )
                )
                .requestMethod(GraphQLTemplate.GraphQLMethod.MUTATE)
                .build();

        GraphQLResponseEntity<UploadScreenshotMutation> responseEntity = new GraphQLTemplate().mutate(requestEntity, UploadScreenshotMutation.class);

        return responseEntity.getResponse();
    }
}
