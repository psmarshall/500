import { Card } from './card.js';

export function sortHand(hand, sortBy) {
  if (sortBy === 'none') {
    return hand;
  } else if (sortBy === 'suit') {
    return hand.sort((a, b) => a.suit.localeCompare(b.suit) || Card.sortValue(a.number) - Card.sortValue(b.number));
  } else if (sortBy === 'rank') {
    return hand.sort((a, b) => Card.sortValue(a.number) - Card.sortValue(b.number) || a.suit.localeCompare(b.suit));
  }
}
