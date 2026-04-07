import "./ViewTabs.css";

export type ViewMode = "scrolling" | "accordion" | "semantic";

interface Props {
  active: ViewMode;
  onChange: (mode: ViewMode) => void;
}

const TABS: { id: ViewMode; label: string }[] = [
  { id: "semantic", label: "Semantic" },
  { id: "accordion", label: "Accordion" },
  { id: "scrolling", label: "Scrolling" },
];

export default function ViewTabs({ active, onChange }: Props) {
  return (
    <nav className="view-tabs" role="tablist" aria-label="View mode">
      {TABS.map((tab) => (
        <button
          key={tab.id}
          role="tab"
          aria-selected={active === tab.id}
          className={`view-tab ${active === tab.id ? "view-tab--active" : ""}`}
          onClick={() => onChange(tab.id)}
        >
          {tab.label}
        </button>
      ))}
    </nav>
  );
}
