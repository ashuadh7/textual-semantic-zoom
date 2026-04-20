# Textual Semantic Zoom — CLAUDE.md

## Project Purpose
Research prototype + personal blog reader built on a shared semantic zoom engine. Compares three reading interfaces (Scroll, Accordion, Semantic Zoom) for a layered Beatles article; also serves as a personal note-reading tool for books, podcasts, and articles.

## Repo Layout

> **Note (Apr 2026):** Project was flattened — the `SemanticText/` subfolder was removed and all Vite project files now live at the repo root. Some older GitHub links and issue references may still point to `SemanticText/` paths; those are stale.
>
> **In-progress (issues #18–#21):** The `src/` folder is being reorganized into `core/` + `apps/` with React Router. Until that work lands, `src/components/` and `src/data/` still reflect the pre-refactor layout below.

```
e:/Waterloo/Textual Semantic zoom/   ← repo root (also Vite project root)
├── CLAUDE.md
├── Readme.md
├── index.html
├── vite.config.ts
├── package.json
└── src/
    ├── App.tsx            ← root; holds ViewMode state
    ├── main.tsx
    ├── components/
    │   ├── ViewTabs.tsx/css         ← tab bar (scrolling | accordion | semantic)
    │   ├── ScrollView.tsx/css       ← Condition 1: flat full-content view
    │   ├── AccordionView.tsx/css    ← Condition 2: section-gated expand/collapse
    │   └── SemanticZoomView.tsx/css ← Condition 3: Shift+Scroll layer zoom + click-to-expand terms
    └── data/
        ├── types.ts                 ← all TypeScript interfaces (Document, SemanticDocument, etc.)
        ├── schema.md                ← JSON authoring schema reference
        ├── beatles.json             ← Document: used by Scroll + Accordion views
        └── beatles-semantic.json    ← SemanticDocument: used by SemanticZoomView
```

## Target Architecture (issues #18–#21)

```
src/
├── core/                        ← shared semantic zoom engine
│   ├── SemanticZoomView.tsx
│   ├── ScrollView.tsx
│   ├── AccordionView.tsx
│   └── types.ts
├── apps/
│   ├── research/                ← research demo shell
│   │   ├── ResearchApp.tsx
│   │   └── data/
│   └── blog/                    ← personal blog reader shell
│       ├── BlogApp.tsx
│       └── data/
└── App.tsx                      ← React Router: / → Blog, /research → Research
```

## Data Model (types.ts)

**beatles.json** → `Document` (Scroll + Accordion)
```
Document → Section[] → Segment[] → Token[]
Segment.depth: 0=always visible, N=revealed at layer N
Token: { type:"text", text } | { type:"term", text, elaboration }
```

**beatles-semantic.json** → `SemanticDocument` (SemanticZoom)
```
SemanticDocument → SZSection[] → SZLayer[] → SZParagraph[]
SZLayer.depth: 1=compressed summary, 2=short paragraphs, 3=full text
SZParagraph.expandsToId?: references depth-3 paragraph for inline expansion
```

## Interface Conditions

| Tab | Component | Mechanic |
|-----|-----------|----------|
| scrolling | ScrollView | All content visible (baseline) |
| accordion | AccordionView | Section-gated expand/collapse |
| semantic | SemanticZoomView | Shift+Scroll global layer + click TermTokens inline |

## Dev Commands (run from repo root)
```
npm run dev      # start Vite dev server
npm run build    # tsc + vite build
npm run lint     # eslint
```

## Key Conventions
- All view components receive `doc: Document` or `semanticDoc: SemanticDocument` as props — no global store.
- CSS is co-located per component (`ComponentName.css`).
- No LLM backend — all content is statically authored JSON.
- Stack: React 19, TypeScript ~6, Vite 8.

## Commit / PR Rules
- Never include Co-Authored-By, "Generated with Claude", or any Claude attribution.
- Always stop after committing — do not push or merge without user approval.
- Every new issue or feature must be worked on a dedicated branch — never commit directly to main.

## Issue Tracker

**Whenever an issue is opened, closed, or updated during a conversation, update this section immediately.**

### Milestones

| Milestone | Goal | Due |
|-----------|------|-----|
| M1 — Monday Demo | Working blog reader with real entries, deployed to GitHub Pages | 2026-04-20 |
| M2 — Blog Pipeline | Sustainable note-publishing workflow; one entry per content type | 2026-05-04 |
| M3 — Research Ready | Infrastructure for a controlled user study (auth, logging, participant tracking) | — |

### Open Issues

| # | Title | Milestone |
|---|-------|-----------|
| #6 | Visual indicators for newly revealed content | M3 — Research Ready |
| #7 | Interaction logging — expansion events, dwell time, depth reached | M3 — Research Ready |
| #22 | Update CLAUDE.md to reflect new project structure | M1 — Monday Demo |
| #24 | Verify GitHub Pages deployment is current | M1 — Monday Demo |
| #25 | Define note authoring schema and template | M2 — Blog Pipeline |
| #26 | GenAI authoring pipeline: raw notes → SemanticDocument JSON | M2 — Blog Pipeline |
| #27 | Personal website integration | M2 — Blog Pipeline |
| #28 | Auth / accounts for multi-user research deployment | M3 — Research Ready |
| #29 | Participant tracking and study session management | M3 — Research Ready |

### Closed Issues

| # | Title |
|---|-------|
| #1 | Author the Beatles article in layered JSON format |
| #2 | Scroll baseline — render full document as flat visible page |
| #3 | Accordion baseline — section-gated expand/collapse interface |
| #4 | Project setup — Vite + React + TypeScript |
| #5 | Semantic Zoom interface — Shift+Scroll global expansion + inline click |
| #13 | Context-aware scroll: hover-targeted vs global depth zoom |
| #14 | Quiz mode: split-screen reader + 5-question MCQ that requires semantic zooming |
| #16 | Mobile support: pinch-to-zoom for SemanticZoomView |
| #18 | Remove quiz panel and split-screen layout |
| #19 | Reorganize code into core/ engine and apps/ contexts |
| #20 | Add React Router: /research and / routes |
| #21 | Blog shell: content-type tabs and SemanticZoom per entry |
| #23 | Author 2-3 real note entries as SemanticDocument JSON |
