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
  // Track which section the mouse is currently over (null = outside all sections).
  const hoveredSectionRef = useRef<string | null>(null);
  // DOM refs for each section element, used for bounding-box hit testing.
  const sectionElsRef = useRef<Map<string, HTMLElement>>(new Map());

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

  // Track hovered section via bounding-box hit testing on mousemove.
  // This is more reliable than onMouseEnter/Leave because sections are full-width
  // block elements — the bounding box approach lets us react to the exact pixel
  // position, and "outside all boxes" correctly maps to the global mode.
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    function handleMouseMove(e: MouseEvent) {
      let found: string | null = null;
      for (const [id, sectionEl] of sectionElsRef.current) {
        const rect = sectionEl.getBoundingClientRect();
        if (
          e.clientX >= rect.left && e.clientX <= rect.right &&
          e.clientY >= rect.top  && e.clientY <= rect.bottom
        ) {
          found = id;
          break;
        }
      }
      hoveredSectionRef.current = found;
    }

    function handleMouseLeave() {
      hoveredSectionRef.current = null;
    }

    el.addEventListener("mousemove", handleMouseMove);
    el.addEventListener("mouseleave", handleMouseLeave);
    return () => {
      el.removeEventListener("mousemove", handleMouseMove);
      el.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, []);

  // Shift+Scroll: if hovering a section → zoom that section only;
  // if outside all sections → zoom all sections globally.
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    function handleWheel(e: WheelEvent) {
      if (!e.shiftKey) return;
      e.preventDefault();
      const targeted = hoveredSectionRef.current;
      setSectionDepths((prev) => {
        const next = { ...prev };
        const ids = targeted ? [targeted] : Object.keys(next);
        for (const id of ids) {
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
        Shift + scroll over a section to zoom it · shift + scroll outside sections to zoom all · click a line to expand · click a heading to collapse or open fully
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
              ref={(el) => {
                if (el) sectionElsRef.current.set(section.id, el);
                else sectionElsRef.current.delete(section.id);
              }}
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
