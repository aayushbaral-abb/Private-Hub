export interface Link {
  id: string;
  title: string;
  url: string;
  user_id: string;
  created_at: string;
}

export interface Memo {
  id: string;
  title: string; 
  content: string;
  user_id: string;
  created_at: string;
}

export interface Doc {
  id: string;
  name: string;
  storage_path: string;
  size: number;
  mime_type: string;
  user_id: string;
  created_at: string;
}

export type ViewState = 'links-view' | 'document' | 'memo' | 'settings';