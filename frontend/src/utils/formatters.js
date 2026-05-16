export const formatDate = (iso) =>
  new Date(iso).toLocaleDateString('en-KE', { dateStyle: 'medium' });

export const formatTime = (iso) =>
  new Date(iso).toLocaleTimeString('en-KE', { timeStyle: 'short' });

export const formatHours = (h) =>
  h != null ? `${parseFloat(h).toFixed(2)} hrs` : '—';

export const formatDateTime = (iso) =>
  iso ? `${formatDate(iso)} ${formatTime(iso)}` : '—';
