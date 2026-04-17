import { useState } from "react";
import type { Document, Token } from "../data/types";
import "./AccordionView.css";

interface Props {
  doc: Document;
}

function renderTokens(tokens: Token[]) {
  return tokens.map((tok, i) => {
    if (tok.type === "term") {
      return <span key={i} className="accordion-term">{tok.text}</span>;
    }
    return <span key={i}>{tok.text}</span>;
  });
}

export default function AccordionView({ doc }: Props) {
  const [openSections, setOpenSections] = useState<Set<string>>(new Set());

  function toggle(id: string) {
    setOpenSections((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }

  return (
    <article className="accordion-view">
      <h1 className="accordion-doc-title">{doc.title}</h1>
      <div className="accordion-list">
        {doc.sections.map((section) => {
          const isOpen = openSections.has(section.id);
          return (
            <div key={section.id} className={`accordion-item${isOpen ? " accordion-item--open" : ""}`}>
              <button
                className="accordion-header"
                aria-expanded={isOpen}
                onClick={() => toggle(section.id)}
              >
                <span className="accordion-title">{section.title}</span>
                <span className="accordion-chevron" aria-hidden="true">
                  {isOpen ? "▲" : "▼"}
                </span>
              </button>
              {isOpen && (
                <div className="accordion-body">
                  {section.segments.map((seg) => (
                    <p key={seg.id} className="accordion-segment">
                      {renderTokens(seg.content)}
                    </p>
                  ))}
                </div>
              )}
              {!isOpen && (
                <div className="accordion-preview" aria-hidden="true">
                  {section.segments.length} paragraph{section.segments.length !== 1 ? "s" : ""} hidden
                </div>
              )}
            </div>
          );
        })}
      </div>
    </article>
  );
}
