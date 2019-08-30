export default (number, text_forms) => {
  const n = Math.abs(number) % 100;
  const n1 = n % 10;
  if (n > 10 && n < 20) {
    // return `${number} ${text_forms[2]}`;
    return `${text_forms[2]}`;
  }
  if (n1 > 1 && n1 < 5) {
    // return `${number} ${text_forms[1]}`;
    return `${text_forms[1]}`;
  }
  if (n1 === 1) {
    // return `${number} ${text_forms[0]}`;
    return `${text_forms[0]}`;
  }
  // return `${number} ${text_forms[2]}`;
  return `${text_forms[2]}`;
};
