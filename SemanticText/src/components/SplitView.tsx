import ScrollView from "./ScrollView";
import AccordionView from "./AccordionView";
import SemanticZoomView from "./SemanticZoomView";
import QuizPanel from "./QuizPanel";
import type { ViewMode } from "./ViewTabs";
import type { Document, SemanticDocument } from "../data/types";
import "./SplitView.css";

interface Props {
  mode: ViewMode;
  doc: Document;
  semanticDoc: SemanticDocument;
}

export default function SplitView({ mode, doc, semanticDoc }: Props) {
  return (
    <div className="split-view">
      {/* ── Left panel: reader (controlled by top-level tabs) ── */}
      <div className="split-pane split-pane--reader">
        {mode === "scrolling" && <ScrollView doc={doc} />}
        {mode === "accordion" && <AccordionView doc={doc} />}
        {mode === "semantic" && <SemanticZoomView doc={semanticDoc} />}
      </div>

      {/* ── Divider ─────────────────────────────────────────── */}
      <div className="split-divider" aria-hidden="true" />

      {/* ── Right panel: quiz (always visible) ──────────────── */}
      <div className="split-pane split-pane--quiz">
        <QuizPanel />
      </div>
    </div>
  );
}
