# Graph Report - .  (2026-11-05)

## Corpus Check
- cluster-only mode — file stats not available

## Summary
- 151 nodes · 269 edges · 8 communities (6 shown, 2 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 1 edges (avg confidence: 0.5)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- Community 0
- Community 1
- Community 2
- Community 3
- Community 4
- Community 5
- Community 6
- Community 7

## God Nodes (most connected - your core abstractions)
1. `LabTrackCacheService` - 13 edges
2. `initializeDemoData()` - 11 edges
3. `Sanitizer` - 11 edges
4. `switchTab()` - 10 edges
5. `Formatters` - 10 edges
6. `CryptoSeal` - 8 edges
7. `openSampleModal()` - 7 edges
8. `ExternalReferralEngine` - 6 edges
9. `renderSamples()` - 6 edges
10. `renderReferrals()` - 6 edges

## Surprising Connections (you probably didn't know these)
- `renderDashboard()` --references--> `Formatters`  [EXTRACTED]
  src/main.js → src/utils/formatters.js
- `renderDashboard()` --references--> `Sanitizer`  [EXTRACTED]
  src/main.js → src/utils/sanitizer.js
- `renderSamples()` --references--> `Formatters`  [EXTRACTED]
  src/main.js → src/utils/formatters.js
- `renderSamples()` --references--> `Sanitizer`  [EXTRACTED]
  src/main.js → src/utils/sanitizer.js
- `renderSLACountdown()` --references--> `Formatters`  [EXTRACTED]
  src/main.js → src/utils/formatters.js

## Import Cycles
- None detected.

## Communities (8 total, 2 thin omitted)

### Community 0 - "Community 0"
Cohesion: 0.03
Nodes (62): acidWater, badgeApta, badgeBact, badgeChem, cachedOrders, cleanWater, completedReferral, csvOutput (+54 more)

### Community 1 - "Community 1"
Cohesion: 0.21
Nodes (20): attachCAAEvaluatorEvents(), attachDashboardEvents(), attachProtocolsEvents(), attachReferralsEvents(), attachSamplesEvents(), initApp(), openProtocolDetailModal(), openProtocolModal() (+12 more)

### Community 2 - "Community 2"
Cohesion: 0.25
Nodes (6): initializeDemoData(), getStorageItem(), LabTrackCacheService, memoryStore, removeStorageItem(), setStorageItem()

### Community 3 - "Community 3"
Cohesion: 0.17
Nodes (11): author, description, license, name, scripts, security:full, test, test:security (+3 more)

### Community 4 - "Community 4"
Cohesion: 0.24
Nodes (4): CAA_LIMITS, CAAStandardsEngine, ProtocolService, CryptoSeal

### Community 5 - "Community 5"
Cohesion: 0.21
Nodes (4): BOTTLE_TYPES, SampleKitRegistry, SLABiologicalSentinel, SampleOrderService

## Knowledge Gaps
- **74 isolated node(s):** `name`, `version`, `description`, `type`, `test` (+69 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **2 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `LabTrackCacheService` connect `Community 2` to `Community 0`, `Community 1`?**
  _High betweenness centrality (0.104) - this node is a cross-community bridge._
- **Why does `Sanitizer` connect `Community 1` to `Community 0`?**
  _High betweenness centrality (0.033) - this node is a cross-community bridge._
- **Why does `ExternalReferralEngine` connect `Community 6` to `Community 0`, `Community 1`?**
  _High betweenness centrality (0.031) - this node is a cross-community bridge._
- **What connects `name`, `version`, `description` to the rest of the system?**
  _74 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Community 0` be split into smaller, more focused modules?**
  _Cohesion score 0.03125 - nodes in this community are weakly interconnected._