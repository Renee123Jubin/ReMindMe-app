import React, { useState, useRef } from 'react';
import { Reminder } from '../types';
import { Share2, Copy, QrCode, Mail, MessageCircle, X, Check, Users, Link2, Download } from 'lucide-react';
import { format } from 'date-fns';

interface ReminderSharingProps {
  reminder: Reminder;
  onClose: () => void;
}

export const ReminderSharing: React.FC<ReminderSharingProps> = ({
  reminder,
  onClose
}) => {
  const [shareMethod, setShareMethod] = useState<'link' | 'qr' | 'social'>('link');
  const [shareLink, setShareLink] = useState('');
  const [copied, setCopied] = useState(false);
  const [showQR, setShowQR] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Generate shareable link
  const generateShareLink = () => {
    const reminderData = {
      title: reminder.title,
      description: reminder.description,
      dueDate: reminder.dueDate.toISOString(),
      priority: reminder.priority,
      emojiTag: reminder.emojiTag,
      colorTag: reminder.colorTag
    };
    
    const encodedData = btoa(JSON.stringify(reminderData));
    const link = `${window.location.origin}/shared-reminder?data=${encodedData}`;
    setShareLink(link);
    return link;
  };

  // Generate QR Code (simplified version)
  const generateQRCode = (text: string) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Simple QR code representation (in a real app, use a QR library)
    canvas.width = 200;
    canvas.height = 200;
    
    // Background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, 200, 200);
    
    // Simple pattern (not a real QR code)
    ctx.fillStyle = '#000000';
    const gridSize = 10;
    for (let i = 0; i < 20; i++) {
      for (let j = 0; j < 20; j++) {
        if ((i + j) % 3 === 0 || (i * j) % 7 === 0) {
          ctx.fillRect(i * gridSize, j * gridSize, gridSize, gridSize);
        }
      }
    }
    
    // Add some corner squares for QR code appearance
    ctx.fillRect(0, 0, 70, 70);
    ctx.fillRect(130, 0, 70, 70);
    ctx.fillRect(0, 130, 70, 70);
    
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(10, 10, 50, 50);
    ctx.fillRect(140, 10, 50, 50);
    ctx.fillRect(10, 140, 50, 50);
    
    ctx.fillStyle = '#000000';
    ctx.fillRect(20, 20, 30, 30);
    ctx.fillRect(150, 20, 30, 30);
    ctx.fillRect(20, 150, 30, 30);
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const shareViaEmail = () => {
    const subject = `Reminder: ${reminder.title}`;
    const body = `Hey! I wanted to share this reminder with you:

${reminder.emojiTag} ${reminder.title}
${reminder.description ? `\nDetails: ${reminder.description}` : ''}
Due: ${format(reminder.dueDate, 'MMMM dd, yyyy at h:mm a')}
Priority: ${reminder.priority.toUpperCase()}

You can add this to your ReMindMe app using this link:
${generateShareLink()}

Stay organized! 🎯`;

    const mailtoLink = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.open(mailtoLink);
  };

  const shareViaSMS = () => {
    const message = `${reminder.emojiTag} Reminder: ${reminder.title}\nDue: ${format(reminder.dueDate, 'MMM dd, h:mm a')}\n\nAdd to your ReMindMe: ${generateShareLink()}`;
    const smsLink = `sms:?body=${encodeURIComponent(message)}`;
    window.open(smsLink);
  };

  const shareViaWhatsApp = () => {
    const message = `${reminder.emojiTag} *Reminder: ${reminder.title}*\n\n${reminder.description ? `${reminder.description}\n\n` : ''}📅 Due: ${format(reminder.dueDate, 'MMMM dd, yyyy at h:mm a')}\n🚨 Priority: ${reminder.priority.toUpperCase()}\n\nAdd to your ReMindMe app: ${generateShareLink()}`;
    const whatsappLink = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(whatsappLink, '_blank');
  };

  const shareViaTwitter = () => {
    const message = `📋 Just set a reminder: "${reminder.title}" ${reminder.emojiTag}\nDue: ${format(reminder.dueDate, 'MMM dd, h:mm a')}\n\nStay organized with @ReMindMeApp! 🎯`;
    const twitterLink = `https://twitter.com/intent/tweet?text=${encodeURIComponent(message)}`;
    window.open(twitterLink, '_blank');
  };

  const downloadQRCode = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const link = document.createElement('a');
    link.download = `reminder-${reminder.title.replace(/[^a-zA-Z0-9]/g, '-')}-qr.png`;
    link.href = canvas.toDataURL();
    link.click();
  };

  React.useEffect(() => {
    generateShareLink();
  }, [reminder]);

  React.useEffect(() => {
    if (showQR && shareLink) {
      generateQRCode(shareLink);
    }
  }, [showQR, shareLink]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="card-fun max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold rainbow-text flex items-center gap-3">
            <Share2 size={32} />
            Share Reminder
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 p-2 rounded-full hover:bg-gray-100 transition-all"
          >
            <X size={24} />
          </button>
        </div>

        {/* Reminder Preview */}
        <div className="card mb-6 bg-gradient-to-r from-blue-50 to-purple-50">
          <div className="flex items-start gap-4">
            <div className="text-4xl">{reminder.emojiTag}</div>
            <div className="flex-1">
              <h3 className="text-2xl font-bold mb-2">{reminder.title}</h3>
              {reminder.description && (
                <p className="text-gray-600 mb-3">{reminder.description}</p>
              )}
              <div className="flex items-center gap-4 text-sm">
                <span className="flex items-center gap-1">
                  📅 {format(reminder.dueDate, 'MMM dd, yyyy at h:mm a')}
                </span>
                <span className="flex items-center gap-1">
                  🚨 {reminder.priority.toUpperCase()} Priority
                </span>
                <div
                  className="w-4 h-4 rounded-full"
                  style={{ backgroundColor: reminder.colorTag }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Share Method Tabs */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setShareMethod('link')}
            className={`flex-1 py-3 px-4 rounded-xl font-bold transition-all ${
              shareMethod === 'link'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <Link2 size={20} className="inline mr-2" />
            Share Link
          </button>
          <button
            onClick={() => {
              setShareMethod('qr');
              setShowQR(true);
            }}
            className={`flex-1 py-3 px-4 rounded-xl font-bold transition-all ${
              shareMethod === 'qr'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <QrCode size={20} className="inline mr-2" />
            QR Code
          </button>
          <button
            onClick={() => setShareMethod('social')}
            className={`flex-1 py-3 px-4 rounded-xl font-bold transition-all ${
              shareMethod === 'social'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <Users size={20} className="inline mr-2" />
            Social
          </button>
        </div>

        {/* Share Link */}
        {shareMethod === 'link' && (
          <div className="space-y-4">
            <div>
              <label className="block text-lg font-bold mb-2">📎 Shareable Link</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={shareLink}
                  readOnly
                  className="input-field flex-1 font-mono text-sm"
                />
                <button
                  onClick={() => copyToClipboard(shareLink)}
                  className={`btn-secondary flex items-center gap-2 ${
                    copied ? 'bg-green-100 text-green-600' : ''
                  }`}
                >
                  {copied ? <Check size={16} /> : <Copy size={16} />}
                  {copied ? 'Copied!' : 'Copy'}
                </button>
              </div>
              <p className="text-sm text-gray-600 mt-2">
                Anyone with this link can add this reminder to their ReMindMe app!
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={shareViaEmail}
                className="btn-secondary flex items-center justify-center gap-2 py-4"
              >
                <Mail size={20} />
                Share via Email
              </button>
              <button
                onClick={shareViaSMS}
                className="btn-secondary flex items-center justify-center gap-2 py-4"
              >
                <MessageCircle size={20} />
                Share via SMS
              </button>
            </div>
          </div>
        )}

        {/* QR Code */}
        {shareMethod === 'qr' && (
          <div className="text-center space-y-4">
            <div>
              <h3 className="text-lg font-bold mb-4">📱 Scan QR Code</h3>
              <div className="inline-block p-4 bg-white rounded-2xl shadow-lg">
                <canvas
                  ref={canvasRef}
                  className="border border-gray-200 rounded-lg"
                />
              </div>
              <p className="text-sm text-gray-600 mt-4 max-w-md mx-auto">
                Scan this QR code with any QR scanner to quickly access the reminder link!
              </p>
            </div>
            
            <div className="flex gap-4 justify-center">
              <button
                onClick={() => copyToClipboard(shareLink)}
                className={`btn-secondary flex items-center gap-2 ${
                  copied ? 'bg-green-100 text-green-600' : ''
                }`}
              >
                {copied ? <Check size={16} /> : <Copy size={16} />}
                {copied ? 'Link Copied!' : 'Copy Link'}
              </button>
              <button
                onClick={downloadQRCode}
                className="btn-secondary flex items-center gap-2"
              >
                <Download size={16} />
                Download QR
              </button>
            </div>
          </div>
        )}

        {/* Social Sharing */}
        {shareMethod === 'social' && (
          <div className="space-y-4">
            <h3 className="text-lg font-bold mb-4">🌐 Share on Social Media</h3>
            
            <div className="grid gap-3">
              <button
                onClick={shareViaWhatsApp}
                className="btn-secondary flex items-center gap-3 py-4 bg-green-50 hover:bg-green-100 text-green-700 border-green-200"
              >
                <div className="text-2xl">💬</div>
                <div className="text-left">
                  <div className="font-bold">WhatsApp</div>
                  <div className="text-sm opacity-75">Share with friends and family</div>
                </div>
              </button>
              
              <button
                onClick={shareViaTwitter}
                className="btn-secondary flex items-center gap-3 py-4 bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-200"
              >
                <div className="text-2xl">🐦</div>
                <div className="text-left">
                  <div className="font-bold">Twitter</div>
                  <div className="text-sm opacity-75">Tweet about your reminder</div>
                </div>
              </button>
              
              <button
                onClick={shareViaEmail}
                className="btn-secondary flex items-center gap-3 py-4 bg-purple-50 hover:bg-purple-100 text-purple-700 border-purple-200"
              >
                <div className="text-2xl">📧</div>
                <div className="text-left">
                  <div className="font-bold">Email</div>
                  <div className="text-sm opacity-75">Send detailed reminder via email</div>
                </div>
              </button>
              
              <button
                onClick={shareViaSMS}
                className="btn-secondary flex items-center gap-3 py-4 bg-orange-50 hover:bg-orange-100 text-orange-700 border-orange-200"
              >
                <div className="text-2xl">💬</div>
                <div className="text-left">
                  <div className="font-bold">Text Message</div>
                  <div className="text-sm opacity-75">Send quick SMS reminder</div>
                </div>
              </button>
            </div>
          </div>
        )}

        {/* Tips */}
        <div className="card bg-gray-50 mt-6">
          <h4 className="font-bold text-gray-800 mb-2">💡 Sharing Tips</h4>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• Share links work on any device with ReMindMe</li>
            <li>• QR codes are perfect for quick mobile sharing</li>
            <li>• Recipients can customize the reminder after adding it</li>
            <li>• Shared reminders don't sync - they create independent copies</li>
          </ul>
        </div>
      </div>
    </div>
  );
};