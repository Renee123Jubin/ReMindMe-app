import React, { useState, useEffect } from 'react';
import { Reminder } from '../types';
import { Calendar, Download, Upload, Sync, CheckCircle, AlertCircle, X } from 'lucide-react';
import { format } from 'date-fns';

interface GoogleCalendarSyncProps {
  reminders: Reminder[];
  onImportReminders: (reminders: Reminder[]) => void;
  onClose: () => void;
}

interface CalendarEvent {
  id: string;
  summary: string;
  description?: string;
  start: { dateTime: string };
  end: { dateTime: string };
  status: string;
}

export const GoogleCalendarSync: React.FC<GoogleCalendarSyncProps> = ({
  reminders,
  onImportReminders,
  onClose
}) => {
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>([]);
  const [selectedEvents, setSelectedEvents] = useState<string[]>([]);
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  // Simulated Google Calendar API integration
  // In a real app, you'd use the Google Calendar API
  const mockCalendarEvents: CalendarEvent[] = [
    {
      id: '1',
      summary: 'Team Meeting',
      description: 'Weekly team sync',
      start: { dateTime: new Date(Date.now() + 86400000).toISOString() }, // Tomorrow
      end: { dateTime: new Date(Date.now() + 86400000 + 3600000).toISOString() }, // Tomorrow + 1 hour
      status: 'confirmed'
    },
    {
      id: '2',
      summary: 'Doctor Appointment',
      description: 'Annual checkup',
      start: { dateTime: new Date(Date.now() + 172800000).toISOString() }, // Day after tomorrow
      end: { dateTime: new Date(Date.now() + 172800000 + 1800000).toISOString() }, // +30 mins
      status: 'confirmed'
    },
    {
      id: '3',
      summary: 'Birthday Party',
      description: "Sarah's birthday celebration",
      start: { dateTime: new Date(Date.now() + 604800000).toISOString() }, // Next week
      end: { dateTime: new Date(Date.now() + 604800000 + 10800000).toISOString() }, // +3 hours
      status: 'confirmed'
    }
  ];

  const connectToGoogle = async () => {
    setIsLoading(true);
    // Simulate API connection
    setTimeout(() => {
      setIsConnected(true);
      setCalendarEvents(mockCalendarEvents);
      setIsLoading(false);
    }, 2000);
  };

  const disconnectFromGoogle = () => {
    setIsConnected(false);
    setCalendarEvents([]);
    setSelectedEvents([]);
  };

  const handleEventSelection = (eventId: string) => {
    setSelectedEvents(prev => 
      prev.includes(eventId) 
        ? prev.filter(id => id !== eventId)
        : [...prev, eventId]
    );
  };

  const importSelectedEvents = async () => {
    if (selectedEvents.length === 0) {
      setErrorMessage('Please select at least one event to import');
      return;
    }

    setSyncStatus('syncing');
    setErrorMessage('');

    // Simulate import process
    setTimeout(() => {
      const eventsToImport = calendarEvents.filter(event => selectedEvents.includes(event.id));
      
      const newReminders: Reminder[] = eventsToImport.map(event => ({
        id: `gcal_${event.id}_${Date.now()}`,
        title: event.summary,
        description: event.description || '',
        dueDate: new Date(event.start.dateTime),
        priority: 'medium' as const,
        colorTag: '#4285f4', // Google blue
        emojiTag: '📅',
        isCompleted: false,
        isRecurring: false,
        notificationEnabled: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }));

      onImportReminders(newReminders);
      setSyncStatus('success');
      setSelectedEvents([]);
      
      setTimeout(() => {
        setSyncStatus('idle');
      }, 2000);
    }, 1500);
  };

  const exportToGoogleCalendar = async () => {
    setSyncStatus('syncing');
    
    // Simulate export process
    setTimeout(() => {
      setSyncStatus('success');
      setTimeout(() => {
        setSyncStatus('idle');
      }, 2000);
    }, 2000);
  };

  const getEventEmoji = (summary: string) => {
    const lower = summary.toLowerCase();
    if (lower.includes('meeting') || lower.includes('work')) return '💼';
    if (lower.includes('doctor') || lower.includes('health')) return '🏥';
    if (lower.includes('birthday') || lower.includes('party')) return '🎉';
    if (lower.includes('exercise') || lower.includes('gym')) return '💪';
    if (lower.includes('shopping')) return '🛒';
    return '📅';
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="card-fun max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold rainbow-text flex items-center gap-3">
            📅 Google Calendar Sync
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 p-2 rounded-full hover:bg-gray-100 transition-all"
          >
            <X size={24} />
          </button>
        </div>

        {!isConnected ? (
          // Connection Screen
          <div className="text-center py-12">
            <div className="text-6xl mb-6">🔗</div>
            <h3 className="text-2xl font-bold mb-4">Connect to Google Calendar</h3>
            <p className="text-lg opacity-75 mb-8 max-w-md mx-auto">
              Sync your reminders with Google Calendar to keep everything in one place! 
              Import calendar events as reminders or export your reminders to your calendar.
            </p>
            
            <button
              onClick={connectToGoogle}
              disabled={isLoading}
              className="btn-fun flex items-center gap-3 mx-auto"
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Connecting...
                </>
              ) : (
                <>
                  <Calendar size={20} />
                  Connect Google Calendar
                </>
              )}
            </button>
            
            <div className="mt-8 p-4 bg-blue-50 rounded-xl border border-blue-200">
              <h4 className="font-bold text-blue-800 mb-2">🔒 Privacy & Security</h4>
              <p className="text-sm text-blue-700">
                We only access your calendar events to sync with your reminders. 
                Your data stays secure and private. You can disconnect at any time.
              </p>
            </div>
          </div>
        ) : (
          // Sync Interface
          <div className="space-y-6">
            {/* Status */}
            <div className="flex items-center justify-between p-4 bg-green-50 rounded-xl border border-green-200">
              <div className="flex items-center gap-3">
                <CheckCircle className="text-green-600" size={24} />
                <div>
                  <h3 className="font-bold text-green-800">Connected to Google Calendar</h3>
                  <p className="text-sm text-green-600">Ready to sync your events and reminders</p>
                </div>
              </div>
              <button
                onClick={disconnectFromGoogle}
                className="btn-secondary text-sm"
              >
                Disconnect
              </button>
            </div>

            {/* Sync Status */}
            {syncStatus !== 'idle' && (
              <div className={`p-4 rounded-xl border ${
                syncStatus === 'syncing' ? 'bg-blue-50 border-blue-200' :
                syncStatus === 'success' ? 'bg-green-50 border-green-200' :
                'bg-red-50 border-red-200'
              }`}>
                <div className="flex items-center gap-3">
                  {syncStatus === 'syncing' && (
                    <>
                      <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                      <span className="text-blue-800 font-medium">Syncing...</span>
                    </>
                  )}
                  {syncStatus === 'success' && (
                    <>
                      <CheckCircle className="text-green-600" size={20} />
                      <span className="text-green-800 font-medium">Sync completed successfully! 🎉</span>
                    </>
                  )}
                  {syncStatus === 'error' && (
                    <>
                      <AlertCircle className="text-red-600" size={20} />
                      <span className="text-red-800 font-medium">{errorMessage}</span>
                    </>
                  )}
                </div>
              </div>
            )}

            <div className="grid md:grid-cols-2 gap-6">
              {/* Import from Calendar */}
              <div className="card">
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <Download size={20} />
                  Import from Calendar
                </h3>
                <p className="text-sm opacity-75 mb-4">
                  Select calendar events to convert into reminders
                </p>

                <div className="space-y-3 max-h-64 overflow-y-auto mb-4">
                  {calendarEvents.map((event) => (
                    <div
                      key={event.id}
                      className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${
                        selectedEvents.includes(event.id)
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => handleEventSelection(event.id)}
                    >
                      <div className="flex items-start gap-3">
                        <div className="text-xl">{getEventEmoji(event.summary)}</div>
                        <div className="flex-1">
                          <h4 className="font-semibold">{event.summary}</h4>
                          {event.description && (
                            <p className="text-sm text-gray-600">{event.description}</p>
                          )}
                          <p className="text-xs text-gray-500 mt-1">
                            {format(new Date(event.start.dateTime), 'MMM dd, h:mm a')}
                          </p>
                        </div>
                        <input
                          type="checkbox"
                          checked={selectedEvents.includes(event.id)}
                          onChange={() => handleEventSelection(event.id)}
                          className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                        />
                      </div>
                    </div>
                  ))}
                </div>

                <button
                  onClick={importSelectedEvents}
                  disabled={selectedEvents.length === 0 || syncStatus === 'syncing'}
                  className="btn-primary w-full flex items-center justify-center gap-2"
                >
                  <Download size={16} />
                  Import {selectedEvents.length} Selected Event{selectedEvents.length !== 1 ? 's' : ''}
                </button>
              </div>

              {/* Export to Calendar */}
              <div className="card">
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <Upload size={20} />
                  Export to Calendar
                </h3>
                <p className="text-sm opacity-75 mb-4">
                  Send your active reminders to Google Calendar
                </p>

                <div className="space-y-3 max-h-64 overflow-y-auto mb-4">
                  {reminders.filter(r => !r.isCompleted).slice(0, 5).map((reminder) => (
                    <div
                      key={reminder.id}
                      className="p-3 rounded-lg border border-gray-200 bg-gray-50"
                    >
                      <div className="flex items-start gap-3">
                        <div className="text-xl">{reminder.emojiTag}</div>
                        <div className="flex-1">
                          <h4 className="font-semibold">{reminder.title}</h4>
                          {reminder.description && (
                            <p className="text-sm text-gray-600">{reminder.description}</p>
                          )}
                          <p className="text-xs text-gray-500 mt-1">
                            {format(reminder.dueDate, 'MMM dd, h:mm a')}
                          </p>
                        </div>
                        <div
                          className="w-4 h-4 rounded-full"
                          style={{ backgroundColor: reminder.colorTag }}
                        />
                      </div>
                    </div>
                  ))}
                  
                  {reminders.filter(r => !r.isCompleted).length > 5 && (
                    <div className="text-center text-sm text-gray-500 py-2">
                      ...and {reminders.filter(r => !r.isCompleted).length - 5} more reminders
                    </div>
                  )}
                </div>

                <button
                  onClick={exportToGoogleCalendar}
                  disabled={reminders.filter(r => !r.isCompleted).length === 0 || syncStatus === 'syncing'}
                  className="btn-primary w-full flex items-center justify-center gap-2"
                >
                  <Upload size={16} />
                  Export {reminders.filter(r => !r.isCompleted).length} Reminder{reminders.filter(r => !r.isCompleted).length !== 1 ? 's' : ''}
                </button>
              </div>
            </div>

            {/* Sync Options */}
            <div className="card bg-gray-50">
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                <Sync size={20} />
                Auto-Sync Options
              </h3>
              
              <div className="space-y-3">
                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                  />
                  <span>📥 Automatically import new calendar events as reminders</span>
                </label>
                
                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                  />
                  <span>📤 Automatically export new reminders to calendar</span>
                </label>
                
                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                  />
                  <span>🔄 Sync completion status between reminders and events</span>
                </label>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};