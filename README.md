# xrpc

  An XML-RPC server middleware for Express running on Node.js
  built on [node](http://nodejs.org) for [Express](http://expressjs.com/).

    var express = require('express'),
        xrpc = require('xrpc'),
        app = express();

    app.use(xrpc.xmlRpc);
    //Note that the Content-Type: of the request must be text/xml for this to work 
    app.post('/RPC', xrpc.route({
        echo: function (msg, callback) {
            callback(null, msg);
        }
    }));

    app.listen(3000);


## Installation

    $ npm install xrpc


## Features

  * express middleware
  * platform-independent xml parser
  * includes a router to make using this module dead-simple

## Examples

See app.js in the example subdirectory for an example implementing one of the metaWeblog API methods

## Running Tests

To run the test, ensure the dev dependencies are installed

    $ npm install

then run the test:

    $ npm test

## License

(The MIT License)

Copyright (c) 2012 Nathan Cartwright&lt;fshost@yahoo.com&gt;

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
'Software'), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
