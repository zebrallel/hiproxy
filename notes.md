# package.json 中自定义 ghooks

```js
  "config": {
    "ghooks": {
      "pre-commit": "./node_modules/.bin/semistandard",
      "pre-push": "npm test"
    }
  }
```

semistandard是一种Node端代码规范

