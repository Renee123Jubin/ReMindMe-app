import React, { useState, useEffect } from 'react';
import { Reminder } from '../types';
import { Plus, Clock, Calendar, Zap, Coffee, Briefcase, Heart, ShoppingCart, X } from 'lucide-react';
import { format, addMinutes, addHours, addDays } from 'date-fns';

interface QuickActionsProps {
  onCreateReminder: (reminder: Partial<Reminder>) => void;
  onClose: () => void;
}

interface QuickTemplate {
  id: string;
  title: string;
  icon: React.ReactNode;
  emojiTag: string;
  colorTag: string;
  priority: 'low' | 'medium' | 'high';
  category: string;
  defaultTime?: number; // minutes from now
}

export const QuickActions: React.FC<QuickActionsProps> = ({
  onCreateReminder,
  onClose
}) => {
  const [selectedTime, setSelectedTime] = useState<'15min' | '1hour' | '1day' | 'custom'>('1hour');
  const [customTitle, setCustomTitle] = useState('');
  const [showCustomForm, setShowCustomForm] = useState(false);

  const quickTemplates: QuickTemplate[] = [
    {
      id: 'coffee',
      title: 'Coffee break',
      icon: <Coffee size={20} />,
      emojiTag: '☕',
      colorTag: '#8B4513',
      priority: 'low',
      category: 'Personal',
      defaultTime: 15
    },
    {
      id: 'meeting',
      title: 'Upcoming meeting',
      icon: <Briefcase size={20} />,
      emojiTag: '💼',
      colorTag: '#2563eb',
      priority: 'high',
      category: 'Work',
      defaultTime: 60
    },
    {
      id: 'medicine',
      title: 'Take medicine',
      icon: <Heart size={20} />,
      emojiTag: '💊',
      colorTag: '#dc2626',
      priority: 'high',
      category: 'Health',
      defaultTime: 30
    },
    {
      id: 'shopping',
      title: 'Buy groceries',
      icon: <ShoppingCart size={20} />,
      emojiTag: '🛒',
      colorTag: '#16a34a',
      priority: 'medium',
      category: 'Shopping',
      defaultTime: 1440 // 1 day
    },
    {
      id: 'workout',
      title: 'Workout time',
      icon: <Zap size={20} />,
      emojiTag: '💪',
      colorTag: '#ea580c',
      priority: 'medium',
      category: 'Health',
      defaultTime: 60
    },
    {
      id: 'call',
      title: 'Make important call',
      icon: <Clock size={20} />,
      emojiTag: '📞',
      colorTag: '#7c3aed',
      priority: 'medium',
      category: 'Personal',
      defaultTime: 30
    }
  ];

  const timeOptions = [
    { value: '15min', label: '15 minutes', minutes: 15 },
    { value: '1hour', label: '1 hour', minutes: 60 },
    { value: '1day', label: '1 day', minutes: 1440 },
    { value: 'custom', label: 'Custom time', minutes: 0 }
  ];

  const getTimeFromNow = (minutes: number): Date => {
    return addMinutes(new Date(), minutes);
  };

  const handleQuickTemplate = (template: QuickTemplate) => {
    const timeMinutes = template.defaultTime || 60;
    const dueDate = getTimeFromNow(timeMinutes);

    const reminderData: Partial<Reminder> = {
      title: template.title,
      dueDate,
      priority: template.priority,
      emojiTag: template.emojiTag,
      colorTag: template.colorTag,
      notificationEnabled: true,
      isCompleted: false,
      isRecurring: false
    };

    onCreateReminder(reminderData);
    onClose();
  };

  const handleCustomQuick = () => {
    if (!customTitle.trim()) return;

    const timeOption = timeOptions.find(opt => opt.value === selectedTime);
    const minutes = timeOption?.minutes || 60;
    const dueDate = getTimeFromNow(minutes);

    const reminderData: Partial<Reminder> = {
      title: customTitle.trim(),
      dueDate,
      priority: 'medium',
      emojiTag: '⭐',
      colorTag: '#3b82f6',
      notificationEnabled: true,
      isCompleted: false,
      isRecurring: false
    };

    onCreateReminder(reminderData);
    setCustomTitle('');
    onClose();
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && customTitle.trim()) {
      handleCustomQuick();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="card-fun max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold rainbow-text flex items-center gap-3">
            <Zap size={32} />
            Quick Actions
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 p-2 rounded-full hover:bg-gray-100 transition-all"
          >
            <X size={24} />
          </button>
        </div>

        <p className="text-lg opacity-75 mb-6 text-center">
          Create reminders instantly with pre-made templates! ⚡
        </p>

        {!showCustomForm ? (
          <div className="space-y-6">
            {/* Quick Templates */}
            <div>
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                🚀 Quick Templates
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {quickTemplates.map((template) => (
                  <button
                    key={template.id}
                    onClick={() => handleQuickTemplate(template)}
                    className="card hover:shadow-xl transition-all duration-300 transform hover:scale-105 p-4 text-left"
                    style={{ borderLeftColor: template.colorTag, borderLeftWidth: '6px' }}
                  >
                    <div className="flex items-center gap-3">
                      <div className="text-3xl">{template.emojiTag}</div>
                      <div className="flex-1">
                        <h4 className="font-bold text-lg">{template.title}</h4>
                        <div className="flex items-center gap-2 text-sm opacity-75">
                          <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                            template.priority === 'high' ? 'bg-red-100 text-red-600' :
                            template.priority === 'medium' ? 'bg-yellow-100 text-yellow-600' :
                            'bg-green-100 text-green-600'
                          }`}>
                            {template.priority.toUpperCase()}
                          </span>
                          <span>•</span>
                          <span>in {template.defaultTime && template.defaultTime >= 1440 ? 
                            `${Math.floor(template.defaultTime / 1440)} day${Math.floor(template.defaultTime / 1440) > 1 ? 's' : ''}` :
                            template.defaultTime && template.defaultTime >= 60 ?
                            `${Math.floor(template.defaultTime / 60)} hour${Math.floor(template.defaultTime / 60) > 1 ? 's' : ''}` :
                            `${template.defaultTime} min`
                          }</span>
                        </div>
                      </div>
                      <div className="text-2xl opacity-50">→</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Quick Reminder */}
            <div className="card bg-gradient-to-r from-purple-50 to-pink-50">
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                ✨ Custom Quick Reminder
              </h3>
              
              <div className="space-y-4">
                <input
                  type="text"
                  value={customTitle}
                  onChange={(e) => setCustomTitle(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="What do you need to remember? 🤔"
                  className="input-field"
                  autoFocus
                />

                <div>
                  <label className="block text-sm font-bold mb-2">⏰ When?</label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {timeOptions.map((option) => (
                      <button
                        key={option.value}
                        onClick={() => setSelectedTime(option.value as any)}
                        className={`p-3 rounded-xl text-sm font-bold transition-all ${
                          selectedTime === option.value
                            ? 'bg-purple-500 text-white scale-105'
                            : 'bg-white border-2 border-purple-200 text-purple-600 hover:border-purple-300'
                        }`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  onClick={handleCustomQuick}
                  disabled={!customTitle.trim()}
                  className="btn-fun w-full flex items-center justify-center gap-2"
                >
                  <Plus size={20} />
                  Create Quick Reminder
                </button>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-3 gap-4">
              <div className="card text-center p-4">
                <div className="text-2xl mb-2">⚡</div>
                <div className="text-lg font-bold">Instant</div>
                <div className="text-sm opacity-75">No forms to fill</div>
              </div>
              <div className="card text-center p-4">
                <div className="text-2xl mb-2">🎯</div>
                <div className="text-lg font-bold">Smart</div>
                <div className="text-sm opacity-75">Pre-configured</div>
              </div>
              <div className="card text-center p-4">
                <div className="text-2xl mb-2">🚀</div>
                <div className="text-lg font-bold">Fast</div>
                <div className="text-sm opacity-75">One-click setup</div>
              </div>
            </div>
          </div>
        ) : (
          // Custom form would go here if needed
          <div>Custom form placeholder</div>
        )}

        {/* Tips */}
        <div className="card bg-gray-50 mt-6">
          <h4 className="font-bold text-gray-800 mb-2">💡 Quick Action Tips</h4>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• Templates use smart defaults for common reminders</li>
            <li>• All quick reminders can be edited after creation</li>
            <li>• Priority levels help organize your tasks</li>
            <li>• Use custom quick reminders for unique needs</li>
          </ul>
        </div>
      </div>
    </div>
  );
};