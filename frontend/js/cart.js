const Cart = {
    items: [], // Array of {productId, quantity, name, price, image_url, cart_id (if DB)}
    
    async init() {
        const user = Auth.getUser();
        if (user) {
            await this.fetchDbCart(user.id);
        } else {
            this.loadLocalCart();
        }
        this.updateBadge();
        // Trigger generic event for views to re-render
        window.dispatchEvent(new Event('cartUpdated'));
    },
    
    loadLocalCart() {
        const local = localStorage.getItem('localCart');
        this.items = local ? JSON.parse(local) : [];
    },
    
    saveLocalCart() {
        localStorage.setItem('localCart', JSON.stringify(this.items));
    },
    
    async fetchDbCart(userId) {
        try {
            const response = await fetch(`${API_BASE}/cart/${userId}`);
            if (response.ok) {
                const data = await response.json();
                // Map DB schema to generic items structure
                this.items = data.map(dbItem => ({
                    cartId: dbItem.cart_id,
                    productId: dbItem.product_id,
                    quantity: dbItem.quantity,
                    name: dbItem.name,
                    price: parseFloat(dbItem.price),
                    image_url: dbItem.image_url
                }));
            }
        } catch (error) {
            console.error('Error fetching DB cart', error);
        }
    },
    
    async syncCartWithServer() {
        const user = Auth.getUser();
        if (!user) return;
        
        this.loadLocalCart();
        if (this.items.length > 0) {
            try {
                // Sync local items to server
                const payload = this.items.map(i => ({ productId: i.productId, quantity: i.quantity }));
                await fetch(`${API_BASE}/cart/sync`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ userId: user.id, localCart: payload })
                });
                // Clear local cart after sync
                localStorage.removeItem('localCart');
            } catch(error) {
                console.error('Sync error', error);
            }
        }
        // Finally reload DB cart
        await this.fetchDbCart(user.id);
        this.updateBadge();
    },

    async addItem(product) {
        const user = Auth.getUser();
        
        if (user) {
            try {
                await fetch(`${API_BASE}/cart/add`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ userId: user.id, productId: product.product_id, quantity: 1 })
                });
                await this.fetchDbCart(user.id);
            } catch(e) {
                console.error("Failed to add to DB cart", e);
            }
        } else {
            // LocalCart Logic
            const existing = this.items.find(i => i.productId === product.product_id);
            if (existing) {
                existing.quantity += 1;
            } else {
                this.items.push({
                    productId: product.product_id,
                    quantity: 1,
                    name: product.name,
                    price: parseFloat(product.price),
                    image_url: product.image_url
                });
            }
            this.saveLocalCart();
        }
        
        this.updateBadge();
        Auth.showAlert('Added to cart');
        window.dispatchEvent(new Event('cartUpdated'));
    },

    async updateQuantity(productId, cartId, newQuantity) {
        const user = Auth.getUser();
        
        if (newQuantity <= 0) {
            return this.removeItem(productId, cartId);
        }

        if (user && cartId) {
            try {
                await fetch(`${API_BASE}/cart/update`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ cartId: cartId, quantity: newQuantity })
                });
                await this.fetchDbCart(user.id);
            } catch(e) {
                console.error("Failed to update DB cart", e);
            }
        } else {
            const item = this.items.find(i => i.productId === productId);
            if (item) item.quantity = newQuantity;
            this.saveLocalCart();
        }
        
        this.updateBadge();
        window.dispatchEvent(new Event('cartUpdated'));
    },

    async removeItem(productId, cartId) {
        const user = Auth.getUser();
        
        if (user) {
            try {
                if (cartId) {
                    await fetch(`${API_BASE}/cart/remove`, {
                        method: 'DELETE',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ cartId: cartId })
                    });
                } else {
                    // Fallback using userId and productId
                    await fetch(`${API_BASE}/cart/user/${user.id}/product/${productId}`, {
                        method: 'DELETE',
                        headers: { 'Content-Type': 'application/json' }
                    });
                }
                
                await this.fetchDbCart(user.id);
            } catch(e) {
                console.error("Failed to remove DB item", e);
            }
        } else {
            this.items = this.items.filter(i => i.productId !== productId);
            this.saveLocalCart();
        }
        
        this.updateBadge();
        Auth.showAlert('Item removed from cart', 'success');
        window.dispatchEvent(new Event('cartUpdated'));
    },

    async clearCart() {
        const user = Auth.getUser();
        if (user) {
            try {
                await fetch(`${API_BASE}/cart/clear/${user.id}`, {
                    method: 'DELETE',
                    headers: { 'Content-Type': 'application/json' }
                });
                await this.fetchDbCart(user.id);
            } catch(e) {
                console.error("Failed to clear DB cart", e);
            }
        } else {
            this.items = [];
            this.saveLocalCart();
        }
        
        this.updateBadge();
        window.dispatchEvent(new Event('cartUpdated'));
    },

    updateBadge() {
        const badge = document.getElementById('cart-badge');
        if (badge) {
            const totalItems = this.items.reduce((sum, item) => sum + item.quantity, 0);
            badge.textContent = totalItems;
            
            // Subtle pop animation
            badge.style.transform = 'scale(1.3)';
            setTimeout(() => badge.style.transform = 'scale(1)', 200);
        }
    },
    
    getTotal() {
        return this.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    }
};

// Init cart on load
document.addEventListener('DOMContentLoaded', () => Cart.init());
