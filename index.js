var express = require('express');
var i18n = i18n = require('i18n');
var cookieParser = require('cookie-parser');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);

var Game = require('./public/game/game');
var Player = require('./public/game/player');

var locales = ['en', 'sv'];
i18n.configure({
    locales: locales,
    defaultLocale: 'en',
    directory: __dirname + '/locales'
});

app.set('view engine', 'pug');
app.use(express.static(__dirname + '/public'));
//enable multi-lingual support
app.use(i18n.init);
//enable cookies
app.use(cookieParser());

var players = [];
var typing = [];
var games = {};
/*
console.log(hand);

game.draw(pack, 1, hand);
console.log(hand); 

game.draw(pack, 2, hand);
console.log(hand); 

game.playCard(1, hand, hand.length-1); 
console.log(hand); 
*/

app.get('/', function(req, res){
  var loc = req.cookies['500_language'];
  if (loc == null) {
    loc = 'en';
  }
  res.cookie('500_language', loc, { maxAge: 365*24*60*60*1000 });
  req.setLocale(loc);
  res.render('home', {
    title: 'Welcome',
    scripts: ['/socket.io/socket.io.js',
          'https://ajax.googleapis.com/ajax/libs/jquery/1.12.4/jquery.min.js',
          '/jquery.cookie.js',
          'https://ajax.googleapis.com/ajax/libs/jqueryui/1.12.1/jquery-ui.min.js',
          '/client.js',
          'http://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/js/bootstrap.min.js'],
    locale: loc
  });
});

io.on('connection', function(socket){
  var locale = socket.handshake.query.locale;
  console.log(socket.handshake.query.locale);
  // Join the room for their locale.
  socket.join(locale);
  socket.on('chat message', function(msg){
    socket.broadcast.emit('chat message', players[socket.id].name + ': ' + msg);
  });

  socket.on('new user', function(name){
    // Send locale specific messages to each user.
    for (var i = 0; i < locales.length; i++) {
      io.to(locales[i]).emit('chat message', name + ' '
        + i18n.__({phrase: 'has joined the chat', locale: locales[i]}));
    }
    
    console.log(name + ' has connected (' + socket.id + ')');
    // Add the player to the list, then updates everyone's list.
    var newPlayer = new Player(socket.id, name);
    players[socket.id] = newPlayer;

    io.emit('user list', playersToList(players));
    io.emit('games list', games);
  });

  socket.on('start typing', function(msg){
    //sends to all except current
    socket.broadcast.emit('start typing', players[socket.id].name);
  });
  socket.on('stop typing', function(msg){
    //sends to all except current
    socket.broadcast.emit('stop typing', players[socket.id].name);
  });

  socket.on('get games', function(msg){
    socket.emit('games list', games);
  });

  socket.on('new game', function(msg){
    newGame(socket);
    console.log('Done new game.');
    //update all games lists
    io.sockets.emit('games list', games);

    console.log("sent games: ");
    console.log(games);
  });

  socket.on('join game', function(hostId) {
    var game = games[hostId];
    game.addPlayer(players[socket.id]);
    socket.join('game ' + hostId);
    // Update all games lists.
    io.sockets.emit('games list', games);
  });

  socket.on('start game', function(msg){
    console.log('start game: ' + socket.id);

    io.to('game ' + socket.id).emit('game started', '');

    var curGame = games[socket.id];

    // Deal cards.
    curGame.deal(5);
    curGame.eachPlayer(function(player) {
      io.to(player.id).emit('hand', player.hand);
    });
  });

  socket.on('disconnect', function(){
    console.log('User disconnected (' + socket.id + ')');
    //send locale specific messages to each user
    for (var i = 0; i < locales.length; i++) {
      io.to(locales[i]).emit('chat message', players[socket.id] + ' '
        + i18n.__({phrase: 'has left the chat', locale: locales[i]}));
    }
    //remove the user, then update everyone's list
    delete players[socket.id];
    socket.broadcast.emit('user list', playersToList(players));
    for(var key in players) {
      console.log('Remaining players: ' + key + ': ' + players[key]);
    }

    // Remove user from any games they were in.
    leaveGames(socket.id);
    socket.broadcast.emit('games list', games);
  });
});

function newGame(socket) {
  var hostId = socket.id;
  // First, leave current game.
  leaveGames(hostId);
  var newGame = new Game(hostId, players[hostId].name, [players[hostId]]);
  games[hostId] = newGame;
  // Join room for game.
  socket.join('game ' + hostId);
  return newGame;
}

// Delete the game hosted by the player.
function deleteGame(hostId) {
  delete games[hostId];
}

// Check all games for the player and delete them if they exist.
function leaveGames(playerId) {
  var player = players[playerId];
  for (let game in games) {
    game.removePlayer(player);
    // Remove the player from the room.
    socket.leave('game ' + game.id);

    if (game.numPlayers() === 0 || playerId === game.id) {
      delete games[playerId];
    }
  }
}

function playersToList(players) {
  var list = '';
  for (let player of players) {
    list += player.name + ', ';
  }
  return list.substring(0, list.length - 2);
}

http.listen(3000, function(){
  console.log('listening on *:3000');
});
