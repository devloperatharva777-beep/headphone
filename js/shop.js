/* ============================================
   AURORA Pro — Cart System & Login Modal
   ============================================ */

const ShopSystem = (() => {
    let cart = [];

    const PRODUCTS = {
        'aurora-pro': { name: 'AURORA Pro', price: 549, emoji: '🎧' },
        'aurora-air': { name: 'AURORA Air', price: 349, emoji: '🎧' },
        'aurora-studio': { name: 'AURORA Studio', price: 749, emoji: '🎧' },
        'aurora-sport': { name: 'AURORA Sport', price: 449, emoji: '🎧' }
    };

    function init() {
        setupCartButtons();
        setupCartPanel();
        setupLoginModal();
        setupColorSwatches();
        loadCart();
    }

    // ===================== ADD TO CART =====================
    function setupCartButtons() {
        document.addEventListener('click', (e) => {
            const btn = e.target.closest('.add-to-cart-btn');
            if (!btn) return;
            e.preventDefault();

            const productId = btn.dataset.product;
            if (!productId || !PRODUCTS[productId]) return;

            addToCart(productId);

            // Button feedback animation
            const origText = btn.textContent;
            btn.textContent = '✓ Added!';
            btn.style.background = 'linear-gradient(135deg, #34A853, #2d9248)';
            setTimeout(() => {
                btn.textContent = origText;
                btn.style.background = '';
            }, 1500);
        });
    }

    function addToCart(productId) {
        const existing = cart.find(item => item.id === productId);
        if (existing) {
            existing.qty++;
        } else {
            cart.push({ id: productId, qty: 1 });
        }
        saveCart();
        updateCartUI();
        openCart();
    }

    function removeFromCart(productId) {
        cart = cart.filter(item => item.id !== productId);
        saveCart();
        updateCartUI();
    }

    function updateQty(productId, delta) {
        const item = cart.find(i => i.id === productId);
        if (!item) return;
        item.qty += delta;
        if (item.qty <= 0) {
            removeFromCart(productId);
            return;
        }
        saveCart();
        updateCartUI();
    }

    function saveCart() {
        try { localStorage.setItem('aurora-cart', JSON.stringify(cart)); } catch (e) {}
    }

    function loadCart() {
        try {
            const saved = localStorage.getItem('aurora-cart');
            if (saved) cart = JSON.parse(saved);
        } catch (e) {}
        updateCartUI();
    }

    // ===================== CART UI =====================
    function updateCartUI() {
        const countEl = document.getElementById('cartCount');
        const itemsEl = document.getElementById('cartItems');
        const emptyEl = document.getElementById('cartEmpty');
        const footerEl = document.getElementById('cartFooter');
        const totalEl = document.getElementById('cartTotal');

        const totalItems = cart.reduce((sum, item) => sum + item.qty, 0);
        const totalPrice = cart.reduce((sum, item) => {
            const product = PRODUCTS[item.id];
            return sum + (product ? product.price * item.qty : 0);
        }, 0);

        // Update nav count badge
        if (countEl) {
            countEl.textContent = totalItems;
            countEl.classList.toggle('visible', totalItems > 0);
        }

        // Update cart panel items
        if (itemsEl) {
            if (cart.length === 0) {
                if (emptyEl) emptyEl.style.display = 'flex';
                // Clear previous items but keep empty state
                const items = itemsEl.querySelectorAll('.cart-item');
                items.forEach(el => el.remove());
            } else {
                if (emptyEl) emptyEl.style.display = 'none';
                // Rebuild items
                const items = itemsEl.querySelectorAll('.cart-item');
                items.forEach(el => el.remove());

                cart.forEach(item => {
                    const product = PRODUCTS[item.id];
                    if (!product) return;

                    const div = document.createElement('div');
                    div.className = 'cart-item';
                    div.innerHTML = `
                        <div class="cart-item-icon">${product.emoji}</div>
                        <div class="cart-item-details">
                            <div class="cart-item-name">${product.name}</div>
                            <div class="cart-item-price">$${product.price}</div>
                        </div>
                        <div class="cart-item-qty">
                            <button class="qty-btn" data-product="${item.id}" data-action="minus">−</button>
                            <span class="qty-value">${item.qty}</span>
                            <button class="qty-btn" data-product="${item.id}" data-action="plus">+</button>
                        </div>
                    `;
                    itemsEl.appendChild(div);
                });
            }
        }

        // Update footer
        if (footerEl) {
            footerEl.style.display = cart.length > 0 ? 'block' : 'none';
        }
        if (totalEl) {
            totalEl.textContent = `$${totalPrice}`;
        }
    }

    // ===================== CART PANEL =====================
    function setupCartPanel() {
        const cartBtn = document.getElementById('cartBtn');
        const cartClose = document.getElementById('cartClose');
        const cartOverlay = document.getElementById('cartOverlay');
        const cartPanel = document.getElementById('cartPanel');

        if (cartBtn) cartBtn.addEventListener('click', openCart);
        if (cartClose) cartClose.addEventListener('click', closeCart);
        if (cartOverlay) cartOverlay.addEventListener('click', closeCart);

        // Qty buttons (event delegation)
        if (cartPanel) {
            cartPanel.addEventListener('click', (e) => {
                const qtyBtn = e.target.closest('.qty-btn');
                if (!qtyBtn) return;
                const productId = qtyBtn.dataset.product;
                const action = qtyBtn.dataset.action;
                updateQty(productId, action === 'plus' ? 1 : -1);
            });
        }

        // Checkout button
        const checkoutBtn = document.getElementById('checkoutBtn');
        if (checkoutBtn) {
            checkoutBtn.addEventListener('click', () => {
                alert('Thank you for your purchase! 🎧\nTotal: ' + document.getElementById('cartTotal').textContent);
                cart = [];
                saveCart();
                updateCartUI();
                closeCart();
            });
        }
    }

    function openCart() {
        document.getElementById('cartPanel')?.classList.add('open');
        document.getElementById('cartOverlay')?.classList.add('open');
        document.body.style.overflow = 'hidden';
    }

    function closeCart() {
        document.getElementById('cartPanel')?.classList.remove('open');
        document.getElementById('cartOverlay')?.classList.remove('open');
        document.body.style.overflow = '';
    }

    // ===================== LOGIN MODAL =====================
    function setupLoginModal() {
        const accountBtn = document.getElementById('accountBtn');
        const loginClose = document.getElementById('loginClose');
        const loginOverlay = document.getElementById('loginOverlay');
        const loginSubmit = document.getElementById('loginSubmit');
        const googleLogin = document.getElementById('googleLogin');

        if (accountBtn) accountBtn.addEventListener('click', openLogin);
        if (loginClose) loginClose.addEventListener('click', closeLogin);
        if (loginOverlay) loginOverlay.addEventListener('click', closeLogin);

        if (googleLogin) {
            googleLogin.addEventListener('click', () => {
                alert('Google Sign-In would be integrated here with Firebase Auth or Google Identity Services.');
            });
        }

        if (loginSubmit) {
            loginSubmit.addEventListener('click', () => {
                const phone = document.getElementById('loginPhone')?.value;
                const email = document.getElementById('loginEmail')?.value;
                const code = document.getElementById('countryCode')?.value;

                if (!phone && !email) {
                    alert('Please enter a phone number or email address.');
                    return;
                }

                if (phone) {
                    alert(`OTP sent to ${code} ${phone}! (Demo mode)`);
                } else {
                    alert(`Verification link sent to ${email}! (Demo mode)`);
                }
                closeLogin();
            });
        }
    }

    function openLogin() {
        document.getElementById('loginModal')?.classList.add('open');
        document.getElementById('loginOverlay')?.classList.add('open');
        document.body.style.overflow = 'hidden';
    }

    function closeLogin() {
        document.getElementById('loginModal')?.classList.remove('open');
        document.getElementById('loginOverlay')?.classList.remove('open');
        document.body.style.overflow = '';
    }

    // ===================== COLOR SWATCHES =====================
    function setupColorSwatches() {
        document.addEventListener('click', (e) => {
            const swatch = e.target.closest('.color-swatch');
            if (!swatch) return;
            const parent = swatch.closest('.color-options');
            if (!parent) return;
            parent.querySelectorAll('.color-swatch').forEach(s => s.classList.remove('active'));
            swatch.classList.add('active');
        });
    }

    return { init };
})();

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    ShopSystem.init();
});
