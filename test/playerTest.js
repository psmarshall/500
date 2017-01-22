var Player = require('../public/game/player');
var chai = require('chai');

var expect = chai.expect;

describe('player', function() {
  describe('create', function() {
    it('has an empty hand', function() {
      var player = new Player('1', 'Sam');

      expect(player.numCards()).to.equal(0);
    });
  });

  describe('add to hand', function() {
    describe('one card', function() {
      it('increases number of cards by 1', function() {
        var player = new Player();

        player.addToHand('1');

        expect(player.numCards()).to.equal(1);
      });
    });

    describe('two cards', function() {
      it('increases number of cards by 2', function() {
        var player = new Player();

        player.addToHand(['1', '2']);

        expect(player.numCards()).to.equal(2);
      });
    });
  });
});