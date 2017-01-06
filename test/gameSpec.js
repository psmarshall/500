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
    it('should have same number of cards', function() {
      var p = game.createPack();
      var s = game.shuffle(p);
      p.should.have.lengthOf(s.length);
    });
  })

  describe('draw', function() {
    describe('one card', function() {
      it('should draw the requested number', function() {
        var pack = game.createPack();
        var cards = game.draw(pack, 1, []);
        cards.should.have.lengthOf(1);
      });

      it('should remove the card from the pack', function() {
        var pack = game.createPack();
        var initialLength = pack.length;
        var cards = game.draw(pack, 1, []);
        pack.should.have.lengthOf(initialLength - 1);
        pack.should.not.include(cards[0]);
      });

      it('should put the drawn card into the hand', function() {
        var hand = [];
        var cards = game.draw(game.createPack(), 1, hand);
        hand.should.have.lengthOf(1);
        hand.should.include(cards[0]);
      });
    });

    describe('three cards', function() {
      it('should draw the requested number', function() {
        var pack = game.createPack();
        var cards = game.draw(pack, 3, []);
        cards.should.have.lengthOf(3);
      });

      it('should remove the cards from the pack', function() {
        var pack = game.createPack();
        var initialLength = pack.length;
        var cards = game.draw(pack, 3, []);
        pack.should.have.lengthOf(initialLength - 3);
        pack.should.not.have.members(cards);
      });

      it('should put the drawn cards into the hand', function() {
        var hand = [];
        var cards = game.draw(game.createPack(), 3, hand);
        hand.should.have.lengthOf(3);
        hand.should.have.members(cards);
      });
    });

  });
});
