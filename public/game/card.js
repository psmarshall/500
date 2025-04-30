export class Card {
  constructor(suit, number, imagePath) {
    this.suit = suit;
    this.number = number;
    this.imagePath = imagePath;
  }

  static isFaceCard(number) {
    return ['jack', 'queen', 'king'].includes(number);
  }

  static NUMBER_TYPES = [
    'ace',
    '2',
    '3',
    '4',
    '5',
    '6',
    '7',
    '8',
    '9',
    '10',
    'jack',
    'queen',
    'king'
  ];

  static cardsAreTriple(cards) {
    if (cards.length < 3) return false;
    const is3or4OfAKind = cards.every(card => card.number === cards[0].number);

    const cardNumbers = cards.map(card => Card.sortValue(card.number)).sort((a, b) => a - b);
    let isStraight = true;
    for (let i = 1; i < cardNumbers.length - 1; i++) {
      if (cardNumbers[i] !== cardNumbers[i - 1] + 1) {
        if (i === cardNumbers.length - 1 && cardNumbers[i] === 14 && cardNumbers[0] === 2) {
          // Ace can be low.
          break;
        }
        isStraight = false;
        break;
      }
    }

    return is3or4OfAKind || isStraight;
  }

  static sortValue(number) {
    switch (number) {
      case '2':
        return 2;
      case '3':
        return 3;
      case '4':
        return 4;
      case '5':
        return 5;
      case '6':
        return 6;
      case '7':
        return 7;
      case '8':
        return 8;
      case '9':
        return 9;
      case '10':
        return 10;
      case 'jack':
        return 11;
      case 'queen':
        return 12;
      case 'king':
        return 13;
      case 'ace':
        return 14;
    }
    return -1;
  }

  static SUIT_TYPES = [
    'hearts',
    'clubs',
    'spades',
    'diamonds'
  ];
}
