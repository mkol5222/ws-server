import { createServer } from 'https';
import { readFileSync } from 'fs';
import { WebSocketServer } from 'ws';

const server = createServer({
  cert: readFileSync('app.pem'),
  key: readFileSync('app.key')
});
const wss = new WebSocketServer({ server });

wss.on('connection', function connection(ws) {
  ws.on('message', function message(data) {
    console.log('received: %s', data);
  });

  ws.send('something');
});

console.log('listening on 8080')
server.listen(8080);