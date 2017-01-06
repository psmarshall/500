var game = require('../game.js');
var chai = require('chai');

chai.should();

describe('Game', function() {
  describe('createPack', function() {
    it('has 52 cards', function() {
      var p = game.createPack();
      p.should.have.lengthOf(52);
    });
  });

  describe('shuffle', function() {
    it('has the same number of cards', function() {
      var pack = game.createPack();
      var initialLength = pack.length;
      var shuffled = game.shuffle(pack);
      shuffled.should.have.lengthOf(initialLength);
    });
  })

  describe('draw', function() {
    describe('one card', function() {
      it('draws the requested number', function() {
        var pack = game.createPack();
        var cards = game.draw(pack, 1, []);
        cards.should.have.lengthOf(1);
      });

      it('removes the card from the pack', function() {
        var pack = game.createPack();
        var initialLength = pack.length;
        var cards = game.draw(pack, 1, []);
        pack.should.have.lengthOf(initialLength - 1);
        pack.should.not.include(cards[0]);
      });

      it('puts the drawn card into the hand', function() {
        var hand = [];
        var cards = game.draw(game.createPack(), 1, hand);
        hand.should.have.lengthOf(1);
        hand.should.include(cards[0]);
      });
    });

    describe('three cards', function() {
      it('draws the requested number', function() {
        var pack = game.createPack();
        var cards = game.draw(pack, 3, []);
        cards.should.have.lengthOf(3);
      });

      it('removes the cards from the pack', function() {
        var pack = game.createPack();
        var initialLength = pack.length;
        var cards = game.draw(pack, 3, []);
        pack.should.have.lengthOf(initialLength - 3);
        pack.should.not.have.members(cards);
      });

      it('puts the drawn cards into the hand', function() {
        var hand = [];
        var cards = game.draw(game.createPack(), 3, hand);
        hand.should.have.lengthOf(3);
        hand.should.have.members(cards);
      });
    });
  });


  describe('play', function() {
    describe('one card', function() {
      it('removes card from hand', function() {
        var hand = ['2_of_hearts'];
        game.playCard(1, hand, 0);
        hand.should.have.lengthOf(0);
      });
    });

    describe('three cards', function() {
      it('removes cards from hand', function() {
        var hand = ['2_of_hearts', '2_of_clubs', '2_of_spades'];
        game.playCard(3, hand, 0);
        hand.should.have.lengthOf(0);
      });
    });
  });
});
