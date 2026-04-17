# Layered Document JSON Schema

## Top-level Document

```ts
interface Document {
  id: string;           // slug identifier
  title: string;        // display title
  sections: Section[];
}
```

## Section

```ts
interface Section {
  id: string;       // slug, e.g. "origins"
  title: string;    // section heading
  segments: Segment[];
}
```

## Segment

A segment is one paragraph or a coherent sentence group. Its `depth` controls the **minimum layer** at which it becomes visible globally.

```ts
interface Segment {
  id: string;       // unique within document, e.g. "s1", "s2"
  depth: number;    // 0 = always visible; 1+ = revealed on that layer
  content: Token[];
}
```

## Token

Inline content within a segment. Two types:

```ts
type Token = TextToken | TermToken;

interface TextToken {
  type: "text";
  text: string;
}

interface TermToken {
  type: "term";
  text: string;         // visible label in prose
  elaboration: string;  // revealed on click (inline expansion)
}
```

## Depth rules

| depth | Visible when... |
|-------|-----------------|
| 0 | Always (layer 0 skeleton) |
| 1 | User reaches layer 1 or clicks into it |
| 2 | User reaches layer 2 or clicks into it |
| N | ... |

- **Segments** are shown/hidden based on the global layer level.
- **TermTokens** are always rendered as clickable highlights regardless of depth; clicking them reveals `elaboration` inline regardless of the current global layer.
- Layer 0 segments, read in order, must form a coherent, complete narrative on their own.
