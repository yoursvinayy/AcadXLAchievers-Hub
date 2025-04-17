const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
app.use(cors());

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"]
  },
  transports: ['websocket'],
  pingTimeout: 60000,
  pingInterval: 25000
});

// Store connected players
const players = new Map();

io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  // Handle setting username
  socket.on('setUsername', (username) => {
    if (!username) {
      socket.emit('error', 'Username is required');
      return;
    }

    // Check if username is already taken
    if (Array.from(players.values()).includes(username)) {
      socket.emit('error', 'Username is already taken');
      return;
    }

    // Store the username
    players.set(socket.id, username);
    console.log('Username set:', username);
    console.log('Current players:', Array.from(players.values()));

    // Send confirmation to the client
    socket.emit('usernameSet', username);

    // Send updated player list to all clients
    io.emit('playerList', Array.from(players.values()));
  });

  // Handle battle requests
  socket.on('battleRequest', ({ opponent, examType }) => {
    const challenger = players.get(socket.id);
    if (!challenger) {
      socket.emit('error', 'Please set your username first');
      return;
    }

    // Find opponent's socket
    const opponentSocket = Array.from(io.sockets.sockets.values())
      .find(s => players.get(s.id) === opponent);

    if (opponentSocket) {
      opponentSocket.emit('battleRequest', { challenger, examType });
    }
  });

  // Handle battle acceptance
  socket.on('acceptBattle', ({ challenger, examType }) => {
    const opponent = players.get(socket.id);
    const challengerSocket = Array.from(io.sockets.sockets.values())
      .find(s => players.get(s.id) === challenger);

    if (challengerSocket) {
      // Notify both players that the battle is starting
      io.to([socket.id, challengerSocket.id]).emit('matchFound', {
        player1: challenger,
        player2: opponent,
        examType
      });
    }
  });

  // Handle battle rejection
  socket.on('rejectBattle', ({ challenger }) => {
    const challengerSocket = Array.from(io.sockets.sockets.values())
      .find(s => players.get(s.id) === challenger);

    if (challengerSocket) {
      challengerSocket.emit('battleRejected', { opponent: players.get(socket.id) });
    }
  });

  // Handle disconnection
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
    players.delete(socket.id);
    // Send updated player list to all clients
    io.emit('playerList', Array.from(players.values()));
  });
});

// Start the server on port 3003
const PORT = 3003;
server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
}).on('error', (err) => {
  console.error('Server error:', err);
}); 