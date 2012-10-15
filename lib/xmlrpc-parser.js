var xml = require('node-xml');

function XmlRpcParser(events) {
    
    this.events = events;
    this.parser = new xml.SaxParser(this.getHandler());
    this.data = {
        method: false,
        is_response: false,
        is_fault: false,
        params: []
    };
    this.finished = false;
    this.complete = false;
    this.isImplicitString = false;
    this.elementStack = [];
    this.cdataStack = [[]];
    this.valueStack = [];
    this.nameStack = [];

}

XmlRpcParser.prototype.parseString = function parseString(str) {
    this.parser.parseString(str);
    return this;
};

XmlRpcParser.prototype.finish = function finish() {

    var instance = this;

    // The flag `this.finished` serves to debounce this function, which
    // could be called multiple times: eg, in response to the successful
    // completion of a document or the end of input (possibly premature).
    if (instance.finished) { return instance; }
    instance.finished = true;

    // XML parsing is all async, so this needs to be as well.
    setTimeout(function () {
        if (instance.complete) {
            instance.events.onDone(instance.data);
        } else {
            instance.events.onError('End of input reached before document complete');
        }
    }, 0);

    return this;
};

XmlRpcParser.prototype.getHandler = function getHandler() {

    var instance = this;

    return function (cb) {

        // React to the start of elements, detects responses and faults, as
        // well as initializing a new struct or array in progress.
        cb.onStartElementNS(function (elem, attrs, prefix, uri, namespaces) {
            // Push the current element name onto the stack, along with a
            // collector for CDATA.
            instance.elementStack.push(elem);
            instance.cdataStack.push([]);
            switch (elem) {
                // Detect a methodResponse.
                case 'methodResponse': instance.data.is_response = true; break;
                    // Detect a response that's a fault.
                case 'fault': instance.data.is_fault = true; break;
                    // Push an empty object onto the stack to collect members
                case 'struct': instance.valueStack.push({}); break;
                    // Push an empty array onto the stack to collect values
                case 'array': instance.valueStack.push([]); break;
                    // Assume an implicit string, to begin with.
                case 'value': instance.isImplicitString = true; break;
            }
        });

        // Collect CDATA if we're in an element
        cb.onCharacters(function (chars) {
            if (instance.cdataStack.length) {
                instance.cdataStack[instance.cdataStack.length - 1].push(chars);
            }
        });

        // React to the end of elements.
        cb.onEndElementNS(function (elem, prefix, uri) {
            var cdata = instance.cdataStack.pop().join('').trim(),
                last_elem = instance.elementStack.pop();
            switch (elem) {
                // The end of a call or response means a successful end of parsing, 
                case 'methodCall':
                case 'methodResponse':
                    instance.complete = true;
                    instance.finish();
                    break;
                    // Record the method name from CDATA, when encountered.
                case 'methodName':
                    instance.data.method = cdata; break;
                    // The end of a param element or a fault means the current
                    // value on the stack is complete.
                case 'param':
                case 'fault':
                    instance.data.params.push(instance.valueStack.pop()); break;
                    // Push this member name onto the stack for safekeeping
                    // until a value comes along.
                case 'name':
                    instance.nameStack.push(cdata); break;
                    // The end of a member is where we pick up the last
                    // encountered name and value and stick the pair into the
                    // current struct under construction
                case 'member':
                    var curr_name = instance.nameStack.pop(),
                        curr_value = instance.valueStack.pop();
                    instance.valueStack[instance.valueStack.length - 1][curr_name] = curr_value;
                    break;
                    // Explicit string, i4, int, and double values are treated the same. 
                    // TODO: Should these be parsed more strictly?
                    // TODO: Lots of repetition here, feels icky.
                case 'string':
                case 'i4':
                case 'int':
                case 'double':
                    instance.isImplicitString = false;
                    instance.valueStack.push(cdata); break;
                    // Parse a boolean into the JS equivalent.
                case 'boolean':
                    instance.isImplicitString = false;
                    instance.valueStack.push(('true' == cdata) || (1 == cdata)); break;
                    // Parse a date from its ISO 8601 representation.
                case 'dateTime.iso8601':
                    instance.isImplicitString = false;
                    instance.valueStack.push(parseISO8601(cdata)); break;
                    // Decode a base64 into its binary form.
                case 'base64':
                    instance.isImplicitString = false;
                    instance.valueStack.push(decodeBase64(cdata)); break;
                    // The end of an array / struct also cancels implicit string
                case 'struct':
                case 'array':
                    instance.isImplicitString = false;
                    break;
                    // The end of a value can mean the end of an implicit
                    // string and also the end of an array item.
                case 'value':
                    if (instance.isImplicitString) {
                        // No type element found within the value element,
                        // so assume an implicit string.
                        instance.valueStack.push(cdata);
                    }
                    if ('data' == instance.elementStack[instance.elementStack.length - 1]) {
                        // Nested inside a data element, so assume an array.
                        var curr_value = instance.valueStack.pop();
                        instance.valueStack[instance.valueStack.length - 1].push(curr_value);
                    }
                    break;
            }
        });

        // React to end of document by calling the onDone handler 
        cb.onEndDocument(function () {
            instance.finish();
        });

        // React to an error by calling the onError handler 
        cb.onError(function (msg) {
            instance.options.onError(msg);
        });

    };

};

// from [Soya.Encode.Base64](http://soya.saltstorm.net)
function decodeBase64(sEncoded) {

    // Input must be dividable with 4.
    if (!sEncoded || (sEncoded.length % 4) > 0) { return sEncoded; }
    else if (typeof (atob) != 'undefined') { return atob(sEncoded); }

    var nBits, i, sDecoded = '';
    var base64 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';

    sEncoded = sEncoded.replace(/\W|=/g, '');
    for (i = 0; i < sEncoded.length; i += 4) {
        nBits =
            (base64.indexOf(sEncoded.charAt(i)) & 0xff) << 18 |
            (base64.indexOf(sEncoded.charAt(i + 1)) & 0xff) << 12 |
            (base64.indexOf(sEncoded.charAt(i + 2)) & 0xff) << 6 |
             base64.indexOf(sEncoded.charAt(i + 3)) & 0xff;
        sDecoded += String.fromCharCode(
            (nBits & 0xff0000) >> 16, (nBits & 0xff00) >> 8, nBits & 0xff);
    }
    return sDecoded.substring(0, sDecoded.length -
        ((sEncoded.charCodeAt(i - 2) == 61) ? 2 :
        (sEncoded.charCodeAt(i - 1) == 61 ? 1 : 0)));

}

function parseISO8601(string) {

    var regexp = "([0-9]{4})(-?([0-9]{2})(-?([0-9]{2})(T([0-9]{2}):([0-9]{2})(:([0-9]{2})(\.([0-9]+))?)?(Z|(([-+])([0-9]{2}):([0-9]{2})))?)?)?)?";

    var time,
        offset = 0,
        dOut = new Date(),
        d = string.match(new RegExp(regexp)),
        date = new Date(d[1], 0, 1);

    if (d[3]) { date.setMonth(d[3] - 1); }
    if (d[5]) { date.setDate(d[5]); }
    if (d[7]) { date.setHours(d[7]); }
    if (d[8]) { date.setMinutes(d[8]); }
    if (d[10]) { date.setSeconds(d[10]); }
    if (d[12]) { date.setMilliseconds(Number("0." + d[12]) * 1000); }
    if (d[14]) {
        offset = (Number(d[16]) * 60) + Number(d[17]);
        offset *= ((d[15] == '-') ? 1 : -1);
    }

    offset -= date.getTimezoneOffset();
    time = (Number(date) + (offset * 60 * 1000));
    dOut.setTime(Number(time));

    return dOut;

}

module.exports = XmlRpcParser;
