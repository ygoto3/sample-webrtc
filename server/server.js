const WebSocketServer = require('ws').Server;

const wss = WebSocketServer({ port: 3434 });

wss.broadcast = function (data) {
  for (let i in this.clients) {
    this.clients[i].send(data);
  }
};

wss.on('connection', ws => {
  ws.on('message', message => {
    console.log('received: %s', message);
    wss.broadcast(message);
  })
});
