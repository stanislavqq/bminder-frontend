export const MONTH_NAMES = [
  '',
  'января',
  'февраля',
  'марта',
  'апреля',
  'мая',
  'июня',
  'июля',
  'августа',
  'сентября',
  'октября',
  'ноября',
  'декабря'
];

export const MONTH_OPTIONS = [
  { value: 1, label: 'Январь' },
  { value: 2, label: 'Февраль' },
  { value: 3, label: 'Март' },
  { value: 4, label: 'Апрель' },
  { value: 5, label: 'Май' },
  { value: 6, label: 'Июнь' },
  { value: 7, label: 'Июль' },
  { value: 8, label: 'Август' },
  { value: 9, label: 'Сентябрь' },
  { value: 10, label: 'Октябрь' },
  { value: 11, label: 'Ноябрь' },
  { value: 12, label: 'Декабрь' }
];

export function daysInMonth(month, year) {
  if (!year) {
    const days = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
    return days[month - 1];
  }
  return new Date(year, month, 0).getDate();
}

export function isValidDate(day, month, year) {
  if (!day || !month) return false;
  const maxDay = daysInMonth(Number(month), year ? Number(year) : 2000);
  return day >= 1 && day <= maxDay;
}

export function getNextBirthday(day, month) {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const year = now.getFullYear();
  let next = new Date(year, month - 1, day);
  if (next < now) {
    next = new Date(year + 1, month - 1, day);
  }
  return next;
}

export function daysUntil(day, month) {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const next = getNextBirthday(day, month);
  return Math.round((next - now) / (1000 * 60 * 60 * 24));
}

export function isToday(day, month) {
  const now = new Date();
  return now.getDate() === Number(day) && now.getMonth() + 1 === Number(month);
}

export function calcAge(day, month, year) {
  if (!year) return null;
  const now = new Date();
  let age = now.getFullYear() - Number(year);
  const hadBirthday =
    now.getMonth() + 1 > Number(month) ||
    (now.getMonth() + 1 === Number(month) && now.getDate() >= Number(day));
  if (!hadBirthday) age -= 1;
  return age;
}

export function formatDate(day, month, year) {
  let str = `${day} ${MONTH_NAMES[Number(month)]}`;
  if (year) str += ` ${year}`;
  return str;
}

export function getInitials(firstName, lastName) {
  const f = (firstName || '?')[0].toUpperCase();
  const l = lastName ? lastName[0].toUpperCase() : '';
  return f + l;
}

export function fullName(person) {
  return [person.firstName, person.lastName].filter(Boolean).join(' ');
}
