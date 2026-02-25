export interface Link {
  id: number;
  user_id: number;
  title: string;
  url: string;
  icon: string;
  active: number;
  order_index: number;
}

export interface Profile {
  id: number;
  user_id: number;
  name: string;
  bio: string;
  avatar_url: string;
  theme: string;
  background_video_url?: string;
  music_embed_url?: string;
  enable_contact_form: number;
}

export interface User {
  id: number;
  username: string;
}
