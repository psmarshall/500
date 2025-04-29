var socket = io({query: 'locale=' + $.cookie('500_language')});
//handle user entering their name
$('#chooseNameForm').submit(function(){
  if ($('#name').val() !== "") {
    socket.emit('new user', $('#name').val());
    $('#content').show(400);
    $('#chooseNameDiv').hide();
  }
  return false;
});

function render(gameState) {
  const { hand, numInPack, numInPile, topOfPile } = gameState;

  // Draw the pile and pack.
  const pile = document.getElementById('pile');
  pile.src = 'images/' + topOfPile.imagePath + '.svg';

  const pack = document.getElementById('pack');
  pack.src = 'images/card_back.svg';

  // Draw players' hand.
  const handDiv = document.getElementById('hand');
  handDiv.innerHTML = '';

  for (const card of hand) {
    const cardImg = document.createElement('img');
    cardImg.src = 'images/' + card.imagePath + '.svg';
    cardImg.className = 'card';
    handDiv.append(cardImg);
  }
}

const turnState = {
  myTurn: false,
  havePickedUp: false,
}

$('#pack').click(() => {
  if (!turnState.myTurn || turnState.havePickedUp) {
    return;
  }
  // TODO: Handle empty pack.
  socket.emit('pick up from pack', '');
  turnState.havePickedUp = true;
});

//handle send message
$('#chatForm').submit(function(){
  socket.emit('chat message', $('#m').val());
  //add the message straight to our local window
  $('#messages').append($('<li>').text($('#name').val() + ": " + $('#m').val()));
  //make sure chat window scrolls automatically
  $('.panel-body').scrollTop($('.panel-body')[0].scrollHeight);
  $('#m').val('');
  return false;
});

//handle new game
$('#newGame').click(function(){
  socket.emit('new game', '');
});

//For title flashing
var isOldTitle = true;
var oldTitle = '500';
var newTitle = 'New Message';
var interval = null;
function changeTitle() {
  document.title = isOldTitle ? oldTitle : newTitle;
  isOldTitle = !isOldTitle;
}

$(window).focus(function () {
  clearInterval(interval);
  $('title').text(oldTitle);
});

//handle receiving a message
socket.on('chat message', function(msg){
  $('#messages').append($('<li>').text(msg));
  //make sure chat window scrolls automatically
  $('.panel-body').scrollTop($('.panel-body')[0].scrollHeight);
  if (!document.hasFocus() && interval === null) {
    interval = setInterval(changeTitle, 850);
  }
});
//catch typing and emit
$('#m').on('keyup', function() {
  if (this.value.length >= 1) {
    socket.emit('start typing', '');
  } else {
    socket.emit('stop typing', '');
  }
});
//handle receiving a user list
socket.on('user list', function(list){
  $('#userList').text(list);
});

function joinGame(game) {
  return function() { socket.emit('join game', game.id); };
}

function startGame() {
  socket.emit('start game', '');
}

// Handle receiving a games list
socket.on('games list', function(games){
  // Clear old list
  $('#gamesList').empty();
  for (let [gameId, game] of new Map(games)) {
    const num_players = game.players.length;
    const list_item = $('<li>').text(game.hostName +
        ' (' + num_players + ' players)');
    const myPlayerId = socket.id;
    // If it is not their game and they aren't already in it
    if (game.id !== myPlayerId) {
      if (!game.players.find(p => p.id === myPlayerId)) {
        // TODO i18n the join text
        var join_button = $('<a>').text('Join').addClass('btn btn-primary btn-sm btn-margin-left');
        join_button.click(joinGame(game));
        list_item.append(join_button);
      } else {
        // They are in this game
        list_item.addClass('current-game');
      }
    } else {
      // They are in this game and are the host
      list_item.addClass('current-game');
      var start_button = $('<a>').text($("#start")[0].innerText).addClass('btn btn-primary btn-sm btn-margin-left');
      start_button.click(startGame);
      list_item.append(start_button);
    }
    $('#gamesList').append(list_item);
  }
});

// handle game starting
socket.on('game started', function(msg){
  $('#lobby').hide();
  $('.jumbotron').hide();
  $('#game').show(400);
});

// Handle update of gameState e.g. cards in hand
socket.on('gameState', function(gameState){
  render(gameState);
  turnState.myTurn = gameState.myTurn;
});

//respond to typing events from other users
socket.on('start typing', function(user){
  //add 'typing' message if it doesn't exist.
  if (!$('#'+user).length) {
    $('#messages').append($('<li id="'+user+'">').text(user + ' is typing...'));
  }
});
socket.on('stop typing', function(user){
  //remove 'typing' message if it exists.
  if ($('#'+user).length) {
    $('#'+user).remove();
  }
});

//handle language change
$("input[name=languageOptions]").change(function () {
  console.log($(this).attr('id'));
  console.log('old cookie: ' + $.cookie('500_language'));
  $.cookie('500_language', $(this).attr('id'), { expires : 365 });
  window.location.reload(true);
});
