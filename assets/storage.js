const HISTORY_KEY = "fareHistory";

export function readHistory() {
  const raw = localStorage.getItem(HISTORY_KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function writeHistory(items) {
  localStorage.setItem(HISTORY_KEY, JSON.stringify(items));
}

export function saveCurrentToHistory(values) {
  const now = new Date();
  const stamp = now.toLocaleString();
  const items = readHistory();
  const signature = `${values.sellingFare}|${values.baseFare}|${values.estimatedProfit}`;

  if (items.length && items[0].signature === signature) {
    return items;
  }

  items.unshift({
    time: stamp,
    sellingFare: values.sellingFare,
    baseFare: values.baseFare,
    profit: values.estimatedProfit,
    signature
  });

  const trimmed = items.slice(0, 5);
  writeHistory(trimmed);
  return trimmed;
}
