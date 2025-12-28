import currency from 'currency.js';

export const money = (value: number, noSymbol = false) => {
  return currency(value, {
    symbol: noSymbol ? '' : 'R$',
    decimal: ',',
    separator: '.',
    precision: 2,
  }).format();
};
