# Visual Knight CodeceptJS Helper
A helper for Codeceptjs which integrates the visual knight platform.

## Installation

```shell
npm install @visual-knight/codeceptjs -D
```

## Integration

```javascript
// codeceptjs.json

{
    ...
    "helpers": {
        ...
        "VisualKnight": {
            "require": "./node_modules/@visual-knight/codeceptjs",
            "key": "YOUR_KEY",
            "project": "YOUR_PROJECT_ID OR YOUR_PROJECT_NAME",
            "useHelper": "Puppeteer" // define which helper you use
            ... // more options can be found in the core documentation
        }
    }
}
```

