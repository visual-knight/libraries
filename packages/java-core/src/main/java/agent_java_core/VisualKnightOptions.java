package agent_java_core;

import lombok.Builder;

@Builder
public class VisualKnightOptions {
    String apiEndpoint;
    String apiKey;
    String project;
    @Builder.Default
    Double misMatchTolerance = 0.01;
    @Builder.Default
    Boolean autoBaseline = false;
    VisualKnightCapabilities visualKnightCapabilities;
    @Builder.Default
    Boolean debug = false;
}
