import { BrowserRouter, Routes, Route } from "react-router-dom";
import ResearchApp from "./apps/research/ResearchApp";
import BlogApp from "./apps/blog/BlogApp";

export default function App() {
  return (
    <BrowserRouter basename="/textual-semantic-zoom">
      <Routes>
        <Route path="/" element={<ResearchApp />} />
        <Route path="/blog" element={<BlogApp />} />
      </Routes>
    </BrowserRouter>
  );
}
