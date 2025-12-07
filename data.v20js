/* ===================================================
   🧩 خريطة العملات + أسماء الدول
=================================================== */
const countryInfo = {
  SA: { symbol: "ر.س", name: "السعودية" },
  AE: { symbol: "د.إ", name: "الإمارات" },
  OM: { symbol: "ر.ع", name: "عُمان" },
  MA: { symbol: "د.م", name: "المغرب" },
  DZ: { symbol: "د.ج", name: "الجزائر" },
  TN: { symbol: "د.ت", name: "تونس" }
};

const exchangeRates = {
  SA: 1,
  AE: 1.02,
  OM: 9.74,
  MA: 0.38,
  DZ: 0.028,
  TN: 1.21
};

/* ===================================================
   🚚 الدوال المساعدة
=================================================== */
function getCountryName() {
  const country = localStorage.getItem("Cntry");
  return countryInfo[country]?.name || "الدولة";
}

function getCurrencySymbol() {
  const country = localStorage.getItem("Cntry");
  return countryInfo[country]?.symbol || "";
}

function formatPrice(num) {
  const n = parseFloat(num);
  if (isNaN(n)) return "";
  return n.toLocaleString("en-US", { minimumFractionDigits: 2 });
}

/* ===================================================
   🌍 تنفيذ عند تحميل الصفحة
=================================================== */
document.addEventListener("DOMContentLoaded", () => {
  const jsonScript = document.getElementById("product-data");
  let data = { countries: {} };

  if (jsonScript) {
    try {
      let jsonText = jsonScript.textContent
        .replace(/,\s*}/g, "}")
        .replace(/,\s*]/g, "]")
        .replace(/:\s*,/g, ': null,')
        .replace(/:\s*}/g, ': null}')
        .replace(/:\s*]/g, ': null]');
      data = JSON.parse(jsonText);
    } catch {}
  }

  const countryCode = localStorage.getItem("Cntry");
  const countryData = data.countries?.[countryCode];
  if (!countryData) return; // لو مفيش بيانات الدولة ما نكملش

  // الشحن والتوفر
  const shippingFeeEl = document.querySelector(".shipping-fee .value");
  const shippingTimeEl = document.querySelector(".shipping-time .value");
  const shippingStatusEl = document.querySelector(".country-shipping .value");
  const shippingLabel = document.querySelector(".country-shipping .label");
  const availabilityEl = document.querySelector(".product-availability .value");

  if (shippingLabel) shippingLabel.textContent = `الشحن إلى ${getCountryName()}:`;

  const minDays = +countryData["shipping-min-days"] || 0;
  const maxDays = +countryData["shipping-max-days"] || 0;
  const hasShipping = minDays > 0 || maxDays > 0;

  const isGloballyAvailable = Object.values(data.countries).some(c => {
    const min = +c["shipping-min-days"] || 0;
    const max = +c["shipping-max-days"] || 0;
    return min > 0 || max > 0;
  });

  const isAvailable = isGloballyAvailable;
  if (availabilityEl) {
    availabilityEl.textContent = isAvailable ? "متوفر" : "غير متوفر";
    availabilityEl.style.color = isAvailable ? "#2e7d32" : "#c62828";
    availabilityEl.style.fontWeight = "bold";
  }

  if (shippingStatusEl) {
    shippingStatusEl.textContent = hasShipping ? "متاح" : "غير متاح";
    shippingStatusEl.style.color = hasShipping ? "#2e7d32" : "#c62828";
    shippingStatusEl.style.fontWeight = "bold";
  }

  if (!hasShipping || !isAvailable) {
    if (shippingFeeEl) shippingFeeEl.textContent = "-";
    if (shippingTimeEl) shippingTimeEl.textContent = "-";
  } else {
    const fee = countryData["shipping-fee"];
    if (shippingFeeEl) {
      if (fee === 0) shippingFeeEl.textContent = "مجانا";
      else shippingFeeEl.textContent = fee ? `${formatPrice(fee)} ${getCurrencySymbol()}` : "-";
    }

    if (shippingTimeEl) {
      if (minDays && maxDays) shippingTimeEl.textContent = `${minDays}-${maxDays} أيام`;
      else if (minDays) shippingTimeEl.textContent = `${minDays} أيام`;
      else if (maxDays) shippingTimeEl.textContent = `${maxDays} أيام`;
      else shippingTimeEl.textContent = "-";
    }
  }

  // الأسعار
  const originalEl = document.querySelector(".price-original");
  const discountedEl = document.querySelector(".price-discounted");
  const savingEl = document.querySelector(".price-saving");
  const discountEl = document.querySelector(".discount-percentage");

  const original = parseFloat(countryData["price-original"]) || null;
  const discounted = parseFloat(countryData["price-discounted"]) || null;

  if (original || discounted) {
    const finalOriginal = original || discounted;
    const finalDiscounted = discounted && discounted < finalOriginal ? discounted : finalOriginal;

    if (originalEl) originalEl.textContent = original ? `${formatPrice(original)} ${getCurrencySymbol()}` : "";
    if (discountedEl) discountedEl.textContent = discounted ? `${formatPrice(discounted)} ${getCurrencySymbol()}` : "";

    const diff = finalOriginal - finalDiscounted;
    if (diff > 0) {
      const rate = exchangeRates[countryCode] || 1;
      const diffInSAR = diff * rate;

      if (discountEl) discountEl.textContent = `${Math.round((diff / finalOriginal) * 100)}%`;

      if (savingEl) {
        savingEl.innerHTML = `
          <span class="save-label">وفر:</span>
          <span class="save-amount">${formatPrice(diff)} ${getCurrencySymbol()}</span>
        `;
      }
    }
  }

  // الرسم البياني
  try {
    const priceHistory = Array.isArray(countryData["price-history"]) ? countryData["price-history"] : [];
    if (!priceHistory.length) return;

    const merged = {};
    priceHistory.forEach(item => {
      if (!merged[item.date]) merged[item.date] = { total: 0, count: 0 };
      merged[item.date].total += item.price;
      merged[item.date].count += 1;
    });

    const finalData = Object.entries(merged).map(([date, { total, count }]) => ({
      date, price: +(total / count).toFixed(2)
    }));

    const prices = finalData.map(x => x.price);
    const dates = finalData.map(x => x.date);

    const min = Math.min(...prices);
    const max = Math.max(...prices);
    const avg = +(prices.reduce((a, b) => a + b, 0) / prices.length).toFixed(2);
    const endPrice = prices[prices.length - 1];
    const prevPrice = prices[prices.length - 2] || endPrice;

    const getArrow = (value, compare) => {
      if (value > compare) return `<span class="stat-arrow arrow-up">▲</span>`;
      if (value < compare) return `<span class="stat-arrow arrow-down">▼</span>`;
      return "";
    };

    const stats = `
      <div class="price-stats">
        <div class="stat-item current">
          <strong>السعر الحالي:</strong> ${endPrice} ${getCurrencySymbol()} ${getArrow(endPrice, prevPrice)}
        </div>
        <div class="stat-item"><strong>المتوسط:</strong> ${avg} ${getCurrencySymbol()} ${getArrow(avg, endPrice)}</div>
        <div class="stat-item"><strong>أقل سعر:</strong> ${min} ${getCurrencySymbol()} ${getArrow(min, endPrice)}</div>
        <div class="stat-item"><strong>أعلى سعر:</strong> ${max} ${getCurrencySymbol()} ${getArrow(max, endPrice)}</div>
      </div>
    `;
    document.getElementById("priceChart")?.insertAdjacentHTML("afterend", stats);

    const tooltipEl = document.createElement("div");
    tooltipEl.id = "chart-tooltip";
    document.body.appendChild(tooltipEl);

    const externalTooltipHandler = (context) => {
      const { chart, tooltip } = context;
      const el = tooltipEl;
      if (tooltip.opacity === 0) { el.style.display = "none"; return; }
      el.style.display = "block";

      const dataIndex = tooltip.dataPoints[0].dataIndex;
      const value = tooltip.dataPoints[0].raw;
      const prev = dataIndex > 0 ? finalData[dataIndex - 1].price : value;
      const diff = +(value - prev).toFixed(2);

      el.innerHTML = `<div>${value}</div>`;
    };

    const ctx = document.getElementById("priceChart")?.getContext("2d");
    if (ctx) {
      new Chart(ctx, {
        type: "line",
        data: { labels: dates, datasets: [{ label: "السعر", data: finalData.map(d => d.price), borderColor: "#8B0000", backgroundColor: "rgba(139,0,0,0.1)", borderWidth: 3, pointRadius: 4, pointHoverRadius: 6, fill: true, tension: 0.2 }] },
        options: { responsive: true, interaction: { mode: 'index', intersect: false }, plugins: { tooltip: { enabled: false, external: externalTooltipHandler } } }
      });
    }
  } catch {}
});
