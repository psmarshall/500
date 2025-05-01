import { cardsAreTriple, cardsCanBuildOn } from '../public/game/gameLogic.js';
import * as chai from 'chai';

chai.should();
var expect = chai.expect;

describe('cardsAreTriple', () => {
  it('returns false for empty array', () => {
    expect(cardsAreTriple([])).to.be.false;
  });
  it('returns false for one card', () => {
    expect(cardsAreTriple([{ number: '2', suit: 'hearts' }])).to.be.false;
  });
  it('returns false for two cards', () => {
    expect(cardsAreTriple([
      { number: '2', suit: 'hearts' },
      { number: '3', suit: 'hearts' }
    ])).to.be.false;
  });

  // straights
  it('returns true for a straight flush 2 -> 4', () => {
    expect(cardsAreTriple([
      { number: '2', suit: 'hearts' },
      { number: '3', suit: 'hearts' },
      { number: '4', suit: 'hearts' }
    ])).to.be.true;
  });

  it('returns true for a straight flush jack -> king', () => {
    expect(cardsAreTriple([
      { number: 'jack', suit: 'hearts' },
      { number: 'queen', suit: 'hearts' },
      { number: 'king', suit: 'hearts' }
    ])).to.be.true;
  });

  it('returns true for a straight flush ace -> 2', () => {
    expect(cardsAreTriple([
      { number: 'ace', suit: 'hearts' },
      { number: '2', suit: 'hearts' },
      { number: '3', suit: 'hearts' }
    ])).to.be.true;
  });

  it('returns true for a straight flush queen -> ace', () => {
    expect(cardsAreTriple([
      { number: 'queen', suit: 'hearts' },
      { number: 'king', suit: 'hearts' },
      { number: 'ace', suit: 'hearts' }
    ])).to.be.true;
  });

  it('returns true for a straight flush queen -> ace out of order', () => {
    expect(cardsAreTriple([
      { number: 'ace', suit: 'hearts' },
      { number: 'king', suit: 'hearts' },
      { number: 'queen', suit: 'hearts' }
    ])).to.be.true;
  });

  it('returns false for ace, 3, 4', () => {
    expect(cardsAreTriple([
      { number: 'ace', suit: 'hearts' },
      { number: '3', suit: 'hearts' },
      { number: '4', suit: 'hearts' }
    ])).to.be.false;
  });

  it('returns false for king, ace, 2 (no wrap allowed)', () => {
    expect(cardsAreTriple([
      { number: 'king', suit: 'hearts' },
      { number: 'ace', suit: 'hearts' },
      { number: '2', suit: 'hearts' }
    ])).to.be.false;
  });

  // non-flush straights
  it('returns false for 2 --> 4 non-flush', () => {
    expect(cardsAreTriple([
      { number: '2', suit: 'hearts' },
      { number: '3', suit: 'hearts' },
      { number: '4', suit: 'diamonds' }
    ])).to.be.false;
  });

  it('returns false for king --> ace non-flush', () => {
    expect(cardsAreTriple([
      { number: 'king', suit: 'clubs' },
      { number: 'ace', suit: 'hearts' },
      { number: 'queen', suit: 'diamonds' }
    ])).to.be.false;
  });

  // 3 or 4 of a kind
  it('returns true for 3 of a kind', () => {
    expect(cardsAreTriple([
      { number: 'ace', suit: 'hearts' },
      { number: 'ace', suit: 'spades' },
      { number: 'ace', suit: 'clubs' }
    ])).to.be.true;
  });

  it('returns true for 4 of a kind', () => {
    expect(cardsAreTriple([
      { number: 'ace', suit: 'hearts' },
      { number: 'ace', suit: 'spades' },
      { number: 'ace', suit: 'clubs' },
      { number: 'ace', suit: 'diamonds' }
    ])).to.be.true;
  });
});

describe('cardsCanBuildOn', () => {
  it('returns false for empty arrays', () => {
    expect(cardsCanBuildOn([], [])).to.be.false;
  });
  it('returns false for empty cards with non-empty played', () => {
    expect(cardsCanBuildOn([], [{ cards: [{ number: 'ace', suit: 'hearts' }] }])).to.be.false;
  });

  // Joining onto straights.
  it('returns true for single adjacent cards', () => {
    expect(cardsCanBuildOn(
      [{ number: '2', suit: 'hearts' }],
      [{ cards: [{ number: '3', suit: 'hearts' }] }])).to.be.true;
  });
  it('returns true for single adjacent ace and 2', () => {
    expect(cardsCanBuildOn(
      [{ number: 'ace', suit: 'hearts' }],
      [{ cards: [{ number: '2', suit: 'hearts' }] }])).to.be.true;
  });
  it('returns true for single adjacent ace and king', () => {
    expect(cardsCanBuildOn(
      [{ number: 'ace', suit: 'hearts' }],
      [{ cards: [{ number: 'king', suit: 'hearts' }] }])).to.be.true;
  });
  it('returns true for joining a triple', () => {
    expect(cardsCanBuildOn(
      [{ number: '5', suit: 'hearts' }],
      [{ cards: [{ number: '2', suit: 'hearts' }, { number: '3', suit: 'hearts' }, { number: '4', suit: 'hearts' }] }])).to.be.true;
  });
  it('returns false for joining a triple of a different suit', () => {
    expect(cardsCanBuildOn(
      [{ number: '5', suit: 'clubs' }],
      [{ cards: [{ number: '2', suit: 'hearts' }, { number: '3', suit: 'hearts' }, { number: '4', suit: 'hearts' }] }])).to.be.false;
  });

  // Joining onto 3 of a kind.
  it('returns true for 3 of a kind same number', () => {
    expect(cardsCanBuildOn(
      [{ number: '3', suit: 'spades' }],
      [{ cards: [{ number: '3', suit: 'hearts' }, { number: '3', suit: 'clubs' }, { number: '3', suit: 'diamonds' }] }])).to.be.true;
  });
  it('returns false for 3 of a kind different number', () => {
    expect(cardsCanBuildOn(
      [{ number: 'ace', suit: 'spades' }],
      [{ cards: [{ number: '3', suit: 'hearts' }, { number: '3', suit: 'clubs' }, { number: '3', suit: 'diamonds' }] }])).to.be.false;
  });
});
