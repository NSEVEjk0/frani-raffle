# Frani Raffle

Ticket sales plus a verifiable draw on Unicity testnet2. Anyone can buy
tickets; the draw picks a winner deterministically from a seed, so the result
can be re-run and verified by anyone.

Made by **CRYPTFRANI**. Owner / creator: **Itachi**.

---

## Track

Social and markets.

## Is it Agentic?

No. Frani Raffle sells tickets and computes a deterministic winner. No
autonomous behaviour, no model in the loop.

## Runs on AstridOS?

No.

## Live on-network

- Network: **testnet2**
- Each deployment holds its own wallet and prints its address at startup.

## SDK features used

| Feature | Where |
|---|---|
| Wallet identity | `src/wallet.js` (Sphere SDK) |
| Oracle values (concept) | the draw seed can come from a testnet2 oracle |

## Commands

```bash
npm run new -- --title "Win a badge" --price 5
npm run buy -- <raffleId> --by 0x… --count 3
npm run draw -- <raffleId> --seed 42
npm run status -- <raffleId>
```
