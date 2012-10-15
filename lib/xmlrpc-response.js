var util = require('util');

var XmlRpcMessage = require('./xmlrpc-message');

function XmlRpcResponse(params) {
    this.method = false;
    this.is_fault = false;
    this.params = params || [];
}

util.inherits(XmlRpcResponse, XmlRpcMessage);

module.exports = XmlRpcResponse;