/* ================================
   ✅ الجزء الأول: كود صفحة المنتج
   ✅ إظهار شريط البائع ديناميكيًا (مع دعم الفيد المتعدد)
   ================================ */

async function loadSellerBar() {
  const sellerBarContainer = document.getElementById("seller-bar");
  if (!sellerBarContainer) return;

  // ✅ نجيب التصنيف اللي بيبدأ بـ store-
  const labels = Array.from(document.querySelectorAll(".post-labels a"));
  const storeLabel = labels.map(el => el.textContent.trim()).find(l => l.startsWith("store-"));

  if (!storeLabel) {
  sellerBarContainer.innerHTML = "";
  return;
}

  // الرابط الأساسي للفيد (مع alt=json)
  let feedUrl = `/feeds/posts/default/-/${encodeURIComponent(storeLabel)}?alt=json&max-results=150`;
  let found = false;
  let nextLink = null;
  const parser = new DOMParser();

  if (!found) {
  sellerBarContainer.innerHTML = "";
}

  try {
    // نبدأ حلقة تحميل متعددة الصفحات (ديناميكي)
    while (feedUrl && !found) {
      const res = await fetch(feedUrl);
      const data = await res.json();
      const entries = data.feed.entry || [];

      // ندور على أول منشور فيه .bar
      for (const entry of entries) {
        const doc = parser.parseFromString(entry.content.$t, "text/html");
        if (doc.querySelector(".bar")) {
          const sellerBar = doc.querySelector(".bar");
          sellerBarContainer.innerHTML = sellerBar.outerHTML;

          // ✅ نجيب رابط المتجر نفسه
          const sellerLink = (entry.link || []).find(l => l.rel === "alternate")?.href || "#";
          let buttons = sellerBarContainer.querySelector(".buttons");

          if (!buttons) {
            buttons = document.createElement("div");
            buttons.className = "buttons";
            sellerBarContainer.querySelector(".bar").appendChild(buttons);
          }

          // زر "اكتشف المتجر"
          buttons.innerHTML = `<a class="button" href="${sellerLink}">اكتشف المتجر</a>`;
          found = true;
          break;
        }
      }

      // ✅ لو لسه ما لقيناش .bar نحاول نكمل لو فيه rel="next"
      if (!found) {
        const links = data.feed.link || [];
        const next = links.find(l => l.rel === "next");
        nextLink = next ? next.href : null;
        feedUrl = nextLink ? nextLink + "&alt=json" : null;
      }
    }

    if (!found) {
      sellerBarContainer.innerHTML = "<p>⚠️ لم يتم العثور على شريط البائع في أي منشور.</p>";
    }

  } catch (err) {
    console.error("❌ خطأ في تحميل بيانات البائع:", err);
    sellerBarContainer.innerHTML = "<p>⚠️ تعذر تحميل بيانات البائع.</p>";
  }
}

loadSellerBar();



/* =====================================
   ✅ الجزء الثاني: كود صفحة المتجر
   ✅ عرض منتجات البائع ديناميكيًا مع تعدد الصفحات
   ===================================== */

async function loadSellerProducts() {
  const container = document.getElementById("seller-products");
  const pagination = document.getElementById("pagination");
  const loader = document.getElementById("loader");
  if (!container || !pagination || !loader) return;

  // ✅ نجيب التصنيف اللي بيبدأ بـ store-
  const labels = Array.from(document.querySelectorAll(".post-labels a"));
  const storeLabel = labels.map(el => el.textContent.trim()).find(l => l.startsWith("store-"));

  if (!storeLabel) {
    container.innerHTML = "<p>لم يتم العثور على تصنيف المتجر.</p>";
    return;
  }

  // الرابط الأساسي للفيد
  let feedUrl = `/feeds/posts/default/-/${encodeURIComponent(storeLabel)}?alt=json&max-results=150`;
  const allEntries = [];
  let nextLink = null;

  loader.style.display = "block";

  try {
    // 🌀 تحميل كل صفحات الفيد (rel="next") واحدة واحدة
    while (feedUrl) {
      const res = await fetch(feedUrl);
      const data = await res.json();
      const entries = data.feed.entry || [];
      allEntries.push(...entries);

      // نحاول نجيب رابط الصفحة التالية (إن وجد)
      const links = data.feed.link || [];
      const next = links.find(l => l.rel === "next");
      nextLink = next ? next.href : null;
      feedUrl = nextLink ? nextLink + "&alt=json" : null;
    }

    loader.style.display = "none";

    if (!allEntries.length) {
      container.innerHTML = "<p>لا توجد منتجات لهذا البائع</p>";
      return;
    }

    // ✅ إعداد الصفحات
    const perPage = 60;
    let currentPage = 1;
    const totalPages = Math.ceil(allEntries.length / perPage);

    // دالة عرض المنتجات
    function renderPage(page) {
      currentPage = page;
      const start = (page - 1) * perPage;
      const end = start + perPage;
      const pageEntries = allEntries.slice(start, end);

      // نولّد HTML المنتجات
      container.innerHTML = pageEntries.map(post => generatePostHTML(post, true)).join("");

      // تحميل كسول للصور لو متاح
      if (typeof lazyLoadImages === "function") lazyLoadImages();

      renderPagination();
    }

    // دالة عرض أزرار الصفحات
    function renderPagination() {
      pagination.innerHTML = "";
      const maxVisible = 10;
      let startPage = Math.max(1, currentPage - Math.floor(maxVisible / 2));
      let endPage = Math.min(totalPages, startPage + maxVisible - 1);

      for (let i = startPage; i <= endPage; i++) {
        const btn = document.createElement("button");
        btn.textContent = i;
        if (i === currentPage) btn.classList.add("active");
        btn.addEventListener("click", () => renderPage(i));
        pagination.appendChild(btn);
      }
    }

    // أول تحميل
    renderPage(1);

  } catch (err) {
    console.error("❌ خطأ في تحميل المنتجات:", err);
    loader.style.display = "none";
    container.innerHTML = "<p>⚠️ حدث خطأ أثناء تحميل المنتجات.</p>";
  }
}

loadSellerProducts();

/******************
 ✅ الكوبونات الكاملة 
*******************/
const $ = (s, r=document) => r.querySelector(s);
const $$ = (s, r=document) => [...r.querySelectorAll(s)];
const wrapper = document.querySelector('#coupons');

function updateExpiryUI(){
  if(!wrapper) return;
  $$('.coupon-card').forEach(card=>{
    const expiryEl = $('.coupon-expiry', card);
    const diff = new Date(card.dataset.expiry) - Date.now();
    if(diff <= 0){
      card.classList.add('is-expired');
      if(!$('.badge-expired', card)){
        const b = document.createElement('span');
        b.className = 'badge-expired';
        b.textContent = 'انتهى';
        card.appendChild(b);
      }
      expiryEl.textContent = 'انتهى العرض';
      return;
    }
    const d = Math.floor(diff / 86400000);
    const h = Math.floor(diff % 86400000 / 3600000);
    const m = Math.floor(diff % 3600000 / 60000);
    const s = Math.floor(diff % 60000 / 1000);
    expiryEl.textContent = `ينتهي بعد: ${d} يوم ${h} ساعة ${m} دقيقة ${s} ثانية`;
  });
}

function reveal(maskBtn){
  const card = maskBtn.closest('.coupon-card');
  const codeEl = $('.coupon-code', card);
  const copyBtn = $('.btn-copy', card);
  codeEl.textContent = card.dataset.code;
  maskBtn.remove();
  copyBtn.disabled = false;
}

async function copyCode(btn){
  const card = btn.closest('.coupon-card');
  const code = card.dataset.code;
  if(!code) return;
  try {
    await navigator.clipboard.writeText(code);
    showFeedback(btn, "تم النسخ");
  } catch {
    const ta = document.createElement('textarea');
    ta.value = code;
    document.body.appendChild(ta);
    ta.select(); document.execCommand('copy');
    document.body.removeChild(ta);
    showFeedback(btn, "تم النسخ");
  }
}

function showFeedback(btnEl, msg) {
  const original = btnEl.textContent;
  btnEl.textContent = msg;
  setTimeout(() => {
    btnEl.textContent = original;
  }, 3000);
}

if(wrapper){
  wrapper.addEventListener('click', e=>{
    if(e.target.classList.contains('coupon-mask')) reveal(e.target);
    if(e.target.classList.contains('btn-copy') && !e.target.disabled) copyCode(e.target);
  });
  updateExpiryUI();
  setInterval(updateExpiryUI, 1000);
}


/******************
 ✅ الكوبونات البسيطة
*******************/
document.addEventListener("click", function (e) {
  if (e.target.classList.contains("copy-button")) {
    const btnEl = e.target;
    const container = btnEl.closest(".coupon-container");
    const codeEl = container.querySelector(".coupon-code");
    const code = codeEl ? codeEl.textContent.trim() : "";

    if (!code) return;

    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(code)
        .then(() => showFeedback(btnEl, "تم النسخ"))
        .catch(() => showFeedback(btnEl, "فشل النسخ!"));
    } else {
      const textarea = document.createElement("textarea");
      textarea.value = code;
      document.body.appendChild(textarea);
      textarea.select();
      try {
        document.execCommand("copy");
        showFeedback(btnEl, "تم النسخ");
      } catch {
        showFeedback(btnEl, "فشل النسخ!");
      }
      document.body.removeChild(textarea);
    }
  }
});

