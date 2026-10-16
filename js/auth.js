/**
 * Authentication & Local Storage Database Service
 * Provides user authentication, session persistence, and order management.
 */

const AuthService = {
    // Keys for localStorage
    USERS_KEY: 'quickbite_users',
    CURRENT_USER_KEY: 'quickbite_current_user',
    ORDERS_KEY: 'quickbite_orders',

    /**
     * Initialize database keys with demo seed data if not present
     */
    init() {
        // Initialize default user
        if (!localStorage.getItem(this.USERS_KEY)) {
            const defaultUsers = [
                {
                    id: 'usr-1',
                    name: 'Varun Aditya',
                    email: 'user@quickbite.com',
                    password: '123456'
                }
            ];
            localStorage.setItem(this.USERS_KEY, JSON.stringify(defaultUsers));
        }

        // Initialize default sample order if none exists
        if (!localStorage.getItem(this.ORDERS_KEY)) {
            const sampleOrders = [
                {
                    id: 'QB-2891',
                    user: 'Varun Aditya',
                    email: 'user@quickbite.com',
                    address: 'Flat 402, Royal Palms, Civil Lines',
                    city: 'Gorakhpur',
                    phone: '+91 98765 43210',
                    instructions: 'Please deliver hot and ring the bell',
                    items: [
                        { id: 'item-1', name: 'Pepperoni Blast', price: 14.99, quantity: 1 },
                        { id: 'item-2', name: 'Garlic Bread Sticks', price: 4.99, quantity: 2 },
                        { id: 'item-3', name: 'Chilled Coke (500ml)', price: 2.49, quantity: 2 }
                    ],
                    subtotal: '29.95',
                    deliveryFee: '2.99',
                    total: '32.94',
                    date: new Date(Date.now() - 15 * 60 * 1000).toLocaleString(),
                    status: 'Preparing',
                    estimatedMinutes: 18
                }
            ];
            localStorage.setItem(this.ORDERS_KEY, JSON.stringify(sampleOrders));
        }
    },

    /**
     * Register a new user
     * @param {string} name 
     * @param {string} email 
     * @param {string} password 
     * @returns {object} { success: boolean, message: string }
     */
    register(name, email, password) {
        this.init();
        const users = JSON.parse(localStorage.getItem(this.USERS_KEY) || '[]');

        // Check if email exists (case insensitive)
        const cleanEmail = email.trim().toLowerCase();
        if (users.find(u => u.email.toLowerCase() === cleanEmail)) {
            return { success: false, message: 'An account with this email already exists.' };
        }

        // Create new user
        const newUser = {
            id: 'usr-' + Date.now().toString(),
            name: name.trim(),
            email: cleanEmail,
            password
        };

        users.push(newUser);
        localStorage.setItem(this.USERS_KEY, JSON.stringify(users));

        // Auto login session
        this.setCurrentUser(newUser);

        return { success: true, message: 'Registration successful! Welcome to QuickBite.' };
    },

    /**
     * Login user
     * @param {string} email 
     * @param {string} password 
     * @returns {object} { success: boolean, message: string }
     */
    login(email, password) {
        this.init();
        const users = JSON.parse(localStorage.getItem(this.USERS_KEY) || '[]');
        const cleanEmail = email.trim().toLowerCase();

        const user = users.find(u => u.email.toLowerCase() === cleanEmail && u.password === password);

        if (user) {
            this.setCurrentUser(user);
            return { success: true, message: 'Welcome back, ' + user.name.split(' ')[0] + '!' };
        }

        return { success: false, message: 'Invalid email address or password. Try demo: user@quickbite.com / 123456' };
    },

    /**
     * Logout user
     */
    logout() {
        localStorage.removeItem(this.CURRENT_USER_KEY);
        window.location.href = 'index.html';
    },

    /**
     * Get current logged in user
     * @returns {object|null}
     */
    getCurrentUser() {
        try {
            return JSON.parse(localStorage.getItem(this.CURRENT_USER_KEY));
        } catch (e) {
            return null;
        }
    },

    /**
     * Set current user session (never saves raw password in session)
     * @param {object} user 
     */
    setCurrentUser(user) {
        const sessionUser = { ...user };
        delete sessionUser.password;
        localStorage.setItem(this.CURRENT_USER_KEY, JSON.stringify(sessionUser));
    },

    /**
     * Check if user is authenticated
     * @returns {boolean}
     */
    isAuthenticated() {
        return !!localStorage.getItem(this.CURRENT_USER_KEY);
    },

    // --- Order Management ---
    /**
     * Save order to localStorage
     * @param {object} order 
     */
    saveOrder(order) {
        this.init();
        let orders = this.getOrders();
        orders.unshift(order); // Add newest order to top
        localStorage.setItem(this.ORDERS_KEY, JSON.stringify(orders));
        return order;
    },

    /**
     * Retrieve all orders
     * @returns {Array}
     */
    getOrders() {
        try {
            return JSON.parse(localStorage.getItem(this.ORDERS_KEY) || '[]');
        } catch (e) {
            return [];
        }
    },

    /**
     * Retrieve latest active order
     * @returns {object|null}
     */
    getLatestOrder() {
        const orders = this.getOrders();
        return orders.length > 0 ? orders[0] : null;
    },

    /**
     * Find order by ID
     * @param {string} orderId 
     * @returns {object|null}
     */
    getOrderById(orderId) {
        const orders = this.getOrders();
        return orders.find(o => o.id === orderId) || null;
    },

    /**
     * Update order status
     * @param {string} orderId 
     * @param {string} newStatus 
     */
    updateOrderStatus(orderId, newStatus) {
        const orders = this.getOrders();
        const index = orders.findIndex(o => o.id === orderId);
        if (index !== -1) {
            orders[index].status = newStatus;
            localStorage.setItem(this.ORDERS_KEY, JSON.stringify(orders));
            return orders[index];
        }
        return null;
    },

    /**
     * Get all registered users
     * @returns {Array}
     */
    getAllUsers() {
        try {
            return JSON.parse(localStorage.getItem(this.USERS_KEY) || '[]');
        } catch (e) {
            return [];
        }
    },

    /**
     * Reset/Clear database for fresh testing
     */
    clearDatabase() {
        localStorage.removeItem(this.USERS_KEY);
        localStorage.removeItem(this.ORDERS_KEY);
        localStorage.removeItem(this.CURRENT_USER_KEY);
        window.location.reload();
    }
};

// Expose to window immediately
window.AuthService = AuthService;

// Auto-run initialization
AuthService.init();
