export interface Reminder {
  id: string;
  title: string;
  description?: string;
  dueDate: Date;
  priority: 'low' | 'medium' | 'high';
  category: string;
  isCompleted: boolean;
  isRecurring: boolean;
  recurringType?: 'daily' | 'weekly' | 'monthly' | 'yearly';
  recurringInterval?: number;
  createdAt: Date;
  updatedAt: Date;
  notificationEnabled: boolean;
}

export interface ReminderFormData {
  title: string;
  description: string;
  dueDate: string;
  dueTime: string;
  priority: 'low' | 'medium' | 'high';
  category: string;
  isRecurring: boolean;
  recurringType: 'daily' | 'weekly' | 'monthly' | 'yearly';
  recurringInterval: number;
  notificationEnabled: boolean;
}

export interface Category {
  id: string;
  name: string;
  color: string;
  icon: string;
}

export interface FilterOptions {
  category?: string;
  priority?: 'low' | 'medium' | 'high';
  status?: 'all' | 'pending' | 'completed';
  dateRange?: 'today' | 'week' | 'month' | 'all';
}

export interface NotificationPermission {
  granted: boolean;
  requested: boolean;
}