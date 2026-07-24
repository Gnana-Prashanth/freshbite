/* =====================================================
   FreshBite - script.js
   -----------------------------------------------------
   This file has 6 parts:
   1. DATA - all our "database" replacements (arrays/objects)
   2. STATE - variables that change as the user interacts
   3. NAVIGATION - showing/hiding pages
   4. RENDER FUNCTIONS - functions that turn data into HTML
   5. EVENT LISTENERS - code that runs when user clicks/types
   6. INIT - runs once when the page loads

   Since there's no database, everything is stored in JavaScript
   variables. We DO use localStorage so the cart survives a page
   refresh (this is the "Local Storage: Optional" part of the brief).
   ===================================================== */


/* ============ 1. DATA ============ */

// Restaurant categories shown on the home page
const categories = [
  { name: "Pizza", emoji: "🍕" },
  { name: "Burgers", emoji: "🍔" },
  { name: "Sushi", emoji: "🍣" },
  { name: "Indian", emoji: "🍛" },
  { name: "Desserts", emoji: "🍰" },
  { name: "Mexican", emoji: "🌮" },
];

// Restaurants for the Restaurant Listing page
const restaurants = [
  { id: 1, name: "Bella Italia", cuisine: "Italian", rating: 4.7, price: "$$", emoji: "🍝" },
  { id: 2, name: "Burger Barn", cuisine: "American", rating: 4.3, price: "$", emoji: "🍔" },
  { id: 3, name: "Spice Route", cuisine: "Indian", rating: 4.8, price: "$$", emoji: "🍛" },
  { id: 4, name: "Sakura Sushi", cuisine: "Japanese", rating: 4.6, price: "$$$", emoji: "🍣" },
  { id: 5, name: "El Fuego", cuisine: "Mexican", rating: 4.2, price: "$", emoji: "🌮" },
  { id: 6, name: "Napoli Pizzeria", cuisine: "Italian", rating: 4.5, price: "$$", emoji: "🍕" },
];

// Food items for the Menu page (and Home page "Featured Dishes")
// diet: "veg", "nonveg", or "gluten-free" - used for filtering
const foodItems = [
  { id: 101, name: "Margherita Pizza", desc: "Classic tomato, mozzarella & basil", price: 12.99, emoji: "🍕", diet: "veg", featured: true,
    ingredients: "Tomato sauce, mozzarella, fresh basil, olive oil", calories: 780 },
  { id: 102, name: "Chicken Burger", desc: "Grilled chicken, lettuce, house sauce", price: 8.99, emoji: "🍔", diet: "nonveg", featured: true,
    ingredients: "Chicken breast, brioche bun, lettuce, tomato, house sauce", calories: 650 },
  { id: 103, name: "Veggie Sushi Roll", desc: "Avocado, cucumber, carrot", price: 10.49, emoji: "🍣", diet: "veg", featured: true,
    ingredients: "Sushi rice, nori, avocado, cucumber, carrot", calories: 420 },
  { id: 104, name: "Butter Chicken", desc: "Creamy tomato curry with rice", price: 13.49, emoji: "🍛", diet: "nonveg", featured: true,
    ingredients: "Chicken, tomato, cream, butter, basmati rice", calories: 890 },
  { id: 105, name: "Gluten-Free Tacos", desc: "Corn tortilla, beef, salsa", price: 9.99, emoji: "🌮", diet: "gluten-free", featured: false,
    ingredients: "Corn tortilla, seasoned beef, salsa, cilantro", calories: 540 },
  { id: 106, name: "Choco Lava Cake", desc: "Warm chocolate cake, molten center", price: 6.49, emoji: "🍰", diet: "veg", featured: false,
    ingredients: "Dark chocolate, butter, eggs, flour, sugar", calories: 460 },
  { id: 107, name: "Grilled Salmon", desc: "Herb-crusted salmon with veggies", price: 15.99, emoji: "🐟", diet: "gluten-free", featured: false,
    ingredients: "Salmon fillet, mixed herbs, seasonal vegetables", calories: 610 },
  { id: 108, name: "Paneer Tikka", desc: "Spiced grilled cottage cheese", price: 11.49, emoji: "🧀", diet: "veg", featured: false,
    ingredients: "Paneer, yogurt, spices, bell peppers, onion", calories: 480 },
];


/* ============ 2. STATE ============ */
// These variables change while the user uses the site.

// Cart: array of { id, name, price, emoji, qty }
// We try to load it from localStorage first, so a refresh doesn't lose the cart.
let cart = JSON.parse(localStorage.getItem("freshbite_cart")) || [];

// Currently logged-in user (null = not logged in). Simulated only, no real backend.
let currentUser = JSON.parse(localStorage.getItem("freshbite_user")) || null;

// Order history (simulated). Array of past orders.
let orderHistory = JSON.parse(localStorage.getItem("freshbite_orders")) || [];

// Current filter state for menu page
let currentDietFilter = "all";


/* ============ 3. NAVIGATION ============ */
// Every "page" in this project is a <section class="page"> with an id.
// This function hides all pages and shows only the one requested.
function goToPage(pageId) {
  document.querySelectorAll(".page").forEach(page => {
    page.classList.remove("active-page");
  });
  document.getElementById(pageId).classList.add("active-page");

  // Update the active state on nav links
  document.querySelectorAll(".nav-link").forEach(link => {
    link.classList.toggle("active", link.dataset.page === pageId);
  });

  // Scroll to top when switching pages
  window.scrollTo(0, 0);

  // Close the mobile menu if it's open
  document.getElementById("navLinks").classList.remove("open");

  // Some pages need their content refreshed every time we visit them
  if (pageId === "cart" || pageId === "checkout") renderCart();
  if (pageId === "account") renderAccountPage();
}

// Any element with a data-page attribute becomes clickable navigation.
// We use "event delegation" on the whole document instead of adding
// a listener to every single button - this is simpler and also works
// for buttons that get created later by JavaScript.
document.addEventListener("click", (e) => {
  const target = e.target.closest("[data-page]");
  if (target) {
    e.preventDefault();
    goToPage(target.dataset.page);
  }
});


/* ============ 4. RENDER FUNCTIONS ============ */
// These functions take our data (arrays) and turn them into HTML.

function renderCategories() {
  const grid = document.getElementById("categoryGrid");
  grid.innerHTML = categories.map(cat => `
    <div class="category-card" data-page="menu">
      <span class="emoji">${cat.emoji}</span>
      <span>${cat.name}</span>
    </div>
  `).join("");
}

// Builds one food card's HTML. Reused by Home, Menu, and Wishlist.
function foodCardHTML(item) {
  const tagClass = item.diet === "veg" ? "tag-veg" : item.diet === "nonveg" ? "tag-nonveg" : "tag-gluten";
  const tagLabel = item.diet === "veg" ? "Veg" : item.diet === "nonveg" ? "Non-Veg" : "Gluten-Free";

  return `
    <div class="food-card" data-food-id="${item.id}">
      <div class="food-card-img">${item.emoji}</div>
      <div class="food-card-body">
        <div class="food-tags"><span class="tag ${tagClass}">${tagLabel}</span></div>
        <h4>${item.name}</h4>
        <p class="desc">${item.desc}</p>
        <div class="food-card-footer">
          <span class="price">$${item.price.toFixed(2)}</span>
          <button class="add-btn" data-add-id="${item.id}"><i class="fa-solid fa-plus"></i></button>
        </div>
      </div>
    </div>
  `;
}

function renderFeaturedDishes() {
  const grid = document.getElementById("featuredGrid");
  const featured = foodItems.filter(item => item.featured);
  grid.innerHTML = featured.map(foodCardHTML).join("");
}

// Renders the menu page, respecting the current dietary filter
function renderMenu() {
  const grid = document.getElementById("menuGrid");
  const filtered = currentDietFilter === "all"
    ? foodItems
    : foodItems.filter(item => item.diet === currentDietFilter);
  grid.innerHTML = filtered.map(foodCardHTML).join("");
}

function renderRestaurants() {
  const grid = document.getElementById("restaurantGrid");
  const cuisine = document.getElementById("filterCuisine").value;
  const minRating = parseFloat(document.getElementById("filterRating").value);
  const price = document.getElementById("filterPrice").value;

  const filtered = restaurants.filter(r => {
    const matchCuisine = cuisine === "all" || r.cuisine === cuisine;
    const matchRating = r.rating >= minRating;
    const matchPrice = price === "all" || r.price === price;
    return matchCuisine && matchRating && matchPrice;
  });

  if (filtered.length === 0) {
    grid.innerHTML = `<p class="empty-msg-small">No restaurants match your filters.</p>`;
    return;
  }

  grid.innerHTML = filtered.map(r => `
    <div class="restaurant-card">
      <div class="restaurant-img">${r.emoji}</div>
      <div class="restaurant-body">
        <h4>${r.name}</h4>
        <div class="restaurant-meta">
          <span>${r.cuisine}</span>
          <span class="rating">★ ${r.rating}</span>
          <span>${r.price}</span>
        </div>
      </div>
    </div>
  `).join("");
}

// Updates the little number badge on the cart icon in the navbar
function updateCartCount() {
  const totalQty = cart.reduce((sum, item) => sum + item.qty, 0);
  document.getElementById("cartCount").textContent = totalQty;
}

// Renders the cart page: item list + subtotal/total
function renderCart() {
  const list = document.getElementById("cartItemsList");
  const emptyMsg = document.getElementById("cartEmptyMsg");
  const layout = document.getElementById("cartLayout");

  if (cart.length === 0) {
    emptyMsg.style.display = "block";
    layout.style.display = "none";
    return;
  }
  emptyMsg.style.display = "none";
  layout.style.display = "grid";

  list.innerHTML = cart.map(item => `
    <div class="cart-item">
      <div class="cart-item-img">${item.emoji}</div>
      <div class="cart-item-info">
        <h4>${item.name}</h4>
        <span class="price">$${item.price.toFixed(2)}</span>
        <div class="qty-control">
          <button data-qty-change="${item.id}" data-delta="-1">-</button>
          <span>${item.qty}</span>
          <button data-qty-change="${item.id}" data-delta="1">+</button>
        </div>
        <div class="remove-btn" data-remove-id="${item.id}">Remove</div>
      </div>
    </div>
  `).join("");

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  const delivery = 2.99;
  const total = subtotal + delivery;

  document.getElementById("cartSubtotal").textContent = `$${subtotal.toFixed(2)}`;
  document.getElementById("cartTotal").textContent = `$${total.toFixed(2)}`;

  // Also fill in the checkout page summary (in case user goes there)
  const checkoutSummary = document.getElementById("checkoutItemsSummary");
  if (checkoutSummary) {
    checkoutSummary.innerHTML = cart.map(item => `
      <div class="summary-row"><span>${item.name} x${item.qty}</span><span>$${(item.price * item.qty).toFixed(2)}</span></div>
    `).join("");
    document.getElementById("checkoutTotal").textContent = `$${total.toFixed(2)}`;
  }
}

// Shows either the login/register box or the profile box, depending on login state
function renderAccountPage() {
  const authBox = document.getElementById("authBox");
  const profileBox = document.getElementById("profileBox");

  if (currentUser) {
    authBox.style.display = "none";
    profileBox.style.display = "block";
    document.getElementById("profileName").textContent = currentUser.name;
    document.getElementById("profileEmail").textContent = currentUser.email;

    const historyList = document.getElementById("orderHistoryList");
    if (orderHistory.length === 0) {
      historyList.innerHTML = `<p class="empty-msg-small">No orders yet.</p>`;
    } else {
      historyList.innerHTML = orderHistory.map(order => `
        <div class="order-history-item">
          <span>Order #${order.id} - ${order.itemCount} items</span>
          <span>$${order.total.toFixed(2)}</span>
        </div>
      `).join("");
    }
  } else {
    authBox.style.display = "block";
    profileBox.style.display = "none";
  }
}


/* ============ 5. EVENT LISTENERS ============ */

// --- Hamburger menu toggle (mobile) ---
document.getElementById("hamburgerBtn").addEventListener("click", () => {
  document.getElementById("navLinks").classList.toggle("open");
});

// --- Add to cart (works for any "add-btn" on Home or Menu pages) ---
// We listen on the whole document since food cards are re-rendered often.
document.addEventListener("click", (e) => {
  const addBtn = e.target.closest("[data-add-id]");
  if (addBtn) {
    addToCart(parseInt(addBtn.dataset.addId));
    return;
  }

  // --- Open product detail modal when a food card (not its button) is clicked ---
  const foodCard = e.target.closest("[data-food-id]");
  if (foodCard && !e.target.closest("[data-add-id]")) {
    openProductModal(parseInt(foodCard.dataset.foodId));
  }
});

function addToCart(foodId) {
  const food = foodItems.find(item => item.id === foodId);
  const existing = cart.find(item => item.id === foodId);

  if (existing) {
    existing.qty += 1;
  } else {
    cart.push({ id: food.id, name: food.name, price: food.price, emoji: food.emoji, qty: 1 });
  }

  saveCart();
  updateCartCount();
  showToast(`${food.name} added to cart!`);
}

// --- Quantity +/- and Remove buttons inside the cart page ---
document.addEventListener("click", (e) => {
  const qtyBtn = e.target.closest("[data-qty-change]");
  if (qtyBtn) {
    const id = parseInt(qtyBtn.dataset.qtyChange);
    const delta = parseInt(qtyBtn.dataset.delta);
    changeQty(id, delta);
  }

  const removeBtn = e.target.closest("[data-remove-id]");
  if (removeBtn) {
    const id = parseInt(removeBtn.dataset.removeId);
    cart = cart.filter(item => item.id !== id);
    saveCart();
    updateCartCount();
    renderCart();
  }
});

function changeQty(id, delta) {
  const item = cart.find(i => i.id === id);
  item.qty += delta;
  if (item.qty <= 0) {
    cart = cart.filter(i => i.id !== id);
  }
  saveCart();
  updateCartCount();
  renderCart();
}

function saveCart() {
  localStorage.setItem("freshbite_cart", JSON.stringify(cart));
}

// --- Product detail modal ---
function openProductModal(foodId) {
  const item = foodItems.find(f => f.id === foodId);
  const tagLabel = item.diet === "veg" ? "Veg" : item.diet === "nonveg" ? "Non-Veg" : "Gluten-Free";

  document.getElementById("productModalContent").innerHTML = `
    <div class="modal-food-img">${item.emoji}</div>
    <h3>${item.name}</h3>
    <p class="desc">${item.desc}</p>
    <span class="price">$${item.price.toFixed(2)}</span>
    <p class="nutrition"><strong>Ingredients:</strong> ${item.ingredients}</p>
    <p class="nutrition"><strong>Calories:</strong> ${item.calories} kcal &nbsp; | &nbsp; <strong>Dietary:</strong> ${tagLabel}</p>
    <button class="btn btn-primary btn-full" data-add-id="${item.id}">Add to Cart</button>
  `;
  document.getElementById("productModal").classList.add("open");
}

document.getElementById("closeModalBtn").addEventListener("click", () => {
  document.getElementById("productModal").classList.remove("open");
});

// Close modal if user clicks the dark overlay (outside the box)
document.getElementById("productModal").addEventListener("click", (e) => {
  if (e.target.id === "productModal") {
    document.getElementById("productModal").classList.remove("open");
  }
});

// --- Restaurant filters ---
["filterCuisine", "filterRating", "filterPrice"].forEach(id => {
  document.getElementById(id).addEventListener("change", renderRestaurants);
});

// --- Menu dietary tag filters ---
document.querySelectorAll(".tag-filter").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".tag-filter").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    currentDietFilter = btn.dataset.diet;
    renderMenu();
  });
});

// --- Checkout form submit ---
document.getElementById("checkoutForm").addEventListener("submit", (e) => {
  e.preventDefault();

  if (cart.length === 0) return;

  // Save this as an order in the (simulated) order history
  const subtotal = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  const total = subtotal + 2.99;

  orderHistory.push({
    id: orderHistory.length + 1,
    itemCount: cart.reduce((sum, item) => sum + item.qty, 0),
    total: total
  });
  localStorage.setItem("freshbite_orders", JSON.stringify(orderHistory));

  // Clear the cart since the "order" is placed
  cart = [];
  saveCart();
  updateCartCount();

  showToast("Order placed successfully! 🎉");
  goToPage("home");
});

// --- Login / Register tabs ---
document.querySelectorAll(".auth-tab").forEach(tab => {
  tab.addEventListener("click", () => {
    document.querySelectorAll(".auth-tab").forEach(t => t.classList.remove("active"));
    tab.classList.add("active");

    const isLogin = tab.dataset.tab === "login";
    document.getElementById("loginForm").style.display = isLogin ? "block" : "none";
    document.getElementById("registerForm").style.display = isLogin ? "none" : "block";
  });
});

// --- Login form (simulated - no real password check) ---
document.getElementById("loginForm").addEventListener("submit", (e) => {
  e.preventDefault();
  const email = e.target.querySelector('input[type="email"]').value;

  currentUser = { name: email.split("@")[0], email: email };
  localStorage.setItem("freshbite_user", JSON.stringify(currentUser));

  showToast("Logged in successfully!");
  renderAccountPage();
});

// --- Register form (simulated) ---
document.getElementById("registerForm").addEventListener("submit", (e) => {
  e.preventDefault();
  const inputs = e.target.querySelectorAll("input");
  const name = inputs[0].value;
  const email = inputs[1].value;

  currentUser = { name: name, email: email };
  localStorage.setItem("freshbite_user", JSON.stringify(currentUser));

  showToast("Account created!");
  renderAccountPage();
});

// --- Logout ---
document.getElementById("logoutBtn").addEventListener("click", () => {
  currentUser = null;
  localStorage.removeItem("freshbite_user");
  renderAccountPage();
});

// --- Contact form (simulated send) ---
document.getElementById("contactForm").addEventListener("submit", (e) => {
  e.preventDefault();
  showToast("Message sent! We'll get back to you soon.");
  e.target.reset();
});

// --- Toast notification helper ---
let toastTimeout;
function showToast(message) {
  const toast = document.getElementById("toast");
  toast.textContent = message;
  toast.classList.add("show");

  clearTimeout(toastTimeout);
  toastTimeout = setTimeout(() => {
    toast.classList.remove("show");
  }, 2500);
}


/* ============ 6. INIT ============ */
// Runs once when the page first loads: render everything with initial data.
function init() {
  renderCategories();
  renderFeaturedDishes();
  renderMenu();
  renderRestaurants();
  updateCartCount();
  renderCart();
  renderAccountPage();
}

init();
