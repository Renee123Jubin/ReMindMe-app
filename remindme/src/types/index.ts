export interface Reminder {
  id: string;
  title: string;
  description?: string;
  dueDate: Date;
  priority: 'low' | 'medium' | 'high';
  colorTag?: string;
  emojiTag?: string;
  isCompleted: boolean;
  isRecurring: boolean;
  recurringType?: 'daily' | 'weekly' | 'monthly' | 'yearly';
  recurringInterval?: number;
  createdAt: Date;
  updatedAt: Date;
  notificationEnabled: boolean;
  youtubeSound?: string; // YouTube URL for custom sound
  voiceMemo?: string; // Audio blob URL
  photos?: string[]; // Array of image URLs/blobs
  sharedWith?: string[]; // Array of friend IDs or emails
}

export interface ReminderFormData {
  title: string;
  description: string;
  dueDate: string;
  dueTime: string;
  priority: 'low' | 'medium' | 'high';
  colorTag: string;
  emojiTag: string;
  isRecurring: boolean;
  recurringType: 'daily' | 'weekly' | 'monthly' | 'yearly';
  recurringInterval: number;
  notificationEnabled: boolean;
  youtubeSound: string;
}

export interface AppTheme {
  id: string;
  name: string;
  colors: {
    primary: string;
    secondary: string;
    background: string;
    surface: string;
    text: string;
    accent: string;
  };
  fonts: {
    primary: string;
    secondary: string;
  };
  customCSS?: string;
}

export interface AIAssistant {
  name: string;
  personality: string;
  avatar: string;
  voiceEnabled: boolean;
  customPrompts: string[];
}

export interface UserSettings {
  theme: string;
  simpleMode: boolean;
  largeText: boolean;
  audioGuide: boolean;
  comicSansMode: boolean;
  aiAssistant: AIAssistant;
  googleCalendarSync: boolean;
  lockScreenReminders: boolean;
}

export interface Category {
  id: string;
  name: string;
  color: string;
  icon: string;
}

export interface FilterOptions {
  category?: string;
  priority?: 'low' | 'medium' | 'high';
  status?: 'all' | 'pending' | 'completed';
  dateRange?: 'today' | 'week' | 'month' | 'all';
  colorTag?: string;
  emojiTag?: string;
}

export interface NotificationPermission {
  granted: boolean;
  requested: boolean;
}

export interface QuickAction {
  id: string;
  title: string;
  icon: string;
  action: () => void;
}