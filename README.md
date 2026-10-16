# QuickBite - Web-Enabled Food Ordering Platform

A modern, responsive, web-enabled food ordering and delivery management system designed for fast browsing, real-time order tracking, cart management, and interactive customer support.

---

## 🌟 Key Features

1. **Structured Architecture**:
   - Organized into clean, modular directories (`css/`, `js/`, `assets/images/`).
   - Resilient design ensuring zero 404 missing resource errors.

2. **Dynamically Smooth Surfing & Micro-interactions**:
   - **Non-blocking Toast Notifications**: Instant, smooth visual confirmation when items are added or removed from the cart without interrupting user browsing.
   - **Cart Badge Bounce Animation**: Real-time counter updates with bouncy pop feedback.
   - **Category Filtering**: Dynamic filtering for Pizzas, Sides, and Desserts with smooth fade transitions.
   - **Real-Time Search**: Instant menu filtering as you type on the menu page.
   - **Smooth Scrolling**: Native smooth transitions between menu sections.

3. **Complete Order & Checkout Workflow**:
   - **Persistent Cart State**: Cart items are saved to `localStorage`, preserving user selections across pages and refreshes.
   - **Interactive Delivery Modal**: Collects address, city, phone number, and cooking instructions with auto-fill support for registered users.
   - **Automated Order Processing**: Computes subtotal, taxes, delivery fee, and generates a unique order reference (`#QB-XXXX`).

4. **Live Order Tracking**:
   - 4-stage visual timeline (`Order Placed` $\rightarrow$ `Preparing` $\rightarrow$ `Out for Delivery` $\rightarrow$ `Delivered`).
   - Radar ETA display with pulse animation.
   - Itemized order breakdown showing dishes, prices, quantities, and delivery notes.
   - Built-in **Status Simulator** button (`Simulate Next Status ⏩`) for live demonstrations.

5. **QuickBot Support Assistant**:
   - Floating AI assistant widget available across all pages.
   - Quick reply suggestion chips for instant answers (*Top Deals*, *Track Order*, *Popular Items*, *Veg Options*).
   - Dynamic order lookup directly from local storage.

6. **Authentication & User Profiles**:
   - User registration and login with session management.
   - Built-in **1-Click Demo Account Autofill** (`user@quickbite.com` / `123456`) for rapid evaluation.
   - Password visibility toggles.
   - Header user status indicator with quick access to Order History.

---

## 📁 Project Structure

```text
Web-Enabled-Food-Ordering-Platform/
├── assets/
│   └── images/               # High-res food imagery & deal graphics
│       ├── bbq_chicken.jpg
│       ├── cheese_burst.jpg
│       ├── double_feast.jpg
│       ├── family_special.jpg
│       └── lunch_saver.jpg
├── css/
│   ├── style.css             # Core responsive layout & typography
│   └── features.css          # Modals, chatbot, toasts, & animations
├── js/
│   ├── auth.js               # User auth, sessions, & order storage
│   ├── api.js                # Simulated API service & QuickBot logic
│   └── app.js                # Cart controller, UI binders, & tracking
├── index.html                # Landing page & featured deals
├── restaurant.html           # Full interactive restaurant menu
├── tracking.html             # Live order tracking dashboard
├── login.html                # User login with demo auto-fill
├── signup.html               # New customer registration
└── README.md                 # Project documentation
```

---

## 🚀 Running the Project

To run QuickBite locally using Python's built-in HTTP server:

```bash
# In the project directory:
python -m http.server 8080
```

Then open your browser at:
```text
http://localhost:8080
```

Alternatively, open `index.html` directly in any modern web browser.
