import { Card } from './card.js';
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
    this.turn = {
      player: this.players[0],
      havePickedUp: false,
      pickedUpPile: false,
    };
  }

  eachPlayer(fn) {
    for (let player of this.players) {
      const gameState = {
        numInPack: this.pack.numCards(),
        numInPile: this.pile.length,
        topOfPile: this.pile[this.pile.length - 1],
        hand: player.hand,
        played: player.played,
        myTurn: player === this.turn.player,
        havePickedUp: false,
        pickedUpPile: false,
      };
      if (gameState.myTurn) {
        gameState.havePickedUp = this.turn.havePickedUp;
        gameState.pickedUpPile = this.turn.pickedUpPile;
      }
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

  pickUpPile(player) {
    if (this.pile.length === 0) return;
    if (!this.turn.player === player) return;
    if (this.turn.havePickedUp) return;

    player.addToHand(this.pile);
    this.pile = [];

    this.turn.havePickedUp = true;
    this.turn.pickedUpPile = true;
  }

  putToPile(player, card) {
    if (!this.turn.player === player) return;
    if (!this.turn.havePickedUp) return;

    if (!player.hasCard(card.suit, card.number)) return;

    const ourCard = player.removeFromHand(card.suit, card.number);
    this.pile.push(ourCard);

    // Turn is over.
    this.turn = {
      player: this.players[(this.players.indexOf(this.turn.player) + 1) % this.players.length],
      havePickedUp: false,
      pickedUpPile: false,
    }
  }

  playCards(player, cards) {
    if (!this.turn.player === player) return;
    if (!this.turn.havePickedUp) return;

    if (!cards.every(card => player.hasCard(card.suit, card.number))) return;

    // TODO: Change when building on existing sets.
    if (cards.length < 3) return;
    if (!Card.cardsAreTriple(cards)) return;

    player.playCards(cards);
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
