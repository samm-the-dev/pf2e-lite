# Exploration & Downtime

> **Status:** Draft -- design decisions and evaluations. PF2e RAW ported as-is unless noted.
>
> **AoN reference data:** Full rules text cached outside the repo in the dev-root `.aon-cache/` directory (survives git operations). Use `npm run aon -- lookup <file> <name>` for RAW.

## Overview

PF2e has three modes of play: Encounter (combat, round-by-round), Exploration (travel, investigation, 10-minute increments), and Downtime (days/weeks between adventures). This document covers Exploration and Downtime.

---

## PART 1: EXPLORATION MODE

### Activities

All exploration and 10-minute activities ported as-is. Full data in `.aon-cache/exploration-activities.json` and `.aon-cache/10min-activities.json`.

### Evaluation: What Works and What Doesn't

**Works well:**
- Activities feeding directly into encounter mode (Avoid Notice -> stealth, Scout -> initiative, Defend -> shield) create meaningful pre-combat decisions
- Structured party roles during travel
- Follow the Expert is elegant design
- 10-minute time increments provide clear duration tracking

**Known pain points:**
- Many groups ignore exploration mode entirely, treating it as freeform
- "One activity" per character feels limiting (can't Search *and* Avoid Notice)
- Nearly every useful activity requires half speed, so the party almost always moves at half speed in practice
- Secret checks (Search, Investigate, Sense Direction) create GM burden
- Vague guidance for newer GMs on when to call for checks
- Treat Wounds dominance creates a "Medicine tax" (addressed below)

---

## PART 2: DOWNTIME MODE

### Activities

All downtime activities ported as-is except Craft (**redesigned** -- see [Crafting](14-crafting.md)). Full data in `.aon-cache/downtime-activities.json`.

### Evaluation: Downtime Pain Points

**Crafting:** PF2e's biggest downtime complaint -- barely saves money vs. buying + Earning Income. **Already addressed** by our 25% material cost redesign (see [Crafting](14-crafting.md)).

**Earn Income:** Single roll, no narrative engagement, no interesting choices. The GM's task-level assignment matters more than the player's build. This is the primary remaining downtime weakness.

**Retraining:** Functions well as-is. Port directly.

### GM Guidance (GM Core)

GM Core chapters on running downtime are cached in `.aon-cache/exploration-downtime-rules.json`. Key topics for GMs:

- **Playing out a Downtime Day** (rules-2610) -- step-by-step structure for running downtime scenes
- **Goals** (rules-2454, rules-2608, rules-2677) -- player and long-term goal setting; "Make sure the players set goals for their characters"
- **Money in Downtime** (rules-2618, rules-2620) -- economic flow guidelines for short and long downtime periods
- **Depth of Downtime** (rules-2605) -- how much detail to invest vs. summarize
- **Campaigns without Downtime** (rules-2607) -- guidance for groups that skip it

---

## PART 3: RESTING

RAW rest mechanics ported as-is from Player Core pg. 439. See `.aon-cache/rest-and-hero-points.json` (rules-2443, rules-2446).

### Our Modifications

**Medicine proficiency benefits** (see [Skills](07-skills.md#proficiency-benefits)):
- Expert: Treat Wounds immunity reduced to **10 minutes** (replaces Continual Recovery feat)
- Master: treat up to **4 creatures simultaneously** (replaces Ward Medic feat)

**Long rest additions:**
- **Mana pool:** Full recovery (see [Spellcasting](10-spellcasting.md))
- **Knockdown count:** Resets to 0 (see [Dying](12-dying.md))

**Field Crafting** (Expert Crafting) -- Create temporary items during a 10-minute rest. See [Crafting](14-crafting.md).

### Recommended Post-Combat Recovery Sequence

1. Stabilize dying allies, stop persistent damage
2. Refocus (recover focus points)
3. Loot/search the area
4. Treat Wounds (heal HP)
5. Repair damaged gear (especially shields)
6. Prepare consumables (Artificer, Alchemist subclass)

---

## PART 4: HERO POINTS

Ported as-is. Full RAW in `.aon-cache/rest-and-hero-points.json` (rules-2333, rules-2654).

### Interaction with Three-Box Dying

With our three-box system (see [Dying](12-dying.md)):

- Heroic Recovery stabilizes at 0 HP and **clears all marked boxes**
- The knockdown count still increments (you were knocked out, even if you recovered via heroism)
- This preserves the death-insurance role while maintaining the escalating danger of the knockdown count

### The Hoarding Problem

PF2e's known Hero Point issue: players hoard points as death insurance and never use the reroll. The reroll (the fun, proactive use) is underutilized because the reactive survival use feels too important.

**Options to evaluate in playtesting:**
1. **Port as-is** -- the simplest approach. The hoarding problem exists but isn't game-breaking. Max 3 naturally constrains accumulation.
2. **Separate currencies** -- 1 "Reroll Token" per session (use it or lose it) + separate death insurance mechanic. More complex but addresses the core tension.
3. **Specific triggers** -- Award Hero Points for specific events (taking a critical hit, rolling a natural 1, making a dramatic sacrifice) rather than GM fiat. More consistent but changes the feel.

**Recommendation:** Port as-is for initial playtesting. The max-3 cap already forces some spending decisions. Monitor whether the hoarding problem feels worse or better with three-box dying (which is already less lethal than PF2e's Wounded track, potentially reducing the death-insurance pressure).

---

## PART 5: SMARS FOCUS CHECK SYSTEM -- EVALUATION

> The SMARS design documents propose a complete alternative resolution mechanic for Exploration and Downtime using proficiency-driven dice and Forged in the Dark-inspired clocks. This section evaluates those proposals.

### The Focus Spectrum (Summary)

Proficiency determines dice mode: Untrained = 1d12 (flat), Trained = 2d6 (bell), Expert = 3d4 (tight bell), Master = static 7. All center around 7. Each mode also defines a **position** (Desperate/Risky/Controlled/Secure) that shapes failure consequences. Outcome tiers: 3- = Failure, 4-6 = Mixed, 7-9 = Success, 10+ = Strong. An Effect axis (Great/Standard/Limited) layers on top based on proficiency vs. task complexity. Full specification in Part 6 below.

**Progress/danger clocks:** Segmented circles (4/6/8 segments) that fill as characters succeed. Racing a progress clock against a danger clock creates tension.

### What the Focus System Gets Right

**1. Progress/danger clocks are genuinely valuable.** Clocks solve PF2e exploration's biggest problem: binary pass/fail resolution with no tension. A clock-based investigation where the party fills segments over multiple checks, while a danger clock ticks toward consequences, is dramatically richer than "roll Perception -- you find it." This works **regardless of dice system**.

**2. Proficiency-as-position is narratively compelling.** The idea that a Master doesn't just succeed more often but *experiences a fundamentally different quality of risk* is elegant. An untrained character forging a blade risks burning themselves; a Master simply produces the blade. This captures something PF2e's flat d20 + degrees of success doesn't.

**3. Environmental dice shifting.** Locations that upgrade or downgrade dice modes ("this place shifts your Focus one step toward chaos") is a simple, flavorful GM lever that communicates danger without stat blocks.

### Where the Focus System Is Problematic

**1. A second dice system increases complexity.** PF2e Lite's core goal is simplification. Adding a separate resolution mechanic for exploration (1d12/2d6/3d4/static 7 with different outcome tiers) alongside d20 for combat creates two systems players must learn. This is the strongest argument against wholesale adoption.

**2. The Effect axis partially duplicates degrees of success.** PF2e's critical success/success/failure/critical failure already provides a four-tier outcome ladder. The Focus system's Great/Standard/Limited Effect axis adds a second dimension of variable outcome, which may be more complexity than benefit.

**3. Master = static 7 removes tension.** Having masters auto-succeed with no roll is thematically satisfying but mechanically flat. Some tables may find it unsatisfying that their most capable characters never face uncertainty in exploration.

**4. Outcome tiers don't map cleanly to PF2e's system.** PF2e uses DC + degrees of success. Focus uses fixed bands (3-/4-6/7-9/10+). Converting between these for effects that span both modes (e.g., a spell learned during downtime that's used in combat) creates friction.

**5. Ability modifiers create problems.** Adding ability modifiers to Focus dice shifts the mean and may undermine the elegance of the proficiency-as-position concept. Without modifiers, there's less differentiation between characters of the same proficiency.

### Recommendation: Adopt Clocks, Present Focus Dice as Variant

**For the core system:**
- Port PF2e exploration and downtime activities using standard d20 resolution
- **Add progress/danger clocks** as a core addition for sustained tasks (investigations, long journeys, crafting projects, reputation building). Clocks pair naturally with d20 + degrees of success: critical success fills extra segments, failure ticks the danger clock.

**As a variant rule:**
- Present the full Focus dice spectrum (1d12/2d6/3d4/static 7) as an **optional variant** for tables that want more narrative-driven exploration. Clearly labeled, self-contained, and not required for other rules to function.
- Include the environmental dice shifting rules as part of the variant.

This approach gets the best innovations (clocks) into the core system while keeping the "Lite" promise of one dice system for all modes.

### Clock System (Core Addition)

#### How Clocks Work

A **progress clock** is a segmented circle (typically 4, 6, or 8 segments). Characters make checks to fill segments. When full, the task is complete.

A **danger clock** runs simultaneously, filling on mixed results, failures, or as time passes. When the danger clock fills, a consequence arrives.

#### Filling Segments (d20 Resolution)

| Check Result | Segments Filled |
|-------------|----------------|
| Critical Success | 3 |
| Success | 2 |
| Failure | 0 (danger clock ticks 1) |
| Critical Failure | 0 (danger clock ticks 2) |

#### Clock Sizes

| Task Complexity | Clock Size | Examples |
|----------------|------------|---------|
| Simple | 4 segments | Navigate a known road, research a common topic |
| Standard | 6 segments | Investigate a mystery, craft a complex item, navigate unfamiliar terrain |
| Complex | 8 segments | Decode ancient texts, build a legendary weapon, track a creature across hostile wilderness |

#### When to Use Clocks

Clocks are most valuable for tasks that:
- Span multiple checks or time periods
- Benefit from partial progress (not all-or-nothing)
- Have escalating consequences for failure
- Involve the whole party contributing different skills

**Not every exploration check needs a clock.** A single Perception check to spot a trap is fine as a standard d20 check. Use clocks for sustained, multi-step tasks where tension and pacing matter.

#### Example: Investigating a Murder

- **Progress clock:** 6 segments (the investigation)
- **Danger clock:** 4 segments (the killer's suspicion)
- The rogue makes Diplomacy checks to Gather Information (fills progress on success)
- The wizard makes Arcana checks to analyze the magical evidence (fills progress)
- On failures, the danger clock ticks -- the killer notices the investigation
- When progress fills: the party identifies the killer
- When danger fills: the killer flees or strikes first

---

## PART 6: VARIANT RULE -- FOCUS DICE

> **Optional.** This variant replaces d20 checks during Exploration and Downtime with a proficiency-driven dice spectrum. Combat continues to use d20. Not required for any other rules in this system.

### The Focus Spectrum

Proficiency determines which dice you roll. All configurations center around 7. Each dice mode also defines the character's **position** -- how much is at stake when things go wrong.

| Proficiency | Dice | Range | Position | What Failure Looks Like |
|-------------|------|-------|----------|------------------------|
| Untrained | 1d12 | 1-12 (flat) | Desperate | Things get worse. New threats, lost resources, harm taken. |
| Trained | 2d6 | 2-12 (bell) | Risky | Complications arise. Partial success, or success with a cost. |
| Expert | 3d4 | 3-12 (tight bell) | Controlled | Minimal consequences. Slower progress, not catastrophe. |
| Master | Static 7 | 7 | Secure | No roll, no risk. The only question is scope and time. |

### Outcome Tiers

| Result | Outcome |
|--------|---------|
| 3 or less | **Failure.** No progress. Consequences per position. |
| 4-6 | **Mixed.** Progress + complication. |
| 7-9 | **Success.** Solid progress, no complications. |
| 10+ | **Strong success.** Exceptional progress or bonus. |

### Environmental Dice Shifting

Specific environments can shift the dice mode up or down:
- A region warped by chaotic magic: downgrade one step (Expert rolls 2d6 instead of 3d4)
- A well-ordered arcane workshop: upgrade crafting-related checks one step
- A cursed ruin: impose Desperate position regardless of proficiency for specific tasks
- A sacred grove: grant Controlled position for healing and restoration work

### Open Questions for This Variant

- Should ability modifiers apply to Focus dice? (Adding them shifts the mean; may undermine the proficiency-as-position elegance.)
- Is 10+ the right Strong Success threshold across all dice modes?
- How do group Focus checks work? (FitD uses "everyone rolls, best result counts but worst generates consequences.")
- How do PF2e skill feats interact? (Do they provide Position or Effect upgrades?)

---

## Open Design Work

- Hero Points interaction with three-box dying: monitor in playtesting
- Clock sizes: need more examples and GM guidance for setting appropriate sizes
- Focus dice variant: needs playtest to determine if the narrative benefits justify the complexity cost
- Whether clocks should be used for Downtime crafting (potentially duplicates the already-redesigned crafting system in [14-crafting.md](14-crafting.md))
- Earning Income narrative texture: consider whether clocks or complication tables can make Earn Income more engaging without increasing complexity
