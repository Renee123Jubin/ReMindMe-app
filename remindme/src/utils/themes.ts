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

const CUSTOM_THEMES_KEY = 'remindme_custom_themes';

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

export const validateTheme = (themeData: any): boolean => {
  return (
    themeData &&
    typeof themeData.id === 'string' &&
    typeof themeData.name === 'string' &&
    themeData.colors &&
    typeof themeData.colors.primary === 'string' &&
    typeof themeData.colors.secondary === 'string' &&
    typeof themeData.colors.background === 'string' &&
    typeof themeData.colors.surface === 'string' &&
    typeof themeData.colors.text === 'string' &&
    typeof themeData.colors.accent === 'string' &&
    themeData.fonts &&
    typeof themeData.fonts.primary === 'string' &&
    typeof themeData.fonts.secondary === 'string'
  );
};

export const loadThemeFromURL = async (url: string): Promise<{ success: boolean; theme?: AppTheme; error?: string }> => {
  try {
    // Validate URL format
    const urlPattern = /^https?:\/\/.+/;
    if (!urlPattern.test(url)) {
      return { success: false, error: 'Please provide a valid HTTP/HTTPS URL' };
    }

    const response = await fetch(url);
    
    if (!response.ok) {
      return { success: false, error: `Failed to fetch theme: ${response.status} ${response.statusText}` };
    }

    const themeData = await response.json();
    
    if (!validateTheme(themeData)) {
      return { success: false, error: 'Invalid theme format. Please check the theme structure.' };
    }

    // Ensure unique ID for custom themes
    const customTheme: AppTheme = {
      ...themeData,
      id: `custom_${Date.now()}_${themeData.id}`,
    };

    return { success: true, theme: customTheme };
  } catch (error) {
    console.error('Failed to load theme from URL:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to load theme from URL' 
    };
  }
};

export const saveCustomTheme = (theme: AppTheme): void => {
  const customThemes = getCustomThemes();
  customThemes[theme.id] = theme;
  localStorage.setItem(CUSTOM_THEMES_KEY, JSON.stringify(customThemes));
};

export const getCustomThemes = (): Record<string, AppTheme> => {
  const data = localStorage.getItem(CUSTOM_THEMES_KEY);
  return data ? JSON.parse(data) : {};
};

export const removeCustomTheme = (themeId: string): void => {
  const customThemes = getCustomThemes();
  delete customThemes[themeId];
  localStorage.setItem(CUSTOM_THEMES_KEY, JSON.stringify(customThemes));
};

export const getAllThemes = (): Record<string, AppTheme> => {
  return { ...themes, ...getCustomThemes() };
};

export const getThemeById = (themeId: string): AppTheme | null => {
  const allThemes = getAllThemes();
  return allThemes[themeId] || null;
};

// Example theme JSON structure for users
export const getExampleThemeJSON = (): string => {
  return JSON.stringify({
    id: "my_awesome_theme",
    name: "🎨 My Awesome Theme",
    colors: {
      primary: "#FF6B6B",
      secondary: "#4ECDC4", 
      background: "#FFFFFF",
      surface: "#F8F9FA",
      text: "#2C3E50",
      accent: "#E74C3C"
    },
    fonts: {
      primary: "Arial, sans-serif",
      secondary: "Georgia, serif"
    },
    customCSS: "/* Optional custom CSS */ .special-button { border-radius: 20px; }"
  }, null, 2);
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