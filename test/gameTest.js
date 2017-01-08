var Game = require('../public/game/game');
var chai = require('chai');

chai.should();
var expect = chai.expect;

describe('Game', function() {
  describe('create', function() {
    it('has an empty pile', function() {
      var game = new Game();

      game.pile.should.have.lengthOf(0);
    });

    describe('with no players', function() {
      it('should have no players', function() {
        var game = new Game();

        expect(game.numPlayers()).to.equal(0);
      });
    });

    describe('with two players', function() {
      it('should have two players', function() {
        var game = new Game('1', '1', ['p1', 'p2']);

        expect(game.numPlayers()).to.equal(2);
      });
    });
  });
});
