import { Pack } from './pack.js';

export class Game {
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

  start() {
    this.deal(5);
    this.pile = this.pack.draw(1);
  }

  eachPlayer(fn) {
    const gameState = {
      numInPack: this.pack.numCards(),
      numInPile: this.pile.length,
      topOfPile: this.pile[this.pile.length - 1],
    };
    for (let player of this.players) {
      gameState.hand = player.hand;
      fn(player, gameState);
    }
  }

  addPlayer(player) {
    this.players.add(player);
  }

  removePlayer(player) {
    this.players.delete(player);
  }
};
