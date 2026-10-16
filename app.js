/**
 * QuickBite Main Application Controller
 * Handles Cart Management, Persistent State, Interactive UI,
 * Checkout Modal, Live Order Tracking, and QuickBot Support Widget.
 */

// Global State with LocalStorage Persistence
const state = {
    cart: JSON.parse(localStorage.getItem('quickbite_cart') || '[]'),
    activeCategory: 'all'
};

// --- Toast Notification System ---
function showToast(title, message, type = 'success', duration = 3200) {
    let container = document.getElementById('toast-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toast-container';
        document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;

    const icons = {
        success: '✓',
        info: 'ℹ',
        error: '✕'
    };

    toast.innerHTML = `
        <div class="toast-icon">${icons[type] || '•'}</div>
        <div class="toast-body">
            <strong>${title}</strong>
            <div>${message}</div>
        </div>
        <button class="toast-close" aria-label="Close">&times;</button>
    `;

    toast.querySelector('.toast-close').addEventListener('click', () => {
        dismissToast(toast);
    });

    container.appendChild(toast);

    const timer = setTimeout(() => {
        dismissToast(toast);
    }, duration);

    function dismissToast(el) {
        clearTimeout(timer);
        el.classList.add('hiding');
        setTimeout(() => {
            if (el.parentNode) el.parentNode.removeChild(el);
        }, 300);
    }
}

// --- Cart Persistence & UI Management ---
function saveCart() {
    localStorage.setItem('quickbite_cart', JSON.stringify(state.cart));
}

function toggleCart(forceOpen = null) {
    const cartDrawer = document.getElementById('cart-drawer');
    const cartOverlay = document.getElementById('cart-overlay');
    if (!cartDrawer || !cartOverlay) return;

    const shouldOpen = forceOpen !== null ? forceOpen : !cartDrawer.classList.contains('open');

    if (shouldOpen) {
        cartDrawer.classList.add('open');
        cartOverlay.classList.add('open');
    } else {
        cartDrawer.classList.remove('open');
        cartOverlay.classList.remove('open');
    }
}

function updateCartUI() {
    const cartCountElement = document.getElementById('cart-count');
    const cartItemsContainer = document.getElementById('cart-items');
    const cartTotalPriceElement = document.getElementById('cart-total-price');

    const totalQuantity = state.cart.reduce((sum, item) => sum + item.quantity, 0);

    // Update Header Badges
    if (cartCountElement) {
        cartCountElement.textContent = totalQuantity;
        cartCountElement.classList.remove('cart-badge-pop');
        void cartCountElement.offsetWidth; // Trigger reflow
        cartCountElement.classList.add('cart-badge-pop');
    }

    // Update Drawer Item List
    if (cartItemsContainer) {
        if (state.cart.length === 0) {
            cartItemsContainer.innerHTML = `
                <div class="empty-cart">
                    <div style="font-size: 40px; margin-bottom: 12px;">🍕</div>
                    <h4>Your cart is empty</h4>
                    <p style="font-size:0.9rem; color:#888; margin-top:4px;">Add tasty dishes from our menu!</p>
                </div>
            `;
        } else {
            cartItemsContainer.innerHTML = state.cart.map(item => `
                <div class="cart-item">
                    <div class="cart-item-info">
                        <h4>${item.name}</h4>
                        <p>$${parseFloat(item.price).toFixed(2)} each</p>
                    </div>
                    <div class="cart-item-controls">
                        <button onclick="updateQuantity('${item.id}', -1)" title="Decrease quantity">−</button>
                        <span>${item.quantity}</span>
                        <button onclick="updateQuantity('${item.id}', 1)" title="Increase quantity">+</button>
                    </div>
                </div>
            `).join('');
        }
    }

    // Update Total Price
    const subtotal = state.cart.reduce((sum, item) => sum + (parseFloat(item.price) * item.quantity), 0);
    if (cartTotalPriceElement) {
        cartTotalPriceElement.textContent = `$${subtotal.toFixed(2)}`;
    }

    saveCart();
}

// Global Cart Actions
window.addToCart = function (name, price) {
    const numericPrice = parseFloat(price);
    const existing = state.cart.find(item => item.name === name);

    if (existing) {
        existing.quantity += 1;
    } else {
        state.cart.push({
            id: 'item-' + Date.now().toString() + Math.floor(Math.random() * 1000),
            name: name,
            price: numericPrice,
            quantity: 1
        });
    }

    updateCartUI();

    // Smooth feedback without aggressive drawer interruption
    showToast('Added to Cart', `${name} • $${numericPrice.toFixed(2)}`, 'success');
};

window.updateQuantity = function (id, change) {
    const itemIndex = state.cart.findIndex(item => item.id === id);

    if (itemIndex > -1) {
        state.cart[itemIndex].quantity += change;

        if (state.cart[itemIndex].quantity <= 0) {
            const removedItem = state.cart[itemIndex];
            state.cart.splice(itemIndex, 1);
            showToast('Item Removed', `${removedItem.name} removed from cart`, 'info');
        }

        updateCartUI();
    }
};

// --- Checkout Modal Management ---
function ensureCheckoutModal() {
    if (document.getElementById('checkout-modal')) return;

    const modal = document.createElement('div');
    modal.id = 'checkout-modal';
    modal.className = 'modal-overlay';
    modal.style.display = 'none';

    modal.innerHTML = `
        <div class="modal-content">
            <button class="modal-close-btn" id="modal-close-x">&times;</button>
            <h2>🛵 Delivery Details</h2>
            <p class="modal-subtitle">Complete your details for rapid 30-min delivery</p>
            <form id="checkout-form">
                <div class="form-group">
                    <label for="address">Delivery Street Address</label>
                    <textarea id="address" required placeholder="Apartment / Flat, Street, Landmark..."></textarea>
                </div>
                <div class="form-group">
                    <label for="city">City / Area</label>
                    <input type="text" id="city" required value="Gorakhpur">
                </div>
                <div class="form-group">
                    <label for="phone">Contact Phone Number</label>
                    <input type="tel" id="phone" required placeholder="+91 98765 43210">
                </div>
                <div class="form-group">
                    <label for="instructions">Cooking / Delivery Instructions</label>
                    <input type="text" id="instructions" placeholder="e.g., Less spicy, Extra oregano, Leave at door">
                </div>
                <div class="checkout-summary">
                    <div>
                        <strong>Order Total</strong>
                        <div style="font-size:0.8rem;color:#666;">Incl. taxes & delivery</div>
                    </div>
                    <span id="checkout-total-display">$0.00</span>
                </div>
                <div class="modal-actions">
                    <button type="button" class="btn btn-secondary" id="cancel-checkout">Cancel</button>
                    <button type="submit" class="btn btn-primary" id="confirm-order-btn">Confirm Order</button>
                </div>
            </form>
        </div>
    `;

    document.body.appendChild(modal);
}

function openCheckoutModal() {
    ensureCheckoutModal();
    const modal = document.getElementById('checkout-modal');
    if (!modal) return;

    const subtotal = state.cart.reduce((sum, item) => sum + (parseFloat(item.price) * item.quantity), 0);
    const deliveryFee = 2.99;
    const grandTotal = subtotal + deliveryFee;

    const totalDisplay = document.getElementById('checkout-total-display');
    if (totalDisplay) {
        totalDisplay.textContent = `$${grandTotal.toFixed(2)}`;
    }

    // Pre-fill user data if logged in
    const user = AuthService.getCurrentUser();
    if (user) {
        const phoneInput = document.getElementById('phone');
        if (phoneInput && !phoneInput.value) {
            phoneInput.value = '+91 98765 43210';
        }
        const addressInput = document.getElementById('address');
        if (addressInput && !addressInput.value) {
            addressInput.value = 'Flat 402, Royal Palms, Civil Lines';
        }
    }

    modal.style.display = 'flex';
}

function closeCheckoutModal() {
    const modal = document.getElementById('checkout-modal');
    if (modal) {
        modal.style.display = 'none';
    }
}

function setupCheckoutModalListeners() {
    ensureCheckoutModal();

    const modal = document.getElementById('checkout-modal');
    const closeBtn = document.getElementById('modal-close-x');
    const cancelBtn = document.getElementById('cancel-checkout');
    const form = document.getElementById('checkout-form');

    if (closeBtn) closeBtn.onclick = closeCheckoutModal;
    if (cancelBtn) cancelBtn.onclick = closeCheckoutModal;

    if (modal) {
        modal.onclick = (e) => {
            if (e.target === modal) closeCheckoutModal();
        };
    }

    if (form) {
        form.onsubmit = (e) => {
            e.preventDefault();

            if (state.cart.length === 0) {
                showToast('Cart Empty', 'Please add items before placing order', 'error');
                closeCheckoutModal();
                return;
            }

            const address = document.getElementById('address').value.trim();
            const city = document.getElementById('city').value.trim();
            const phone = document.getElementById('phone').value.trim();
            const instructions = document.getElementById('instructions').value.trim();

            const subtotal = state.cart.reduce((sum, item) => sum + (parseFloat(item.price) * item.quantity), 0);
            const deliveryFee = 2.99;
            const grandTotal = subtotal + deliveryFee;

            const currentUser = AuthService.getCurrentUser();
            const orderId = 'QB-' + Math.floor(1000 + Math.random() * 9000);

            const newOrder = {
                id: orderId,
                user: currentUser ? currentUser.name : 'Guest Customer',
                email: currentUser ? currentUser.email : 'guest@quickbite.com',
                address: `${address}, ${city}`,
                city: city,
                phone: phone,
                instructions: instructions || 'Standard delivery',
                items: JSON.parse(JSON.stringify(state.cart)),
                subtotal: subtotal.toFixed(2),
                deliveryFee: deliveryFee.toFixed(2),
                total: grandTotal.toFixed(2),
                date: new Date().toLocaleString(),
                status: 'Order Placed',
                estimatedMinutes: 28
            };

            // Save order
            AuthService.saveOrder(newOrder);

            // Clear Cart
            state.cart = [];
            updateCartUI();
            toggleCart(false);
            closeCheckoutModal();

            showToast('Order Confirmed! 🍕', `Order #${orderId} has been placed. Redirecting to tracking...`, 'success', 3000);

            // Redirect smoothly to tracking page
            setTimeout(() => {
                window.location.href = `tracking.html?orderId=${orderId}`;
            }, 800);
        };
    }
}

// --- Navigation Auth State for All Pages ---
function updateAuthState() {
    const user = AuthService.getCurrentUser();
    const navContainers = document.querySelectorAll('.app-header nav, .app-header .flex nav');

    navContainers.forEach(nav => {
        // Look for existing user dropdown or login button
        const existingDropdown = nav.querySelector('.user-nav-dropdown');
        if (existingDropdown) existingDropdown.remove();

        const authBtn = nav.querySelector('.btn-secondary, a[href="login.html"]');

        if (user) {
            if (authBtn) authBtn.style.display = 'none';

            const userDropdown = document.createElement('div');
            userDropdown.className = 'user-nav-dropdown';
            userDropdown.innerHTML = `
                <div class="user-badge">
                    <span style="font-size:14px;">👤</span>
                    <span>Hi, ${user.name.split(' ')[0]}</span>
                </div>
                <a href="tracking.html" style="font-weight:600;font-size:0.9rem;color:var(--text-main);">My Orders</a>
                <a href="#" id="nav-logout-btn" style="color:#666;font-size:0.85rem;margin-left:4px;cursor:pointer;">Logout</a>
            `;

            userDropdown.querySelector('#nav-logout-btn').addEventListener('click', (e) => {
                e.preventDefault();
                AuthService.logout();
            });

            nav.appendChild(userDropdown);
        } else {
            if (authBtn) {
                authBtn.style.display = 'inline-block';
                authBtn.textContent = 'Login';
                authBtn.href = 'login.html';
            }
        }
    });

    if (window.lucide) {
        window.lucide.createIcons();
    }
}

// --- Interactive Menu Highlights Filtering ---
function setupMenuHighlights() {
    const tabButtons = document.querySelectorAll('.menu-tabs .tab-btn');
    const highlightCards = document.querySelectorAll('.highlights-grid .highlight-card');

    if (tabButtons.length === 0 || highlightCards.length === 0) return;

    // Attach category data to cards if not set
    const categoriesMap = {
        'Pepperoni Blast': 'pizzas',
        'Veggie Supreme': 'pizzas',
        'Cheese Burst': 'pizzas',
        'BBQ Chicken': 'pizzas'
    };

    highlightCards.forEach(card => {
        const title = card.querySelector('h4')?.textContent?.trim();
        const category = categoriesMap[title] || 'pizzas';
        card.setAttribute('data-category', category);

        // Connect Add to Cart button
        const addBtn = card.querySelector('button');
        if (addBtn && !addBtn.getAttribute('onclick')) {
            const priceText = card.querySelector('.price')?.textContent || '$12.99';
            const priceMatch = priceText.match(/[\d.]+/);
            const price = priceMatch ? parseFloat(priceMatch[0]) : 12.99;
            addBtn.addEventListener('click', () => {
                addToCart(title, price);
            });
        }
    });

    // Tab click handlers
    tabButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            tabButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            const filter = btn.textContent.trim().toLowerCase();

            highlightCards.forEach(card => {
                const cardCat = card.getAttribute('data-category') || 'pizzas';
                if (filter === 'all' || cardCat === filter || (filter === 'pizzas' && cardCat === 'pizzas')) {
                    card.classList.remove('hidden');
                    card.style.animation = 'fadeIn 0.3s ease-out';
                } else {
                    card.classList.add('hidden');
                }
            });
        });
    });

    // Hook up Deals "Order Now" buttons
    const dealCards = document.querySelectorAll('.deal-card');
    dealCards.forEach((card, index) => {
        const btn = card.querySelector('button');
        const title = card.querySelector('h3')?.textContent || 'Special Deal';
        const prices = [18.99, 24.99, 11.99];
        const dealPrice = prices[index] || 15.99;

        if (btn) {
            btn.addEventListener('click', () => {
                addToCart(title, dealPrice);
            });
        }
    });
}

// --- QuickBot Support Widget ---
function setupChatbot() {
    const chatBtn = document.getElementById('chat-btn');
    const chatWidget = document.getElementById('chat-widget');
    const closeBtn = document.getElementById('close-chat');
    const sendBtn = document.getElementById('chat-send');
    const input = document.getElementById('chat-input');
    const body = document.getElementById('chat-body');

    if (!chatBtn || !chatWidget) return;

    // Toggle Chatbot
    chatBtn.addEventListener('click', () => {
        const isOpen = chatWidget.style.display !== 'none';
        chatWidget.style.display = isOpen ? 'none' : 'flex';
        if (!isOpen && input) {
            input.focus();
        }
    });

    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            chatWidget.style.display = 'none';
        });
    }

    // Add quick reply chips if not present
    if (body && !body.querySelector('.chat-chips')) {
        const chipsContainer = document.createElement('div');
        chipsContainer.className = 'chat-chips';
        chipsContainer.innerHTML = `
            <button class="chat-chip" data-msg="Today's best deals">🔥 Top Deals</button>
            <button class="chat-chip" data-msg="Track my order status">📦 Track Order</button>
            <button class="chat-chip" data-msg="Popular recommendations">⭐ What's Popular?</button>
            <button class="chat-chip" data-msg="Vegetarian options">🌱 Veg Options</button>
        `;
        body.appendChild(chipsContainer);

        chipsContainer.querySelectorAll('.chat-chip').forEach(chip => {
            chip.addEventListener('click', () => {
                const message = chip.getAttribute('data-msg');
                sendMessage(message);
            });
        });
    }

    async function sendMessage(textToSend = null) {
        const text = textToSend || (input ? input.value.trim() : '');
        if (!text) return;

        if (input) input.value = '';

        // User bubble
        const userBubble = document.createElement('div');
        userBubble.className = 'chat-msg user';
        userBubble.textContent = text;
        body.appendChild(userBubble);
        body.scrollTop = body.scrollHeight;

        // Bot typing placeholder
        const botTyping = document.createElement('div');
        botTyping.className = 'chat-msg bot';
        botTyping.innerHTML = '<em>QuickBot is typing...</em>';
        body.appendChild(botTyping);
        body.scrollTop = body.scrollHeight;

        // Call ApiService
        const response = await ApiService.getBotResponse(text);

        botTyping.innerHTML = response;
        body.scrollTop = body.scrollHeight;
    }

    if (sendBtn) {
        sendBtn.addEventListener('click', () => sendMessage());
    }

    if (input) {
        input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                sendMessage();
            }
        });
    }
}

// --- Live Order Tracking Logic ---
function setupOrderTracking() {
    const trackingContainer = document.querySelector('.tracking-container');
    if (!trackingContainer) return;

    // Read order from URL param or get latest
    const urlParams = new URLSearchParams(window.location.search);
    const orderIdParam = urlParams.get('orderId');

    const order = orderIdParam ? AuthService.getOrderById(orderIdParam) : AuthService.getLatestOrder();

    if (!order) {
        trackingContainer.innerHTML = `
            <div class="tracking-card" style="text-align: center; padding: 50px 20px;">
                <div style="font-size: 54px; margin-bottom: 16px;">🛵</div>
                <h2>No Active Orders Found</h2>
                <p style="color: #666; margin-bottom: 24px;">You haven't placed an order yet. Treat yourself to fresh, hot food!</p>
                <a href="restaurant.html" class="btn btn-primary">Browse Full Menu</a>
            </div>
        `;
        return;
    }

    const orderHeaderTitle = document.querySelector('.tracking-header h2');
    const orderBadge = document.querySelector('.tracking-header .status-badge');

    if (orderHeaderTitle) orderHeaderTitle.textContent = `Order #${order.id}`;
    if (orderBadge) {
        orderBadge.textContent = order.status;
        orderBadge.className = `status-badge status-step-pill ${order.status.toLowerCase().replace(/\s+/g, '-')}`;
    }

    // Update Timeline Items
    const stages = ['Order Placed', 'Preparing', 'Out for Delivery', 'Delivered'];
    const currentStageIndex = stages.indexOf(order.status) !== -1 ? stages.indexOf(order.status) : 1;

    const timelineItems = document.querySelectorAll('.tracking-timeline .timeline-item');
    timelineItems.forEach((item, index) => {
        item.classList.remove('active', 'completed');
        if (index < currentStageIndex) {
            item.classList.add('completed');
        } else if (index === currentStageIndex) {
            item.classList.add('active');
        }
    });

    // Render Order Details Card below tracking
    let summaryCard = document.getElementById('order-summary-card');
    if (!summaryCard) {
        summaryCard = document.createElement('div');
        summaryCard.id = 'order-summary-card';
        summaryCard.className = 'order-summary-card';
        document.querySelector('.tracking-card').appendChild(summaryCard);
    }

    const itemsHtml = (order.items || []).map(item => `
        <div class="order-item-row">
            <div>
                <span class="order-item-qty">${item.quantity}x</span>
                <strong>${item.name}</strong>
            </div>
            <div>$${(parseFloat(item.price) * item.quantity).toFixed(2)}</div>
        </div>
    `).join('');

    summaryCard.innerHTML = `
        <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:16px;">
            <div>
                <h3 style="font-size:1.15rem; margin-bottom:4px;">Delivery Summary</h3>
                <div style="font-size:0.9rem; color:#6B7280;">Placed on ${order.date}</div>
            </div>
            <button id="advance-status-btn" class="btn btn-secondary btn-sm" style="font-size:0.75rem;">
                Simulate Next Status ⏩
            </button>
        </div>
        <div style="background:#F9FAFB; padding:12px 16px; border-radius:10px; font-size:0.9rem; margin-bottom:16px;">
            <div><strong>Recipient:</strong> ${order.user} (${order.phone})</div>
            <div style="margin-top:4px;"><strong>Address:</strong> ${order.address}</div>
            ${order.instructions ? `<div style="margin-top:4px;color:#6B7280;"><em>Note: ${order.instructions}</em></div>` : ''}
        </div>
        <div class="order-items-list">
            ${itemsHtml}
        </div>
        <div class="order-totals-table">
            <div class="order-total-row">
                <span>Subtotal</span>
                <span>$${parseFloat(order.subtotal || order.total).toFixed(2)}</span>
            </div>
            <div class="order-total-row">
                <span>Delivery Fee</span>
                <span>$${parseFloat(order.deliveryFee || 2.99).toFixed(2)}</span>
            </div>
            <div class="order-total-row grand-total">
                <span>Paid Total</span>
                <span style="color:var(--primary);">$${parseFloat(order.total).toFixed(2)}</span>
            </div>
        </div>
    `;

    // Hook up interactive status simulator button
    const advanceBtn = summaryCard.querySelector('#advance-status-btn');
    if (advanceBtn) {
        advanceBtn.onclick = () => {
            const nextIndex = (currentStageIndex + 1) % stages.length;
            const nextStatus = stages[nextIndex];
            AuthService.updateOrderStatus(order.id, nextStatus);
            showToast('Order Status Updated', `Order #${order.id} is now ${nextStatus}!`, 'info');
            setupOrderTracking();
        };
    }
}

// --- Initialize Everything on DOM Load ---
document.addEventListener('DOMContentLoaded', () => {
    // 1. Elements
    const cartTrigger = document.getElementById('cart-trigger');
    const closeCartBtn = document.getElementById('close-cart');
    const cartOverlay = document.getElementById('cart-overlay');
    const checkoutBtn = document.querySelector('.cart-footer .btn-primary');

    // 2. Cart Open/Close Listeners
    if (cartTrigger) {
        cartTrigger.addEventListener('click', (e) => {
            e.preventDefault();
            toggleCart();
        });
    }

    if (closeCartBtn) closeCartBtn.addEventListener('click', () => toggleCart(false));
    if (cartOverlay) cartOverlay.addEventListener('click', () => toggleCart(false));

    // 3. Checkout Button Listener
    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            if (state.cart.length === 0) {
                showToast('Empty Cart', 'Please add items to your cart first!', 'error');
                return;
            }
            openCheckoutModal();
        });
    }

    // 4. Subsystems
    setupCheckoutModalListeners();
    updateCartUI();
    updateAuthState();
    setupMenuHighlights();
    setupChatbot();
    setupOrderTracking();

    // 5. Lucide icons
    if (window.lucide) {
        window.lucide.createIcons();
    }
});
