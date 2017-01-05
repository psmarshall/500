function createPack() {  
  var suits = new Array("hearts", "clubs", "spades", "diamonds");
  var cards = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'jack', 'queen', 'king', 'ace'];
  var pack = new Array();
  var n = 52;
  var index = n / suits.length;

  var count = 0;
  for(i = 0; i < 4; i++) {
    for(j = 0; j < cards.length; j++) {
      var cardname = cards[j] + "_of_" + suits[i];
      if (j > 8 && j < 12) cardname += '2'; //use full face card images
      pack[count++] = cardname;
    }
  }
  return pack;
}

function shuffle(pack) {  
  var i = pack.length, j, tempi, tempj;
  if (i === 0) return false;
  while (--i) {
     j = Math.floor(Math.random() * (i + 1));
     tempi = pack[i];
     tempj = pack[j];
     pack[i] = tempj;
     pack[j] = tempi;
   }
  return pack;
}

function draw(pack, amount, hand, initial) {  
  var cards = new Array();
  cards = pack.slice(0, amount);

  pack.splice(0, amount);

  if (!initial) {
    hand.push.apply(hand, cards);
    //hand.concat(hand);
  }

  return cards;
}

function playCard(amount, hand, index) {  
  hand.splice(index, amount)
  return hand;
}

exports.createPack = createPack;  
exports.shuffle = shuffle;
exports.draw = draw;  
exports.playCard = playCard;
