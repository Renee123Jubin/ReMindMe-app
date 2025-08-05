import { AppTheme } from '../types';

export const themes: Record<string, AppTheme> = {
  cottagecore: {
    id: 'cottagecore',
    name: '🌿 Cottagecore',
    colors: {
      primary: '#8B5A3C',
      secondary: '#A0522D',
      background: '#F5F5DC',
      surface: '#FAEBD7',
      text: '#654321',
      accent: '#228B22',
    },
    fonts: {
      primary: '"Brush Script MT", cursive',
      secondary: '"Georgia", serif',
    },
  },
  starlight: {
    id: 'starlight',
    name: '✨ Starlight',
    colors: {
      primary: '#4A148C',
      secondary: '#7B1FA2',
      background: '#0D1B2A',
      surface: '#1B263B',
      text: '#E0E1DD',
      accent: '#FFD700',
    },
    fonts: {
      primary: '"Orbitron", monospace',
      secondary: '"Roboto", sans-serif',
    },
  },
  pastelDream: {
    id: 'pastelDream',
    name: '🌸 Pastel Dream',
    colors: {
      primary: '#FFB6C1',
      secondary: '#DDA0DD',
      background: '#FFF0F5',
      surface: '#F0F8FF',
      text: '#8B008B',
      accent: '#98FB98',
    },
    fonts: {
      primary: '"Quicksand", sans-serif',
      secondary: '"Poppins", sans-serif',
    },
  },
  neonVibes: {
    id: 'neonVibes',
    name: '⚡ Neon Vibes',
    colors: {
      primary: '#FF1493',
      secondary: '#00FFFF',
      background: '#000000',
      surface: '#1A1A1A',
      text: '#FFFFFF',
      accent: '#00FF00',
    },
    fonts: {
      primary: '"Orbitron", monospace',
      secondary: '"Rajdhani", sans-serif',
    },
  },
  comicSans: {
    id: 'comicSans',
    name: '💅 Comic Sans Vibes',
    colors: {
      primary: '#FF69B4',
      secondary: '#FF1493',
      background: '#FFFACD',
      surface: '#FFF8DC',
      text: '#8B008B',
      accent: '#32CD32',
    },
    fonts: {
      primary: '"Comic Sans MS", cursive',
      secondary: '"Comic Sans MS", cursive',
    },
  },
};

export const applyTheme = (theme: AppTheme, comicSansMode: boolean = false): void => {
  const root = document.documentElement;
  
  // Apply colors
  root.style.setProperty('--color-primary', theme.colors.primary);
  root.style.setProperty('--color-secondary', theme.colors.secondary);
  root.style.setProperty('--color-background', theme.colors.background);
  root.style.setProperty('--color-surface', theme.colors.surface);
  root.style.setProperty('--color-text', theme.colors.text);
  root.style.setProperty('--color-accent', theme.colors.accent);
  
  // Apply fonts
  const fontFamily = comicSansMode ? '"Comic Sans MS", cursive' : theme.fonts.primary;
  root.style.setProperty('--font-primary', fontFamily);
  root.style.setProperty('--font-secondary', theme.fonts.secondary);
  
  // Apply custom CSS if available
  if (theme.customCSS) {
    let styleElement = document.getElementById('custom-theme-css');
    if (!styleElement) {
      styleElement = document.createElement('style');
      styleElement.id = 'custom-theme-css';
      document.head.appendChild(styleElement);
    }
    styleElement.textContent = theme.customCSS;
  }
};

export const loadThemeFromURL = async (url: string): Promise<AppTheme | null> => {
  try {
    const response = await fetch(url);
    const themeData = await response.json();
    
    // Validate theme structure
    if (themeData.id && themeData.name && themeData.colors && themeData.fonts) {
      return themeData as AppTheme;
    }
    return null;
  } catch (error) {
    console.error('Failed to load theme from URL:', error);
    return null;
  }
};

export const getEmojiTags = (): string[] => [
  '❤️', '💙', '💚', '💛', '🧡', '💜', '🖤', '🤍', '🤎',
  '⭐', '✨', '🌟', '💫', '⚡', '🔥', '❄️', '🌈', '☀️',
  '🎉', '🎊', '🎈', '🎁', '🏆', '🎯', '🎨', '🎭', '🎪',
  '🌸', '🌺', '🌻', '🌷', '🌹', '🌿', '🍀', '🌱', '🌳',
  '📚', '✏️', '📝', '💼', '🏠', '🍕', '☕', '🎵', '📱',
];

export const getColorTags = (): string[] => [
  '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
  '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9',
  '#F8C471', '#82E0AA', '#F1948A', '#AED6F1', '#A9DFBF',
];