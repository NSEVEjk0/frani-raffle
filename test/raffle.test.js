// Frani Raffle — unit tests (plain node).
import assert from 'node:assert/strict';
import { createRaffle, buyTickets, draw } from '../src/raffle.js';

const A = '0xAAA';
const B = '0xBBB';
const C = '0xCCC';

const raffle = createRaffle({ title: 'Badge', ticketPrice: '5', organizer: A });

buyTickets(raffle, A, 1);
buyTickets(raffle, B, 2);
buyTickets(raffle, C, 1);
assert.equal(raffle.totalTickets, 4);

// draw is deterministic for a fixed seed
const w1 = draw(raffle, 42);
assert.equal(raffle.drawn, true);
assert.ok([A, B, C].includes(w1));

// re-running the same draw yields the same winner (determinism)
const raffle2 = createRaffle({ title: 'Badge', ticketPrice: '5', organizer: A });
buyTickets(raffle2, A, 1);
buyTickets(raffle2, B, 2);
buyTickets(raffle2, C, 1);
assert.equal(draw(raffle2, 42), w1);

// cannot buy after draw
assert.throws(() => buyTickets(raffle, A, 1), /already drawn/);

// cannot draw an empty raffle
const empty = createRaffle({ title: 'Empty', ticketPrice: '1', organizer: A });
assert.throws(() => draw(empty, 1), /no tickets/);

console.log('raffle.test.js — all passed');
