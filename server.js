const express = require('express');
const fs = require('fs-extra');
const WebSocket = require('ws');
const cors = require('cors');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Basic API Route
app.get('/', (req, res) => {
  res.send('Orbital Pod is running!');
});

// WebSocket Setup
const wss = new WebSocket.Server({ noServer: true });

wss.on('connection', (ws) => {
  ws.on('message', (message) => {
	console.log('Received:', message);
	ws.send('Hello from Orbital Pod!');
  });
});

// Start Server
const server = app.listen(PORT, () => {
  console.log(`Orbital Pod running at http://localhost:${PORT}`);
});

// Upgrade HTTP to WebSocket
server.on('upgrade', (request, socket, head) => {
  wss.handleUpgrade(request, socket, head, (ws) => {
	wss.emit('connection', ws, request);
  });
});
