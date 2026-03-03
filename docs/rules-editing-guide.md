# Rules Editing Guide

Instructions for converting PF2e RAW content (from AoN cache) into PF2e Lite rules text.

## Pipeline

1. `scripts/aon-fetch.mjs` fetches AoN Elasticsearch data into `.aon-cache/`
2. `scripts/convert-aon.mjs` converts cache into `rules/*.md` files
   - Auto-strips sections listed in `SECTIONS_TO_REMOVE` (Golarion product identity)
   - Output is clean RAW PF2e content minus stripped sections
3. Manual editing applies the design modifications below to each chapter

## Automated Removals (convert-aon.mjs)

These sections are stripped during conversion. Add new entries to `SECTIONS_TO_REMOVE`
in the script as you discover setting-specific sections in later chapters.

| Chapter | Sections Stripped |
|---------|-----------------|
| 01-introduction | Golarion and the Inner Sea (+ children), Religion (+ children), Golarion glossary entry |

## Global Modifications

Apply these everywhere across all chapters.

### Level Cap: 1-10

- "1st to 20th" -> "1st to 10th"
- Capstone examples: replace level-20 feats with level-10 equivalents
- Remove references to levels 11+
- Ancestry feat levels: cap at 5th and 9th (not 13th/17th)

### Proficiency: 4 Ranks (No Legendary)

- Remove "legendary" from all rank lists
- "five ranks" -> "four ranks"
- "untrained, trained, expert, master, and legendary" -> "untrained, trained, expert, and master"
- Proficiency bonuses: "2, 4, 6, and 8" -> "2, 4, or 6"
- Character sheet boxes: "T, E, M, and L" -> "T, E, and M"

### Class Count: 12

- "8 classes" -> "12 classes"
- Remove witch from caster lists (not in PF2e Lite roster)
- See CLAUDE.md Class Grid for the full roster

### Mana System (Replaces Spell Slots)

- "spell slots" -> "mana pool" (for caster resource references)
- "spell slots and spells" -> "spells" (when redundant)
- Spell rank cap: "1st to 10th" -> "1st to 5th"
- Add "limited by their mana pool" where rank limits are explained

### Ability Boosts

- "four attribute boosts at 5th level and every 5 levels thereafter" ->
  "attribute boosts at regular intervals as they level up (see Gradual Ability Boosts in Chapter 3)"

### Merged Feat Track

- "General feats and skill feats (which are a subset of general feats)" ->
  "General feats (which include skill feats) and dedication feats"

### Free Archetype

- Archetypes/dedications: reference "Dedications in Chapter 5"

## Product/Brand Cleanup

- "Pathfinder GM Core" -> "Chapter 9"
- "Pathfinder Monster Core" -> rewrite as generic reference to Chapter 9
- Remove paizo.com URLs and references
- Remove Adventure Path references
- Remove Archives of Nethys links

## Page Reference Replacement

Replace all "page NNN" and "pages NNN-NNN" with chapter cross-references:
- "page 19" (attribute modifiers) -> "the Attribute Modifier Overview sidebar above"
- "pages 20-21" (ancestry/class summaries) -> "Chapters 2 and 3"
- "page 84" (backgrounds) -> "Chapter 2"
- "page 215" (archetypes) -> "Dedications in Chapter 5"
- "page 268" (starting loadouts) -> "Chapter 6"
- "page 404" (Perception) -> "Chapter 8"
- "page 413" (Hero Points) -> "Chapter 8"
- "page 271" (armor Dex cap) -> "Chapter 6"
- "page 452" (glossary) -> "the Key Terms glossary at the end of this chapter"
- "Glossary and Index in the back of this book" -> "Key Terms glossary at the end of this chapter"
- "Conditions Appendix at the back of this book" -> "Chapter 8"
- "Appendices" chapter summary -> "Chapter 9: Game Mastering" with new description

General rule: if a page ref points to content within the same chapter, use section name.
If it points to another chapter, use "Chapter N".

## Golarion Content Removal

This is required for ORC compliance (Golarion is Paizo product identity).

### Section-Level (automated by converter)

See Automated Removals table above.

### Text-Level (manual per chapter)

- "Age of Lost Omens" -> remove or replace with generic phrasing
  - "The Age of Lost Omens abounds" -> "The world abounds"
  - "representing the Age of Lost Omens" -> remove qualifier
- Named deities (Sarenrae, Torag, Cayden Cailean, Desna, Iomedae, etc.) -> remove
  - "cleric of Sarenrae" -> "cleric"
  - "sacred light of Sarenrae" -> "my faith"
  - "Thank Torag" -> "Thank the gods"
  - Remove deity banter lines entirely if they serve no mechanical purpose
- Faith/deity character creation sections -> remove entirely
- "Deity" step in character creation -> remove
- Deity page refs in edicts -> generic "edicts and anathema of your faith"
- Versatile heritages (nephilim etc.) -> remove (setting-specific, not in Lite roster)
- Pathfinder Society -> remove

## Chapter-Specific Notes

### Chapter 1: Introduction

All modifications listed above have been applied. Key structural changes:
- Removed entire Faith subsection from Step 1
- Removed Deity step from Step 10
- Rewrote Overview sidebar to reference chapters instead of page layouts
- Simplified character sheet/page references throughout
- Example of Play: deity references rewritten to be setting-agnostic

### Chapter 2: Ancestries & Backgrounds

Framework edits applied. Key structural changes:
- Ancestry feat levels capped at 5th/9th (removed 13th/17th)
- Removed Versatile Heritages section (Changeling, Nephilim — deferred to expansion)
- Kept Mixed Ancestry heritages (aiuvarin/dromaar) as core content
- Replaced all Golarion/Inner Sea/Taldane references with generic phrasing
- Replaced page number references with chapter cross-references
- Fixed typo ("andappear" → "and appear")

Note: Chapter 2 is currently a structural framework (no individual ancestry/background entries yet). Actual ancestry and background content will be added from AoN cache in a future pass.

### Chapter 3: Classes

Framework edits applied. Key structural changes:
- "8 classes" → "12 classes", level cap "20th" → "10th"
- Removed witch reference from intro (not in PF2e Lite roster)
- "cleric's choice of deity" → "cleric's choice of faith"
- Proficiency ranks capped at master (removed legendary refs)
- Skill Increases: removed legendary tier (15th level), kept master at 7th
- Attribute Boosts → references Gradual Ability Boosts
- Ancestry feats: "5th, 9th, 13th, and 17th" → "5th and 9th"
- Spellcasting Archetypes: removed Expert (12th) and Master (18th) tiers, kept Basic only
- Removed witch archetype reference, replaced spell slot terminology
- Removed 3 duplicate sections (Alchemical Archetypes, Temporary Items, Riding Animal Companions — converter artifacts)
- All page references replaced with chapter cross-references

Note: Chapter 3 is currently a structural framework (no individual class entries yet). Actual class content will be added in a future pass.

### Chapter 4: Skills

Framework edits applied:
- Removed legendary tier from skill increases and Simple Skill DC table
- Replaced page references with chapter cross-references
- "GM Core guidelines" → "the guidelines in Chapter 9"

Note: Chapter 4 is currently a framework (no individual skill entries yet). Medicine proficiency auto-unlocks and actual skill content will be added in a future pass.

### Chapter 5: Feats & Dedications

Stub (11 lines) — no edits needed. Actual feat content (merged feat tracks, Free Archetype, dedications) will be added in a future pass.

### Chapter 6: Equipment

Framework edits applied:
- Replaced ~25 page references with chapter cross-references or "in this chapter"/"below"
- "on Golarion" → removed from alchemical items section
- "GM Core" → "Chapter 9"
- "starting money (page 25)" → "starting money (see Chapter 1)"

Note: Chapter 6 has substantial AoN content (543 lines). Design-specific changes (simplified shields, crafting refs, staves/wands mana interaction) will be applied in a future pass.

### Chapter 7: Spells

Framework edits applied:
- "spell slots" → "mana" / "mana pool" throughout
- Removed witch from caster lists (not in PF2e Lite roster)
- "from 1 to 10" → "from 1 to 5" (spell rank cap)
- Replaced all page references with chapter cross-references
- Prepared/spontaneous caster descriptions updated for mana terminology

Note: Chapter 7 has substantial AoN content (327 lines). Design-specific changes (full mana math, Spellshape system) will be applied in a future pass.

### Chapter 8: Playing the Game

Framework edits applied:
- Removed legendary from proficiency rank lists and bonus table (4 ranks: untrained/trained/expert/master)
- "spell slots" → "mana" (hidden creature targeting, daily preparations)
- Removed witch reference in retraining section (→ druid example)
- Removed legendary from skill retraining example
- Replaced page references with section cross-references (dying, Hero Points, Make an Impression)

Note: Chapter 8 has full AoN content (1554 lines). Design-specific changes (20 conditions, two-tier detection, three-box dying) will be applied in a future pass.

### Chapter 9: Game Mastering

Stub (3 lines) — no edits needed. Needs GM Core data; encounter math, DC tables, treasure will be added in a future pass.
