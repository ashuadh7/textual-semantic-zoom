export interface TextToken {
  type: "text";
  text: string;
}

export interface TermToken {
  type: "term";
  text: string;
  elaboration: string;
}

export type Token = TextToken | TermToken;

export interface Segment {
  id: string;
  depth: number;
  content: Token[];
}

export interface Section {
  id: string;
  title: string;
  segments: Segment[];
}

export interface Document {
  id: string;
  title: string;
  sections: Section[];
}

// ── Semantic Zoom document ─────────────────────────────────────────────────
// Each section has discrete layers (depth 1 = compressed summary,
// depth 2 = short paragraphs, depth 3 = full text). The same concepts
// appear in the same order at every depth level.

export interface SZParagraph {
  id: string;
  tokens: Token[];
  // References a depth-3 paragraph in the same section; clicking the whole
  // paragraph expands it inline to show that full content.
  expandsToId?: string;
}

export interface SZLayer {
  depth: number;
  paragraphs: SZParagraph[];
}

export interface SZSection {
  id: string;
  title: string;
  layers: SZLayer[];
}

export interface SemanticDocument {
  id: string;
  title: string;
  sections: SZSection[];
}
