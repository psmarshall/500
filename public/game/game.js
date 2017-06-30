'use strict';

var Pack = require('./pack');

module.exports = class Game {
  constructor(id, hostName, players = new Set()) {
    this.id = id;
    this.hostName = hostName;
    this.players = players;
    this.pack = new Pack();
    this.pile = [];
  }

  numPlayers() {
    return this.players.size;
  }

  deal(handSize) {
    for (let player of this.players) {
      player.addToHand(this.pack.draw(handSize));
    }
  }

  eachPlayer(fn) {
    for (let player of this.players) {
      fn(player);
    }
  }

  addPlayer(player) {
    this.players.add(player);
  }

  removePlayer(player) {
    this.players.delete(player);
  }
};
