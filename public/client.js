var socket = io({query: 'locale=' + $.cookie('500_language')});
//handle user entering their name
$('#chooseNameForm').submit(function(){
  if ($('#name').val() != "") {
    socket.emit('new user', $('#name').val());
    $('#content').show(400);
    $('#chooseNameDiv').hide();
  }
  return false;
});

// Canvas stuff.
var canvas = document.createElement("canvas");
var context = canvas.getContext("2d");
canvas.width = $("#chooseNameDiv").width();
canvas.height = 512;
$('#canvas')[0].appendChild(canvas);

var gapWidth = 20;
var gapHeight = 20;
var handSize = 5;
var cardWidth = (canvas.width - ((handSize + 1) * 20)) / handSize;
var cardHeight = 1.4523 * cardWidth;

$("#canvas").dblclick(function(event) {
  mouseX = event.pageX - this.offsetLeft;
  mouseY = event.pageY - this.offsetTop;
  console.log('x: ' + mouseX + ', y: ' + mouseY);
});

function render(hand) {
  canvas.width = $("#content").width();
  context.clearRect(0, 0, canvas.width, canvas.height);
  var ypos = canvas.height - cardHeight - gapHeight;
  for (let i = 0; i < hand.length; i++) {
    let card = new Image();
    card.src = 'images/' + hand[i].imagePath + '.svg';
    card.onload = function() {
      var xpos = (i + 1) * 20 + i * cardWidth;
      context.drawImage(card, xpos, ypos, cardWidth, cardHeight);
    }
  }
}

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
  if (!document.hasFocus() && interval == null) {
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
//handle receiving a games list
socket.on('games list', function(games){
  //clear old list
  $('#gamesList').empty();
  $.each(games, function(key, game) {
    var num_players = game.players.length;
    var list_item = $('<li>').text(game.hostName
        + ' (' + num_players + ' players)');
    //add a join button, if it is not their game and they aren't already in it
    if (game.id != socket.io.engine.id) {
      if ($.inArray(socket.io.engine.id, game.players) == -1) {
        var join_button = $('<a>').text('Join').addClass('btn btn-primary btn-sm btn-margin-left');
        join_button.click(function() {
          socket.emit('join game', game.hostId);
        });
        list_item.append(join_button);
      } else {
        //they are in this game
        list_item.addClass('current-game');
      }
    } else {
      //they are in this game && are host
      list_item.addClass('current-game');
      var start_button = $('<a>').text('Start').addClass('btn btn-primary btn-sm btn-margin-left');
      start_button.click(function(){
        socket.emit('start game', '');
      });
      list_item.append(start_button);
    }
    $('#gamesList').append(list_item);
  });
});

// handle game starting
socket.on('game started', function(msg){
  $('#lobby').hide();
  $('#game').show(400);
});

// handle update of cards in hand
socket.on('hand', function(hand){
  render(hand);
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
