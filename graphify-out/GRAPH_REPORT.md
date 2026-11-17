# Graph Report - c:\Users\Regondi Calidad\Desktop\QM\LabTrack  (2026-11-17)

## Corpus Check
- Corpus is ~17,191 words - fits in a single context window. You may not need a graph.

## Summary
- 195 nodes · 370 edges · 12 communities (10 shown, 2 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 2 edges (avg confidence: 0.5)
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
- Community 8
- Community 9

## God Nodes (most connected - your core abstractions)
1. `initModalListeners()` - 18 edges
2. `LabTrackCacheService` - 15 edges
3. `initializeDemoData()` - 14 edges
4. `Sanitizer` - 13 edges
5. `switchTab()` - 11 edges
6. `svgIcon()` - 10 edges
7. `renderSamples()` - 9 edges
8. `renderProtocols()` - 9 edges
9. `renderReferrals()` - 9 edges
10. `Formatters` - 9 edges

## Surprising Connections (you probably didn't know these)
- `dictamenVisual()` --references--> `Formatters`  [EXTRACTED]
  src/main.js → src/utils/formatters.js
- `showToast()` --references--> `Sanitizer`  [EXTRACTED]
  src/main.js → src/utils/sanitizer.js
- `renderDashboard()` --references--> `Formatters`  [EXTRACTED]
  src/main.js → src/utils/formatters.js
- `renderDashboard()` --references--> `Sanitizer`  [EXTRACTED]
  src/main.js → src/utils/sanitizer.js
- `renderSamples()` --references--> `Formatters`  [EXTRACTED]
  src/main.js → src/utils/formatters.js

## Import Cycles
- None detected.

## Communities (12 total, 2 thin omitted)

### Community 0 - "Community 0"
Cohesion: 0.03
Nodes (67): acidWater, badgeApta, badgeBact, badgeChem, cachedOrders, cachedReferrals, cleanWater, completedReferral (+59 more)

### Community 1 - "Community 1"
Cohesion: 0.17
Nodes (23): SLABiologicalSentinel, attachCAAEvaluatorEvents(), attachDashboardEvents(), attachProtocolsEvents(), attachReferralsEvents(), demoBadgeHtml(), dictamenVisual(), openProtocolDetailModal() (+15 more)

### Community 2 - "Community 2"
Cohesion: 0.16
Nodes (11): ExternalReferralEngine, closeAllModals(), closeModalElement(), initializeDemoData(), initModalListeners(), getStorageItem(), LabTrackCacheService, memoryStore (+3 more)

### Community 3 - "Community 3"
Cohesion: 0.20
Nodes (5): CAA_LIMITS, CAAStandardsEngine, ProtocolService, SampleOrderService, CryptoSeal

### Community 4 - "Community 4"
Cohesion: 0.17
Nodes (11): author, description, license, name, scripts, security:full, test, test:security (+3 more)

### Community 5 - "Community 5"
Cohesion: 0.27
Nodes (8): attachSamplesEvents(), initApp(), openModalElement(), openProtocolModal(), openSampleModal(), openWhatsAppModal(), setFormError(), WhatsAppLabNotifierService

### Community 6 - "Community 6"
Cohesion: 0.20
Nodes (9): background_color, description, display, icons, lang, name, short_name, start_url (+1 more)

### Community 7 - "Community 7"
Cohesion: 0.20
Nodes (9): indexPath, parts, pkgData, pkgPath, root, semver, swPath, versionData (+1 more)

## Knowledge Gaps
- **98 isolated node(s):** `name`, `short_name`, `description`, `start_url`, `display` (+93 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **2 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `LabTrackCacheService` connect `Community 2` to `Community 0`, `Community 1`?**
  _High betweenness centrality (0.079) - this node is a cross-community bridge._
- **Why does `Sanitizer` connect `Community 1` to `Community 0`?**
  _High betweenness centrality (0.039) - this node is a cross-community bridge._
- **Why does `Formatters` connect `Community 1` to `Community 0`?**
  _High betweenness centrality (0.020) - this node is a cross-community bridge._
- **What connects `name`, `short_name`, `description` to the rest of the system?**
  _98 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Community 0` be split into smaller, more focused modules?**
  _Cohesion score 0.028985507246376812 - nodes in this community are weakly interconnected._