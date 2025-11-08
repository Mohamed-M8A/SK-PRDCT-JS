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

/* 💱 تحويل تقريبي إلى الريال السعودي */
const exchangeRates = {
  SA: 1,
  AE: 1.02,
  OM: 9.74,
  MA: 0.38,
  DZ: 0.028,
  TN: 1.21
};

/* ===================================================
   🚚 دوال الشحن + دوال المساعدة
=================================================== */
document.addEventListener("DOMContentLoaded", () => {
/** 🧭 إرجاع اسم الدولة بناءً على localStorage */
function getCountryName() {
  const country = localStorage.getItem("Cntry");
  return countryInfo[country]?.name || "الدولة";
}

/** 💰 إرجاع رمز العملة بناءً على localStorage */
function getCurrencySymbol() {
  const country = localStorage.getItem("Cntry");
  return countryInfo[country]?.symbol || "";
}

/** 🔢 تنسيق رقم كسعر */
function formatPrice(num) {
  const n = parseFloat(num);
  if (isNaN(n)) return "";
  return n.toLocaleString("en-US", { minimumFractionDigits: 2 });
}

/* ===================================================
   🌍 تنفيذ عند تحميل الصفحة
=================================================== */
const jsonScript = document.getElementById("product-data");
let data = { countries: {} }; // تعريف مبدئي يمنع توقف الكود

if (!jsonScript) {
  console.warn("⚠️ لا يوجد عنصر product-data في الصفحة — سيتم المتابعة بدون بيانات المنتج");
} else {
  try {
    // 🧹 تنظيف JSON من المفاتيح اللي مالهاش قيمة أو فواصل غلط
    let jsonText = jsonScript.textContent
      .replace(/,\s*}/g, "}")
      .replace(/,\s*]/g, "]")
      .replace(/:\s*,/g, ': null,')
      .replace(/:\s*}/g, ': null}')
      .replace(/:\s*]/g, ': null]');

    data = JSON.parse(jsonText);
  } catch {
    console.warn("⚠️ خطأ في JSON داخل product-data — سيتم التجاهل والمتابعة");
    data = { countries: {} };
  }
}

const countryCode = localStorage.getItem("Cntry");
const countryData = data.countries?.[countryCode];

if (!countryData) {
  console.warn(`⚠️ لا توجد بيانات لهذه الدولة (${countryCode})`);
  return;
}

/* ===================================================
   🚚 قسم الشحن + التوفر
=================================================== */
const shippingFeeEl = document.querySelector(".shipping-fee .value");
const shippingTimeEl = document.querySelector(".shipping-time .value");
const shippingStatusEl = document.querySelector(".country-shipping .value");
const shippingLabel = document.querySelector(".country-shipping .label");
const availabilityEl = document.querySelector(".product-availability .value");

// عنوان الشحن إلى
if (shippingLabel) shippingLabel.textContent = `الشحن إلى ${getCountryName()}:`;

// 🧠 استنتاج حالة الشحن والتوفر بناءً على بيانات المدة والرسوم
const minDays = +countryData["shipping-min-days"] || 0;
const maxDays = +countryData["shipping-max-days"] || 0;
// 🧭 تحقق من حالة الشحن للدولة الحالية
const hasShipping = (+countryData["shipping-min-days"] || 0) > 0 || (+countryData["shipping-max-days"] || 0) > 0;

// 🌍 التحقق العام من توفر المنتج على الأقل في دولة واحدة بناءً على الأيام فقط
const isGloballyAvailable = Object.values(data.countries).some(c => {
  const min = +c["shipping-min-days"] || 0;
  const max = +c["shipping-max-days"] || 0;
  return min > 0 || max > 0;
});

// ⚙️ حالة التوفر تعتمد على التوفر العام (مش لازم الدولة الحالية يكون فيها شحن)
const isAvailable = isGloballyAvailable;

// 🟢 نصوص الحالات
const shippingStatusText = hasShipping ? "متاح" : "غير متاح";
const availabilityText = isAvailable ? "متوفر" : "غير متوفر";

// 🎨 عرض حالة التوفر
if (availabilityEl) {
  availabilityEl.textContent = availabilityText;
  availabilityEl.style.color = isAvailable ? "#2e7d32" : "#c62828";
  availabilityEl.style.fontWeight = "bold";
}

// 🎨 عرض حالة الشحن
if (shippingStatusEl) {
  shippingStatusEl.textContent = shippingStatusText;
  shippingStatusEl.style.color = hasShipping ? "#2e7d32" : "#c62828";
  shippingStatusEl.style.fontWeight = "bold";
}

// 🚫 لو غير متاح → نخفي التفاصيل
if (!hasShipping || !isAvailable) {
  if (shippingFeeEl) shippingFeeEl.textContent = "-";
  if (shippingTimeEl) shippingTimeEl.textContent = "-";
} else {
  const fee = countryData["shipping-fee"];
  if (shippingFeeEl) {
    if (fee === 0) {
      shippingFeeEl.textContent = "مجانا";
      shippingFeeEl.style.color = "#2e7d32";
      shippingFeeEl.style.fontWeight = "bold";
    } else if (fee) {
      shippingFeeEl.textContent = `${formatPrice(fee)} ${getCurrencySymbol()}`;
    } else {
      shippingFeeEl.textContent = "-";
    }
  }

  if (shippingTimeEl) {
    if (minDays && maxDays) {
      shippingTimeEl.textContent = `${minDays}-${maxDays} أيام`;
    } else if (minDays && !maxDays) {
      shippingTimeEl.textContent = `${minDays} أيام`;
    } else if (!minDays && maxDays) {
      shippingTimeEl.textContent = `${maxDays} أيام`;
    } else {
      shippingTimeEl.textContent = "-";
    }
  }
}

  /* ===================================================
     💰 الأسعار + الخصم + التوفير
  =================================================== */
  const originalEl = document.querySelector(".price-original");
  const discountedEl = document.querySelector(".price-discounted");
  const savingEl = document.querySelector(".price-saving");
  const discountEl = document.querySelector(".discount-percentage");

  const original = countryData["price-original"];
  const discounted = countryData["price-discounted"];

  // تحقق من القيم
  const validOriginal = parseFloat(original) || null;
  const validDiscounted = parseFloat(discounted) || null;

  if (validOriginal || validDiscounted) {

  const finalOriginal = validOriginal || validDiscounted;
  const finalDiscounted =
    validDiscounted && validDiscounted < finalOriginal
      ? validDiscounted
      : finalOriginal;

  // عرض الأسعار
  if (originalEl && validOriginal) {
    originalEl.textContent = `${formatPrice(validOriginal)} ${getCurrencySymbol()}`;
  } else if (originalEl) {
    originalEl.textContent = "";
  }

if (discountedEl && validDiscounted) {
  discountedEl.textContent = `${formatPrice(validDiscounted)} ${getCurrencySymbol()}`;
} else if (discountedEl) {
  discountedEl.textContent = "";
}


  // حساب الفرق فقط لو في خصم حقيقي
  const diff = finalOriginal - finalDiscounted;
  if (diff > 0) {
    const rate = exchangeRates[countryCode] || 1;
    const diffInSAR = diff * rate;

    // لو أقل من 50 ريال سعودي → نخفي الخصم والتوفير فقط
      if (diffInSAR < 50) {
      if (savingEl) savingEl.innerHTML = "";
      if (discountEl) discountEl.textContent = `${Math.round((diff / finalOriginal) * 100)}%`;
      } else {
      const percentage = Math.round((diff / finalOriginal) * 100);
      if (discountEl) discountEl.textContent = `${percentage}%`;
      if (savingEl) {
        savingEl.innerHTML = `
          <span class="save-label">وفر:</span>
          <span class="save-amount">${formatPrice(diff)} ${getCurrencySymbol()}</span>
        `;

        // ألوان حسب قيمة التوفير المكافئة
        let color = "#2c3e50";
        if (diffInSAR >= 100 && diffInSAR < 200) color = "#1abc9c";
        else if (diffInSAR < 400) color = "#2ecc71";
        else if (diffInSAR < 600) color = "#e67e22";
        else if (diffInSAR < 1000) color = "#c0392b";
        else if (diffInSAR < 1500) color = "#f5008b";
        else if (diffInSAR < 2000) color = "#8e44ad";
        else color = "#f39c12";

        savingEl.style.color = color;
        savingEl.style.fontWeight = "bold";
        savingEl.title = `الفرق بين السعر القديم (${formatPrice(finalOriginal)}) والجديد (${formatPrice(finalDiscounted)})`;

        // 🔥 إضافة النار لو التوفير كبير
        const saveAmount = savingEl.querySelector(".save-amount");
if (diffInSAR >= 500 && !saveAmount.querySelector("img")) {
  const fireGif = document.createElement("img");
  fireGif.src = "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEj5J9EL4a9cV3VWmcK1ZYD6OYEB-1APv9gggocpaa7jAJXdgvX8Q7QiaAZC9NxcN25f8MTRSYD6SKwT1LSjL0SB1ovJH1SSkRmqH2y3f1NzWGkC0BE-gpj5bTc1OKi3Rfzh44sAAJSvOS5uq7Ut9ETN-V9LgKim0dkmEVmqUWa-2ZGA7FvMAYrVaJgn/w199-h200/fire%20(1).gif";
  fireGif.alt = "🔥";
  fireGif.style.cssText = `
    width: 25px; height: 25px; vertical-align: middle; margin: 0; display: inline;
  `;
  saveAmount.appendChild(fireGif);
      }
     }
    }
   }
  }    
// ==============================
// ✅ الرسم البياني 
// ==============================

  try {
    // ✅ جلب بيانات تاريخ الأسعار من نفس countryData
    const priceHistory = Array.isArray(countryData["price-history"])
      ? countryData["price-history"]
      : [];

    // ✅ لو مفيش بيانات سعر → إخفاء القسم والخروج
    if (!priceHistory.length) {
  const chartCanvas = document.getElementById("priceChart");
  if (chartCanvas) chartCanvas.parentElement.style.display = "none";
  return;
}


    // ✅ دمج الأسعار في نفس التاريخ (حساب المتوسط)
    const merged = {};
    priceHistory.forEach(item => {
      if (!merged[item.date]) merged[item.date] = { total: 0, count: 0 };
      merged[item.date].total += item.price;
      merged[item.date].count += 1;
    });

    // ✅ إنشاء مصفوفة نهائية بالتاريخ والمتوسط لكل يوم
    const finalData = Object.entries(merged).map(([date, { total, count }]) => ({
    date,
    price: +(total / count).toFixed(2)
    }));

    // ✅ استخراج القيم (الأسعار + التواريخ)
    const prices = finalData.map(x => x.price);
    const dates = finalData.map(x => x.date);

    // ✅ حساب الإحصائيات العامة
    const min = Math.min(...prices);
    const max = Math.max(...prices);
    const avg = +(prices.reduce((a, b) => a + b, 0) / prices.length).toFixed(2);
    const endPrice = prices[prices.length - 1];
    const prevPrice = prices[prices.length - 2] || endPrice;

    // ✅ دالة لتحديد السهم الصاعد أو الهابط
    const getArrow = (value, compare) => {
      if (value > compare) return `<span class="stat-arrow arrow-up">▲</span>`;
      if (value < compare) return `<span class="stat-arrow arrow-down">▼</span>`;
      return "";
    };

    // ✅ إنشاء إحصائيات الأسعار أسفل الرسم البياني
    const stats = `
      <div class="price-stats">
        <div class="stat-item current">
          <strong>السعر الحالي:</strong> ${endPrice} ${getCurrencySymbol()} ${getArrow(endPrice, prevPrice)}
          <small style="font-size:12px;color:#666;">(${(endPrice - prevPrice).toFixed(2)} ${getCurrencySymbol()})</small>
        </div>
        <div class="stat-item"><strong>المتوسط:</strong> ${avg} ${getCurrencySymbol()} ${getArrow(avg, endPrice)}</div>
        <div class="stat-item"><strong>أقل سعر:</strong> ${min} ${getCurrencySymbol()} ${getArrow(min, endPrice)}</div>
        <div class="stat-item"><strong>أعلى سعر:</strong> ${max} ${getCurrencySymbol()} ${getArrow(max, endPrice)}</div>
      </div>
    `;

    // ✅ إدراج الإحصائيات بعد الرسم البياني مباشرة
    document.getElementById("priceChart")?.insertAdjacentHTML("afterend", stats);

    // ✅ إعداد التولتيب (Tooltip) المخصص
    const tooltipEl = document.createElement("div");
    tooltipEl.id = "chart-tooltip";
    document.body.appendChild(tooltipEl);

    // ✅ دالة لتنسيق التولتيب الخارجي
    const externalTooltipHandler = (context) => {
      const { chart, tooltip } = context;
      const el = tooltipEl;

      if (tooltip.opacity === 0) {
        el.style.opacity = 0;
        el.style.display = "none";
        return;
      }

      el.style.display = "block";
      el.style.opacity = 1;

      const dataIndex = tooltip.dataPoints[0].dataIndex;
      const value = tooltip.dataPoints[0].raw;
      const prev = dataIndex > 0 ? finalData[dataIndex - 1].price : value;
      const diff = +(value - prev).toFixed(2);
      const percent = prev !== 0 ? ((diff / prev) * 100).toFixed(1) : 0;

      const arrow = diff > 0
        ? `<span class="stat-arrow arrow-up">▲</span>`
        : diff < 0
          ? `<span class="stat-arrow arrow-down">▼</span>`
          : `<span class="stat-arrow">-</span>`;

      const date = finalData[dataIndex].date;

      el.innerHTML = `
        <div class="tooltip-line" style="font-weight:bold;">${date}</div>
        <div class="tooltip-line">السعر: ${value} ${getCurrencySymbol()}</div>
        <div class="tooltip-line">التغير: ${arrow} ${diff} ${getCurrencySymbol()}</div>
        <div class="tooltip-line">النسبة: ${percent}%</div>
      `;

      const position = chart.canvas.getBoundingClientRect();
      const tooltipWidth = 160;
      const pageWidth = window.innerWidth;
      const chartLeft = position.left + window.pageXOffset;
      const pointX = chartLeft + tooltip.caretX;

      if (pointX > pageWidth * 0.7) {
        el.style.left = (pointX - tooltipWidth - 20) + 'px';
      } else {
        el.style.left = (pointX + 10) + 'px';
      }

      el.style.top = position.top + window.pageYOffset + tooltip.caretY - 40 + 'px';
    };

    // ✅ إنشاء الرسم البياني باستخدام Chart.js
    const ctx = document.getElementById("priceChart")?.getContext("2d");
    if (ctx) {
      new Chart(ctx, {
        type: "line",
        data: {
          labels: dates,
          datasets: [{
            label: "السعر",
            data: finalData.map(d => d.price),
            borderColor: "#2c3e50",
            backgroundColor: "rgba(44,62,80,0.1)",
            borderWidth: 3,
            pointRadius: 4,
            pointHoverRadius: 6,
            fill: true,
            tension: 0.2
          }]
        },
        options: {
          responsive: true,
          interaction: { mode: 'index', intersect: false },
          plugins: { tooltip: { enabled: false, external: externalTooltipHandler } },
          scales: {
            x: { title: { display: true, text: "التاريخ" } },
            y: { title: { display: true, text: `السعر (${getCurrencySymbol()})` } }
          }
        }
      });
    }
   
  } catch (err) {
    console.error("❌ خطأ أثناء تحميل بيانات الرسم البياني:", err);
  }
});
