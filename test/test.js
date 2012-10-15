

var assert = require('assert');

var os = require('os');
var host = os.hostname();
var port = process.env.PORT || 18776;

var http = require('http'),
    express = require('express');

var xrpc = require('..');
var app = express();

var data = { test: 999 };

app.configure(function () {
    app.use(xrpc.xmlRpc);
});

app.post('/RPC', xrpc.route({
    echo: function (msg, callback) {
        callback(null, msg);
    }
}));

var server = http.createServer(app).listen(port);


// the following code is not part of this module (it is needed to create a client for this test)
var xmlrpc = require('xmlrpc');

var client = xmlrpc.createClient({ host: host, port: port, path: '/RPC' });

// Sends a method call to the XML-RPC server
client.methodCall('echo', [data], function (error, value) {
    assert.equal(value.test, 999);
    console.log('express-xmlrpc test complete. If no errors are thrown then the test is successful.\n');
    server.close();
});


