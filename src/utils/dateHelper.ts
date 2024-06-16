export const getCurrentDate = () => {
  const today = new Date();
  today.setHours(today.getHours() + 7);
  return today;
};

export const getMonday = (d: Date) => {
  const day = d.getDay();
  const diff = d.getDate() - day + (day == 0 ? -6 : 1);
  const monday = new Date(d.setDate(diff));
  return monday;
};

export const toDateString = (d: Date) => {
  const string = d.toISOString().split('T')[0];
  return string;
};

export const isLeap = (y: number) => {
  if (y % 100 === 0 && y % 400 === 0) return true;
  if (y % 4 === 0) return true;
  return false;
};
