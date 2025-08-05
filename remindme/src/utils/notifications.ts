export const requestNotificationPermission = async (): Promise<boolean> => {
  if (!('Notification' in window)) {
    console.log('This browser does not support notifications');
    return false;
  }

  if (Notification.permission === 'granted') {
    return true;
  }

  if (Notification.permission === 'denied') {
    return false;
  }

  const permission = await Notification.requestPermission();
  return permission === 'granted';
};

export const showNotification = (title: string, options?: NotificationOptions): void => {
  if (Notification.permission === 'granted') {
    new Notification(title, {
      icon: '/favicon.ico',
      badge: '/favicon.ico',
      ...options,
    });
  }
};

export const scheduleNotification = (reminder: { title: string; dueDate: Date; description?: string }) => {
  const now = new Date();
  const timeUntilDue = reminder.dueDate.getTime() - now.getTime();

  if (timeUntilDue > 0) {
    setTimeout(() => {
      showNotification(`Reminder: ${reminder.title}`, {
        body: reminder.description || 'You have a reminder due now!',
        tag: `reminder-${reminder.title}`,
      });
    }, timeUntilDue);
  }
};