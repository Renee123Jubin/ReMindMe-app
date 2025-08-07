import React, { useState, useRef, useEffect } from 'react';
import { Reminder, AIAssistant as AIAssistantType } from '../types';
import { MessageCircle, Send, Mic, MicOff, Bot, User, Sparkles, X } from 'lucide-react';
import { format } from 'date-fns';

interface ChatMessage {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  suggestions?: string[];
}

interface AIAssistantProps {
  assistant: AIAssistantType;
  reminders: Reminder[];
  onCreateReminder: (reminderData: Partial<Reminder>) => void;
  onUpdateReminder: (id: string, updates: Partial<Reminder>) => void;
  onDeleteReminder: (id: string) => void;
  onClose: () => void;
}

export const AIAssistant: React.FC<AIAssistantProps> = ({
  assistant,
  reminders,
  onCreateReminder,
  onUpdateReminder,
  onDeleteReminder,
  onClose
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      type: 'assistant',
      content: `Hi! I'm ${assistant.name}, your ${assistant.personality} reminder assistant! ${assistant.avatar} How can I help you manage your reminders today?`,
      timestamp: new Date(),
      suggestions: [
        "Create a reminder for tomorrow",
        "Show my overdue reminders",
        "What's coming up today?",
        "Help me organize my tasks"
      ]
    }
  ]);
  
  const [inputMessage, setInputMessage] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Initialize speech recognition
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInputMessage(transcript);
        setIsListening(false);
      };

      recognitionRef.current.onerror = () => {
        setIsListening(false);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }
  }, []);

  const startListening = () => {
    if (recognitionRef.current) {
      setIsListening(true);
      recognitionRef.current.start();
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  };

  const parseReminderFromText = (text: string): Partial<Reminder> | null => {
    const lowerText = text.toLowerCase();
    
    // Extract title (everything before time/date keywords)
    let title = text;
    const timeKeywords = ['at', 'on', 'tomorrow', 'today', 'next', 'in'];
    for (const keyword of timeKeywords) {
      const index = lowerText.indexOf(keyword);
      if (index > 0) {
        title = text.substring(0, index).trim();
        break;
      }
    }

    // Clean up title
    title = title.replace(/^(remind me to|create a reminder|add a reminder|set a reminder)/i, '').trim();
    
    if (!title) return null;

    // Extract date/time
    let dueDate = new Date();
    
    if (lowerText.includes('tomorrow')) {
      dueDate.setDate(dueDate.getDate() + 1);
    } else if (lowerText.includes('next week')) {
      dueDate.setDate(dueDate.getDate() + 7);
    } else if (lowerText.includes('next month')) {
      dueDate.setMonth(dueDate.getMonth() + 1);
    }

    // Extract time (simple patterns)
    const timeMatch = text.match(/(\d{1,2}):?(\d{2})?\s*(am|pm)/i);
    if (timeMatch) {
      let hours = parseInt(timeMatch[1]);
      const minutes = parseInt(timeMatch[2] || '0');
      const ampm = timeMatch[3].toLowerCase();
      
      if (ampm === 'pm' && hours !== 12) hours += 12;
      if (ampm === 'am' && hours === 12) hours = 0;
      
      dueDate.setHours(hours, minutes, 0, 0);
    } else {
      // Default to 9 AM if no time specified
      dueDate.setHours(9, 0, 0, 0);
    }

    // Extract priority
    let priority: 'low' | 'medium' | 'high' = 'medium';
    if (lowerText.includes('urgent') || lowerText.includes('important') || lowerText.includes('asap')) {
      priority = 'high';
    } else if (lowerText.includes('low priority') || lowerText.includes('when i have time')) {
      priority = 'low';
    }

    // Extract emoji based on content
    let emojiTag = '⭐';
    if (lowerText.includes('work') || lowerText.includes('meeting')) emojiTag = '💼';
    else if (lowerText.includes('health') || lowerText.includes('doctor')) emojiTag = '🏥';
    else if (lowerText.includes('shopping') || lowerText.includes('buy')) emojiTag = '🛒';
    else if (lowerText.includes('exercise') || lowerText.includes('gym')) emojiTag = '💪';
    else if (lowerText.includes('call') || lowerText.includes('phone')) emojiTag = '📞';
    else if (lowerText.includes('birthday') || lowerText.includes('party')) emojiTag = '🎉';

    return {
      title,
      dueDate,
      priority,
      emojiTag,
      colorTag: priority === 'high' ? '#ef4444' : priority === 'low' ? '#10b981' : '#f59e0b',
      notificationEnabled: true,
      isCompleted: false,
      isRecurring: false
    };
  };

  const generateResponse = async (userMessage: string): Promise<{ content: string; suggestions?: string[] }> => {
    const lowerMessage = userMessage.toLowerCase();
    
    // Handle reminder creation
    if (lowerMessage.includes('create') || lowerMessage.includes('add') || lowerMessage.includes('remind me')) {
      const reminderData = parseReminderFromText(userMessage);
      if (reminderData) {
        onCreateReminder(reminderData);
        return {
          content: `Perfect! I've created a reminder for "${reminderData.title}" ${reminderData.emojiTag}. It's set for ${format(reminderData.dueDate!, 'MMM dd at h:mm a')}. Is there anything else you'd like me to help you with?`,
          suggestions: [
            "Show all my reminders",
            "Create another reminder",
            "What's due today?",
            "Set a recurring reminder"
          ]
        };
      } else {
        return {
          content: "I'd love to help you create a reminder! Could you tell me what you need to remember and when? For example: 'Remind me to call mom tomorrow at 2pm'",
          suggestions: [
            "Remind me to buy groceries tomorrow",
            "Meeting with team at 3pm today",
            "Doctor appointment next week",
            "Pay bills on Friday"
          ]
        };
      }
    }

    // Handle showing reminders
    if (lowerMessage.includes('show') || lowerMessage.includes('list') || lowerMessage.includes('what')) {
      const activeReminders = reminders.filter(r => !r.isCompleted);
      const overdueReminders = activeReminders.filter(r => r.dueDate < new Date());
      const todayReminders = activeReminders.filter(r => {
        const today = new Date();
        return r.dueDate.toDateString() === today.toDateString();
      });

      if (lowerMessage.includes('overdue')) {
        if (overdueReminders.length === 0) {
          return {
            content: "Great news! You don't have any overdue reminders! 🎉 You're staying on top of things!",
            suggestions: ["What's coming up today?", "Show all reminders", "Create a new reminder"]
          };
        } else {
          const overdueList = overdueReminders.map(r => `• ${r.emojiTag} ${r.title} (was due ${format(r.dueDate, 'MMM dd')})`).join('\n');
          return {
            content: `You have ${overdueReminders.length} overdue reminder${overdueReminders.length > 1 ? 's' : ''}:\n\n${overdueList}\n\nWould you like me to help you reschedule any of these?`,
            suggestions: ["Reschedule overdue reminders", "Mark some as complete", "Show today's reminders"]
          };
        }
      }

      if (lowerMessage.includes('today')) {
        if (todayReminders.length === 0) {
          return {
            content: "You don't have any reminders for today! 🌟 Perfect time to relax or get ahead on tomorrow's tasks!",
            suggestions: ["What's coming up tomorrow?", "Create a reminder for later", "Show all reminders"]
          };
        } else {
          const todayList = todayReminders.map(r => `• ${r.emojiTag} ${r.title} at ${format(r.dueDate, 'h:mm a')}`).join('\n');
          return {
            content: `Here's what you have today:\n\n${todayList}\n\nYou've got this! 💪`,
            suggestions: ["Mark one as complete", "Add another reminder", "Show overdue reminders"]
          };
        }
      }

      // General reminder list
      if (activeReminders.length === 0) {
        return {
          content: "You don't have any active reminders right now! 🎉 You're either super organized or ready to add some new ones!",
          suggestions: ["Create my first reminder", "Import from calendar", "Set up recurring reminders"]
        };
      } else {
        const recentReminders = activeReminders.slice(0, 5);
        const reminderList = recentReminders.map(r => `• ${r.emojiTag} ${r.title} - ${format(r.dueDate, 'MMM dd, h:mm a')}`).join('\n');
        return {
          content: `Here are your upcoming reminders:\n\n${reminderList}${activeReminders.length > 5 ? `\n\n...and ${activeReminders.length - 5} more!` : ''}\n\nNeed help with any of these?`,
          suggestions: ["Show overdue reminders", "Create a new reminder", "Edit a reminder", "What's due today?"]
        };
      }
    }

    // Handle completion
    if (lowerMessage.includes('complete') || lowerMessage.includes('done') || lowerMessage.includes('finished')) {
      return {
        content: "Great job on completing tasks! 🎉 Which reminder would you like to mark as complete? You can tell me the name or I can show you your active reminders.",
        suggestions: ["Show my reminders", "Mark all overdue as complete", "Create a new reminder"]
      };
    }

    // Handle help
    if (lowerMessage.includes('help') || lowerMessage.includes('what can you do')) {
      return {
        content: `I'm ${assistant.name}, and I'm here to make managing reminders fun and easy! ${assistant.avatar}\n\nI can help you:\n• Create reminders with natural language\n• Show your upcoming tasks\n• Find overdue reminders\n• Organize by priority\n• Set recurring reminders\n• And much more!\n\nJust tell me what you need in plain English!`,
        suggestions: [
          "Create a reminder for tomorrow",
          "Show my overdue reminders", 
          "What's due today?",
          "Help me organize my tasks"
        ]
      };
    }

    // Default response
    const responses = [
      `I'm ${assistant.name} and I'm here to help! ${assistant.avatar} Could you tell me more about what you'd like to do with your reminders?`,
      `That's interesting! As your ${assistant.personality} assistant, I'd love to help you with your reminders. What would you like to do?`,
      `I'm not quite sure what you mean, but I'm eager to help! ${assistant.avatar} Try asking me to create a reminder, show your tasks, or ask what I can do!`
    ];

    return {
      content: responses[Math.floor(Math.random() * responses.length)],
      suggestions: [
        "Create a reminder",
        "Show my reminders", 
        "What can you do?",
        "Help me organize"
      ]
    };
  };

  const handleSendMessage = async (messageText?: string) => {
    const text = messageText || inputMessage.trim();
    if (!text) return;

    // Add user message
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: text,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsTyping(true);

    // Simulate typing delay
    setTimeout(async () => {
      const response = await generateResponse(text);
      
      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: response.content,
        timestamp: new Date(),
        suggestions: response.suggestions
      };

      setMessages(prev => [...prev, assistantMessage]);
      setIsTyping(false);
    }, 1000 + Math.random() * 1000); // Random delay for realism
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="card-fun max-w-2xl w-full h-[600px] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between mb-4 pb-4 border-b-2 border-opacity-20" style={{ borderColor: 'var(--color-primary)' }}>
          <div className="flex items-center gap-3">
            <div className="text-3xl">{assistant.avatar}</div>
            <div>
              <h2 className="text-2xl font-bold rainbow-text">{assistant.name}</h2>
              <p className="text-sm opacity-75">Your {assistant.personality} assistant</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 p-2 rounded-full hover:bg-gray-100 transition-all"
          >
            <X size={24} />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto space-y-4 mb-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-[80%] rounded-2xl p-4 ${
                message.type === 'user'
                  ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white'
                  : 'bg-white shadow-lg border-2 border-opacity-20'
              }`} style={message.type === 'assistant' ? { borderColor: 'var(--color-primary)' } : {}}>
                <div className="flex items-start gap-2">
                  {message.type === 'assistant' && (
                    <div className="text-xl flex-shrink-0">{assistant.avatar}</div>
                  )}
                  {message.type === 'user' && (
                    <User size={20} className="flex-shrink-0 mt-1" />
                  )}
                  <div className="flex-1">
                    <p className="whitespace-pre-line">{message.content}</p>
                    <p className="text-xs opacity-60 mt-2">
                      {format(message.timestamp, 'h:mm a')}
                    </p>
                  </div>
                </div>
                
                {/* Suggestions */}
                {message.suggestions && message.suggestions.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-opacity-20" style={{ borderColor: 'var(--color-primary)' }}>
                    <p className="text-xs opacity-60 mb-2">Quick actions:</p>
                    <div className="flex flex-wrap gap-2">
                      {message.suggestions.map((suggestion, index) => (
                        <button
                          key={index}
                          onClick={() => handleSendMessage(suggestion)}
                          className="text-xs px-3 py-1 rounded-full bg-opacity-20 hover:bg-opacity-30 transition-all"
                          style={{ backgroundColor: 'var(--color-primary)' }}
                        >
                          {suggestion}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
          
          {/* Typing indicator */}
          {isTyping && (
            <div className="flex justify-start">
              <div className="bg-white shadow-lg border-2 border-opacity-20 rounded-2xl p-4" style={{ borderColor: 'var(--color-primary)' }}>
                <div className="flex items-center gap-2">
                  <div className="text-xl">{assistant.avatar}</div>
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <textarea
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={`Ask ${assistant.name} anything about your reminders...`}
              className="input-field resize-none pr-12"
              rows={2}
              disabled={isTyping}
            />
            {recognitionRef.current && (
              <button
                onClick={isListening ? stopListening : startListening}
                className={`absolute right-3 top-3 p-1 rounded-lg transition-all ${
                  isListening 
                    ? 'bg-red-100 text-red-600 wiggle' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
                title={isListening ? 'Stop listening' : 'Voice input'}
              >
                {isListening ? <MicOff size={16} /> : <Mic size={16} />}
              </button>
            )}
          </div>
          <button
            onClick={() => handleSendMessage()}
            disabled={!inputMessage.trim() || isTyping}
            className="btn-fun px-6 flex items-center gap-2"
          >
            <Send size={16} />
            Send
          </button>
        </div>
      </div>
    </div>
  );
};