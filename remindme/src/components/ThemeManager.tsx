import React, { useState, useEffect } from 'react';
import { AppTheme } from '../types';
import { 
  getAllThemes, 
  loadThemeFromURL, 
  saveCustomTheme, 
  removeCustomTheme, 
  applyTheme,
  getExampleThemeJSON 
} from '../utils/themes';
import { Download, Trash2, Plus, Eye, Copy, AlertCircle, CheckCircle } from 'lucide-react';

interface ThemeManagerProps {
  currentTheme: string;
  onThemeChange: (themeId: string) => void;
  comicSansMode: boolean;
}

export const ThemeManager: React.FC<ThemeManagerProps> = ({
  currentTheme,
  onThemeChange,
  comicSansMode
}) => {
  const [themes, setThemes] = useState<Record<string, AppTheme>>({});
  const [showAddTheme, setShowAddTheme] = useState(false);
  const [themeUrl, setThemeUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [showExample, setShowExample] = useState(false);

  useEffect(() => {
    setThemes(getAllThemes());
  }, []);

  const handleAddTheme = async () => {
    if (!themeUrl.trim()) {
      setMessage({ type: 'error', text: 'Please enter a theme URL' });
      return;
    }

    setLoading(true);
    setMessage(null);

    const result = await loadThemeFromURL(themeUrl.trim());

    if (result.success && result.theme) {
      saveCustomTheme(result.theme);
      setThemes(getAllThemes());
      setThemeUrl('');
      setShowAddTheme(false);
      setMessage({ type: 'success', text: `Theme "${result.theme.name}" added successfully!` });
    } else {
      setMessage({ type: 'error', text: result.error || 'Failed to load theme' });
    }

    setLoading(false);
  };

  const handleRemoveTheme = (themeId: string) => {
    if (themeId.startsWith('custom_')) {
      removeCustomTheme(themeId);
      setThemes(getAllThemes());
      if (currentTheme === themeId) {
        onThemeChange('pastelDream'); // Fallback to default theme
      }
      setMessage({ type: 'success', text: 'Custom theme removed' });
    }
  };

  const handlePreviewTheme = (theme: AppTheme) => {
    applyTheme(theme, comicSansMode);
  };

  const copyExampleJSON = () => {
    navigator.clipboard.writeText(getExampleThemeJSON());
    setMessage({ type: 'success', text: 'Example JSON copied to clipboard!' });
  };

  const clearMessage = () => {
    setTimeout(() => setMessage(null), 3000);
  };

  useEffect(() => {
    if (message) clearMessage();
  }, [message]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">🎨 Theme Manager</h2>
        <button
          onClick={() => setShowAddTheme(!showAddTheme)}
          className="btn-primary flex items-center gap-2"
        >
          <Plus size={20} />
          Add Custom Theme
        </button>
      </div>

      {/* Message */}
      {message && (
        <div className={`flex items-center gap-2 p-3 rounded-lg ${
          message.type === 'success' 
            ? 'bg-green-100 text-green-800 border border-green-200' 
            : 'bg-red-100 text-red-800 border border-red-200'
        }`}>
          {message.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
          {message.text}
        </div>
      )}

      {/* Add Theme Form */}
      {showAddTheme && (
        <div className="card bg-blue-50 border-blue-200">
          <h3 className="text-lg font-semibold mb-4 text-blue-800">Add Theme from URL</h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Theme JSON URL
              </label>
              <input
                type="url"
                value={themeUrl}
                onChange={(e) => setThemeUrl(e.target.value)}
                placeholder="https://example.com/my-theme.json"
                className="input-field"
                disabled={loading}
              />
            </div>

            <div className="flex gap-2">
              <button
                onClick={handleAddTheme}
                disabled={loading}
                className="btn-primary flex items-center gap-2"
              >
                <Download size={16} />
                {loading ? 'Loading...' : 'Add Theme'}
              </button>
              
              <button
                onClick={() => setShowExample(!showExample)}
                className="btn-secondary flex items-center gap-2"
              >
                <Eye size={16} />
                Show Example
              </button>
            </div>

            {/* Example JSON */}
            {showExample && (
              <div className="mt-4">
                <div className="flex justify-between items-center mb-2">
                  <label className="text-sm font-medium text-gray-700">
                    Example Theme JSON Structure:
                  </label>
                  <button
                    onClick={copyExampleJSON}
                    className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1"
                  >
                    <Copy size={14} />
                    Copy
                  </button>
                </div>
                <pre className="bg-gray-800 text-green-400 p-4 rounded-lg text-xs overflow-x-auto">
                  {getExampleThemeJSON()}
                </pre>
                <p className="text-xs text-gray-600 mt-2">
                  Host this JSON file anywhere online (GitHub Gist, Pastebin, your own server) and paste the URL above!
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Theme Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Object.values(themes).map((theme) => (
          <div
            key={theme.id}
            className={`card cursor-pointer transition-all duration-200 hover:shadow-lg ${
              currentTheme === theme.id ? 'ring-2 ring-blue-500 bg-blue-50' : ''
            }`}
          >
            {/* Theme Preview */}
            <div 
              className="h-20 rounded-lg mb-3 p-3 flex items-center justify-center text-white font-bold"
              style={{ 
                background: `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.secondary})`,
                fontFamily: theme.fonts.primary
              }}
            >
              {theme.name}
            </div>

            {/* Theme Info */}
            <div className="space-y-2">
              <h3 className="font-semibold text-gray-800">{theme.name}</h3>
              <div className="flex gap-1">
                {Object.values(theme.colors).slice(0, 4).map((color, index) => (
                  <div
                    key={index}
                    className="w-4 h-4 rounded-full border border-gray-300"
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2 mt-4">
              <button
                onClick={() => onThemeChange(theme.id)}
                className={`flex-1 py-2 px-3 rounded text-sm font-medium transition-colors ${
                  currentTheme === theme.id
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {currentTheme === theme.id ? 'Active' : 'Apply'}
              </button>
              
              <button
                onClick={() => handlePreviewTheme(theme)}
                className="px-3 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                title="Preview"
              >
                <Eye size={16} />
              </button>

              {theme.id.startsWith('custom_') && (
                <button
                  onClick={() => handleRemoveTheme(theme.id)}
                  className="px-3 py-2 text-red-600 hover:text-red-800 transition-colors"
                  title="Remove"
                >
                  <Trash2 size={16} />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Instructions */}
      <div className="card bg-gray-50">
        <h3 className="font-semibold text-gray-800 mb-2">📝 How to create custom themes:</h3>
        <ol className="list-decimal list-inside space-y-1 text-sm text-gray-600">
          <li>Create a JSON file with the theme structure (click "Show Example" above)</li>
          <li>Host it online (GitHub Gist, Pastebin, or your own server)</li>
          <li>Copy the direct link to the JSON file</li>
          <li>Paste the URL and click "Add Theme"</li>
          <li>Your custom theme will be saved locally and available anytime!</li>
        </ol>
      </div>
    </div>
  );
};