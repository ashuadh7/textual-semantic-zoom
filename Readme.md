# Textual Semantic Zoom

A browser-based prototype demonstrating **semantic zooming for text**: a reading interface where content is revealed progressively through layered disclosure rather than presented all at once.

## Concept

The system models a document as a stack of depth tiers. The base layer contains the essential skeleton of the text. Each successive layer slots additional detail into the existing prose at natural positions, preserving the original phrase order and document structure throughout.

Revelation happens two ways:
- **Global expansion** — `Shift+Scroll` advances the document one layer at a time, revealing the next tier of detail across the whole text.
- **Selective expansion** — clicking a highlighted term or phrase opens an inline elaboration for that specific concept only.

A subtle visual indicator (e.g., a highlight fade or marginal mark) distinguishes newly revealed content from content that was already visible.

## Demo Target

The immediate goal is a working demo built around **an article about The Beatles**. The article will be authored manually in a layered JSON format, with layer 0 as the essential narrative and layers 1–N progressively adding context, detail, and supporting facts.

Three interface conditions will be implemented for comparison:

| Condition | Description |
|-----------|-------------|
| **Scroll** | All content visible simultaneously (standard reading) |
| **Accordion** | Content segmented by section, expandable on demand |
| **Semantic Zoom** | Progressive layer-by-layer disclosure via Shift+Scroll + inline click |

## Conceptual Frame: Negotiated Priority

The system implements a **negotiated priority model**: authors encode significance through which content appears at which layer (structural salience), while readers exercise agency through selective inline expansion (contextual relevance). This is distinct from the author-controlled hierarchy of an accordion and the undifferentiated access of a scroll.

## Technical Stack

- Vite + React + TypeScript
- No LLM backend required for the demo (content is manually authored)

## Future Work

- **GenAI authoring pipeline** — transform an arbitrary document into a layered semantic zoom representation automatically; evaluate for authoring efficiency and structural fidelity.
- **Graph view** — explore an alternative rendering mode where concepts and their relationships are visualised as an interactive graph rather than linear prose.
- **Controlled user study** — within-subjects comparison of Scroll × Accordion × Semantic Zoom across three text genres (fictional encyclopedia, expository science, cultural review), measuring recall, comprehension, relevance identification, and NASA-TLX cognitive load.

## Development Phases & Issues

### Phase 1: Foundation
- **Issue 1:** Project setup — Vite + React + TypeScript, linting, folder structure
- **Issue 2:** Author the Beatles article in layered JSON format (layer 0 = skeleton, layers 1–N = progressive detail)

### Phase 2: Core Interfaces
- **Issue 3:** Scroll baseline — render the full layered document as a flat, fully-visible page
- **Issue 4:** Accordion baseline — segment the document by section with expand/collapse controls
- **Issue 5:** Semantic Zoom interface — layer-aware renderer with Shift+Scroll global expansion and click-to-expand inline terms

### Phase 3: Polish & Instrumentation
- **Issue 6:** Visual indicators — highlight fade or marginal marks on newly revealed content
- **Issue 7:** Interaction logging — record expansion events, dwell time, and depth reached per session
