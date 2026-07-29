export const formatDuration = (minutes: number): string => {
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  const hoursText = hours > 0 ? `${hours}hr` : "";
  const minutesText = remainingMinutes > 0 ? `${remainingMinutes}min` : "";

  return [hoursText, minutesText].filter(Boolean).join(" ");
};
