export interface DevtoArticle {
  id: string;
  title: string;
  description: string;
  cover_image: string;
  url: string;
  created_at: string;
  tag_list: string[];
}

export interface DevtoArticleBodyMarkdown {
  id: string;
  body_markdown: string;
}
