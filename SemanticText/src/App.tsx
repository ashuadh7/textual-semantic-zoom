import { useState } from "react";
import ViewTabs, { type ViewMode } from "./components/ViewTabs";
import ScrollView from "./components/ScrollView";
import AccordionView from "./components/AccordionView";
import SemanticZoomView from "./components/SemanticZoomView";
import type { Document, SemanticDocument } from "./data/types";
import beatlesData from "./data/beatles.json";
import beatlesSemanticData from "./data/beatles-semantic.json";
import "./App.css";

const doc = beatlesData as Document;
const semanticDoc = beatlesSemanticData as unknown as SemanticDocument;

export default function App() {
  const [mode, setMode] = useState<ViewMode>("scrolling");

  return (
    <div className="app-shell">
      <header className="app-header">
        <span className="app-brand">Textual Semantic Zoom</span>
      </header>
      <ViewTabs active={mode} onChange={setMode} />
      <main className="app-content">
        {mode === "scrolling" && <ScrollView doc={doc} />}
        {mode === "accordion" && <AccordionView doc={doc} />}
        {mode === "semantic" && <SemanticZoomView doc={semanticDoc} />}
      </main>
    </div>
  );
}
