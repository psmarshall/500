import { cardsAreTriple, cardsCanBuildOn } from './game/gameLogic.js';

const socket = io({query: 'locale=' + $.cookie('500_language')});
// Handle user entering their name.
$('#chooseNameForm').submit(() => {
  if ($('#name').val() !== "") {
    socket.emit('new user', $('#name').val());
    $('#content').show(400);
    $('#chooseNameDiv').hide();
  }
  return false;
});

function render(gameState) {
  const { hand, played, topOfPile, myTurn, havePickedUp, pickedUpPile, isFirstTurn, scores} = gameState;

  turnState.myTurn = myTurn;
  turnState.havePickedUp = havePickedUp;
  turnState.pickedUpPile = pickedUpPile;
  turnState.isFirstTurn = isFirstTurn;
  turnState.havePlacedFirstTriple = played[0].length > 0;
  turnState.scores = scores;
  turnState.gameOver = scores.some(player => !!player.score);

  // Draw the pile and pack.
  const pile = document.getElementById('pile');
  pile.src = 'images/' + (topOfPile ? topOfPile.imagePath : 'empty_card') + '.svg';

  const pack = document.getElementById('pack');
  pack.src = 'images/card_back.svg';

  // Draw played cards.
  const allPlayedDivs = document.getElementById('playedArea').childNodes;
  let i = 0;
  for (const playerPlayed of played) {
    // TODO: Need more divs for more than 2 players.
    const playedDiv = allPlayedDivs[i];
    playedDiv.innerHTML = '';
    for (const playedSet of playerPlayed) {
      const playedSetDiv = document.createElement('div');
      playedSetDiv.className = 'playedSet';
      for (const card of playedSet.cards) {
        const cardImg = document.createElement('img');
        cardImg.src = 'images/' + card.imagePath + '.svg';
        cardImg.className = 'card';
        playedSetDiv.append(cardImg);
      }
      playedDiv.append(playedSetDiv);
    }
    if (turnState.gameOver) {
      const scoreDiv = document.createElement('div');
      scoreDiv.className = 'score';
      scoreDiv.innerText = `${scores[i].name}: ${scores[i].score} points`;
      playedDiv.append(scoreDiv);
    }
    i++;
  }

  // Draw players' hand.
  const handDiv = document.getElementById('hand');
  handDiv.innerHTML = '';

  selectedCards.clear();
  for (const card of hand) {
    const cardImg = document.createElement('img');
    cardImg.src = 'images/' + card.imagePath + '.svg';
    cardImg.className = 'card';
    cardImg.onclick = () => {
      cardImg.classList.toggle('selected');
      if (selectedCards.has(card)) {
        selectedCards.delete(card);
      } else {
        selectedCards.add(card);
      }

      document.getElementById('putToPile').disabled =
          turnState.gameOver || !turnState.myTurn || !turnState.havePickedUp || selectedCards.size !== 1;
      // TODO: Disable play button for non-triples if !havePlacedFirstTriple.
      document.getElementById('playSelected').disabled =
          turnState.gameOver || !turnState.myTurn || !turnState.havePickedUp || !canPlayCards(selectedCards, played.flat());
    }
    handDiv.append(cardImg);
  }

  // Write advice.
  const adviceDiv = document.getElementById('advice');
  if (turnState.gameOver) {
    adviceDiv.innerText = 'Game over!';
  } else if (!turnState.myTurn) {
    adviceDiv.innerText = 'Waiting for your turn...';
  } else {
    if (!turnState.havePickedUp) {
      if (turnState.isFirstTurn) {
        adviceDiv.innerText = 'Draw from the pack. You can\'t pick up the pile on your first turn.';
      } else {
        adviceDiv.innerText = 'Draw from the pack or pick up the pile.';
      }
    } else if (turnState.pickedUpPile) {
      adviceDiv.innerText = 'Put down a triple to avoid -50 points!';
    } else {
      if (!turnState.havePlacedFirstTriple) {
        adviceDiv.innerText = 'Play a triple from your hand, or put a card in the pile to end your turn.';
      } else {
        adviceDiv.innerText = 'Play cards from your hand, or put a card in the pile to end your turn.';
      }
    }
  }
}

function canPlayCards(cards, played) {
  cards = Array.from(cards);
  if (cards.length < 3 && !turnState.havePlacedFirstTriple) return false;

  return cardsAreTriple(cards) || cardsCanBuildOn(cards, played);
}

const selectedCards = new Set();

const turnState = {
  myTurn: false,
  havePickedUp: false,
  pickedUpPile: false,
  isFirstTurn: true,
  havePlacedFirstTriple: false,
};

$('#pack').click(() => {
  if (turnState.gameOver || !turnState.myTurn || turnState.havePickedUp) {
    return;
  }
  // TODO: Handle empty pack.
  socket.emit('pick up from pack', '');
  turnState.havePickedUp = true;
});

$('#pile').click(() => {
  if (turnState.gameOver || !turnState.myTurn || turnState.havePickedUp || turnState.isFirstTurn) {
    return;
  }
  // TODO: Handle empty pile.
  socket.emit('pick up pile', '');
  turnState.havePickedUp = true;
  turnState.pickedUpPile = true;
});

$('#putToPile').click(() => {
  if (turnState.gameOver || !turnState.myTurn || selectedCards.size !== 1) {
    return;
  }
  const card = Array.from(selectedCards)[0];
  socket.emit('put to pile', card);
  selectedCards.clear();
  document.getElementById('putToPile').disabled = true;
});

$('#playSelected').click(() => {
  if (turnState.gameOver || !turnState.myTurn) {
    return;
  }
  socket.emit('play cards', Array.from(selectedCards));
  selectedCards.clear();
  document.getElementById('playSelected').disabled = true;
});

// Handle send message.
$('#chatForm').submit(() => {
  socket.emit('chat message', $('#m').val());
  //add the message straight to our local window
  $('#messages').append($('<li>').text($('#name').val() + ": " + $('#m').val()));
  //make sure chat window scrolls automatically
  $('.panel-body').scrollTop($('.panel-body')[0].scrollHeight);
  $('#m').val('');
  return false;
});

// Handle new game.
$('#newGame').click(() => {
  socket.emit('new game', '');
});

// Handle receiving a message.
socket.on('chat message', function(msg){
  $('#messages').append($('<li>').text(msg));
  //make sure chat window scrolls automatically
  $('.panel-body').scrollTop($('.panel-body')[0].scrollHeight);
});
// Catch typing and emit.
$('#m').on('keyup', function() {
  if (this.value.length >= 1) {
    socket.emit('start typing', '');
  } else {
    socket.emit('stop typing', '');
  }
});
// Handle receiving a user list.
socket.on('user list', function(list){
  $('#userList').text(list);
});

// Handle receiving a games list.
socket.on('games list', function(games){
  // Clear old list.
  $('#gamesList').empty();
  for (const [_, game] of new Map(games)) {
    const num_players = game.players.length;
    const list_item = $('<li>').text(game.hostName +
        ' (' + num_players + ' players)');
    const myPlayerId = socket.id;
    // If it is not their game and they aren't already in it.
    if (game.id !== myPlayerId) {
      if (!game.players.find(p => p.id === myPlayerId)) {
        // TODO i18n the join text.
        const join_button = $('<a>').text('Join').addClass('btn btn-primary btn-sm btn-margin-left');
        join_button.click(() => socket.emit('join game', game.id));
        list_item.append(join_button);
      } else {
        // They are in this game.
        list_item.addClass('current-game');
      }
    } else {
      // They are in this game and are the host.
      list_item.addClass('current-game');
      const start_button = $('<a>').text($("#start")[0].innerText).addClass('btn btn-primary btn-sm btn-margin-left');
      start_button.click(() => socket.emit('start game', ''));
      list_item.append(start_button);
    }
    $('#gamesList').append(list_item);
  }
});

// Handle game starting.
socket.on('game started', function(msg){
  $('#lobby').hide();
  $('.jumbotron').hide();
  $('#game').show(400);
});

// Handle update of gameState e.g. cards in hand.
socket.on('gameState', function(gameState){
  render(gameState);
  turnState.myTurn = gameState.myTurn;
});

// Respond to typing events from other users.
socket.on('start typing', function(user){
  // Add 'typing' message if it doesn't exist.
  if (!$('#'+user).length) {
    $('#messages').append($('<li id="'+user+'">').text(user + ' is typing...'));
  }
});
socket.on('stop typing', function(user){
  // Remove 'typing' message if it exists.
  if ($('#'+user).length) {
    $('#'+user).remove();
  }
});

// Handle language change.
$("input[name=languageOptions]").change(function () {
  console.log($(this).attr('id'));
  console.log('old cookie: ' + $.cookie('500_language'));
  $.cookie('500_language', $(this).attr('id'), { expires : 365 });
  window.location.reload(true);
});
