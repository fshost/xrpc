var os = require('os');

var express = require('express');

var xrpc = require('..');

var app = express();

app.configure(function () {
    app.use(xrpc.xmlRpc);
});

// example implementing one of the methods from the metaWeblog API (blogger.getUsersBlogs)
// to test interaction use Windows Live Writer, MarsEdit, or other metaWeblog-compatible blogging client
// (or see the test script for how to test using a node.js xmlrpc client)
app.post('/RPC', xrpc.route({
    blogger: {
        getUsersBlogs: function (key, username, password, callback) {
            console.log('getuserblogs called with key:', key, 'username:', username, 'and password:', password);
            callback(null, [{ url: 'http://programmingcorner.blogspot.com', blogid: 1, blogName: 'my blog' }]);
        }
    }
}));


app.listen(3000);
console.log('listening for XML-RPC calls on http://' + os.hostname() + ':3000/RPC');