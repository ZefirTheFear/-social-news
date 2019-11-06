import numberFormatter from "./NumberFormatter";

const daysInMonth = (month, year) => {
  return new Date(year, month, 0).getDate();
};

export default time => {
  const yearCreation = new Date(time).getFullYear();
  const monthCreation = new Date(time).getMonth() + 1;
  const dayCreation = new Date(time).getDate();

  const year = new Date().getUTCFullYear();
  const month = new Date().getUTCMonth() + 1;
  const day = new Date().getUTCDate();

  let difDay = day - dayCreation;
  let difMonth = month - monthCreation;
  let difYear = year - yearCreation;

  if (difDay < 0) {
    difMonth--;
    difDay = daysInMonth(monthCreation, yearCreation) + difDay;
  }
  if (difMonth < 0) {
    difYear--;
    difMonth = 12 + difMonth;
  }

  const Y = difYear ? `${difYear} ${numberFormatter(difYear, ["год", "года", "лет"])}` : "";
  const M = difMonth
    ? `${difMonth} ${numberFormatter(difMonth, ["месяц", "месяца", "месяцев"])}`
    : "";
  const D = difDay ? `${difDay} ${numberFormatter(difDay, ["день", "дня", "дней"])}` : "";

  if (`${Y} ${M} ${D}` === "  ") {
    return `с сегодняшнего дня`;
  }

  return `${Y} ${M} ${D}`;
};
