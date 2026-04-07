import { useState } from "react";
import ViewTabs, { type ViewMode } from "./components/ViewTabs";
import ScrollView from "./components/ScrollView";
import AccordionView from "./components/AccordionView";
import type { Document } from "./data/types";
import beatlesData from "./data/beatles.json";
import "./App.css";

const doc = beatlesData as Document;

function Placeholder({ label }: { label: string }) {
  return (
    <div className="placeholder">
      <p>{label} view — coming soon.</p>
    </div>
  );
}

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
        {mode === "semantic" && <Placeholder label="Semantic Zoom" />}
      </main>
    </div>
  );
}
