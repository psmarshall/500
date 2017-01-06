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
});