import { Card } from './card.js';

export class Player {
  constructor(id, name) {
    this.id = id;
    this.name = name;
    this.hand = [];
    this.played = [];
  }

  addToHand(cards) {
    this.hand.push(...cards);
  }

  numCards() {
    return this.hand.length;
  }

  hasCard(suit, number) {
    return this.hand.some(card => card.suit === suit && card.number === number);
  }

  removeFromHand(suit, number) {
    const card = this.hand.find(card => card.suit === suit && card.number === number);
    this.hand = this.hand.filter(card => !(card.suit === suit && card.number === number));
    return card;
  }

  playCards(cards) {
    let cardsToPlay = [];
    for (const card of cards) {
      if (this.hasCard(card.suit, card.number)) {
        cardsToPlay.push(this.removeFromHand(card.suit, card.number));
      }
    }
    // TODO: Should put ace low if played in a straight with 2 and 3.
    cardsToPlay = cardsToPlay.sort((a, b) => {
      const aValue = Card.sortValue(a.number);
      const bValue = Card.sortValue(b.number);
      return aValue - bValue;
    });
    // TODO: Expand with which set this was built on.
    this.played.push({
      cards: cardsToPlay
    });
    return cardsToPlay;
  }
}
