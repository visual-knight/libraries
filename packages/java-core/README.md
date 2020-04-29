# Java implementation for [Visual Knight](https://github.com/visual-knight/platform-community-edition) API 
Port from JavaScript implementation [link](https://github.com/visual-knight/libraries/tree/master/packages/core)

## Gradle
```
repositories {
    maven { url 'https://jitpack.io' }
}
```
```
dependencies {
    implementation 'com.github.pashidlos:visualknight_agent_java_core:${VERSION}'
}
```
## Maven
```
<repositories>
    <repository>
        <id>jitpack.io</id>
        <url>https://jitpack.io</url>
    </repository>
</repositories>
```
```
<dependency>
    <groupId>com.github.pashidlos</groupId>
    <artifactId>visualknight_agent_java_core</artifactId>
    <version>${VERSION}</version>
</dependency>
```
[Available versions](https://github.com/pashidlos/visualknight_agent_java_core/releases)

More info about https://jitpack.io/

## Usage
* Setup options object
```
VisualKnightOptions visualKnightOptions = VisualKnightOptions.builder()
    // URL to Visual Knight backend
    // Required
    .apiEndpoint("http://localhost:3333/graphql")

    // Your Visual Knight API key
    // Required
    .apiKey("API_KEY") 

    // Your project name or ID
    // Required
    .project("PROJECT_KEY_OR_NAME")

    // The mismatch tolerance for the comparison, 0.01 is 1%
    // Optional
    // Default: 0.01
    .misMatchTolerance(0.01)

    // Accept first testsession for a variation as baseline
    // Optional
    // Default: false
    .autoBaseline(false)
    .build();
```
* Create instance of `VisualKnightCore`
```
VisualKnightCore visualKnightCore = new VisualKnightCore(visualKnightOptions);
```
* Take a screenshot as String in Base64 format
```
// Selenium example
String screenshotBase64 = ((TakesScreenshot) driver).getScreenshotAs(OutputType.BASE64);
```
* Create instance of `VisualKnightCapabilities`
```
VisualKnightCapabilities visualKnightCapabilities = VisualKnightCapabilities.builder()
                // Available: 'Windows', 'Mac OS', `Puppeteer`
                .os("Windows")

                // Available: 'Internet Explorer', 'Firefox', 'Safari', 'Chrome', 'Opera'
                .browserName("Chrome")
                .build()
```
* Process image
```
visualKnightCore.processScreenshot(
        "Name for test",
        screenshotBase64,
        visualKnightCapabilities
);
```