import { Pack } from './pack.js';

export class Game {
  constructor(id, hostName, players = []) {
    this.id = id;
    this.hostName = hostName;
    this.players = players;
    this.pack = new Pack();
    this.pile = [];
    this.turn = undefined;
  }

  numPlayers() {
    return this.players.length;
  }

  deal(handSize) {
    for (let player of this.players) {
      player.addToHand(this.pack.draw(handSize));
    }
  }

  start() {
    this.deal(5);
    this.pile = this.pack.draw(1);
    console.log('game start', this.players);
    this.turn = {
      player: this.players[0],
      havePickedUp: false
    };
  }

  eachPlayer(fn) {
    const gameState = {
      numInPack: this.pack.numCards(),
      numInPile: this.pile.length,
      topOfPile: this.pile[this.pile.length - 1],
      myTurn: false
    };
    for (let player of this.players) {
      gameState.hand = player.hand;
      console.log('player?', player, this.turn);
      gameState.myTurn = player === this.turn.player;
      fn(player, gameState);
    }
  }

  pickUpFromPack(player) {
    if (this.pack.numCards() === 0) return;
    if (!this.turn.player === player) return;
    if (this.turn.havePickedUp) return;

    const cards = this.pack.draw(1);
    player.addToHand(cards);

    this.turn.havePickedUp = true;
  }

  addPlayer(player) {
    this.players.push(player);
  }

  removePlayer(player) {
    this.players = this.players.filter(p => p.id !== player.id);
  }

  hasPlayer(player) {
    return this.players.some(p => p.id === player.id);
  }
};
