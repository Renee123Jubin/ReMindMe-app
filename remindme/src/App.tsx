import React, { useState, useEffect } from 'react';
import { Reminder, UserSettings } from './types';
import { ReminderForm } from './components/ReminderForm';
import { ThemeManager } from './components/ThemeManager';
import { saveReminders, loadReminders } from './utils/storage';
import { applyTheme, getThemeById, themes } from './utils/themes';
import { requestNotificationPermission, scheduleNotification } from './utils/notifications';
import { Plus, Settings, Palette, Bell, Search, Filter, Calendar, CheckCircle, Edit, Trash2, Volume2 } from 'lucide-react';
import { format, isToday, isTomorrow, isPast } from 'date-fns';

function App() {
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [showThemeManager, setShowThemeManager] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [editingReminder, setEditingReminder] = useState<Reminder | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPriority, setFilterPriority] = useState<'all' | 'low' | 'medium' | 'high'>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'completed'>('all');
  
  const [settings, setSettings] = useState<UserSettings>({
    theme: 'pastelDream',
    simpleMode: false,
    largeText: false,
    audioGuide: false,
    comicSansMode: false,
    aiAssistant: {
      name: 'Remi',
      personality: 'friendly and helpful',
      avatar: '🤖',
      voiceEnabled: false,
      customPrompts: []
    },
    googleCalendarSync: false,
    lockScreenReminders: false,
  });

  // Load data on startup
  useEffect(() => {
    const loadedReminders = loadReminders();
    setReminders(loadedReminders);
    
    // Request notification permission
    requestNotificationPermission();
    
    // Apply saved theme
    const savedSettings = localStorage.getItem('remindme_settings');
    if (savedSettings) {
      const parsedSettings = JSON.parse(savedSettings);
      setSettings(parsedSettings);
      
      const theme = getThemeById(parsedSettings.theme);
      if (theme) {
        applyTheme(theme, parsedSettings.comicSansMode);
      }
    } else {
      // Apply default theme
      applyTheme(themes.pastelDream, false);
    }
  }, []);

  // Save settings when they change
  useEffect(() => {
    localStorage.setItem('remindme_settings', JSON.stringify(settings));
  }, [settings]);

  // Schedule notifications for active reminders
  useEffect(() => {
    reminders
      .filter(r => !r.isCompleted && r.notificationEnabled)
      .forEach(reminder => {
        scheduleNotification({
          title: reminder.title,
          dueDate: reminder.dueDate,
          description: reminder.description
        });
      });
  }, [reminders]);

  const handleSaveReminder = (reminderData: Omit<Reminder, 'id' | 'createdAt' | 'updatedAt'>) => {
    const now = new Date();
    
    if (editingReminder) {
      // Update existing reminder
      const updatedReminder: Reminder = {
        ...reminderData,
        id: editingReminder.id,
        createdAt: editingReminder.createdAt,
        updatedAt: now,
      };
      
      const updatedReminders = reminders.map(r => 
        r.id === editingReminder.id ? updatedReminder : r
      );
      
      setReminders(updatedReminders);
      saveReminders(updatedReminders);
      setEditingReminder(null);
    } else {
      // Create new reminder
      const newReminder: Reminder = {
        ...reminderData,
        id: `reminder_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        createdAt: now,
        updatedAt: now,
      };
      
      const updatedReminders = [...reminders, newReminder];
      setReminders(updatedReminders);
      saveReminders(updatedReminders);
    }
    
    setShowForm(false);
  };

  const handleDeleteReminder = (id: string) => {
    if (window.confirm('Are you sure you want to delete this reminder? 🗑️')) {
      const updatedReminders = reminders.filter(r => r.id !== id);
      setReminders(updatedReminders);
      saveReminders(updatedReminders);
    }
  };

  const handleToggleComplete = (id: string) => {
    const updatedReminders = reminders.map(r => 
      r.id === id ? { ...r, isCompleted: !r.isCompleted, updatedAt: new Date() } : r
    );
    setReminders(updatedReminders);
    saveReminders(updatedReminders);
  };

  const handleThemeChange = (themeId: string) => {
    const theme = getThemeById(themeId);
    if (theme) {
      applyTheme(theme, settings.comicSansMode);
      setSettings(prev => ({ ...prev, theme: themeId }));
    }
  };

  const handleSettingChange = (key: keyof UserSettings, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
    
    // Apply theme changes immediately
    if (key === 'comicSansMode') {
      const theme = getThemeById(settings.theme);
      if (theme) {
        applyTheme(theme, value);
      }
    }
  };

  // Filter reminders based on search and filters
  const filteredReminders = reminders.filter(reminder => {
    const matchesSearch = reminder.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         reminder.description?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesPriority = filterPriority === 'all' || reminder.priority === filterPriority;
    
    const matchesStatus = filterStatus === 'all' || 
                         (filterStatus === 'completed' && reminder.isCompleted) ||
                         (filterStatus === 'pending' && !reminder.isCompleted);
    
    return matchesSearch && matchesPriority && matchesStatus;
  });

  // Sort reminders by due date
  const sortedReminders = filteredReminders.sort((a, b) => {
    if (a.isCompleted !== b.isCompleted) {
      return a.isCompleted ? 1 : -1; // Completed items go to bottom
    }
    return a.dueDate.getTime() - b.dueDate.getTime();
  });

  const getDateLabel = (date: Date) => {
    if (isToday(date)) return '🌟 Today';
    if (isTomorrow(date)) return '⭐ Tomorrow';
    if (isPast(date)) return '⚠️ Overdue';
    return format(date, 'MMM dd, yyyy');
  };

  const appClasses = `min-h-screen transition-all duration-300 ${
    settings.simpleMode ? 'simple-mode' : ''
  } ${settings.largeText ? 'large-text' : ''} ${
    settings.comicSansMode ? 'comic-sans' : ''
  }`;

  return (
    <div className={appClasses}>
      {/* Header */}
      <header className="sticky top-0 z-40 backdrop-blur-md border-b-2" style={{ 
        backgroundColor: 'var(--color-surface)', 
        borderColor: 'var(--color-primary)' 
      }}>
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h1 className="text-4xl font-bold rainbow-text">
                🎯 ReMindMe
              </h1>
              <div className="hidden md:flex items-center gap-2 text-sm opacity-75">
                <span>{reminders.filter(r => !r.isCompleted).length} active</span>
                <span>•</span>
                <span>{reminders.filter(r => r.isCompleted).length} completed</span>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowThemeManager(true)}
                className="btn-secondary flex items-center gap-2"
                title="Themes"
              >
                <Palette size={20} />
                <span className="hidden sm:inline">Themes</span>
              </button>
              
              <button
                onClick={() => setShowSettings(true)}
                className="btn-secondary flex items-center gap-2"
                title="Settings"
              >
                <Settings size={20} />
                <span className="hidden sm:inline">Settings</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* Search and Filters */}
        <div className="card mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search your reminders... 🔍"
                className="input-field pl-12"
              />
            </div>
            
            <div className="flex gap-2">
              <select
                value={filterPriority}
                onChange={(e) => setFilterPriority(e.target.value as any)}
                className="input-field w-auto"
              >
                <option value="all">All Priorities</option>
                <option value="high">🔴 High</option>
                <option value="medium">🟡 Medium</option>
                <option value="low">🟢 Low</option>
              </select>
              
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as any)}
                className="input-field w-auto"
              >
                <option value="all">All Status</option>
                <option value="pending">📋 Pending</option>
                <option value="completed">✅ Completed</option>
              </select>
            </div>
          </div>
        </div>

        {/* Reminders List */}
        <div className="space-y-4">
          {sortedReminders.length === 0 ? (
            <div className="card-fun text-center py-12">
              <div className="text-6xl mb-4">🎉</div>
              <h3 className="text-2xl font-bold mb-2">
                {searchTerm || filterPriority !== 'all' || filterStatus !== 'all' 
                  ? 'No matching reminders found!' 
                  : 'No reminders yet!'}
              </h3>
              <p className="text-lg opacity-75 mb-6">
                {searchTerm || filterPriority !== 'all' || filterStatus !== 'all'
                  ? 'Try adjusting your search or filters 🔍'
                  : 'Create your first reminder to get started! ✨'}
              </p>
              {!searchTerm && filterPriority === 'all' && filterStatus === 'all' && (
                <button
                  onClick={() => setShowForm(true)}
                  className="btn-fun"
                >
                  Create First Reminder 🚀
                </button>
              )}
            </div>
          ) : (
            sortedReminders.map((reminder) => (
              <div
                key={reminder.id}
                className={`reminder-item ${
                  reminder.isCompleted ? 'opacity-60' : ''
                } reminder-priority-${reminder.priority}`}
                style={{ borderLeftColor: reminder.colorTag }}
              >
                <div className="flex items-start gap-4">
                  {/* Emoji Tag */}
                  <div className="text-3xl flex-shrink-0">
                    {reminder.emojiTag}
                  </div>
                  
                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className={`text-xl font-bold ${
                        reminder.isCompleted ? 'line-through' : ''
                      }`}>
                        {reminder.title}
                      </h3>
                      
                      <div
                        className="w-4 h-4 rounded-full flex-shrink-0"
                        style={{ backgroundColor: reminder.colorTag }}
                      />
                    </div>
                    
                    {reminder.description && (
                      <p className="text-gray-600 mb-2">{reminder.description}</p>
                    )}
                    
                    <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
                      <span className="flex items-center gap-1">
                        <Calendar size={16} />
                        {getDateLabel(reminder.dueDate)}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock size={16} />
                        {format(reminder.dueDate, 'h:mm a')}
                      </span>
                      {reminder.youtubeSound && (
                        <span className="flex items-center gap-1">
                          <Volume2 size={16} />
                          Custom Sound
                        </span>
                      )}
                      {reminder.voiceMemo && (
                        <span className="flex items-center gap-1">
                          <Mic size={16} />
                          Voice Memo
                        </span>
                      )}
                      {reminder.photos && reminder.photos.length > 0 && (
                        <span className="flex items-center gap-1">
                          <Camera size={16} />
                          {reminder.photos.length} Photo{reminder.photos.length > 1 ? 's' : ''}
                        </span>
                      )}
                    </div>
                    
                    {/* Photos */}
                    {reminder.photos && reminder.photos.length > 0 && (
                      <div className="flex gap-2 mb-3">
                        {reminder.photos.slice(0, 3).map((photo, index) => (
                          <img
                            key={index}
                            src={photo}
                            alt={`Photo ${index + 1}`}
                            className="w-16 h-16 object-cover rounded-lg"
                          />
                        ))}
                        {reminder.photos.length > 3 && (
                          <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center text-sm font-bold">
                            +{reminder.photos.length - 3}
                          </div>
                        )}
                      </div>
                    )}
                    
                    {/* Voice Memo */}
                    {reminder.voiceMemo && (
                      <div className="mb-3">
                        <audio controls src={reminder.voiceMemo} className="h-8" />
                      </div>
                    )}
                  </div>
                  
                  {/* Actions */}
                  <div className="flex flex-col gap-2 flex-shrink-0">
                    <button
                      onClick={() => handleToggleComplete(reminder.id)}
                      className={`p-2 rounded-lg transition-all ${
                        reminder.isCompleted
                          ? 'bg-green-100 text-green-600 hover:bg-green-200'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                      title={reminder.isCompleted ? 'Mark as pending' : 'Mark as completed'}
                    >
                      <CheckCircle size={20} />
                    </button>
                    
                    <button
                      onClick={() => {
                        setEditingReminder(reminder);
                        setShowForm(true);
                      }}
                      className="p-2 rounded-lg bg-blue-100 text-blue-600 hover:bg-blue-200 transition-all"
                      title="Edit reminder"
                    >
                      <Edit size={20} />
                    </button>
                    
                    <button
                      onClick={() => handleDeleteReminder(reminder.id)}
                      className="p-2 rounded-lg bg-red-100 text-red-600 hover:bg-red-200 transition-all"
                      title="Delete reminder"
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </main>

      {/* Quick Action Button */}
      <button
        onClick={() => setShowForm(true)}
        className="quick-action-button"
        title="Add new reminder"
      >
        <Plus size={24} />
      </button>

      {/* Modals */}
      {showForm && (
        <ReminderForm
          onSave={handleSaveReminder}
          onCancel={() => {
            setShowForm(false);
            setEditingReminder(null);
          }}
          initialData={editingReminder || undefined}
          isEditing={!!editingReminder}
        />
      )}

      {showThemeManager && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="card-fun max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <ThemeManager
              currentTheme={settings.theme}
              onThemeChange={handleThemeChange}
              comicSansMode={settings.comicSansMode}
            />
            <div className="flex justify-end mt-6">
              <button
                onClick={() => setShowThemeManager(false)}
                className="btn-primary"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {showSettings && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="card-fun max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-3xl font-bold rainbow-text">⚙️ Settings</h2>
              <button
                onClick={() => setShowSettings(false)}
                className="text-gray-500 hover:text-gray-700 p-2 rounded-full hover:bg-gray-100 transition-all"
              >
                <X size={24} />
              </button>
            </div>
            
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-bold mb-4">🎨 Appearance</h3>
                <div className="space-y-3">
                  <label className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={settings.comicSansMode}
                      onChange={(e) => handleSettingChange('comicSansMode', e.target.checked)}
                      className="w-5 h-5 text-pink-600 rounded focus:ring-pink-500"
                    />
                    <span className="text-lg">💅 Comic Sans Mode (Fun fonts!)</span>
                  </label>
                  
                  <label className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={settings.simpleMode}
                      onChange={(e) => handleSettingChange('simpleMode', e.target.checked)}
                      className="w-5 h-5 text-pink-600 rounded focus:ring-pink-500"
                    />
                    <span className="text-lg">🎯 Simple Mode (Easier to use)</span>
                  </label>
                  
                  <label className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={settings.largeText}
                      onChange={(e) => handleSettingChange('largeText', e.target.checked)}
                      className="w-5 h-5 text-pink-600 rounded focus:ring-pink-500"
                    />
                    <span className="text-lg">🔍 Large Text Mode</span>
                  </label>
                </div>
              </div>
              
              <div>
                <h3 className="text-xl font-bold mb-4">🤖 AI Assistant</h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium mb-1">Assistant Name:</label>
                    <input
                      type="text"
                      value={settings.aiAssistant.name}
                      onChange={(e) => handleSettingChange('aiAssistant', {
                        ...settings.aiAssistant,
                        name: e.target.value
                      })}
                      className="input-field"
                      placeholder="Remi"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1">Personality:</label>
                    <input
                      type="text"
                      value={settings.aiAssistant.personality}
                      onChange={(e) => handleSettingChange('aiAssistant', {
                        ...settings.aiAssistant,
                        personality: e.target.value
                      })}
                      className="input-field"
                      placeholder="friendly and helpful"
                    />
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="text-xl font-bold mb-4">🔗 Integrations</h3>
                <div className="space-y-3">
                  <label className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={settings.googleCalendarSync}
                      onChange={(e) => handleSettingChange('googleCalendarSync', e.target.checked)}
                      className="w-5 h-5 text-pink-600 rounded focus:ring-pink-500"
                    />
                    <span className="text-lg">📅 Google Calendar Sync</span>
                  </label>
                  
                  <label className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={settings.lockScreenReminders}
                      onChange={(e) => handleSettingChange('lockScreenReminders', e.target.checked)}
                      className="w-5 h-5 text-pink-600 rounded focus:ring-pink-500"
                    />
                    <span className="text-lg">🔒 Lock Screen Reminders</span>
                  </label>
                </div>
              </div>
            </div>
            
            <div className="flex justify-end mt-8">
              <button
                onClick={() => setShowSettings(false)}
                className="btn-primary"
              >
                Save Settings
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
