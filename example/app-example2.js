var express = require('express'),
    xrpc = require('xrpc'),
    app = express();

 
app.use(xrpc.xmlRpc);

app.post('/RPC', xrpc.route({
    handleNewRequest: function ( params, callback ) {
    	var responseObj = {
    		firstMember: params.firstMember,
    		secondMember: params.secondMember,
    		response: '',
    		action: 'end'
    	};

    	//The rest of the magic that manipulates the responseObj object e.g.
    	responseObj.response = 'The response string';
 
 		//Send the final response
        callback( null, responseObj );
    }
}));

app.listen(3000);

//Then send a request to http://localhost:3000/RPC if this is on localhost 
//Sample request in ./example-2-request.xml and the expected response is shown in ./example-2-response.xml
//A very key thing to note is that Content-Type: header must be text/xml. One way to test is to use:
//curl -d @example-2-request.xml --header "Content-Type: text/xml" http://localhost:3000/RPC
