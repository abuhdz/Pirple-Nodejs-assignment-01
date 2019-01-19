/*
*/

// Dependencies
const http = require('http');
const https = require('https');
const url = require('url');
const StringDecoder = require('string_decoder').StringDecoder;
const debug = 1;
const config = require ('./config');
const fs = require('fs');

var httpsServerOptions = {
    'key' : fs.readFileSync('./key.pem'), 
    'cert' : fs.readFileSync('./cert.pem'),
};

// The server should respond to all request with a string
var httpServer = http.createServer(function(request, response){
    unifiedServer(request, response);
});

// Start the server and have it listen on port 4000
httpServer.listen(config.httpPort, function() {
   if(debug) 
      console.log('The server is listening on port '+config.httpPort+' in '+ config.envName + ' mode now!');
});

// instantiate the https server
var httpsServer = https.createServer(httpsServerOptions, function(request, response){
    unifiedServer(request, response);
});

// start the https server
httpsServer.listen(config.httpsPort, function(){
   if(debug) 
      console.log('The server is listening on port '+config.httpsPort+' in '+ config.envName + ' mode now!');
});

// all the server logic for both the http and https server
var unifiedServer = function(request, response) {
    // get the url and parse it
    parsedUrl = url.parse(request.url, false);

    if(debug) 
        console.log('ParsedUrl:', parsedUrl, '\nRequest.url :', request.url);

    // get the path from the URL
    var path = parsedUrl.pathname;
    if(debug) 
        console.log('Path :', path);

    var trimmedPath = path.replace(/^\/+|\/+$/g,'');
    if(debug) 
        console.log('TrimmedPath :', trimmedPath);
    
    // get the query string as an object
    var queryStringObject = parsedUrl.query;
    if(debug) 
        console.log('queryStringObject:', queryStringObject);

    // get the method and trimmedPath to lower case
    var method = request.method.toUpperCase();
    if(debug) 
        console.log('Method :', method);
    
    // get the headers as an object
    var headers = request.headers;
    if(debug) 
        console.log('Headers:', headers);

    // get payload if any
    var decoder = new StringDecoder('utf-8');
    var buffer = '';
    var data = request.on('data', function(data){
        buffer += decoder.write(data);
    });
    if(debug) 
        console.log('buffer:', buffer);

    // log the request path
    request.on('end', function(){
        buffer += decoder.end(); 

        // choose the handler this request should go to. if one is not found, use the notfound handler
        var choosenHandler = typeof(router[trimmedPath]) !== 'undefined' ? router[trimmedPath] : handler.notfound;
        
        // construct the data object to send to the handler
        var data =  {
            'trimmedPath' : trimmedPath,
            'queryStringObject' : queryStringObject,
            'method' : method,
            'header' : headers,
            'payload' : buffer,
        };

        // route the request to the handler specified in the router
        choosenHandler(data, function(statusCode, payload) {

            // use the status code called back by the handler or default 200
            statusCode = typeof(statusCode) == 'number' ? statusCode : 200;

            // use the payload called back by handler, or default to an empty obhect 
            payload = typeof(payload) == 'object' ? payload : {};

            // convert the payload to a string
            var payloadString = JSON.stringify(payload);

            //return the response
            response.setHeader('Content-Type', 'application/json');
            response.writeHead(statusCode);
            response.end(payloadString);

            if(debug) 
                console.log('status code', statusCode, 'payloadString', payloadString);

        });


   });


};


// define the handler
var handler = {};
// sample handler
handler.sample = function(data, callback){
    // callback a http status code, and payload object
    callback(406, {'name' : 'sample handler'});    
};

handler.contoh = function(data, callback) {
    callback(200, {'contoh' : 'ini contoh kang'});
};

handler.pusink = function(data, callback) {
    callback(408, {'pusink' : 'ini contoh orang pusink '});
};

handler.ping = function(data, callback) {
    callback(200);    
};

handler.hello = function(data, callback) {
    callback(200, {'Assignment #1' : 'Hi, I am already sent assignemtn #1 to the tutor, hopefully this is great!'});    
};

handler.notfound = function(data, callback) {
    callback(404);
};
// define a request router
var router = {
    'sample' : handler.sample,
    'contoh' : handler.contoh,
    'pusink' : handler.pusink,
    'ping' : handler.ping,
    'hello' : handler.hello,
}