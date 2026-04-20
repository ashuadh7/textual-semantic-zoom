export interface PodcastEntry {
  id: string;
  date: string;
  title: string;
}

export interface BookEntry {
  id: string;
  title: string;
  content: string;
}

export interface ArticleEntry {
  id: string;
  title: string;
  content: string;
}

export interface BlogData {
  podcasts: PodcastEntry[];
  books: BookEntry[];
  articles: ArticleEntry[];
}

export type BlogTab = "podcasts" | "books" | "articles";
