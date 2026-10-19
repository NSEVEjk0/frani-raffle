// Frani Raffle — ticket sales + verifiable draw domain logic.
// Tickets are per-address counts. The draw is deterministic: a seed (e.g. an
// oracle value) picks a winner from the weighted ticket list, so anyone can
// re-run the draw and verify the result.

export function newId(prefix) {
  return `${prefix}_${Date.now().toString(36)}_${Math.floor(Math.random() * 1e9).toString(36)}`;
}

export function createRaffle({ title, ticketPrice, organizer }) {
  if (!title || !String(title).trim()) throw new Error('a raffle needs a title');
  const price = Number(ticketPrice);
  if (!Number.isFinite(price) || price <= 0) throw new Error('ticketPrice must be positive');
  if (!organizer) throw new Error('a raffle needs an organizer');
  return {
    id: newId('raf'),
    title: String(title).trim(),
    ticketPrice: String(price),
    organizer,
    tickets: {},
    totalTickets: 0,
    winner: null,
    drawn: false,
    createdAt: new Date().toISOString(),
  };
}

export function buyTickets(raffle, buyer, count = 1) {
  if (!raffle) throw new Error('raffle not found');
  if (raffle.drawn) throw new Error('raffle already drawn');
  const n = Number(count);
  if (!Number.isInteger(n) || n < 1) throw new Error('count must be a positive integer');
  raffle.tickets[buyer] = (raffle.tickets[buyer] || 0) + n;
  raffle.totalTickets += n;
  return n;
}

export function draw(raffle, seed) {
  if (!raffle) throw new Error('raffle not found');
  if (raffle.drawn) throw new Error('raffle already drawn');
  if (raffle.totalTickets === 0) throw new Error('no tickets sold');
  const s = BigInt(String(seed ?? Date.now()));
  // Weighted pick: expand addresses by ticket count, pick by seed modulo total.
  const pool = [];
  for (const [addr, count] of Object.entries(raffle.tickets)) {
    for (let i = 0; i < count; i++) pool.push(addr);
  }
  const idx = Number(s % BigInt(pool.length));
  raffle.winner = pool[idx];
  raffle.drawn = true;
  raffle.drawnAt = new Date().toISOString();
  raffle.seed = String(seed ?? '');
  return raffle.winner;
}

export function renderRaffle(raffle) {
  const state = raffle.drawn ? `winner ${raffle.winner}` : `${raffle.totalTickets} tickets`;
  return `${raffle.id} · ${raffle.title} · ${raffle.ticketPrice} UCT/ticket · ${state}`;
}
