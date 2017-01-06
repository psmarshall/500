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
  $.each(games, function(key, value) {
    var num_players = value.players.length;
    var list_item = $('<li>').text(value.host_name 
        + ' (' + num_players + ' players)');
    //add a join button, if it is not their game and they aren't already in it
    if (value.host_id != socket.io.engine.id) {
      if ($.inArray(socket.io.engine.id, value.players) == -1) {
        var join_button = $('<a>').text('Join').addClass('btn btn-primary btn-sm btn-margin-left');
        join_button.click(function() {
          socket.emit('join game', value.host_id);
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
  $('#hand').empty();
  for (var i = 0; i < hand.length; i++) {
    var list_item = $('<li>').addClass('list-item-card');
    var card = $('<img>').attr('src', 'images/' + hand[i] + '.svg');

    card.addClass('card');
    list_item.append(card);
    list_item.css('left', i * 1.5 + 'em');
    list_item.css('z-index', i);
    $('#hand').append(list_item);
  }
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

$('#hand').sortable({
  opacity: 0.8,
  cursor: 'move',
  tolerance: 'pointer',
  update: function() {
    var i = 0;
    $('.list-item-card').each(function() {
      $(this).css('left', i * 1.5 + 'em');
      $(this).css('z-index', i);
      i++;
    });
  },
  change: function() {
    var i = 0;
    $('.list-item-card').not('.ui-sortable-helper').each(function() {
      $(this).css('left', i * 1.5 + 'em');
      $(this).css('z-index', i);
      i++;
    });
  }
});
$('#hand').disableSelection();
