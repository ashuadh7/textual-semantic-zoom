import { useState, useEffect, useRef } from "react";
import type { SemanticDocument, SZSection, SZLayer, SZParagraph, Token } from "../data/types";
import "./SemanticZoomView.css";

interface Props {
  doc: SemanticDocument;
}

function maxLayerDepth(doc: SemanticDocument): number {
  let max = 0;
  for (const section of doc.sections) {
    for (const layer of section.layers) {
      if (layer.depth > max) max = layer.depth;
    }
  }
  return max;
}

function layerForDepth(layers: SZLayer[], depth: number): SZLayer | undefined {
  const candidates = layers.filter((l) => l.depth <= depth);
  return candidates.length > 0 ? candidates[candidates.length - 1] : undefined;
}

function fullParagraph(section: SZSection, id: string): SZParagraph | undefined {
  for (const layer of section.layers) {
    const found = layer.paragraphs.find((p) => p.id === id);
    if (found) return found;
  }
  return undefined;
}

function renderTokens(tokens: Token[]) {
  return tokens.map((tok, i) =>
    tok.type === "term"
      ? <span key={i} className="sz-term-text">{tok.text}</span>
      : <span key={i}>{tok.text}</span>
  );
}

interface ParagraphRowProps {
  para: SZParagraph;
  section: SZSection;
  expanded: boolean;
  onToggle: () => void;
}

function ParagraphRow({ para, section, expanded, onToggle }: ParagraphRowProps) {
  const isExpandable = !!para.expandsToId;
  const fullPara = para.expandsToId ? fullParagraph(section, para.expandsToId) : undefined;
  const tokensToShow = expanded && fullPara ? fullPara.tokens : para.tokens;

  return (
    <p
      className={`sz-segment${isExpandable ? " sz-segment--expandable" : ""}${expanded ? " sz-segment--expanded" : ""}`}
      onClick={isExpandable ? onToggle : undefined}
      role={isExpandable ? "button" : undefined}
      tabIndex={isExpandable ? 0 : undefined}
      onKeyDown={
        isExpandable
          ? (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onToggle(); } }
          : undefined
      }
    >
      {renderTokens(tokensToShow)}
      {isExpandable && (
        <span className="sz-expand-indicator" aria-hidden="true">
          {expanded ? " ▲" : " ▼"}
        </span>
      )}
    </p>
  );
}

export default function SemanticZoomView({ doc }: Props) {
  const maxDepth = maxLayerDepth(doc);

  // Each section tracks its own depth independently.
  const [sectionDepths, setSectionDepths] = useState<Record<string, number>>(
    () => Object.fromEntries(doc.sections.map((s) => [s.id, 0]))
  );

  // Per-paragraph expansion, keyed as "sectionId:paragraphId"
  const [expandedParagraphs, setExpandedParagraphs] = useState<Set<string>>(new Set());

  const containerRef = useRef<HTMLElement>(null);

  // Section title click: toggle between 0 (heading only) and maxDepth (full).
  function toggleSection(sectionId: string) {
    setSectionDepths((prev) => ({
      ...prev,
      [sectionId]: prev[sectionId] === 0 ? maxDepth : 0,
    }));
    // Clear per-paragraph expansions for this section.
    setExpandedParagraphs((prev) => {
      const next = new Set(prev);
      for (const key of next) {
        if (key.startsWith(`${sectionId}:`)) next.delete(key);
      }
      return next;
    });
  }

  function toggleParagraph(sectionId: string, paraId: string) {
    const key = `${sectionId}:${paraId}`;
    setExpandedParagraphs((prev) => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });
  }

  // Shift+Scroll: nudge every section's depth by ±1, each clamped independently.
  // Sections at different depths drift apart or converge naturally.
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    function handleWheel(e: WheelEvent) {
      if (!e.shiftKey) return;
      e.preventDefault();
      setSectionDepths((prev) => {
        const next = { ...prev };
        for (const id of Object.keys(next)) {
          if (e.deltaY < 0) next[id] = Math.min(next[id] + 1, maxDepth);
          else if (e.deltaY > 0) next[id] = Math.max(next[id] - 1, 0);
        }
        return next;
      });
    }

    el.addEventListener("wheel", handleWheel, { passive: false });
    return () => el.removeEventListener("wheel", handleWheel);
  }, [maxDepth]);

  return (
    <article className="sz-view" ref={containerRef}>
      <h1 className="sz-doc-title">{doc.title}</h1>

      <p className="sz-hint" aria-hidden="true">
        Shift + scroll to zoom · click a line to expand · click a heading to collapse or open fully
      </p>

      <div className="sz-sections">
        {doc.sections.map((section) => {
          const depth = sectionDepths[section.id] ?? 0;
          const layer = depth > 0 ? layerForDepth(section.layers, depth) : undefined;
          const isCollapsed = depth === 0;

          return (
            <section
              key={section.id}
              className={`sz-section${isCollapsed ? " sz-section--collapsed" : ""}`}
            >
              <h2
                className="sz-section-title"
                onClick={() => toggleSection(section.id)}
                role="button"
                tabIndex={0}
                aria-expanded={!isCollapsed}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") { e.preventDefault(); toggleSection(section.id); }
                }}
              >
                {section.title}
                <span className="sz-section-chevron" aria-hidden="true">
                  {isCollapsed ? "▼" : "▲"}
                </span>
              </h2>

              {layer && (
                <div className="sz-layer sz-fade-in" key={`${section.id}-d${layer.depth}`}>
                  {layer.paragraphs.map((para) => (
                    <ParagraphRow
                      key={para.id}
                      para={para}
                      section={section}
                      expanded={expandedParagraphs.has(`${section.id}:${para.id}`)}
                      onToggle={() => toggleParagraph(section.id, para.id)}
                    />
                  ))}
                </div>
              )}
            </section>
          );
        })}
      </div>
    </article>
  );
}
