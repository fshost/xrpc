var util = require('util');

var XmlRpcMessage = require('./xmlrpc-message');

// Expects a fault code and message string:
//
//     var fault = new XMLRPC.Fault(404, "Method not found");
//     var xml = msg.xml();
//
function XmlRpcFault(fault_code, fault_string) {
    this.method = false;
    this.is_fault = true;
    this.params = [{
        faultString: fault_string,
        faultCode: fault_code
    }];
}

util.inherits(XmlRpcFault, XmlRpcMessage);

module.exports = XmlRpcFault;