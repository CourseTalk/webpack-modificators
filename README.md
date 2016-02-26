# webpack-modificators

[![Build Status](https://travis-ci.org/CourseTalk/webpack-modificators.svg?branch=master)](https://travis-ci.org/CourseTalk/webpack-modificators)

[![NPM](https://nodei.co/npm/webpack-modificators.png)](https://npmjs.org/package/webpack-modificators)

This WebPack plugin allows to replace modules by modificator name.

# Install

```
npm install webpack-modificators --save-dev
```

# Usage

Add this plugin into your webpack config:

``` javascript
var WebpackModificators = require('webpack-modificators');

module.exports = {
  entry: { },
  output: { },
  plugins: [new WebpackModificators('new')]
};
```

WebpackModificators gets one argument: modificator name.

Webpack will try require dependency with name `{dependency-name}--{modification-name}` instead of `{dependency-name}`. If it's not possible webpack will use `{dependency-name}`.

Common case of this plugin: build the same entry point but with slightly different dependencies. To do it you may use list of webpack configs:

``` javascript
var WebpackModificators = require('webpack-modificators');

module.exports = [{
  entry: { entry1: 'file.js' },
  output: { }
}, {
  entry: { entry2: 'file.js' },
  output: { },
  plugins: [new WebpackModificators({strong: ['new']})]
}];
```

# Development

Build an example:

```
npm run build_example
```

Run jshint and tests:

```
npm test
```

Run tests in Docker (node 0.10):

```
docker-compose run --rm test
```
