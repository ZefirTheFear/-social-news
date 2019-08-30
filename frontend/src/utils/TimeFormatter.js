import numberFormatter from "./NumberFormatter";

export default time => {
  const secsPassed = Math.round((new Date().getTime() - new Date(time)) / 1000);
  if (secsPassed <= 60) {
    return `${Math.round(secsPassed)} ${numberFormatter(Math.round(secsPassed), [
      "секунда",
      "секунды",
      "секунд"
    ])} назад`;
  } else if (secsPassed > 60 && secsPassed <= 3600) {
    return `${Math.round(secsPassed / 60)} ${numberFormatter(Math.round(secsPassed / 60), [
      "минута",
      "минуты",
      "минут"
    ])} назад`;
  } else if (secsPassed > 3600 && secsPassed <= 86400) {
    return `${Math.round(secsPassed / 3600)} ${numberFormatter(Math.round(secsPassed / 3600), [
      "час",
      "часа",
      "часов"
    ])} назад`;
  } else {
    return `${Math.round(secsPassed / 86400)} ${numberFormatter(Math.round(secsPassed / 86400), [
      "день",
      "дня",
      "дней"
    ])} назад`;
  }
};
