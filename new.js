/* ===================================================
   🚀 المحرك البيناري لإدارة منتجات AliExpress (V1.1)
=================================================== */

async function initBinaryEngine() {
    const BIN_URL = "https://pub-13fdf8672306452ea378b09a024d0072.r2.dev/RRR1.bin";
    const RECORD_SIZE = 32;

    // 1. لقطة الـ UID من الصفحة
    const uidElement = document.querySelector(".UID");
    if (!uidElement) {
        console.warn("⚠️ لم يتم العثور على عنصر .UID في الصفحة.");
        return;
    }
    const productUID = uidElement.textContent.trim();

    // 2. تحديد العملة بناءً على الدولة
    const countryCode = localStorage.getItem("Cntry") || "SA";
    const currencyMap = { SA: "ر.س", AE: "د.إ", OM: "ر.ع", MA: "د.م", DZ: "د.ج", TN: "د.ت" };
    const currency = currencyMap[countryCode] || "ر.س";

    try {
        const response = await fetch(`${BIN_URL}?v=${Date.now()}`); // كسر الكاش لضمان أحدث بيانات
        if (!response.ok) throw new Error("Network response was not ok");
        
        const buffer = await response.arrayBuffer();
        const view = new DataView(buffer);
        const totalRecords = buffer.byteLength / RECORD_SIZE;

        let foundIndex = -1;

        // 3. محرك القفز والبحث
        for (let i = 0; i < totalRecords; i++) {
            const offset = i * RECORD_SIZE;
            const currentID = view.getBigUint64(offset).toString();
            
            if (currentID === productUID) {
                foundIndex = offset;
                break;
            }
        }

        if (foundIndex === -1) {
            console.error(`❌ المنتج رقم ${productUID} غير موجود في ملف البيناري.`);
            return;
        }

        // 4. استخراج البيانات (Extraction)
        const priceO = view.getUint32(foundIndex + 12) / 100;
        const priceD = view.getUint32(foundIndex + 16) / 100;
        
        // فك شفرة 3 بايت الشحن
        const s1 = view.getUint8(foundIndex + 20);
        const s2 = view.getUint8(foundIndex + 21);
        const s3 = view.getUint8(foundIndex + 22);
        const shippingFee = (s1 << 16 | s2 << 8 | s3) / 100;

        const orders = view.getUint16(foundIndex + 23);
        const reviews = view.getUint16(foundIndex + 25);
        const score = view.getUint8(foundIndex + 27) / 10;
        const minDays = view.getUint8(foundIndex + 28);
        const maxDays = view.getUint8(foundIndex + 29);

        // 5. تحديث الـ DOM
        
        // الأسعار والتوفير
        document.querySelector(".price-original").textContent = `${priceO.toLocaleString()} ${currency}`;
        document.querySelector(".price-discounted").textContent = `${priceD.toLocaleString()} ${currency}`;
        
        if (priceO > priceD) {
            const discPercent = Math.round(((priceO - priceD) / priceO) * 100);
            document.querySelector(".discount-percentage").textContent = `${discPercent}%-`;
            document.querySelector(".price-saving").textContent = `وفر ${(priceO - priceD).toFixed(2)} ${currency}`;
        }

        // التقييمات والنجوم
        document.getElementById("ratingValue").textContent = score;
        const reviewBtn = document.getElementById("goToReviews");
        if (reviewBtn) {
            reviewBtn.textContent = `${reviews} تقييمات`;
            reviewBtn.dataset.count = reviews;
        }
        
        // تشغيل دالة النجوم لو كانت موجودة
        if (typeof renderStars === 'function') {
            const starsGroup = document.getElementById("stars");
            starsGroup.setAttribute("data-rating", score);
            renderStars(starsGroup);
        }

        // تفاصيل الشحن والطلبات
        document.querySelector(".orders-info .value").textContent = `+${orders}`;
        document.querySelector(".shipping-time .value").textContent = `${minDays}-${maxDays} أيام`;
        
        const shipFeeValue = document.querySelector(".shipping-fee .value");
        if (shippingFee === 0) {
            shipFeeValue.textContent = "مجاناً";
            shipFeeValue.classList.add("free-shipping"); // تقدر تلونها بالأخضر في الـ CSS
        } else {
            shipFeeValue.textContent = `${shippingFee} ${currency}`;
        }

        // الحالة
        document.querySelector(".product-availability .value").textContent = "متوفر";
        document.querySelector(".country-shipping .value").textContent = "متاح";

        console.log("✅ تمت مزامنة بيانات المنتج بنجاح.");

    } catch (err) {
        console.error("❌ خطأ في تشغيل المحرك البيناري:", err);
    }
}

// الانطلاق عند التحميل
document.addEventListener("DOMContentLoaded", initBinaryEngine);
