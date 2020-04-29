package agent_java_core;

import io.aexp.nodes.graphql.annotations.GraphQLArgument;
import io.aexp.nodes.graphql.annotations.GraphQLProperty;
import lombok.*;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@GraphQLProperty(name = "uploadScreenshot", arguments = {
        @GraphQLArgument(name = "testSessionId", type = "String!"),
        @GraphQLArgument(name = "base64Image", type = "String!")
})
class UploadScreenshotMutation {
    Float misMatchPercentage;
    Float misMatchTolerance;
    Boolean isSameDimensions;
    String link;
}