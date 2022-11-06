import { createServer } from 'http';
import { parse } from 'url';
import { WebSocketServer } from 'ws';
import path from 'path';
import fs from 'fs';

const server = createServer(function(req, res) {
    const uri = parse(req.url).pathname;
    console.log(`got request for ${uri}`)

    if (uri == '/') {
        res.writeHead(200, 'text/html');
        const  filename = path.join(process.cwd(), 'client.html');
        var fileStream = fs.createReadStream(filename);
        fileStream.pipe(res);

    } else {
            res.writeHead(404, {'Content-Type': 'text/plain'});
            res.write('404 Not Found\n');
            res.end();
    }
});

const wss1 = new WebSocketServer({ noServer: true });
const wss2 = new WebSocketServer({ noServer: true });

wss1.on('connection', function connection(ws) {
    // ...
    setInterval(() => {
        console.log(`wss1 sending ${Date.now()}`);

        ws.send(`wss1 ${Date.now()}`);
    }, 5000)

    console.log('wss1 connection');
    ws.send(`wss1 connected`);
    ws.on('message', function message(data) {
        console.log('wss1 received: %s', data);
        ws.send(`wss1 received ${data}`);
    });


});

wss2.on('connection', function connection(ws) {
    // ...
    console.log('wss2 connection')
    ws.on('message', function message(data) {
        console.log('wss2 received: %s', data);
    });
});

server.on('upgrade', function upgrade(request, socket, head) {
    const { pathname } = parse(request.url);

    if (pathname === '/foo') {
        wss1.handleUpgrade(request, socket, head, function done(ws) {
            wss1.emit('connection', ws, request);
        });
    } else if (pathname === '/bar') {
        wss2.handleUpgrade(request, socket, head, function done(ws) {
            wss2.emit('connection', ws, request);
        });
    } else {
        socket.destroy();
    }
});

console.log('listening on 8080');
server.listen(8080);