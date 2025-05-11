import express from 'express';
import i18n from 'i18n';
import cookieParser from 'cookie-parser';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { Game } from './public/game/game.js';
import { Player } from './public/game/player.js';

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, { cors: { origin: '*' } });

const locales = ['en', 'sv', 'de'];
const locale_names = ['English', 'Svenska', 'Deutsch'];
i18n.configure({
    locales: locales,
    defaultLocale: 'en',
    directory: import.meta.dirname + '/locales'
});

app.set('view engine', 'pug');
app.use(express.static(import.meta.dirname + '/public'));
app.use(express.static(import.meta.dirname + '/node_modules/lit-html/'));
app.use(i18n.init);
app.use(cookieParser());

const players = [];
const games = new Map();

app.get('/', (req, res) => {
  let loc = req.cookies['500_language'];
  if (loc === null) {
    loc = 'en';
  }
  res.cookie('500_language', loc, { maxAge: 365*24*60*60*1000 });
  // req.setLocale(loc);
  res.render('home', {
    title: 'Welcome',
    scripts: ['/socket.io/socket.io.js',
          'https://code.jquery.com/jquery-3.7.1.min.js',
          '/jquery.cookie.js',
          'https://code.jquery.com/ui/1.14.0-beta.2/jquery-ui.min.js',
          'https://cdn.jsdelivr.net/npm/bootstrap@5.3.5/dist/js/bootstrap.bundle.min.js'],
    modules: [
      '/client.js',
    ],
    locales: locales,
    locale_names: locale_names,
    currentLocale: loc
  });
});

io.on('connection', (socket) => {
  const locale = socket.handshake.query.locale;
  console.log(socket.handshake.query.locale);
  // Join the room for their locale.
  socket.join(locale);
  socket.on('chat message', (msg) => {
    socket.broadcast.emit('chat message', players[socket.id].name + ': ' + msg);
  });

  socket.on('new user', (name) => {
    // Send locale specific messages to each user.
    for (let i = 0; i < locales.length; i++) {
      io.to(locales[i]).emit('chat message', name + ' ' +
        i18n.__({phrase: 'has joined the chat', locale: locales[i]}));
    }

    console.log(name + ' has connected (' + socket.id + ')');
    // Add the player to the list, then updates everyone's list.
    const newPlayer = new Player(socket.id, name);
    players[socket.id] = newPlayer;

    io.emit('user list', playersToList(players));
    emitGames(io, games);
  });

  socket.on('start typing', () => {
    //sends to all except current
    socket.broadcast.emit('start typing', players[socket.id].name);
  });
  socket.on('stop typing', () => {
    //sends to all except current
    socket.broadcast.emit('stop typing', players[socket.id].name);
  });

  socket.on('get games', () => {
    emitGames(socket, games);
  });

  socket.on('new game', () => {
    newGame(socket);
    //update all games lists
    emitGames(io.sockets, games);
    console.log("sent games: ", games);
  });

  socket.on('join game', (hostId) => {
    const game = games.get(hostId);
    game.addPlayer(players[socket.id]);
    socket.join('game ' + hostId);
    // Update all games lists.
    emitGames(io.sockets, games);
  });

  socket.on('start game', () => {
    console.log('start game: ' + socket.id);

    io.to('game ' + socket.id).emit('game started', '');

    const curGame = games.get(socket.id);

    // Deal cards.
    curGame.start();
    curGame.eachPlayer((player, gameState) => {
      io.to(player.id).emit('gameState', gameState);
      console.log('gameState sent to ' + player.name + ': ', gameState);
    });
  });

  socket.on('pick up from pack', () => {
    let gameId;
    for (const game of games.values()) {
      if (game.hasPlayer(players[socket.id])) {
        gameId = game.id;
        break;
      }
    }
    // TODO Handle error.

    // Trusting client here.
    const curGame = games.get(gameId);
    curGame.pickUpFromPack(players[socket.id]);
    curGame.eachPlayer((player, gameState) => {
      io.to(player.id).emit('gameState', gameState);
    });
  });

  socket.on('pick up pile', () => {
    let gameId;
    for (const game of games.values()) {
      if (game.hasPlayer(players[socket.id])) {
        gameId = game.id;
        break;
      }
    }
    // TODO Handle error.

    // Trusting client here.
    const curGame = games.get(gameId);
    curGame.pickUpPile(players[socket.id]);
    curGame.eachPlayer((player, gameState) => {
      io.to(player.id).emit('gameState', gameState);
    });
  });

  socket.on('put to pile', (card) => {
    let gameId;
    for (const game of games.values()) {
      if (game.hasPlayer(players[socket.id])) {
        gameId = game.id;
        break;
      }
    }
    // TODO Handle error.

    // Trusting client here.
    const curGame = games.get(gameId);
    curGame.putToPile(players[socket.id], card);
    curGame.eachPlayer((player, gameState) => {
      io.to(player.id).emit('gameState', gameState);
    });
  });

  socket.on('play cards', (cards) => {
    let gameId;
    for (const game of games.values()) {
      if (game.hasPlayer(players[socket.id])) {
        gameId = game.id;
        break;
      }
    }
    // TODO Handle error.

    // Trusting client here.
    const curGame = games.get(gameId);
    curGame.playCards(players[socket.id], cards);
    curGame.eachPlayer((player, gameState) => {
      io.to(player.id).emit('gameState', gameState);
    });
  });

  socket.on('disconnect', () => {
    console.log('User disconnected (' + socket.id + ')');
    // The user may not have entered a name yet
    if (players[socket.id] !== undefined) {
        // Send locale specific messages to each user
      for (let i = 0; i < locales.length; i++) {
        io.to(locales[i]).emit('chat message', players[socket.id].name + ' ' +
          i18n.__({phrase: 'has left the chat', locale: locales[i]}));
      }
      //remove the user, then update everyone's list
      leaveGames(socket);
      delete players[socket.id];
      socket.broadcast.emit('user list', playersToList(players));
      for (const key in players) {
        console.log('Remaining players: ' + key + ': ' + players[key]);
      }
      emitGames(socket.broadcast, games);
    }
  });
});

function newGame(socket) {
  const hostId = socket.id;
  // First, leave current game.
  leaveGames(socket);
  const newGame = new Game(hostId, players[hostId].name, [players[hostId]]);
  games.set(hostId, newGame);
  // Join room for game.
  socket.join('game ' + hostId);
  return newGame;
}

// Check all games for the player and delete them if they exist.
function leaveGames(socket) {
  const player = players[socket.id];
  for (const game of games.values()) {
    game.removePlayer(player);
    // Remove the player from the room.
    if (socket) socket.leave('game ' + game.id);

    if (game.numPlayers() === 0 || socket.id === game.id) {
      games.delete(socket.id);
    }
  }
}

// Can probably get rid of this now that games are not a Set.
function emitGames(destination, games) {
  destination.emit('games list', Array.from(games));
}

function playersToList(players) {
  return players.map(p => p.name).join(', ');
}

httpServer.listen(3000, () => {
  console.log('listening on *:3000');
});
