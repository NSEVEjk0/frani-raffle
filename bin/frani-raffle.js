#!/usr/bin/env node
// Frani Raffle — CLI + daemon entrypoint.
// Made by CRYPTFRANI. Owner / creator: Itachi. Unicity testnet2 only.

import process from 'node:process';
import { config } from '../src/config.js';
import { Store } from '../src/store.js';
import { createRaffle, buyTickets, draw, renderRaffle } from '../src/raffle.js';

export const HELP = `Frani Raffle — ticket sales + verifiable draw on Unicity testnet2

Usage:
  frani-raffle new --title "Win a badge" --price 5 [--organizer <address>]
  frani-raffle buy <raffleId> --by <address> [--count <n>]
  frani-raffle draw <raffleId> [--seed <number>]
  frani-raffle status <raffleId>
  frani-raffle list
  frani-raffle about
  frani-raffle help
`;

export const aboutText = `Frani Raffle — verifiable draws on Unicity testnet2.
Made by CRYPTFRANI. Owner / creator: Itachi.
`;

function parseArgs(argv) {
  const out = { _: [] };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a.startsWith('--')) {
      const eq = a.indexOf('=');
      if (eq !== -1) out[a.slice(2, eq)] = a.slice(eq + 1);
      else if (argv[i + 1] && !argv[i + 1].startsWith('--')) out[a.slice(2)] = argv[++i];
      else out[a.slice(2)] = true;
    } else out._.push(a);
  }
  return out;
}

async function main() {
  const [cmd, ...rest] = process.argv.slice(2);
  const args = parseArgs(rest);
  const store = new Store(config.dataDir);

  switch (cmd) {
    case 'new': {
      const raffle = createRaffle({
        title: args.title,
        ticketPrice: args.price,
        organizer: args.organizer || 'anon',
      });
      await store.save(raffle);
      console.log(`Created ${renderRaffle(raffle)}`);
      console.log(`Raffle id: ${raffle.id}`);
      break;
    }
    case 'buy': {
      const raffle = await store.get(rest[0]);
      const n = buyTickets(raffle, args.by, args.count !== undefined ? Number(args.count) : 1);
      await store.save(raffle);
      console.log(`${args.by} bought ${n} ticket${n === 1 ? '' : 's'} — ${renderRaffle(raffle)}`);
      break;
    }
    case 'draw': {
      const raffle = await store.get(rest[0]);
      const winner = draw(raffle, args.seed);
      await store.save(raffle);
      console.log(`Winner: ${winner} (seed ${raffle.seed || 'auto'})`);
      break;
    }
    case 'status': {
      const raffle = await store.get(rest[0]);
      console.log(renderRaffle(raffle));
      break;
    }
    case 'list': {
      const raffles = await store.list();
      if (raffles.length === 0) console.log('No raffles yet.');
      for (const r of raffles) console.log(renderRaffle(r));
      break;
    }
    case 'about':
      console.log(aboutText);
      break;
    case 'help':
    case undefined:
      console.log(HELP);
      break;
    default:
      console.error(`Unknown command: ${cmd}`);
      console.log(HELP);
      process.exit(1);
  }
}

main().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
