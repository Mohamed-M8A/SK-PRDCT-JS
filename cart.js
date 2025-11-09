/***********************
 * ✅ إشعارات Toast
 ***********************/
function showCartToast(message, type = "success") {
  const host = document.createElement("div");
  document.body.prepend(host);

  const shadow = host.attachShadow({ mode: "open" });

  const toast = document.createElement("div");
  toast.textContent = message;
  shadow.appendChild(toast);

  const style = document.createElement("style");
  style.textContent = `
    div {
      position: fixed;
      top: 20px;
      right: 20px;
      min-width: 220px;
      max-width: 320px;
      background: ${type === "error" ? "#e74c3c" : "#2ecc71"};
      color: white;
      font-family: sans-serif;
      font-size: 14px;
      padding: 12px 18px;
      border-radius: 10px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.2);
      opacity: 0;
      transform: translateX(120%);
      transition: all 0.4s ease;
      z-index: 1000000;
    }
    div.show {
      opacity: 1;
      transform: translateX(0);
    }
  `;
  shadow.appendChild(style);

  setTimeout(() => toast.classList.add("show"), 50);

  setTimeout(() => {
    toast.classList.remove("show");
    setTimeout(() => host.remove(), 400);
  }, 3000);
}

/***********************
 * ✅ تخزين العربة (مع منع التكرار)
 ***********************/
function addToCart(productUrl, clean = false) {
  if (clean) {
    const urlObj = new URL(productUrl);
    urlObj.search = "";
    productUrl = urlObj.toString();
  }

  let cart = JSON.parse(localStorage.getItem("cart")) || [];
  const exists = cart.some(item => item.productUrl === productUrl);

  if (exists) {
    showCartToast("المنتج موجود بالفعل في العربة!", "error");
    return;
  }

  cart.push({ productUrl });
  localStorage.setItem("cart", JSON.stringify(cart));
  showCartToast("تمت إضافة المنتج إلى العربة بنجاح!", "success");
}

/***********************
 * ✅ زر صفحة المنتج
 ***********************/
function handleAddToCart(event) {
  event.preventDefault();
  event.stopPropagation();

  const productUrl = window.location.href;
  addToCart(productUrl, true);
}

document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll(".add-to-cart").forEach(btn => {
    btn.replaceWith(btn.cloneNode(true));
  });

  document.querySelectorAll(".add-to-cart").forEach(btn => {
    btn.addEventListener("click", handleAddToCart);
  });

  // ربط زر الكوبون
  const couponBtn = document.querySelector(".copy-button");
  if (couponBtn) {
    couponBtn.addEventListener("click", (e) => {
      e.preventDefault();
      copyCoupon();
    });
  }
});

/***********************
 * ✅ زر الويدجت (الرئيسية)
 ***********************/
document.addEventListener("click", function (e) {
  const postCard = e.target.closest(".post-card");
  if (!postCard) return;

  const cartButton = e.target.closest(".external-cart-button");
  if (cartButton) {
    const productUrl = postCard.getAttribute("data-product-url");
    addToCart(productUrl, false);
    e.preventDefault();
  }
});
