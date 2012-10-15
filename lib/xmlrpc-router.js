
var XmlRpcResponse = require('./lib/xmlrpc-response');
var XmlRpcFault = require('./lib/xmlrpc-fault');

// for use in conjunction with express-xmlrpc (xmlrpc middleware for express)
// returns a route handler for an express server which dispatches XML-RPC
// requests to handlers. The return value from a handler is transformed from
// javascript into an XML-RPC response and sent.
//      var xrpc = require('xrpc');
//      
//      app.use(xrpc.xmlRpc);
//
//     server.post('/RPC2', xrpc.route({
//         echo: function (msg) {
//             success("Echo: " + msg);
//             // fault(
//         }
//     }));
exports.route = function route(handlers) {

    return function (req, res) {

        var cb = function (err, rv) {
            if (!err) {
                res.send(new XmlRpcResponse([rv]).xml());
            }
            else {
                res.send(new XmlRpcFault(err.code || 0, err.message || err).xml());
            }
        };

        if (!req.xmlRpc) {
            res.send(new XmlRpcFault(-32700, 'parse error. not well formed').xml());
        }

        var params = req.xmlRpc.params,
            method = req.xmlRpc.method;

        if (handlers.hasOwnProperty(method))
            try {
                handlers[method](params);
            }
            catch (e) {
                res.send(new XmlRpcFault(-32500, 'Unexpected exception ' + e).xml());
            }
        else
            res.send(new XmlRpcFault(-32601, 'requested method ' + method + ' not found'));

    };

};