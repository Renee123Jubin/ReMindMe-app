import React, { useState, useRef } from 'react';
import { Reminder, ReminderFormData } from '../types';
import { getEmojiTags, getColorTags } from '../utils/themes';
import { Calendar, Clock, Mic, Camera, Youtube, Palette, Smile, Save, X, Play, Pause } from 'lucide-react';
import { format } from 'date-fns';

interface ReminderFormProps {
  onSave: (reminder: Omit<Reminder, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onCancel: () => void;
  initialData?: Partial<Reminder>;
  isEditing?: boolean;
}

export const ReminderForm: React.FC<ReminderFormProps> = ({
  onSave,
  onCancel,
  initialData,
  isEditing = false
}) => {
  const [formData, setFormData] = useState<ReminderFormData>({
    title: initialData?.title || '',
    description: initialData?.description || '',
    dueDate: initialData?.dueDate ? format(initialData.dueDate, 'yyyy-MM-dd') : '',
    dueTime: initialData?.dueDate ? format(initialData.dueDate, 'HH:mm') : '',
    priority: initialData?.priority || 'medium',
    colorTag: initialData?.colorTag || '#FFB6C1',
    emojiTag: initialData?.emojiTag || '⭐',
    isRecurring: initialData?.isRecurring || false,
    recurringType: initialData?.recurringType || 'daily',
    recurringInterval: initialData?.recurringInterval || 1,
    notificationEnabled: initialData?.notificationEnabled ?? true,
    youtubeSound: initialData?.youtubeSound || '',
  });

  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [voiceMemo, setVoiceMemo] = useState<string | null>(initialData?.voiceMemo || null);
  const [photos, setPhotos] = useState<string[]>(initialData?.photos || []);
  const [isPlayingSound, setIsPlayingSound] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const emojiTags = getEmojiTags();
  const colorTags = getColorTags();

  const handleInputChange = (field: keyof ReminderFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        const audioUrl = URL.createObjectURL(audioBlob);
        setVoiceMemo(audioUrl);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error('Error starting recording:', error);
      alert('Could not access microphone. Please check permissions.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      Array.from(files).forEach(file => {
        const reader = new FileReader();
        reader.onload = (e) => {
          if (e.target?.result) {
            setPhotos(prev => [...prev, e.target!.result as string]);
          }
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const removePhoto = (index: number) => {
    setPhotos(prev => prev.filter((_, i) => i !== index));
  };

  const testYouTubeSound = async () => {
    if (!formData.youtubeSound) return;
    
    setIsPlayingSound(true);
    // This is a simplified version - in a real app you'd use YouTube API
    // For now, we'll just show the preview
    setTimeout(() => setIsPlayingSound(false), 3000);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      alert('Please enter a reminder title! 📝');
      return;
    }

    if (!formData.dueDate || !formData.dueTime) {
      alert('Please set a date and time! ⏰');
      return;
    }

    const dueDateTime = new Date(`${formData.dueDate}T${formData.dueTime}`);
    
    if (dueDateTime <= new Date()) {
      alert('Please set a future date and time! 🚀');
      return;
    }

    const reminderData: Omit<Reminder, 'id' | 'createdAt' | 'updatedAt'> = {
      title: formData.title.trim(),
      description: formData.description.trim(),
      dueDate: dueDateTime,
      priority: formData.priority,
      colorTag: formData.colorTag,
      emojiTag: formData.emojiTag,
      isCompleted: false,
      isRecurring: formData.isRecurring,
      recurringType: formData.isRecurring ? formData.recurringType : undefined,
      recurringInterval: formData.isRecurring ? formData.recurringInterval : undefined,
      notificationEnabled: formData.notificationEnabled,
      youtubeSound: formData.youtubeSound.trim() || undefined,
      voiceMemo: voiceMemo || undefined,
      photos: photos.length > 0 ? photos : undefined,
    };

    onSave(reminderData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="card-fun max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold rainbow-text">
            {isEditing ? '✏️ Edit Reminder' : '✨ Create New Reminder'}
          </h2>
          <button
            onClick={onCancel}
            className="text-gray-500 hover:text-gray-700 p-2 rounded-full hover:bg-gray-100 transition-all"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title */}
          <div>
            <label className="block text-lg font-bold mb-2 flex items-center gap-2">
              📝 Reminder Title
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              placeholder="What do you need to remember? 🤔"
              className="input-field"
              maxLength={100}
            />
          </div>

          {/* Emoji and Color Tags */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-lg font-bold mb-2">🎨 Color Tag</label>
              <div className="flex items-center gap-2">
                <div
                  className="w-12 h-12 rounded-full border-4 border-white shadow-lg cursor-pointer"
                  style={{ backgroundColor: formData.colorTag }}
                  onClick={() => setShowColorPicker(!showColorPicker)}
                />
                <button
                  type="button"
                  onClick={() => setShowColorPicker(!showColorPicker)}
                  className="btn-secondary flex items-center gap-2"
                >
                  <Palette size={16} />
                  Pick Color
                </button>
              </div>
              
              {showColorPicker && (
                <div className="color-picker mt-2">
                  {colorTags.map((color) => (
                    <div
                      key={color}
                      className={`color-option ${formData.colorTag === color ? 'selected' : ''}`}
                      style={{ backgroundColor: color }}
                      onClick={() => {
                        handleInputChange('colorTag', color);
                        setShowColorPicker(false);
                      }}
                    />
                  ))}
                </div>
              )}
            </div>

            <div>
              <label className="block text-lg font-bold mb-2">😀 Emoji Tag</label>
              <div className="flex items-center gap-2">
                <div className="w-12 h-12 flex items-center justify-center text-2xl bg-white rounded-xl border-2 border-gray-300">
                  {formData.emojiTag}
                </div>
                <button
                  type="button"
                  onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                  className="btn-secondary flex items-center gap-2"
                >
                  <Smile size={16} />
                  Pick Emoji
                </button>
              </div>
              
              {showEmojiPicker && (
                <div className="emoji-picker mt-2">
                  {emojiTags.map((emoji) => (
                    <div
                      key={emoji}
                      className="emoji-option"
                      onClick={() => {
                        handleInputChange('emojiTag', emoji);
                        setShowEmojiPicker(false);
                      }}
                    >
                      {emoji}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Date and Time */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-lg font-bold mb-2 flex items-center gap-2">
                <Calendar size={20} />
                Date
              </label>
              <input
                type="date"
                value={formData.dueDate}
                onChange={(e) => handleInputChange('dueDate', e.target.value)}
                className="input-field"
                min={format(new Date(), 'yyyy-MM-dd')}
              />
            </div>
            <div>
              <label className="block text-lg font-bold mb-2 flex items-center gap-2">
                <Clock size={20} />
                Time
              </label>
              <input
                type="time"
                value={formData.dueTime}
                onChange={(e) => handleInputChange('dueTime', e.target.value)}
                className="input-field"
              />
            </div>
          </div>

          {/* Priority */}
          <div>
            <label className="block text-lg font-bold mb-2">🚨 Priority Level</label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { value: 'low', label: '🟢 Low', color: 'bg-green-100 border-green-300' },
                { value: 'medium', label: '🟡 Medium', color: 'bg-yellow-100 border-yellow-300' },
                { value: 'high', label: '🔴 High', color: 'bg-red-100 border-red-300' }
              ].map((priority) => (
                <button
                  key={priority.value}
                  type="button"
                  onClick={() => handleInputChange('priority', priority.value)}
                  className={`p-3 rounded-xl border-2 font-bold transition-all ${
                    formData.priority === priority.value 
                      ? `${priority.color} scale-105` 
                      : 'bg-gray-100 border-gray-300 hover:scale-105'
                  }`}
                >
                  {priority.label}
                </button>
              ))}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-lg font-bold mb-2">📄 Notes (Optional)</label>
            <textarea
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Add any extra details here... 📝"
              className="input-field resize-none"
              rows={3}
              maxLength={500}
            />
          </div>

          {/* YouTube Sound */}
          <div>
            <label className="block text-lg font-bold mb-2 flex items-center gap-2">
              <Youtube size={20} />
              Custom Sound (YouTube URL)
            </label>
            <div className="flex gap-2">
              <input
                type="url"
                value={formData.youtubeSound}
                onChange={(e) => handleInputChange('youtubeSound', e.target.value)}
                placeholder="https://youtube.com/watch?v=..."
                className="input-field flex-1"
              />
              <button
                type="button"
                onClick={testYouTubeSound}
                disabled={!formData.youtubeSound || isPlayingSound}
                className="btn-secondary flex items-center gap-2"
              >
                {isPlayingSound ? <Pause size={16} /> : <Play size={16} />}
                {isPlayingSound ? 'Playing...' : 'Test'}
              </button>
            </div>
          </div>

          {/* Voice Memo */}
          <div>
            <label className="block text-lg font-bold mb-2 flex items-center gap-2">
              <Mic size={20} />
              Voice Memo
            </label>
            <div className="flex gap-2 items-center">
              <button
                type="button"
                onClick={isRecording ? stopRecording : startRecording}
                className={`btn-fun flex items-center gap-2 ${isRecording ? 'wiggle' : ''}`}
              >
                <Mic size={16} />
                {isRecording ? '🔴 Stop Recording' : '🎤 Start Recording'}
              </button>
              {voiceMemo && (
                <div className="flex items-center gap-2">
                  <audio controls src={voiceMemo} className="h-10" />
                  <button
                    type="button"
                    onClick={() => setVoiceMemo(null)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <X size={16} />
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Photos */}
          <div>
            <label className="block text-lg font-bold mb-2 flex items-center gap-2">
              <Camera size={20} />
              Photos
            </label>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handlePhotoUpload}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="btn-secondary flex items-center gap-2"
            >
              <Camera size={16} />
              Add Photos
            </button>
            
            {photos.length > 0 && (
              <div className="grid grid-cols-3 gap-2 mt-3">
                {photos.map((photo, index) => (
                  <div key={index} className="relative">
                    <img
                      src={photo}
                      alt={`Photo ${index + 1}`}
                      className="w-full h-20 object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => removePhoto(index)}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recurring */}
          <div>
            <label className="flex items-center gap-3 text-lg font-bold">
              <input
                type="checkbox"
                checked={formData.isRecurring}
                onChange={(e) => handleInputChange('isRecurring', e.target.checked)}
                className="w-5 h-5 text-pink-600 rounded focus:ring-pink-500"
              />
              🔄 Make this recurring
            </label>
            
            {formData.isRecurring && (
              <div className="mt-3 grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Repeat every:</label>
                  <input
                    type="number"
                    min="1"
                    max="365"
                    value={formData.recurringInterval}
                    onChange={(e) => handleInputChange('recurringInterval', parseInt(e.target.value))}
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Period:</label>
                  <select
                    value={formData.recurringType}
                    onChange={(e) => handleInputChange('recurringType', e.target.value)}
                    className="input-field"
                  >
                    <option value="daily">Day(s)</option>
                    <option value="weekly">Week(s)</option>
                    <option value="monthly">Month(s)</option>
                    <option value="yearly">Year(s)</option>
                  </select>
                </div>
              </div>
            )}
          </div>

          {/* Notifications */}
          <div>
            <label className="flex items-center gap-3 text-lg font-bold">
              <input
                type="checkbox"
                checked={formData.notificationEnabled}
                onChange={(e) => handleInputChange('notificationEnabled', e.target.checked)}
                className="w-5 h-5 text-pink-600 rounded focus:ring-pink-500"
              />
              🔔 Enable notifications
            </label>
          </div>

          {/* Submit Buttons */}
          <div className="flex gap-4 pt-6">
            <button
              type="submit"
              className="btn-fun flex-1 flex items-center justify-center gap-2"
            >
              <Save size={20} />
              {isEditing ? '💾 Update Reminder' : '✨ Create Reminder'}
            </button>
            <button
              type="button"
              onClick={onCancel}
              className="btn-secondary px-8"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};