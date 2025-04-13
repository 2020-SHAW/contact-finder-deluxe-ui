
export interface ContactResult {
  id?: string;
  name?: string;
  email?: string;
  phone?: string;
  website?: string;
  socialMedia?: string;
  niche?: string;
  location?: string;
  created_at?: string;
}

export interface SearchResult {
  title: string;
  url: string;
  snippet: string;
}
