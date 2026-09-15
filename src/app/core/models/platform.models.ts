export interface Streamer {
  id: string;
  name: string;
  handle: string;
  avatar: string;
  banner: string;
  verified: boolean;
  bio: string;
  followers: number;
  category: string;
  streamTitle: string;
  viewerCount: number;
  isLive: boolean;
  tags: string[];
  thumbnailUrl: string;
  schedule: { day: string; time: string; topic: string }[];
}

export interface VODItem {
  id: string;
  title: string;
  duration: string;
  views: number;
  date: string;
  thumbnailUrl: string;
  videoUrl?: string;
  blobUrl?: string;
  category: string;
}

export interface ClipItem {
  id: string;
  title: string;
  duration: string;
  views: number;
  clipper: string;
  thumbnailUrl: string;
}

export interface ChatMessage {
  id: string;
  user: string;
  avatar: string;
  badge?: 'broadcaster' | 'mod' | 'vip' | 'sub';
  text: string;
  timestamp: string;
  isSuperChat?: boolean;
  superChatAmount?: string;
}

export interface UserAccount {
  id: string;
  name: string;
  email: string;
  handle: string;
  avatar: string;
  banner: string;
  role: 'creator' | 'viewer';
  streamKey: string;
  ingestServer: string;
  bio: string;
  followers: number;
  following: number;
}
