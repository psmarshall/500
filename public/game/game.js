import { Pack } from './pack.js';
import * as GameLogic from './gameLogic.js';

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
    // TODO: Should be 5.
    this.deal(10);
    this.pile = this.pack.draw(1);
    this.turn = {
      player: this.players[0],
      havePickedUp: false,
      pickedUpPile: false,
      isFirstTurn: true,
      havePlayedTriple: false,
    };
  }

  eachPlayer(fn) {
    for (let player of this.players) {
      const gameState = {
        numInPack: this.pack.numCards(),
        numInPile: this.pile.length,
        topOfPile: this.pile[this.pile.length - 1],
        hand: player.hand,
        played: [player.played, ...this.players.filter(p => p !== player).map(p => p.played)],
        myTurn: player === this.turn.player,
        havePickedUp: false,
        pickedUpPile: false,
        isFirstTurn: false,
        scorecard: this.players.map(p => ({
          name: p.name,
          // TODO: Should be real scores.
          scores: [135, -50],
        })),
      };
      if (gameState.myTurn) {
        gameState.havePickedUp = this.turn.havePickedUp;
        gameState.pickedUpPile = this.turn.pickedUpPile;
        gameState.isFirstTurn = this.turn.isFirstTurn;
        gameState.havePlayedTriple = this.turn.havePlayedTriple;
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

    // TODO: Remove, this is for easier testing.
    player.addToHand(this.pack.draw(1));
    player.addToHand(this.pack.draw(1));
    player.addToHand(this.pack.draw(1));
    player.addToHand(this.pack.draw(1));

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
      isFirstTurn: this.turn.isFirstTurn,
      havePlayedTriple: false,
    };
    // Once all players have had their first turn.
    if (this.turn.isFirstTurn && this.turn.player === this.players[0]) {
      this.turn.isFirstTurn = false;
    }

    if (player.hand.length === 0) {
      this.scoreGame();
    }
  }

  playCards(player, cards) {
    if (!this.turn.player === player) return;
    if (!this.turn.havePickedUp) return;

    if (!cards.every(card => player.hasCard(card.suit, card.number))) return;

    // You must place a card in the pile to go out.
    if (player.hand.length === cards.length) return;
    // You must play a triple before building on another set.
    if (cards.length < 3 && player.played.length === 0) return false;
    const cardsAreTriple = GameLogic.cardsAreTriple(cards);
    const cardsCanBuildOn = GameLogic.cardsCanBuildOn(cards, this.players.map(p => p.played).flat());
    if (!(cardsAreTriple || cardsCanBuildOn)) return;

    if (cardsAreTriple) {
      this.turn.havePlayedTriple = true;
    }

    player.playCards(cards);
  }

  scoreGame() {
    for (const player of this.players) {
      let score = 0;
      for (const play of player.played) {
        for (const card of play.cards) {
          score += card.scoreValue();
        }
      }
      for (const card of player.hand) {
        score -= card.scoreValue();
      }
      player.scores.push(score);
    }
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
