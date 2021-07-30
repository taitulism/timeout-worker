[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Build Status](https://travis-ci.org/taitulism/timeout-worker.svg?branch=master)](https://travis-ci.org/taitulism/timeout-worker)


timeout-worker
==================
A dedicated web-worker for the `setTimeout` method.
Client only. No server required.

&nbsp;

## Why?
When the current tab loses focus the browser throttles its timeouts and they become inaccurate when setting short timeout periods. This behavior is inconsistent between different browsers and the subject is not well documented. 

Using a web-worker for setting timeouts eliminates this issue.

&nbsp;

## Install
`$ npm install timeout-worker`  

&nbsp;

## Usage
```js
// import:
import { timeoutWorker } from 'timeout-worker';
// or require:
const { timeoutWorker } = require('timeout-worker');

// initialize
timeoutWorker.start();

const timeoutRef = timeoutWorker.setTimeout(() => {
    // do somthing
}, 3000)

timeoutWorker.clearTimeout(timeoutRef);

// terminate
timeoutWorker.stop();
```

&nbsp;

## `timeoutWorker`
A singleton instance. It has the following methods:  
* `.start()`
* `.setTimeout(callback, ms)`
* `.clearTimeout(timeoutRef)`
* `.stop()`
* `.onError(errorHandler)`

&nbsp;

### `.start()`
Initializes a worker. **Must be called in order to set timeouts**. 

&nbsp;

### `.setTimeout(callback, ms)`
`.setTimeout(callback, ms[, arg1, arg2, ..., argN])`

>TL;DR - Same as `window.setTimeout()`.

Sets a timeout in the worker scope. Returns a timeout reference (number) that can be used for clearing the timeout. Accepts a callback to run after the given delay in milliseconds. Extra arguments will be passed to the callback by the same order.

**Calling `setTimeout` before initializing a worker will throw an error**. See `.start()` above.

```js
timeoutWorker.setTimeout((a, b, c) => {

    console.log(a, b, c); // 1 2 3

}, 1000, 1, 2, 3);
```

&nbsp;

### `.clearTimeout()`
>TL;DR - Same as `window.clearTimeout()`.

Cancles an active timeout. Accept a timeout reference (returned by `setTimeout`).


```js
const timeoutRef = timeoutWorker.setTimeout(callback, 1000);

timeoutWorker.clearTimeout(timeoutRef);
```


&nbsp;

### `.stop()`
Terminates the worker, clearing any active timeouts. Will not set any new timeouts until `.start()` is called again.

&nbsp;

### `.onError(errorHandler)`
Sets an error handler function to catch the worker's exceptions. The function will get called with an `Error`
```js
timeoutWorker.onError((err) => {
    console.error(err);
});

/*
  Error: timeoutWorker
  Uncaught Error: Something Happend!
      Worker: blob:null/ce72fad0-bd41-46f7-9bea-fd405ab117c5
      Line: 7
      Col: 15
      Timestamp: 72.00000001466833
      at Worker._worker.onerror (timeout-worker.js:58)
*/
```


You can see the worker's code by opening the blob in a new browser tab.


