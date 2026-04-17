# Textual Semantic Zoom

**[Live Demo](https://ashuadh7.github.io/textual-semantic-zoom/)** — try the reading interface in the browser, no install needed.

A browser-based **semantic zooming interface for text**: content is revealed progressively through layered disclosure rather than presented all at once. Built as both a personal note-reading tool and a research prototype.

## Concept

The system models a document as a stack of depth tiers. The base layer contains the essential skeleton of the text. Each successive layer slots additional detail into the existing prose at natural positions, preserving the original phrase order and document structure throughout.

Revelation happens two ways:
- **Global expansion** — `Shift+Scroll` (desktop) or pinch gesture (mobile/trackpad) advances the document one layer at a time, revealing the next tier of detail across the whole text.
- **Selective expansion** — clicking a highlighted term or phrase opens an inline elaboration for that specific concept only.

## Project Contexts

This repo serves two overlapping purposes built on a **shared semantic zoom engine**:

| Context | URL | What it is |
|---|---|---|
| **Blog reader** | `/` | Personal notes on books, podcasts, articles — infinite scroll by content type, semantic zoom only |
| **Research demo** | `/research` | Three-view comparison (Scroll / Accordion / Semantic Zoom) for a controlled user study |

Any improvement to the core engine (new gestures, rendering fixes, new interaction patterns) automatically applies to both contexts.

## Architecture

```
src/
├── core/                        ← shared semantic zoom engine
│   ├── SemanticZoomView.tsx     (the main zoom interface)
│   ├── ScrollView.tsx           (linear baseline)
│   ├── AccordionView.tsx        (section-gated baseline)
│   └── types.ts                 (Document, SemanticDocument schemas)
├── apps/
│   ├── research/                ← research demo shell
│   │   ├── ResearchApp.tsx      (3-view tabs, sample content)
│   │   └── data/                (beatles.json, beatles-semantic.json)
│   └── blog/                    ← personal blog reader shell
│       ├── BlogApp.tsx          (Podcasts | Books | Articles tabs)
│       └── data/                (one JSON per entry)
└── App.tsx                      ← React Router: / → Blog, /research → Research
```

## Data Model

**Linear content** (`Document`) → used by Scroll + Accordion views
```
Document → Section[] → Segment[] → Token[]
Segment.depth: 0=always visible, N=revealed at layer N
Token: { type:"text", text } | { type:"term", text, elaboration }
```

**Semantic content** (`SemanticDocument`) → used by SemanticZoom view
```
SemanticDocument → SZSection[] → SZLayer[] → SZParagraph[]
SZLayer.depth: 1=compressed summary, 2=short paragraphs, 3=full text
SZParagraph.expandsToId?: references depth-3 paragraph for inline expansion
```

## Dev Commands

Run inside `SemanticText/`:
```
npm run dev      # start Vite dev server
npm run build    # tsc + vite build
npm run lint     # eslint
```

## Future Work

- **GenAI authoring pipeline** — transform an arbitrary document into a layered semantic zoom representation automatically.
- **Concept linking** — highlight a concept (e.g. "cognitive overload") and surface all related passages across the document for high-level scanning.
- **Graph view** — explore relationships between concepts as an interactive graph rather than linear prose.
- **Controlled user study** — within-subjects comparison of Scroll × Accordion × Semantic Zoom across text genres, measuring recall, comprehension, and cognitive load (NASA-TLX).

## Issues / Roadmap

See [GitHub Issues](https://github.com/ashuadh7/textual-semantic-zoom/issues) for current work items.

### Architecture pivot (v2)
- **Issue #17** — Remove quiz panel and split-screen layout (`git tag: quiz-removed`)
- **Issue #18** — Reorganize into `core/` engine and `apps/` contexts
- **Issue #19** — Add React Router: `/research` and `/` routes
- **Issue #20** — Blog shell: content-type tabs + infinite scroll with SemanticZoom
- **Issue #21** — Update CLAUDE.md to reflect new project structure
