import { useState, useEffect, useRef } from "react";
import type { SemanticDocument, SZSection, SZLayer, SZParagraph, Token } from "./types";
import "./SemanticZoomView.css";

interface Props {
  doc: SemanticDocument;
  hideTitle?: boolean;
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

export default function SemanticZoomView({ doc, hideTitle = false }: Props) {
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

  // Pinch-to-zoom (mobile): two fingers spread = zoom in, pinch = zoom out.
  // Target section is determined by the midpoint of the two touches.
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    // Distance between two touch points.
    function touchDist(t: TouchList) {
      const dx = t[0].clientX - t[1].clientX;
      const dy = t[0].clientY - t[1].clientY;
      return Math.sqrt(dx * dx + dy * dy);
    }

    // Midpoint of two touches — used for section hit-testing.
    function touchMid(t: TouchList) {
      return {
        x: (t[0].clientX + t[1].clientX) / 2,
        y: (t[0].clientY + t[1].clientY) / 2,
      };
    }

    // Find the section that contains a point (or null = outside all).
    function sectionAtPoint(x: number, y: number): string | null {
      for (const [id, sectionEl] of sectionElsRef.current) {
        const rect = sectionEl.getBoundingClientRect();
        if (x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom) {
          return id;
        }
      }
      return null;
    }

    // State for the current pinch gesture (lives in closure).
    let baseDist = 0;
    let lastStepDist = 0;
    let pinchTargetId: string | null = null;
    const STEP_RATIO = 0.25; // 25% change from last step triggers a depth step.

    function handleTouchStart(e: TouchEvent) {
      if (e.touches.length !== 2) return;
      baseDist = touchDist(e.touches);
      lastStepDist = baseDist;
      const mid = touchMid(e.touches);
      pinchTargetId = sectionAtPoint(mid.x, mid.y);
    }

    function handleTouchMove(e: TouchEvent) {
      if (e.touches.length !== 2) return;
      e.preventDefault(); // Prevent page scroll during pinch.
      const dist = touchDist(e.touches);
      const ratio = (dist - lastStepDist) / lastStepDist;

      if (Math.abs(ratio) < STEP_RATIO) return;

      const direction = ratio > 0 ? 1 : -1; // spread = +1, pinch = -1
      lastStepDist = dist;

      setSectionDepths((prev) => {
        const next = { ...prev };
        const ids = pinchTargetId ? [pinchTargetId] : Object.keys(next);
        for (const id of ids) {
          next[id] = Math.min(Math.max(next[id] + direction, 0), maxDepth);
        }
        return next;
      });
    }

    function handleTouchEnd(e: TouchEvent) {
      if (e.touches.length < 2) {
        baseDist = 0;
        lastStepDist = 0;
        pinchTargetId = null;
      }
    }

    el.addEventListener("touchstart", handleTouchStart, { passive: true });
    el.addEventListener("touchmove", handleTouchMove, { passive: false });
    el.addEventListener("touchend", handleTouchEnd, { passive: true });
    return () => {
      el.removeEventListener("touchstart", handleTouchStart);
      el.removeEventListener("touchmove", handleTouchMove);
      el.removeEventListener("touchend", handleTouchEnd);
    };
  }, [maxDepth]);

  return (
    <article className="sz-view" ref={containerRef}>
      {!hideTitle && <h1 className="sz-doc-title">{doc.title}</h1>}

      <p className="sz-hint sz-hint--desktop" aria-hidden="true">
        Shift + scroll over a section to zoom it · shift + scroll outside sections to zoom all · click a line to expand · click a heading to collapse or open fully
      </p>
      <p className="sz-hint sz-hint--mobile" aria-hidden="true">
        Pinch over a section to zoom it · tap a line to expand · tap a heading to collapse or open fully
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
