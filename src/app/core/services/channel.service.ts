import { Injectable, signal } from '@angular/core';
import { Streamer, VODItem, ClipItem, ChatMessage } from '../models/platform.models';

const INITIAL_CHANNELS: Streamer[] = [
  {
    id: 'alexrivers',
    name: 'Alex Rivers',
    handle: 'alexrivers',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    banner: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&auto=format&fit=crop&q=80',
    verified: true,
    bio: 'Full-stack developer, cyber-indie gamer, and tech streamer. Building next-gen browser tools live every weekday!',
    followers: 48920,
    category: 'Software & Game Dev',
    streamTitle: '🔴 Building Web OBS Studio with Angular & Tailwind! (Live Coding)',
    viewerCount: 1420,
    isLive: true,
    tags: ['Angular', 'TypeScript', 'WebDev', 'LiveCode'],
    thumbnailUrl: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=600&auto=format&fit=crop&q=80',
    schedule: [
      { day: 'Mon-Fri', time: '14:00 UTC', topic: 'Frontend Engineering & Live Coding' },
      { day: 'Saturday', time: '18:00 UTC', topic: 'Indie Game Dev & Community Showcase' }
    ]
  },
  {
    id: 'cyberninja',
    name: 'Kaito Cyber',
    handle: 'kaitoninja',
    avatar: 'https://images.unsplash.com/photo-1566492031773-4f4e44671857?w=150&auto=format&fit=crop&q=80',
    banner: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=1200&auto=format&fit=crop&q=80',
    verified: true,
    bio: 'Apex predator in tactical shooters. Master tier esports coach & mechanical prodigy.',
    followers: 215400,
    category: 'Valorant & Tactical FPS',
    streamTitle: '🏆 Radiant Rank Push | Drops Enabled | Sub Games Today!',
    viewerCount: 8940,
    isLive: true,
    tags: ['FPS', 'Competitive', 'Esports', 'Ranked'],
    thumbnailUrl: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=600&auto=format&fit=crop&q=80',
    schedule: [
      { day: 'Daily', time: '16:00 UTC', topic: 'Ranked Grind & Scrims' }
    ]
  },
  {
    id: 'synthbeats',
    name: 'Aria Synth',
    handle: 'ariamusic',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
    banner: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=1200&auto=format&fit=crop&q=80',
    verified: true,
    bio: 'Analog modular synth jams, chill lofi beats to code/relax to, and sound design experiments.',
    followers: 67300,
    category: 'Music & Audio Production',
    streamTitle: '🎹 Late Night Cyberpunk Synthwave & Chill Vibes (Live Improvisation)',
    viewerCount: 2310,
    isLive: true,
    tags: ['Music', 'Synthwave', 'Chill', 'Creative'],
    thumbnailUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&auto=format&fit=crop&q=80',
    schedule: [
      { day: 'Wed, Fri, Sun', time: '20:00 UTC', topic: 'Live Modular Beats' }
    ]
  },
  {
    id: 'pixelartisan',
    name: 'Elena Rostova',
    handle: 'elenapixels',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    banner: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=1200&auto=format&fit=crop&q=80',
    verified: true,
    bio: 'Concept artist for AAA fantasy games. Character design, 3D sculpting and digital painting.',
    followers: 94800,
    category: 'Art & Design',
    streamTitle: '🎨 Painting Sci-Fi Environments & Mech Concepts in Blender',
    viewerCount: 3180,
    isLive: true,
    tags: ['Art', 'Blender', 'Illustration', '3D'],
    thumbnailUrl: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=600&auto=format&fit=crop&q=80',
    schedule: [
      { day: 'Tue, Thu, Sat', time: '13:00 UTC', topic: 'Concept Art Workflows' }
    ]
  },
  {
    id: 'galaxyexplorer',
    name: 'Dr. Marcus Vance',
    handle: 'marcusspace',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    banner: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1200&auto=format&fit=crop&q=80',
    verified: false,
    bio: 'Astrophysicist & science communicator. Stargazing, telescope streams and space news.',
    followers: 43200,
    category: 'Science & Technology',
    streamTitle: '🔭 James Webb Deep Space Discoveries & Exoplanet Analysis',
    viewerCount: 1890,
    isLive: false,
    tags: ['Science', 'Space', 'Astronomy', 'Education'],
    thumbnailUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=600&auto=format&fit=crop&q=80',
    schedule: [
      { day: 'Fridays', time: '21:00 UTC', topic: 'Live Telescope Broadcast' }
    ]
  }
];

const INITIAL_VODS: VODItem[] = [
  {
    id: 'vod-1',
    title: 'Building a Real-Time Canvas Compositor in TypeScript (Full VOD)',
    duration: '2:45:12',
    views: 12450,
    date: '2 days ago',
    thumbnailUrl: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=600&auto=format&fit=crop&q=80',
    category: 'Software & Game Dev'
  },
  {
    id: 'vod-2',
    title: 'WebRTC Multi-Peer Streaming Architecture Deep Dive',
    duration: '3:12:05',
    views: 8930,
    date: '5 days ago',
    thumbnailUrl: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=600&auto=format&fit=crop&q=80',
    category: 'Software & Game Dev'
  },
  {
    id: 'vod-3',
    title: 'Designing Beautiful Creator Dashboards with Tailwind CSS',
    duration: '1:58:30',
    views: 15400,
    date: '1 week ago',
    thumbnailUrl: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=600&auto=format&fit=crop&q=80',
    category: 'Software & Game Dev'
  }
];

const INITIAL_CLIPS: ClipItem[] = [
  {
    id: 'clip-1',
    title: 'When the 60fps canvas loop hits 0ms lag 🔥',
    duration: '0:34',
    views: 34100,
    clipper: 'DevFanatic',
    thumbnailUrl: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=400&auto=format&fit=crop&q=80'
  },
  {
    id: 'clip-2',
    title: 'Insane CSS Glassmorphism trick you need to know',
    duration: '0:45',
    views: 28900,
    clipper: 'TailwindNinja',
    thumbnailUrl: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=400&auto=format&fit=crop&q=80'
  },
  {
    id: 'clip-3',
    title: 'That sudden compiler error reaction 😂',
    duration: '0:22',
    views: 52000,
    clipper: 'Lurker99',
    thumbnailUrl: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=400&auto=format&fit=crop&q=80'
  }
];

@Injectable({
  providedIn: 'root'
})
export class ChannelService {
  readonly channels = signal<Streamer[]>(INITIAL_CHANNELS);
  readonly vods = signal<VODItem[]>(INITIAL_VODS);
  readonly clips = signal<ClipItem[]>(INITIAL_CLIPS);
  readonly followedChannels = signal<string[]>(['alexrivers', 'kaitoninja']);

  readonly chatMessages = signal<ChatMessage[]>([
    {
      id: '1',
      user: 'PixelWizard',
      avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=PixelWizard',
      badge: 'vip',
      text: 'Hey everyone! Hyped for this stream 🙌',
      timestamp: '14:02'
    },
    {
      id: '2',
      user: 'CyberSamurai',
      avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=CyberSamurai',
      badge: 'sub',
      text: 'The canvas compositor looks so smooth!!',
      timestamp: '14:03'
    },
    {
      id: '3',
      user: 'DevGuru',
      avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=DevGuru',
      badge: 'mod',
      text: 'Remember to follow community guidelines! Have fun!',
      timestamp: '14:04'
    },
    {
      id: '4',
      user: 'StreamChampion',
      avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=StreamChampion',
      badge: 'sub',
      isSuperChat: true,
      superChatAmount: '$25.00',
      text: 'Loving the Web OBS Studio project! Keep crushing it! 🚀⚡️',
      timestamp: '14:05'
    },
    {
      id: '5',
      user: 'NovaEcho',
      avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=NovaEcho',
      text: 'Can we add animated webcam borders too?',
      timestamp: '14:06'
    }
  ]);

  constructor() {
    this.startSimulatedChat();
  }

  getChannelById(id: string): Streamer | undefined {
    return this.channels().find(c => c.id === id || c.handle === id);
  }

  isFollowing(channelId: string): boolean {
    return this.followedChannels().includes(channelId);
  }

  toggleFollow(channelId: string): boolean {
    const list = this.followedChannels();
    if (list.includes(channelId)) {
      this.followedChannels.set(list.filter(id => id !== channelId));
      return false;
    } else {
      this.followedChannels.set([...list, channelId]);
      return true;
    }
  }

  sendChatMessage(message: { user: string; avatar: string; text: string; badge?: any; isSuperChat?: boolean; superChatAmount?: string }): void {
    const newMsg: ChatMessage = {
      id: Date.now().toString(),
      user: message.user,
      avatar: message.avatar,
      badge: message.badge,
      text: message.text,
      isSuperChat: message.isSuperChat,
      superChatAmount: message.superChatAmount,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    this.chatMessages.update(msgs => [...msgs.slice(-50), newMsg]);
  }

  addRecordedVOD(vod: VODItem): void {
    this.vods.update(current => [vod, ...current]);
  }

  deleteVOD(id: string): void {
    this.vods.update(current => current.filter(v => v.id !== id));
  }

  private startSimulatedChat(): void {
    if (typeof window === 'undefined') return;

    const sampleChatters = [
      { user: 'QuantumCoder', text: 'This UI is super clean! 10x better than standard OBS menus.' },
      { user: 'EchoVibe', text: 'The audio mixer peak levels are responding so cleanly 🎧' },
      { user: 'GlitchMaster', text: 'Wait, does this record straight into WebM in the browser?' },
      { user: 'AstroGeek', text: 'GGs! Loving the stream quality today!' },
      { user: 'ByteKnight', text: 'PrimeNG + Tailwind styling looks futuristic 🔥' },
      { user: 'LunaStreams', text: 'Can this run PiP webcam over screen capture? Yes it can!!' }
    ];

    setInterval(() => {
      // 30% chance every 8 seconds to add a realistic message
      if (Math.random() < 0.4) {
        const item = sampleChatters[Math.floor(Math.random() * sampleChatters.length)];
        this.sendChatMessage({
          user: item.user,
          avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${item.user}`,
          text: item.text,
          badge: Math.random() > 0.5 ? 'sub' : undefined
        });
      }
    }, 8000);
  }
}
