var Pack = require('../public/game/pack');
var chai = require('chai');

chai.should();
var expect = chai.expect;

describe('Pack', function() {
  describe('create', function() {
    it('has 52 cards', function() {
      var pack = new Pack();
      
      expect(pack.numCards()).to.equal(52);
    });
  });

  describe('shuffle', function() {
    it('has the same number of cards', function() {
      var pack = new Pack();
      var initialNumCards = pack.numCards();
      pack.shuffle();

      expect(pack.numCards()).to.equal(initialNumCards);
    });
  });

  describe('draw', function() {
    describe('one card', function() {
      it('draws exactly one card', function() {
        var pack = new Pack();
        var cards = pack.draw(1);

        cards.should.have.lengthOf(1);
      });

      it('removes the card from the pack', function() {
        var pack = new Pack();
        var initialNumCards = pack.numCards();
        var cards = pack.draw(1);

        expect(pack.numCards()).to.equal(initialNumCards - 1);
        pack.rawArray().should.not.include(cards[0]);
      });
    });

    describe('three cards', function() {
      it('draws exactly three cards', function() {
        var pack = new Pack();
        var cards = pack.draw(3);

        cards.should.have.lengthOf(3);
      });

      it('removes the cards from the pack', function() {
        var pack = new Pack();
        var initialNumCards = pack.numCards();
        var cards = pack.draw(3);

        expect(pack.numCards()).to.equal(initialNumCards - 3);
        pack.rawArray().should.not.have.members(cards);
      });
    });
  });
});
