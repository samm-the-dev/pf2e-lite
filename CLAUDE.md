# PF2e Lite — Design Skeleton

@.toolbox/templates/ai-context/AGENTS.md

A Next.js web app (rules reference, future character builder) built on top of
tabletop RPG design documents.

## Rules Editing Workflow

The `rules/` directory contains PF2e rules text converted from AoN cache. See
[`docs/rules-editing-guide.md`](docs/rules-editing-guide.md) for the full editing
pipeline, global modification rules, and per-chapter status.

## Project Structure

- `src/` — Next.js App Router application (TypeScript, Tailwind CSS)
  - `src/app/` — Pages and layouts
  - `src/app/rules/[slug]/` — Dynamic route rendering design docs via react-markdown
  - `src/components/` — Shared React components
  - `src/lib/docs.ts` — Build-time utilities to read markdown from `docs/`
- `docs/` — 19 numbered design docs (`00-overview.md` through `18-open-questions.md`),
  supporting analysis docs, and a mana math spreadsheet. See [README](README.md).
- `public/` — Static assets

## Build Commands

```
npm run dev        # Start dev server (localhost:3000)
npm run build      # Static export to out/
npm run lint       # ESLint
npm run format     # Prettier
```

## Static Export

The app uses `output: 'export'` in `next.config.ts` for GitHub Pages deployment.
`basePath: '/pf2e-lite'` is applied in production only. No API routes, no SSR —
all pages are statically generated at build time.

## Writing Style

- Use hyphens (`-`), not en dashes (`–`) or em dashes (`—`), for negative numbers and ranges (e.g., `-5 ft`, `levels 1-10`)

## Design Philosophy

- **Preserve PF2e's core math** (±10 crit threshold, 65% base hit rate, degrees of success)
- **Simplify systems, not depth** — fewer subsystems, same tactical decisions
- **Levels 1-10 only** (Master proficiency cap)
- **ORC licensed** — based on PF2e Remastered content

## Class Grid

4 martial / 4 full caster / 4 empowered (one per tradition):

| Role | Classes |
|------|---------|
| Martial | Fighter (STR), Rogue (DEX), Barbarian (STR/CON), Monk (STR/DEX) |
| Full caster (mana) | Wizard (INT/arcane), Cleric (WIS/divine), Druid (WIS/primal), Bard (CHA/occult) |
| Empowered (focus spells) | Champion (STR/divine), Ranger (DEX/primal), Artificer (INT/arcane), Thaumaturge (CHA/occult) |

- Psychic: moved to expansion (complex, niche — 6 conscious minds, amps, Unleash Psyche)
- Bard: direct port as full occult caster (compositions + mana)

## Key Custom Classes

- **Artificer** (`docs/06-artificer.md`): INT arcane-empowered crafter, Alchemist-model chassis.
  Infusions are qualitative (add capabilities, not numerical bonuses).
- **Thaumaturge** (`docs/05-classes.md`): CHA occult-empowered martial, ported from Dark Archive.

## Reference Sources

- **RPGBot** (rpgbot.net): good mechanical analysis reference. Proprietary content
  (no open license) — use as reference/inspiration, don't copy.

## Archives of Nethys — Elasticsearch API

AoN has an unauthenticated Elasticsearch backend for querying PF2e data.

### Connection

- **Endpoint:** `https://elasticsearch.aonprd.com/aon70/_search`
- **Method:** POST with JSON body
- **Auth:** None required
- **Max results:** 10,000 per query via `size` parameter

### Important: Index Contains Both Editions

The index has **both pre-remaster and remastered** content as separate documents.
Filter to remaster sources to get current rules.

**Remaster sources** (use `match_phrase` on `source` field):
- `GM Core` (2,406 docs, released 2023-11-15)
- `Player Core` (5,439 docs)
- `Player Core 2` (2,322 docs)
- `Rage of Elements` (836 docs)
- `Howl of the Wild` (720 docs)
- `War of Immortals` (645 docs)
- `Divine Mysteries` (665 docs)

**Pre-remaster sources** (filter these OUT for current rules):
- `Core Rulebook`, `Advanced Player's Guide`, `Gamemastery Guide`,
  `Secrets of Magic`, `Guns & Gears`, `Dark Archive`, `Treasure Vault`

### Gotcha: Name Updates Across Editions

AoN sometimes applies remaster names to pre-remaster entries. For example,
`Quickstrike` (remaster name for `Speed`) may appear under `Core Rulebook` source.
Always check `primary_source` to confirm which edition an entry belongs to.

### Key Fields

| Field | Type | Notes |
|-------|------|-------|
| `name` | string | Item/rule name |
| `category` | keyword | `equipment`, `feat`, `spell`, `creature`, etc. |
| `item_category` | string | `Runes`, `Alchemical Items`, etc. (equipment only) |
| `item_subcategory` | string | `Weapon Property Runes`, `Armor Property Runes`, etc. |
| `source` | string[] | Source book name(s), e.g. `["GM Core"]` |
| `primary_source` | string | Single primary source |
| `release_date` | date | Publication date |
| `level` | int | Item/feat/spell level |
| `price_raw` | string | Price as text, e.g. `"500 gp"` |
| `rarity` | string | `common`, `uncommon`, `rare`, `unique` |
| `trait` | string[] | PF2e traits |
| `summary` | string | Short description |
| `markdown` | string | Full content with HTML markup |
| `text` | string | Full content as plain text |

### Example Queries

**Remastered weapon property runes:**
```json
{
  "size": 100,
  "query": {
    "bool": {
      "must": [
        { "match": { "category": "equipment" } },
        { "match": { "item_subcategory": "Weapon Property Runes" } },
        { "match_phrase": { "source": "GM Core" } }
      ]
    }
  },
  "_source": ["name", "level", "price_raw", "rarity", "trait", "summary", "source"]
}
```

**Search by name across all categories:**
```json
{
  "size": 10,
  "query": { "match": { "name": "Flaming" } },
  "_source": ["name", "category", "level", "source", "summary"]
}
```

**All remastered equipment (any remaster source):**
```json
{
  "size": 200,
  "query": {
    "bool": {
      "must": [{ "match": { "category": "equipment" } }],
      "should": [
        { "match_phrase": { "source": "GM Core" } },
        { "match_phrase": { "source": "Player Core" } },
        { "match_phrase": { "source": "Player Core 2" } },
        { "match_phrase": { "source": "Rage of Elements" } }
      ],
      "minimum_should_match": 1
    }
  },
  "_source": ["name", "level", "price_raw", "item_category", "item_subcategory", "source"]
}
```

### Querying from Python

```python
import json, urllib.request

def query_aon(body):
    req = urllib.request.Request(
        "https://elasticsearch.aonprd.com/aon70/_search",
        data=json.dumps(body).encode(),
        headers={"Content-Type": "application/json"},
    )
    with urllib.request.urlopen(req, timeout=15) as resp:
        return json.loads(resp.read())
```

### Limitations

- No official API documentation or SLA — undocumented backend, could change
- `source_raw` field (includes page numbers) is not aggregatable
- Text fields like `item_subcategory` don't support term aggregations — use `match` queries
- Content in `markdown`/`text` is semi-structured (HTML/custom markup), not clean JSON per attribute
- Admin endpoints (`_cat/indices`, etc.) are blocked
- Total index likely exceeds 10,000 docs (Elasticsearch default cap on reported total)

### Alternative Data Sources

- **Foundry VTT PF2e** (`github.com/foundryvtt/pf2e`): Best structured JSON data, actively maintained.
  Equipment in `packs/` directory. Run `npm run extractPacks equipment` for JSON files.
- **Pf2eTools** (`github.com/Pf2eToolsOrg/Pf2eTools`): Comprehensive JSON, MIT licensed.
- **Pf2ools** (`github.com/Pf2ools/pf2ools-data`): JSON organized by source book, MIT licensed.
