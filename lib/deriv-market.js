export function findDerivSymbol(symbols, query, fallback = '1HZ100V') {
  const list = Array.isArray(symbols) ? symbols : [];
  const wanted = String(query || '').toLowerCase();

  const found = list.find((item) => {
    const name = String(item?.underlying_symbol_name || item?.display_name || '').toLowerCase();
    return name.includes(wanted);
  });

  return found?.underlying_symbol || found?.symbol || fallback;
}

export function lastDigitFromQuote(quote) {
  const text = String(quote ?? '').replace(/[^0-9]/g, '');
  return text ? Number(text[text.length - 1]) : null;
}

export function formatDerivError(error) {
  return error?.message || 'Deriv request failed. Please check the connection and try again.';
}
