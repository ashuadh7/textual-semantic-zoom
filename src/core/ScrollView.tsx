import type { Document, Token } from "./types";
import "./ScrollView.css";

interface Props {
  doc: Document;
}

function renderTokens(tokens: Token[]) {
  return tokens.map((tok, i) => {
    if (tok.type === "term") {
      return <span key={i} className="scroll-term">{tok.text}</span>;
    }
    return <span key={i}>{tok.text}</span>;
  });
}

export default function ScrollView({ doc }: Props) {
  return (
    <article className="scroll-view">
      <h1 className="scroll-doc-title">{doc.title}</h1>
      {doc.sections.map((section) => (
        <section key={section.id} className="scroll-section">
          <h2 className="scroll-section-title">{section.title}</h2>
          {section.segments.map((seg) => (
            <p key={seg.id} className="scroll-segment">
              {renderTokens(seg.content)}
            </p>
          ))}
        </section>
      ))}
    </article>
  );
}
