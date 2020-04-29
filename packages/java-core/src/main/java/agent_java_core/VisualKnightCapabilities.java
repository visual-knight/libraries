package agent_java_core;

import lombok.Builder;

@Builder
public class VisualKnightCapabilities {
    @Builder.Default
    String os = "unknown";
    @Builder.Default
    String browserName = "unknown";
}
