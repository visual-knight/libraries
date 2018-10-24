# Visual Knight Core

The core library calls the Visual Knight API

## Core options which can be used in every adapter

```javascript
{
  // Your Visual Knight Api key
  // Required
  key: string;
  
  // Your project name or ID
  // Required
  project: string;
  
  // Browser e.g.: Chrome
  // Optional
  browserName: string;

  // Device e.g.: Mac Os
  // Optional
  deviceName: string;

  // Accept first testsession for a variation as baseline
  // Optional
  // Default: false
  autoBaseline?: boolean;

  // The mismatch tolerance for the comparison, 0.01 is 1%
  // Optional
  // Default: 0.01
  misMatchTolerance?: number;

  // You don't want realtime feedback in your CI? ;)
  // It just sends the image and continues as successful test without feedback
  // Optional
  // Default: true
  liveResult?: boolean;
}
```