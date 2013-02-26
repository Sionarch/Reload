var http    = require('http'),
    rpc     = require('./jsonrpc'),
    url     = require('url'),
    express = require('../express/'),
    path    = require('path'),
    vars    = require('../application/globals');

var app             = express(),
    server          = http.createServer(app),
    emptyRPCRequest = "?jsonRPC={}";


var errorResponse = function (response, content) {
    response.writeHead(404);
    response.end(content);
};


create = function(port) {
    console.log(path.resolve(__dirname, '../UI'));

    app.use(express.favicon());

    if(vars.globals.logLevel == 2){
        app.use(express.logger('dev'));
    }
    
    app.use(express.cookieParser('foobar'));
    app.use(express.session());
    app.use(express.bodyParser());
    app.use('/', express.static(path.resolve(__dirname, '../UI')));

    app.get('/proccess', function(request, response){
        
        rpc.listen(JSON.parse(request.query.jsonRPC), response);
    });



    app.post('/', function( request, response ){

        rpc.listen(request.body, response);
    });

    // Init WebSockets.
    var io      = require('../node_modules/socket.io');
    io = io.listen(server);

    // Start app.
    server.listen(port);

    // WebSocket message dispatcher registration.
    var md = vars.MsgDispatcher;

    io.sockets.on('connection', function (socket) {

        // A callback that sends a message on the WebSocket with appropriate header.
        var msgHandler = function( msg ) {
            if (!msg.target) {
                console.log('Message has no target: ' + JSON.stringify(msg));
                return;
            }

            switch ( msg.target ) {
                case 'devices':
                    socket.emit('devices', {msg: msg.msg});
                break;

                case 'log':
                    socket.emit('log', { msg: msg.msg });
                break;
                default:
                    console.log('Unknown target ' + msg.target);
            }
        };

        // Register message handler.
        md.subscribe(msgHandler);

    });

    if(vars.globals.openBrowser) {
        vars.methods.startWebUI();    
    }
    
    console.log('Server started listening on port: ' + port, 0);
};

exports.create = create;
