import { n, fmt, money } from "./formatter.js";

const el = {
  baseFare: document.getElementById("baseFare"),
  airlineCommissionPercent: document.getElementById("airlineCommissionPercent"),
  taxAmount: document.getElementById("taxAmount"),
  bankPercent: document.getElementById("bankPercent"),
  issueFee: document.getElementById("issueFee"),
  profit: document.getElementById("profit"),
  otherCommission: document.getElementById("otherCommission"),
  useOtherCommission: document.getElementById("useOtherCommission"),
  convertToMmk: document.getElementById("convertToMmk"),
  exchangeRateField: document.getElementById("exchangeRateField"),
  exchangeRate: document.getElementById("exchangeRate"),
  sellingFare: document.getElementById("sellingFare"),
  sellingMmkLine: document.getElementById("sellingMmkLine"),
  sellingMmkValue: document.getElementById("sellingMmkValue"),
  issuingFareAmount: document.getElementById("issuingFareAmount"),
  otherCommissionLine: document.getElementById("otherCommissionLine"),
  otherCommissionAmount: document.getElementById("otherCommissionAmount"),
  profitAmount: document.getElementById("profitAmount"),
  copyBreakdownBtn: document.getElementById("copyBreakdownBtn"),
  downloadCardBtn: document.getElementById("downloadCardBtn"),
  resultPanel: document.getElementById("resultPanel"),
  clearBtn: document.getElementById("clearBtn")
};

function plain(value) {
  const rounded = Math.round(value * 100) / 100;
  return Number.isInteger(rounded) ? String(rounded) : rounded.toFixed(2).replace(/0+$/, "").replace(/\.$/, "");
}

function calculate() {
  const base = n(el.baseFare.value);
  const airlineCommissionPct = n(el.airlineCommissionPercent.value);
  const tax = n(el.taxAmount.value);
  const bankPct = n(el.bankPercent.value);
  const issue = n(el.issueFee.value);
  const profit = n(el.profit.value);
  const otherCommission = el.useOtherCommission.checked ? n(el.otherCommission.value) : 0;
  const exchangeRate = el.convertToMmk.checked ? n(el.exchangeRate.value) : 0;

  const airlineCommission = base * (airlineCommissionPct / 100);
  const bank = base * (bankPct / 100);
  const issuingFare = base - (base * 0.03) + tax + bank + issue;
  const total = base - airlineCommission + tax + bank + issue + profit + otherCommission;
  const estimatedProfit = profit;
  const sellingMmk = total * exchangeRate;

  const values = {
    sellingFare: total,
    bank,
    airlineCommission,
    estimatedProfit,
    baseFare: base
  };

  el.sellingFare.textContent = money(values.sellingFare);
  el.issuingFareAmount.textContent = money(issuingFare);
  el.otherCommissionAmount.textContent = money(otherCommission);
  el.otherCommissionLine.classList.toggle("hidden", !(otherCommission > 0));
  el.profitAmount.textContent = money(estimatedProfit);
  el.sellingMmkValue.textContent = `${fmt(sellingMmk)} MMK`;
  el.sellingMmkLine.classList.toggle("hidden", !el.convertToMmk.checked);
}

function toggleOtherCommission() {
  const show = el.useOtherCommission.checked;
  el.otherCommission.closest(".field").classList.toggle("hidden", !show);
  if (!show) {
    el.otherCommission.value = "";
  }
  calculate();
}

function toggleMmkConversion() {
  const show = el.convertToMmk.checked;
  el.exchangeRateField.classList.toggle("hidden", !show);
  el.sellingMmkLine.classList.toggle("hidden", !show);
  if (!show) {
    el.exchangeRate.value = "";
  }
  calculate();
}

async function downloadCardAsImage() {
  if (typeof window.html2canvas === "undefined") {
    return;
  }

  const sourceCanvas = await window.html2canvas(el.resultPanel, {
    backgroundColor: null,
    scale: 2
  });

  const radius = 32;
  const outputCanvas = document.createElement("canvas");
  outputCanvas.width = sourceCanvas.width;
  outputCanvas.height = sourceCanvas.height;
  const ctx = outputCanvas.getContext("2d");
  if (!ctx) return;

  const w = outputCanvas.width;
  const h = outputCanvas.height;
  const r = Math.min(radius, w / 2, h / 2);

  ctx.beginPath();
  ctx.moveTo(r, 0);
  ctx.arcTo(w, 0, w, h, r);
  ctx.arcTo(w, h, 0, h, r);
  ctx.arcTo(0, h, 0, 0, r);
  ctx.arcTo(0, 0, w, 0, r);
  ctx.closePath();
  ctx.clip();
  ctx.drawImage(sourceCanvas, 0, 0);

  const link = document.createElement("a");
  link.href = outputCanvas.toDataURL("image/png");
  link.download = "selling-fare-card.png";
  link.click();
}

async function copyBreakdown() {
  const base = n(el.baseFare.value);
  const airlineCommissionPct = n(el.airlineCommissionPercent.value);
  const tax = n(el.taxAmount.value);
  const bankPct = n(el.bankPercent.value);
  const issue = n(el.issueFee.value);
  const profit = n(el.profit.value);
  const otherCommission = el.useOtherCommission.checked ? n(el.otherCommission.value) : 0;

  const bank = base * (bankPct / 100);
  const issuingFare = base - (base * 0.03) + tax + bank + issue;
  const sellingFare = base - (base * (airlineCommissionPct / 100)) + tax + bank + issue + profit + otherCommission;

  const breakdownLines = [
    `Selling Fare - $${plain(sellingFare)}`,
    `Issuing Fare - $${plain(issuingFare)}`,
    `**Profit** - $${plain(profit)}`,
    ``,
    `Base Fare - $${plain(base)}`,
    `Airline Com: - ${plain(airlineCommissionPct)}%`,
    `Tax - $${plain(tax)}`,
    `Bank Charges - ${plain(bankPct)}%`,
    `Issues Fees - $${plain(issue)}`
  ];

  if (otherCommission > 0) {
    breakdownLines.push(`Other commission - $${plain(otherCommission)}`);
  }

  const breakdown = breakdownLines.join("\n");

  try {
    await navigator.clipboard.writeText(breakdown);
  } catch {
    const textarea = document.createElement("textarea");
    textarea.value = breakdown;
    textarea.setAttribute("readonly", "");
    textarea.style.position = "fixed";
    textarea.style.opacity = "0";
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand("copy");
    document.body.removeChild(textarea);
  }
}

function clearForm() {
  el.baseFare.value = "";
  el.airlineCommissionPercent.value = "";
  el.taxAmount.value = "";
  el.bankPercent.value = "";
  el.issueFee.value = "";
  el.profit.value = "";
  el.useOtherCommission.checked = false;
  el.otherCommission.value = "";
  el.convertToMmk.checked = false;
  el.exchangeRate.value = "";
  toggleOtherCommission();
  toggleMmkConversion();
  calculate();
}

el.clearBtn.addEventListener("click", clearForm);
el.copyBreakdownBtn.addEventListener("click", copyBreakdown);
el.downloadCardBtn.addEventListener("click", downloadCardAsImage);
el.useOtherCommission.addEventListener("change", toggleOtherCommission);
el.convertToMmk.addEventListener("change", toggleMmkConversion);

[el.baseFare, el.airlineCommissionPercent, el.taxAmount, el.bankPercent, el.issueFee, el.profit, el.otherCommission, el.exchangeRate].forEach((input) => {
  input.addEventListener("input", calculate);
});

toggleOtherCommission();
toggleMmkConversion();
calculate();
