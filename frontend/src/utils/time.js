export function calculateTimeDifference(start, end) {
  const startTime = new Date(`2000-01-01T${start}`);
  const endTime = new Date(`2000-01-01T${end}`);
  
  if (endTime < startTime) {
    endTime.setDate(endTime.getDate() + 1);
  }
  
  const diffMs = endTime.getTime() - startTime.getTime();
  return Number((diffMs / (1000 * 60 * 60)).toFixed(2));
}

export function formatTime(timeString) {
  if (!timeString) return '';
  try {
    return new Date(`1970-01-01T${timeString}`).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  } catch {
    return timeString;
  }
}