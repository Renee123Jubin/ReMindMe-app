import { Reminder, Category } from '../types';

const REMINDERS_KEY = 'remindme_reminders';
const CATEGORIES_KEY = 'remindme_categories';

export const saveReminders = (reminders: Reminder[]): void => {
  localStorage.setItem(REMINDERS_KEY, JSON.stringify(reminders));
};

export const loadReminders = (): Reminder[] => {
  const data = localStorage.getItem(REMINDERS_KEY);
  if (!data) return [];
  
  return JSON.parse(data).map((reminder: any) => ({
    ...reminder,
    dueDate: new Date(reminder.dueDate),
    createdAt: new Date(reminder.createdAt),
    updatedAt: new Date(reminder.updatedAt),
  }));
};

export const saveCategories = (categories: Category[]): void => {
  localStorage.setItem(CATEGORIES_KEY, JSON.stringify(categories));
};

export const loadCategories = (): Category[] => {
  const data = localStorage.getItem(CATEGORIES_KEY);
  if (!data) {
    // Default categories
    const defaultCategories: Category[] = [
      { id: '1', name: 'Personal', color: '#3b82f6', icon: 'User' },
      { id: '2', name: 'Work', color: '#ef4444', icon: 'Briefcase' },
      { id: '3', name: 'Health', color: '#10b981', icon: 'Heart' },
      { id: '4', name: 'Shopping', color: '#f59e0b', icon: 'ShoppingCart' },
    ];
    saveCategories(defaultCategories);
    return defaultCategories;
  }
  
  return JSON.parse(data);
};