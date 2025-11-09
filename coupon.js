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
