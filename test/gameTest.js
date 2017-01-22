var Game = require('../public/game/game');
var Player = require('../public/game/player');
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
        var game = new Game('1', '1', new Set(['p1', 'p2']));

        expect(game.numPlayers()).to.equal(2);
      });
    });
  });

  describe('add player', function() {
    it('increases player count by 1' , function() {
      var game = new Game();
      var player = new Player('123', 'Sam');

      game.addPlayer(player);

      expect(game.numPlayers()).to.equal(1);
    });
  });

  describe('remove player', function() {
    it('reduces player count by 1', function() {
      var p2 = 'p2';
      var game = new Game('1', '1', new Set(['p1', p2]));

      game.removePlayer(p2);

      expect(game.numPlayers()).to.equal(1);
    });
  });

  describe('deal', function() {
    describe('zero cards', function() {
      it('does nothing to players\' hands', function() {
        var p1 = new Player('123', 'Sam');
        var p2 = new Player('456', 'Charlie');
        var game = new Game('123', 'Sam', new Set([p1, p2]));

        game.deal(0);

        expect(p1.numCards()).to.equal(0);
        expect(p2.numCards()).to.equal(0);
      });
    });

    describe('seven cards', function() {
      it('increases each players\' hand size to 7', function() {
        var p1 = new Player('123', 'Sam');
        var p2 = new Player('456', 'Charlie');
        var game = new Game('123', 'Sam', new Set([p1, p2]));

        game.deal(7);

        expect(p1.numCards()).to.equal(7);
        expect(p2.numCards()).to.equal(7);
      });
    });
  });
});
