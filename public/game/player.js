export class Player {
  constructor(id, name) {
    this.id = id;
    this.name = name;
    this.hand = [];
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
};
