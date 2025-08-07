# 🎯 ReMindMe - Your Smart Reminder App

A delightful, feature-rich reminder app built with React, TypeScript, and lots of love! ✨

## 🌟 Features

### ✨ **Core Reminders**
- **Customizable reminders** with name, time, date, and notes
- **Color tags** (15+ beautiful colors) and **emoji tags** (45+ fun emojis)
- **Priority levels** (High 🔴, Medium 🟡, Low 🟢)
- **Recurring reminders** (daily, weekly, monthly, yearly)
- **Smart notifications** with browser alerts

### 🎨 **Themes & Customization**
- **5 Built-in themes:**
  - 🌿 **Cottagecore** - Rustic and cozy
  - ✨ **Starlight** - Dark and mystical
  - 🌸 **Pastel Dream** - Soft and dreamy
  - ⚡ **Neon Vibes** - Bold and electric
  - 💅 **Comic Sans Vibes** - Fun and playful

- **Custom URL themes** - Add any theme from a URL!
- **Comic Sans Mode** toggle for extra fun 💅
- **Simple Mode** for easier use
- **Large Text Mode** for better accessibility

### 🤖 **AI Assistant**
- **Personalized AI chatbot** (customizable name, personality, avatar)
- **Natural language processing** - "Remind me to call mom tomorrow at 2pm"
- **Smart reminder creation** from text
- **Voice input support** (where available)
- **Context-aware responses** based on your reminders

### ⚡ **Quick Actions**
- **One-click templates** for common reminders:
  - ☕ Coffee break (15 min)
  - 💼 Meeting reminder (1 hour)
  - 💊 Take medicine (30 min)
  - 🛒 Buy groceries (1 day)
  - 💪 Workout time (1 hour)
  - 📞 Make important call (30 min)
- **Custom quick reminders** with flexible timing

### 🎵 **Multimedia Features**
- **YouTube sound integration** - Custom notification sounds from YouTube!
- **Voice memos** - Record audio notes for reminders
- **Photo attachments** - Add images from gallery or camera
- **Audio playback** controls for voice memos

### 📅 **Google Calendar Sync**
- **Import calendar events** as reminders
- **Export reminders** to Google Calendar
- **Auto-sync options** for seamless integration
- **Privacy-focused** connection management

### 👥 **Sharing & Collaboration**
- **Share reminders** via multiple methods:
  - 📎 Shareable links
  - 📱 QR codes (with download option)
  - 📧 Email integration
  - 💬 SMS/WhatsApp sharing
  - 🐦 Social media sharing
- **Cross-platform compatibility**

### 🎯 **Smart Organization**
- **Advanced search** and filtering
- **Priority-based sorting**
- **Status filtering** (pending/completed)
- **Date-based organization** (today, tomorrow, overdue)
- **Visual indicators** for different reminder types

### 💾 **Data Management**
- **Local storage** - Everything saved on your device
- **Offline functionality** - Works without internet
- **Data persistence** - Never lose your reminders
- **Export/import** capabilities

### 🎪 **Fun UI Elements**
- **Bright, colorful design** with big buttons
- **Emoji-rich interface** 🎉
- **Smooth animations** and transitions
- **Interactive elements** with hover effects
- **Rainbow text effects** and fun styling

## 🚀 Getting Started

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn

### Installation

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd remindme
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the development server:**
   ```bash
   npm start
   ```

4. **Open your browser:**
   Navigate to `http://localhost:3000`

### Building for Production

```bash
npm run build
```

## 🎨 Creating Custom Themes

Create a JSON file with this structure:

```json
{
  "id": "my_awesome_theme",
  "name": "🎨 My Awesome Theme",
  "colors": {
    "primary": "#FF6B6B",
    "secondary": "#4ECDC4", 
    "background": "#FFFFFF",
    "surface": "#F8F9FA",
    "text": "#2C3E50",
    "accent": "#E74C3C"
  },
  "fonts": {
    "primary": "Arial, sans-serif",
    "secondary": "Georgia, serif"
  },
  "customCSS": "/* Optional custom CSS */"
}
```

Host it online (GitHub Gist, Pastebin, etc.) and add the URL in Theme Manager!

## 🤖 AI Assistant Usage

Talk to your AI assistant naturally:

- **"Remind me to call mom tomorrow at 2pm"**
- **"Show my overdue reminders"**
- **"What's due today?"**
- **"Create a meeting reminder for next week"**
- **"Help me organize my tasks"**

The AI understands context and can create smart reminders with appropriate emojis, colors, and priorities!

## 📱 Mobile & PWA Features

- **Responsive design** works on all devices
- **Touch-friendly** interface
- **PWA capabilities** for app-like experience
- **Mobile notifications** (where supported)

## 🔧 Technical Features

- **React 18** with TypeScript
- **Tailwind CSS** for styling
- **Local Storage** for data persistence
- **Web APIs** for notifications, speech recognition, media
- **Modern ES6+** JavaScript features
- **Component-based architecture**

## 🎯 Usage Tips

1. **Start with Quick Actions** for instant reminders
2. **Use the AI Assistant** for natural language input
3. **Customize themes** to match your style
4. **Enable notifications** for better reminder management
5. **Try voice memos** for detailed reminder notes
6. **Share reminders** with friends and family
7. **Sync with Google Calendar** for unified scheduling

## 🌟 What Makes ReMindMe Special?

- **🎨 Beautiful & Fun** - Designed to make task management enjoyable
- **🤖 AI-Powered** - Smart assistant that understands you
- **🎵 Multimedia Rich** - Voice, photos, custom sounds
- **🌍 Shareable** - Easy collaboration with others
- **⚡ Lightning Fast** - Quick actions for instant productivity
- **🎭 Highly Customizable** - Themes, settings, and personalization
- **📱 Universal** - Works everywhere, offline-first

## 🤝 Contributing

We love contributions! Whether it's:
- 🐛 Bug fixes
- ✨ New features
- 🎨 Theme contributions
- 📚 Documentation improvements
- 🌍 Translations

## 📄 License

This project is licensed under the MIT License.

## 💝 Acknowledgments

Built with love using:
- React & TypeScript
- Tailwind CSS
- Lucide React Icons
- date-fns for date handling
- And lots of coffee ☕

---

**Made with ❤️ for everyone who wants to stay organized while having fun!** 🎉

*Remember: Life's too short for boring reminder apps!* ✨
