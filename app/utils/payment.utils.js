const loanCalculate = (totalPayment, downPayment, loanTerm, apr) => {
  // post-order payments
  const financedAmount = totalPayment - downPayment + ((totalPayment - downPayment) * apr) / 100;
  // Per month
  const loanPayment = financedAmount / loanTerm;

  return { financedAmount, loanPayment };
};
exports.loanCalculate = loanCalculate;

const maxDownPayment = totalPayment => {
  const percentage = 85;
  return (totalPayment * percentage) / 100;
};
exports.maxDownPayment = maxDownPayment;

const currencyConvert = price => {
  const parsedPrice = parseInt(price, 10);
  return parseInt((parsedPrice / 23000) * 100, 10); // *100 for cents
};
exports.currencyConvert = currencyConvert;

module.exports = { loanCalculate, maxDownPayment, currencyConvert };
