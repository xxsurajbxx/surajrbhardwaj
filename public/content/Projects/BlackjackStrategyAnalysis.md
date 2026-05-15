# Blackjack Strategy Analysis

A Monte Carlo simulation of 1,000,000 blackjack hands to compare four betting and playing strategies: Dealer Strategy, Basic Strategy, High-Low Card Counting, and High-Low Card Counting with Bet Spreads. The full analysis and results are documented in [doc/Final Report.pdf](doc/Final%20Report.pdf).

## Overview

The project simulates blackjack at the card and hand level, records the outcome of every hand alongside the true count at the time it was played, and uses linear regression across the true count axis to measure how count-awareness changes expected return. The simulation favors casino-typical rules to produce a conservative baseline.

---

## Game Rules Modeled

| Rule | Setting | Player Impact |
|---|---|---|
| Decks in shoe | 8 | Negative (harder to count) |
| Blackjack payout | 3:2 | Positive |
| Dealer hits on soft 17 | Yes | Negative (standard) |
| Double after split | Allowed | Positive |
| Maximum splits | 4 hands | Positive |
| American-style peek | Yes | Positive (dealer checks for BJ before players act) |
| Surrender | Not offered | Negative |
| Insurance | Not offered | N/A |
| Penetration | ~7 of 8 decks dealt | Positive (more cards seen before reshuffle) |

The cut-card position is randomized each shoe: `Math.floor(Math.random()*27)+45` cards are left undealt, giving an average penetration of roughly 7 decks out of 8.

---

## Architecture

```
source/
├── header.js              # Shared game engine (Card, Deck, strategy logic)
├── DealerStrategy.js      # Simulation: player mimics dealer rules
├── BasicStrategy.js       # Simulation: player uses basic strategy
├── HighLowCardCounting.js # Simulation: basic strategy + count-based sit-out
├── BetSpreads.js          # Simulation: counting + logistic bet sizing
├── NewStrategy.js         # Experimental: Monte Carlo strategy derivation
├── LowCountVsBasic.js     # Benchmark: low-count strategy vs basic strategy
├── StrategyDataToCode.py  # Converts JSON strategy tables → JS switch statements
├── Visualization.py       # Generates 4-panel analysis plots from JSON output
└── package.json           # Node.js dependency (seedrandom)

doc/
├── main.tex               # LaTeX source for the final report
├── Final Report.pdf        # Compiled report
├── gameRules.txt          # Rule decisions and rationale
└── *.png                  # Charts embedded in the report
```

### Core Shared Engine (`header.js`)

All simulations import this module. Key components:

**`Card` / `Deck` classes** — `Deck` builds a full multi-deck shoe and implements two shuffle types:
- `bridgeShuffle()` — interleaves two halves with randomized run lengths (simulates a riffle shuffle)
- `cutShuffle()` — cuts the deck at a randomized point near center

These are applied in the pattern `bridge, bridge, cut, bridge, bridge, cut, bridge, bridge` to approximate a realistic casino shuffle. `Math.random()` is seeded with `seedrandom('abc')` in every simulation script so results are fully reproducible.

**`calcValues(hand)`** — Handles ace ambiguity correctly. Counts all aces as 1 first, then promotes as many as possible to 11 without busting. Returns `[total, 'Hard'|'Soft']`.

**`dealerStrategy(deck, hand, count)`** — Dealer hits until hard 17 or above; hits soft 17. This is used for both the dealer and the Dealer Strategy player simulation.

**`basicStrategy(dCard, handVal, stiffness)`** — Full lookup-table implementation of the Wizard of Odds 8-deck basic strategy chart. Returns one of: `'h'` (hit), `'s'` (stand), `'dh'` (double, else hit), `'ds'` (double, else stand).

**`shouldSplit(pCard, dCard)`** — Encodes the standard split chart. Always splits aces and eights; never splits fives or tens. Other pairs are conditional on the dealer upcard.

**`runStrategy(deck, hand, dealerCard, count, strategy)`** — Generic hand-play loop. Accepts any strategy function as a parameter, enabling code reuse across all four simulations. Handles the `dh`/`ds` fallback logic (double is only available on the initial 2-card hand).

**`playOutHand(playersHand, dealerUpcard, deck, count)`** — Recursive split handler. Calls itself up to 3 times (max 4 hands), then delegates each resulting hand to `runStrategy`. Aces split from another split hand are limited to one card per ace (standard casino rule).

**`blackjackSimulation(deck, betAmount, count, countThreshold)`** — Top-level hand orchestrator. Handles dealer blackjack peek, evaluates all split hands against the dealer's final hand, and aggregates returns. The `countThreshold` parameter is used by the counting strategies to skip playing below a minimum true count.

**`betSpread(count)`** — Logistic function mapping true count to bet size:

```
betSpread(count) = 9.5 / (1 + 19 * e^(-0.75 * count))
```

This produces a smooth curve from approximately 0.5 units at neutral/negative counts to approximately 9.5 units at high counts, avoiding the abrupt step changes of a linear spread.

**`evaluateReturn(pHandVal, dHandVal, pNumCards, dNumCards, doubled, split)`** — Applies the 3:2 blackjack bonus and 2× doubling multiplier. A player blackjack pays 1.5× except when the hand resulted from a split.

---

## Strategies

### 1. Dealer Strategy (`DealerStrategy.js`)

The player mirrors the dealer exactly: hit until hard 17 or above, hit soft 17. No doubling, no splitting awareness. Used as the worst-case baseline.

### 2. Basic Strategy (`BasicStrategy.js`)

The player follows the Wizard of Odds 8-deck basic strategy chart, encoded in `basicStrategy()` inside `header.js`. This is statistically optimal under the assumption that each card draw is independent. Includes all hard totals, soft totals, doubling, and splitting decisions.

### 3. High-Low Card Counting (`HighLowCardCounting.js`)

Extends basic strategy with a count-based sit-out rule: if the true count is below +2, the player sits out that hand (the dealer still draws cards and the count updates, but no bet is placed). The true count is calculated as:

```
trueCount = runningCount / decksRemaining
```

where `decksRemaining = deck.numCards / 52`.

The High-Low system assigns:
- **+1** to cards 2–6 (low cards leaving the shoe are bad for the player)
- **0** to cards 7–9 (neutral)
- **−1** to cards 10, J, Q, K, A (high cards leaving are bad for the player)

The running count is maintained inside `Deck.draw()` via a passed-by-reference `counter` object.

### 4. Bet Spreads (`BetSpreads.js`)

Combines count-based sit-out (same +2 threshold) with dynamic bet sizing. Instead of a flat 1-unit bet, the bet is computed per hand using `betSpread(trueCount)`. The logistic function was chosen over a step function to more naturally scale bets with the true count and avoid unrealistically sharp transitions.

---

## Experimental Work

### Strategy Derivation via Monte Carlo (`NewStrategy.js`)

An attempt to derive an empirically optimal playing strategy for negative-count shoes (true count ≤ −2) by exhaustively sampling every `(dealer upcard, player total, hand type) × (Hit, Stand, Double)` combination. For each combination, it runs 1,000 simulated hands and records the total return. The resulting JSON is then parsed by `StrategyDataToCode.py` to generate a JavaScript switch-statement strategy function.

The simulation uses a round-robin approach: for each game state, it prioritizes whichever action (H, S, D) has been sampled fewest times, ensuring balanced coverage before the main simulation loop completes.

**Key technical challenge:** The initial implementation reused the standard `shouldSplit` logic from basic strategy during the experimental strategy's hand play. This was identified as a flaw — the split decisions were not adapted to the negative-count context — which likely contributed to the experimental strategy underperforming basic strategy in benchmarks.

### Benchmark (`LowCountVsBasic.js`)

Runs 1,000,000 hands in negative-count conditions (true count ≤ −2) using basic strategy, to establish a reference line for comparing the derived low-count strategy.

---

## Simulation Design Decisions

**Seeded randomness** — `seedrandom('abc')` is called at the top of every simulation script. This ensures any run produces identical output, making results reproducible and comparable across strategies without variance from different random sequences.

**Shoe-level vs. hand-level reset** — Cards are not reshuffled between hands. The deck is only reshuffled when the number of remaining cards drops below the shoe cutoff. The `Deck.resetDeck()` method moves drawn cards back into the shoe without re-creating the Deck object, preserving the simulation state.

**Count threading** — The `counter` object (a simple wrapper around a number) is passed by reference into `Deck.draw()`. This allows the count to update inside draw operations that happen deep in the call stack (during splits and dealer play) without needing a return value.

**Null-signal for sit-outs** — When the player sits out a hand due to low count, `blackjackSimulation()` returns `null`. The caller checks for this and skips adding to the results array, so the total hand count only reflects played hands.

**Data output** — Each simulation writes a JSON file containing: total results, per-hand results array, cumulative running total, win/loss/draw counts, and the true count at the time each hand was played. This JSON feeds directly into `Visualization.py`.

---

## Visualization (`Visualization.py`)

Accepts one or more JSON data files as command-line arguments and generates a 4-panel figure for each:

| Panel | Content |
|---|---|
| Top-left | Bankroll trajectory — individual 100,000-hand segments in gray, average trajectory in green (profitable) or red (losing) |
| Top-right | Expected return vs. true count scatter with error bars, zero line in red, linear regression line in green/red |
| Bottom-left | Box-and-whisker of segment-ending bankrolls |
| Bottom-right | Summary statistics table |

The scatter plot is filtered: only true count buckets with at least 1,000 observations **and** a standard error below 0.05 are plotted, removing noisy data at extreme counts.

Computed statistics: Final Results, House Edge, Win/Loss/Draw percentages, regression slope, R², per-segment bankroll minimum, and Sharpe Ratio.

---

## Results

All four strategies were simulated over exactly 1,000,000 hands with the same seed.

| Strategy | Final Result (units) | House/Player Edge | Win Rate |
|---|---|---|---|
| Dealer Strategy | −79,451 | House 7.95% | 45.91% |
| Basic Strategy | −12,450.5 | House 1.25% | 42.83% |
| High-Low Counting | +14,800 | Player 1.48% | 43.77% |
| Counting + Bet Spreads | +79,151.25 | Player 7.92% | 43.77% |

Win rate is a misleading metric here: Dealer Strategy wins the most hands because the dealer never busts as readily as a player following basic strategy, but it loses catastrophically in units because it never doubles or uses favorable splits.

The true count vs. expected return regression confirms a positive slope for all strategies that track the count, validating that count information has real predictive power over per-hand EV. Basic Strategy shows a slope of ~0.0041 (positive expected return increases with count, but it cannot exploit this because bet size is fixed). Counting with bet spreads compounds this by also increasing wager size as EV rises.

---

## Running the Simulations

**Prerequisites:** Node.js, Python 3 with `matplotlib` and `numpy`.

```bash
cd source
npm install

# Run each simulation (produces a JSON data file)
node DealerStrategy.js
node BasicStrategy.js
node HighLowCardCounting.js
node BetSpreads.js

# Generate charts from the JSON output
python3 Visualization.py DealerStrategyData.json BasicStrategyData.json HighLowCardCountingData.json BetSpreadsData.json
```

To derive a new strategy for a specific count condition:
```bash
node NewStrategy.js   # writes NewStrategyData.json
python3 StrategyDataToCode.py NewStrategyData.json  # prints JS switch statements to stdout
```

---

## Known Limitations and Future Work

- **Single-threaded** — the simulation runs sequentially. Multithreading across CPU cores would allow scaling to hundreds of millions of hands, significantly tightening confidence intervals.
- **No playing deviations** — the counting strategies still use basic strategy for hand decisions. Advanced counters modify playing decisions based on the count (e.g., stand on Hard 16 vs. 10 at TC ≥ +0). Adding index plays would further reduce the house edge.
- **No camouflage modeling** — perfect mechanical play and clean bet spreads would attract detection in a real casino. A full model should include cover plays and intentional variance to simulate practical longevity at the table.
- **Experimental strategy bug** — the low-count derived strategy reuses the basic-strategy split logic rather than deriving split decisions from the same Monte Carlo process, likely degrading its performance relative to what an optimal low-count strategy could achieve.
