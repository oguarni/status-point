/**
 * Date formatting utilities with i18n support
 */

// Portuguese month names
const monthNamesPt = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
];

// English month names (short)
const monthNamesEn = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
];

/**
 * Format a date according to the specified locale
 * @param date - The date to format (Date object, ISO string, or null)
 * @param locale - The locale code (e.g., 'en', 'pt')
 * @returns Formatted date string or empty string if date is null
 */
export const formatDate = (date: Date | string | null | undefined, locale: string = 'en'): string => {
  if (!date) return '';

  const dateObj = typeof date === 'string' ? new Date(date) : date;

  if (isNaN(dateObj.getTime())) return '';

  // Portuguese and Brazilian format: dd/mm/yyyy
  if (locale === 'pt' || locale === 'pt-BR') {
    const day = dateObj.getDate().toString().padStart(2, '0');
    const month = (dateObj.getMonth() + 1).toString().padStart(2, '0');
    const year = dateObj.getFullYear();
    return `${day}/${month}/${year}`;
  }

  // English format: mm/dd/yyyy
  const month = (dateObj.getMonth() + 1).toString().padStart(2, '0');
  const day = dateObj.getDate().toString().padStart(2, '0');
  const year = dateObj.getFullYear();
  return `${month}/${day}/${year}`;
};

/**
 * Format a date with full month name and time
 * Portuguese: "10 de Novembro de 2025, 21:00h"
 * English: "Nov 10, 2025, 09:00 PM"
 * @param date - The date to format
 * @param locale - The locale code
 * @returns Formatted date string with month name and time
 */
export const formatDateWithMonthName = (date: Date | string | null | undefined, locale: string = 'en'): string => {
  if (!date) return '';

  const dateObj = typeof date === 'string' ? new Date(date) : date;

  if (isNaN(dateObj.getTime())) return '';

  const day = dateObj.getDate();
  const monthIndex = dateObj.getMonth();
  const year = dateObj.getFullYear();
  const hours = dateObj.getHours();
  const minutes = dateObj.getMinutes().toString().padStart(2, '0');

  if (locale === 'pt' || locale === 'pt-BR') {
    // Portuguese format: "10 de Novembro de 2025, 21:00h"
    const monthName = monthNamesPt[monthIndex];
    return `${day} de ${monthName} de ${year}, ${hours}:${minutes}h`;
  }

  // English format: "Nov 10, 2025, 09:00 PM"
  const monthName = monthNamesEn[monthIndex];
  const hour12 = hours % 12 || 12;
  const ampm = hours >= 12 ? 'PM' : 'AM';
  return `${monthName} ${day}, ${year}, ${hour12.toString().padStart(2, '0')}:${minutes} ${ampm}`;
};

/**
 * Format just the date with month name (no time)
 * Portuguese: "10 de Novembro de 2025"
 * English: "Nov 10, 2025"
 * @param date - The date to format
 * @param locale - The locale code
 * @returns Formatted date string with month name
 */
export const formatDateLong = (date: Date | string | null | undefined, locale: string = 'en'): string => {
  if (!date) return '';

  const dateObj = typeof date === 'string' ? new Date(date) : date;

  if (isNaN(dateObj.getTime())) return '';

  const day = dateObj.getDate();
  const monthIndex = dateObj.getMonth();
  const year = dateObj.getFullYear();

  if (locale === 'pt' || locale === 'pt-BR') {
    // Portuguese format: "10 de Novembro de 2025"
    const monthName = monthNamesPt[monthIndex];
    return `${day} de ${monthName} de ${year}`;
  }

  // English format: "Nov 10, 2025"
  const monthName = monthNamesEn[monthIndex];
  return `${monthName} ${day}, ${year}`;
};

/**
 * Format a date with time according to the specified locale
 * Portuguese: "dd/mm/aaaa HH:mm'h'" (e.g., "15/11/2025 14:30h")
 * English: "mm/dd/yyyy h:mmAM/PM" (e.g., "11/15/2025 2:30PM")
 * @param date - The date to format (Date object, ISO string, or null)
 * @param locale - The locale code (e.g., 'en', 'pt')
 * @returns Formatted datetime string or empty string if date is null
 */
export const formatDateTime = (date: Date | string | null | undefined, locale: string = 'en'): string => {
  if (!date) return '';

  const dateObj = typeof date === 'string' ? new Date(date) : date;

  if (isNaN(dateObj.getTime())) return '';

  const hours24 = dateObj.getHours();
  const minutes = dateObj.getMinutes().toString().padStart(2, '0');

  // Portuguese and Brazilian format: dd/mm/aaaa HH:mm'h' (24-hour)
  if (locale === 'pt' || locale === 'pt-BR') {
    const day = dateObj.getDate().toString().padStart(2, '0');
    const month = (dateObj.getMonth() + 1).toString().padStart(2, '0');
    const year = dateObj.getFullYear();
    const hours = hours24.toString().padStart(2, '0');
    return `${day}/${month}/${year} ${hours}:${minutes}h`;
  }

  // English format: mm/dd/yyyy h:mmAM/PM (12-hour)
  const month = (dateObj.getMonth() + 1).toString().padStart(2, '0');
  const day = dateObj.getDate().toString().padStart(2, '0');
  const year = dateObj.getFullYear();
  const hours12 = hours24 % 12 || 12; // Convert to 12-hour format (0 becomes 12)
  const ampm = hours24 >= 12 ? 'PM' : 'AM';
  return `${month}/${day}/${year} ${hours12}:${minutes}${ampm}`;
};

/**
 * Convert a date input value (yyyy-mm-dd) to the format expected by the API
 * @param dateStr - The date string from an input field
 * @returns ISO date string
 */
export const toISODate = (dateStr: string): string => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  return date.toISOString();
};

/**
 * Convert an ISO date string to a format suitable for date input (yyyy-mm-dd)
 * @param isoDate - ISO date string or Date object
 * @returns Date string in yyyy-mm-dd format
 */
export const toInputDate = (isoDate: Date | string | null | undefined): string => {
  if (!isoDate) return '';

  const dateObj = typeof isoDate === 'string' ? new Date(isoDate) : isoDate;

  if (isNaN(dateObj.getTime())) return '';

  const year = dateObj.getFullYear();
  const month = (dateObj.getMonth() + 1).toString().padStart(2, '0');
  const day = dateObj.getDate().toString().padStart(2, '0');

  return `${year}-${month}-${day}`;
};

/**
 * Format a relative date (e.g., "2 days ago", "in 3 hours")
 * @param date - The date to format
 * @param locale - The locale code
 * @returns Relative date string
 */
export const formatRelativeDate = (date: Date | string | null | undefined, locale: string = 'en'): string => {
  if (!date) return '';

  const dateObj = typeof date === 'string' ? new Date(date) : date;

  if (isNaN(dateObj.getTime())) return '';

  const now = new Date();
  const diffMs = now.getTime() - dateObj.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (locale === 'pt' || locale === 'pt-BR') {
    if (diffDays === 0) return 'Hoje';
    if (diffDays === 1) return 'Ontem';
    if (diffDays === -1) return 'Amanhã';
    if (diffDays > 1) return `Há ${diffDays} dias`;
    if (diffDays < -1) return `Em ${Math.abs(diffDays)} dias`;
  }

  // English
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays === -1) return 'Tomorrow';
  if (diffDays > 1) return `${diffDays} days ago`;
  if (diffDays < -1) return `In ${Math.abs(diffDays)} days`;

  return formatDate(dateObj, locale);
};
