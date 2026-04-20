import { useState } from "react";
import Markdown from "react-markdown";
import type { BlogTab, PodcastEntry, BookEntry, ArticleEntry } from "./types";
import type { SemanticDocument } from "../../core/types";
import SemanticZoomView from "../../core/SemanticZoomView";
import blogData from "./data/blog.json";
import simonSinekDoc from "./data/simon-sinek.json";
import malcolmGladwellDoc from "./data/malcolm-gladwell.json";
import "./BlogApp.css";

const podcastDocs: Record<string, SemanticDocument> = {
  "simon-sinek-what-now-2026-04-17": simonSinekDoc as unknown as SemanticDocument,
  "malcolm-gladwell-what-now-2026-04-17": malcolmGladwellDoc as unknown as SemanticDocument,
};

function SemanticAccordionItem({ header, doc }: { header: string; doc: SemanticDocument }) {
  const [open, setOpen] = useState(false);
  return (
    <div className={`blog-accordion-item${open ? " open" : ""}`}>
      <button className="blog-accordion-header" onClick={() => setOpen(!open)}>
        <span>{header}</span>
        <span className="blog-accordion-chevron">{open ? "▲" : "▼"}</span>
      </button>
      {open && (
        <div className="blog-accordion-body">
          <SemanticZoomView doc={doc} hideTitle />
        </div>
      )}
    </div>
  );
}

function AccordionItem({ header, content }: { header: string; content: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className={`blog-accordion-item${open ? " open" : ""}`}>
      <button className="blog-accordion-header" onClick={() => setOpen(!open)}>
        <span>{header}</span>
        <span className="blog-accordion-chevron">{open ? "▲" : "▼"}</span>
      </button>
      {open && (
        <div className="blog-accordion-body">
          <Markdown>{content}</Markdown>
        </div>
      )}
    </div>
  );
}

function PodcastsTab({ entries }: { entries: PodcastEntry[] }) {
  if (entries.length === 0) return <p className="blog-empty">No podcast notes yet.</p>;
  return (
    <div className="blog-accordion-list">
      {entries.map((e) => {
        const doc = podcastDocs[e.id];
        return doc ? (
          <SemanticAccordionItem key={e.id} header={`${e.date} — ${e.title}`} doc={doc} />
        ) : null;
      })}
    </div>
  );
}

function BooksTab({ entries }: { entries: BookEntry[] }) {
  if (entries.length === 0) return <p className="blog-empty">No book notes yet.</p>;
  return (
    <div className="blog-accordion-list">
      {entries.map((e) => (
        <AccordionItem key={e.id} header={e.title} content={e.content} />
      ))}
    </div>
  );
}

function ArticlesTab({ entries }: { entries: ArticleEntry[] }) {
  if (entries.length === 0) return <p className="blog-empty">No article notes yet.</p>;
  return (
    <div className="blog-accordion-list">
      {entries.map((e) => (
        <AccordionItem key={e.id} header={e.title} content={e.content} />
      ))}
    </div>
  );
}

const TABS: { id: BlogTab; label: string }[] = [
  { id: "podcasts", label: "Podcasts" },
  { id: "books", label: "Books" },
  { id: "articles", label: "Articles" },
];

export default function BlogApp() {
  const [tab, setTab] = useState<BlogTab>("podcasts");

  return (
    <div className="blog-shell">
      <header className="blog-header">
        <span className="blog-brand">Notes</span>
      </header>
      <nav className="blog-tabs">
        {TABS.map((t) => (
          <button
            key={t.id}
            className={`blog-tab${tab === t.id ? " active" : ""}`}
            onClick={() => setTab(t.id)}
          >
            {t.label}
          </button>
        ))}
      </nav>
      <main className="blog-content">
        {tab === "podcasts" && <PodcastsTab entries={blogData.podcasts as PodcastEntry[]} />}
        {tab === "books" && <BooksTab entries={blogData.books as BookEntry[]} />}
        {tab === "articles" && <ArticlesTab entries={blogData.articles as ArticleEntry[]} />}
      </main>
    </div>
  );
}
