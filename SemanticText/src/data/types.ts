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
