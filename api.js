/**
 * API Service
 * Handles network communication with simulated delays, backend error handling,
 * and smart QuickBot support engine.
 */

const ApiService = {
    /**
     * Simulate login API call with realistic latency
     */
    async login(email, password) {
        await new Promise(resolve => setTimeout(resolve, 400));
        try {
            return AuthService.login(email, password);
        } catch (error) {
            console.error("Login API error:", error);
            return { success: false, message: "An unexpected network error occurred." };
        }
    },

    /**
     * Simulate register API call
     */
    async register(name, email, password) {
        await new Promise(resolve => setTimeout(resolve, 500));
        try {
            return AuthService.register(name, email, password);
        } catch (error) {
            console.error("Registration API error:", error);
            return { success: false, message: "An unexpected network error occurred." };
        }
    },

    /**
     * Submit customer review
     */
    async submitReview(data) {
        await new Promise(resolve => setTimeout(resolve, 400));
        console.log("Customer Review Submitted:", data);
        return { success: true, message: "Thank you! Your review has been submitted successfully." };
    },

    /**
     * Intelligent QuickBot response generator
     */
    async getBotResponse(userMsg) {
        // Realistic bot typing delay
        await new Promise(resolve => setTimeout(resolve, 450));

        const msg = (userMsg || '').toLowerCase().trim();

        if (msg.includes('order') || msg.includes('track') || msg.includes('status') || msg.includes('where is')) {
            const latest = AuthService.getLatestOrder();
            if (latest) {
                return `📦 Your order <strong>${latest.id}</strong> is currently <strong>${latest.status}</strong>! <a href="tracking.html" style="color:#E31837;font-weight:700;text-decoration:underline;">Click here to track live</a>.`;
            }
            return "You don't have any active orders right now. Browse our <a href='restaurant.html' style='color:#E31837;font-weight:700;'>delicious menu</a> to place one!";
        }

        if (msg.includes('deal') || msg.includes('offer') || msg.includes('coupon') || msg.includes('discount')) {
            return "🔥 Today's top offers:<br>• <strong>Double Feast</strong>: Buy 1 Medium Pizza & Get 1 Free!<br>• <strong>Lunch Saver</strong>: 40% OFF all items (12 PM - 3 PM).<br>Check our home page for instant ordering!";
        }

        if (msg.includes('popular') || msg.includes('recommend') || msg.includes('best') || msg.includes('special')) {
            return "⭐ Our customer favorites are the <strong>Pepperoni Blast</strong>, <strong>Cheese Burst Supreme</strong>, and <strong>Whopper Meal</strong>! You can tap 'Add to Cart' directly on the menu.";
        }

        if (msg.includes('veg') || msg.includes('vegetarian')) {
            return "🌱 We have great vegetarian options: <strong>Veggie Supreme</strong>, <strong>Cheese Burst Pizza</strong>, and <strong>Golden Crispy Onion Rings</strong>!";
        }

        if (msg.includes('delivery') || msg.includes('time') || msg.includes('speed') || msg.includes('how long')) {
            return "⚡ QuickBite delivers steaming hot food within <strong>30 minutes</strong>, or your next delivery is free!";
        }

        if (msg.includes('contact') || msg.includes('phone') || msg.includes('manager') || msg.includes('help') || msg.includes('support')) {
            return "📞 You can reach our support desk 24/7 at <strong>support.quickbitefood12@gmail.com</strong> or call <strong>+91 98765 43210</strong>.";
        }

        if (msg.includes('hi') || msg.includes('hello') || msg.includes('hey')) {
            const user = AuthService.getCurrentUser();
            const name = user ? user.name.split(' ')[0] : 'friend';
            return `Hello ${name}! 👋 I am QuickBot, your personal food assistant. How can I help you today? Ask me about deals, recommendations, or order tracking!`;
        }

        return "I can help with popular pizzas, today's deals, delivery times, or tracking your active orders. What would you like to know?";
    }
};

// Expose to window
window.ApiService = ApiService;
