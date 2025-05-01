import { Card } from './card.js';

// Game logic helpers used by frontend and backend.

export function cardsCanBuildOn(cards, played) {
  if (played.length === 0) return false;
  // TODO: Make work for multiple cards at once for straights.
  if (cards.length !== 1) return false;
  const [card] = cards;
  for (const play of played) {
    const playedCards = play.cards;
    const is3PlusOfAKind = playedCards.length >= 3 && playedCards.every(card => card.number === playedCards[0].number);
    if (is3PlusOfAKind) {
      if (card.number === playedCards[0].number) {
        console.log('Can build on 3 of a kind', card, playedCards);
        return true;
      } else {
        continue;
      }
    }

    const cardNumber = Card.sortValue(card.number);
    const startCardNumber = Card.sortValue(playedCards[0].number);
    const endCardNumber = Card.sortValue(playedCards[playedCards.length - 1].number);

    // Can only join onto straights of the same suit.
    if (card.suit !== playedCards[0].suit) {
      continue;
    }

    // TODO: Cards can be built on a specific set where there are multiple options.
    // Can just record whether it was a straight or not?
    // This isn't implemented yet but we'd need to check that here.
    if (cardNumber === startCardNumber - 1 || cardNumber === endCardNumber + 1
        || (cardNumber === 14 && startCardNumber === 2) // Ace can be low.
        // No need to account for joining onto a single ace because this is impossible.
    ) {
      console.log('Can build on', card, playedCards);
      return true;
    }
  }
  return false;
}

export function cardsAreTriple(cards) {
  if (cards.length < 3) return false;
  const is3or4OfAKind = cards.every(card => card.number === cards[0].number);

  const cardNumbers =
      cards.map(card => Card.sortValue(card.number)).sort((a, b) => a - b);
  let isStraight = true;
  for (let i = 1; i < cardNumbers.length; i++) {
    if (cardNumbers[i] !== cardNumbers[i - 1] + 1) {
      if (i === cardNumbers.length - 1 && cardNumbers[i] === 14 && cardNumbers[0] === 2) {
        // Ace can be low.
        break;
      }
      isStraight = false;
      break;
    }
  }
  let isFlush = cards.every(card => card.suit === cards[0].suit);
  const isStraightFlush = isStraight && isFlush;

  return is3or4OfAKind || isStraightFlush;
}
