// utils/date.ts

/**
 * Только время: 14:30
 */
export const formatTime24 = (dateInput: string | Date) => {
  const date = new Date(dateInput);
  return new Intl.DateTimeFormat([], {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(date);
};

/**
 * Метка дня для разделителя: "Сегодня", "Понедельник" или "25 марта"
 */
export const formatDateLabel = (dateInput: string | Date) => {
  const date = new Date(dateInput);
  const now = new Date();
  
  // Обнуляем время для сравнения только дат
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const target = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  
  const diffInDays = Math.floor((today.getTime() - target.getTime()) / (1000 * 60 * 60 * 24));

  if (diffInDays === 0) return 'Сегодня';
  if (diffInDays === 1) return 'Вчера';
  if (diffInDays < 7) {
    // Название дня недели (например, "Понедельник")
    return new Intl.DateTimeFormat('ru-RU', { weekday: 'long' }).format(date);
  }
  
  // Если прошло больше недели: "25 марта"
  return new Intl.DateTimeFormat('ru-RU', { day: 'numeric', month: 'long' }).format(date);
};

/**
 * Только число и месяц: 25 мар.
 */
export const formatShortDate = (dateInput: string | Date) => {
  const date = new Date(dateInput);
  return new Intl.DateTimeFormat('ru-RU', {
    day: 'numeric',
    month: 'short',
  }).format(date);
};