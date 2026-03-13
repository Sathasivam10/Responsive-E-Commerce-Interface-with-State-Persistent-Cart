function renderCartView() {
    const container = document.getElementById('cart-items-container');
    const emptyMsg = document.getElementById('empty-cart-message');
    
    if (!container) return;
    
    container.innerHTML = '';
    
    if (Cart.items.length === 0) {
        emptyMsg.style.display = 'block';
        updateSummary(0);
        return;
    }
    
    emptyMsg.style.display = 'none';
    
    Cart.items.forEach(item => {
        const cartItemEl = document.createElement('div');
        cartItemEl.className = 'cart-item';
        cartItemEl.innerHTML = `
            <img src="${item.image_url}" alt="${item.name}" class="cart-item-img">
            <div class="cart-item-details">
                <div class="cart-item-title">${item.name}</div>
                <div class="cart-item-price price-currency">${parseFloat(item.price).toLocaleString('en-IN')}</div>
            </div>
            <div class="cart-item-actions">
                <div class="qty-controls">
                    <button class="qty-btn dec-btn" data-pid="${item.productId}" data-cid="${item.cartId || ''}">-</button>
                    <input type="text" class="qty-input" value="${item.quantity}" readonly>
                    <button class="qty-btn inc-btn" data-pid="${item.productId}" data-cid="${item.cartId || ''}">+</button>
                </div>
                <button class="btn btn-danger remove-btn" data-pid="${item.productId}" data-cid="${item.cartId || ''}">Remove</button>
            </div>
        `;
        container.appendChild(cartItemEl);
    });

    attachCartListeners();
    updateSummary(Cart.getTotal());
}

function updateSummary(subtotal) {
    const subEl = document.getElementById('summary-subtotal');
    const taxEl = document.getElementById('summary-tax');
    const totalEl = document.getElementById('summary-total');
    
    if (!subEl) return;
    
    const tax = subtotal * 0.18; // 18% tax
    const total = subtotal + tax;

    subEl.textContent = `₹${subtotal.toLocaleString('en-IN', {minimumFractionDigits: 2})}`;
    taxEl.textContent = `₹${tax.toLocaleString('en-IN', {minimumFractionDigits: 2})}`;
    totalEl.textContent = `₹${total.toLocaleString('en-IN', {minimumFractionDigits: 2})}`;
}

function attachCartListeners() {
    document.querySelectorAll('.dec-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const pid = parseInt(e.target.dataset.pid);
            const cid = e.target.dataset.cid ? parseInt(e.target.dataset.cid) : null;
            const currentItem = Cart.items.find(i => i.productId === pid);
            if(currentItem) Cart.updateQuantity(pid, cid, currentItem.quantity - 1);
        });
    });

    document.querySelectorAll('.inc-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const pid = parseInt(e.target.dataset.pid);
            const cid = e.target.dataset.cid ? parseInt(e.target.dataset.cid) : null;
            const currentItem = Cart.items.find(i => i.productId === pid);
            if(currentItem) Cart.updateQuantity(pid, cid, currentItem.quantity + 1);
        });
    });

    document.querySelectorAll('.remove-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const pid = parseInt(e.target.dataset.pid);
            const cid = e.target.dataset.cid ? parseInt(e.target.dataset.cid) : null;
            Cart.removeItem(pid, cid);
        });
    });
}

// Re-render when cart state changes
window.addEventListener('cartUpdated', renderCartView);

// Initial render
document.addEventListener('DOMContentLoaded', () => {
    // Relying on Cart.init() dispatching 'cartUpdated'
    const checkoutBtn = document.getElementById('checkout-btn');
    if(checkoutBtn) {
        checkoutBtn.addEventListener('click', async () => {
            if(Cart.items.length === 0) {
                Auth.showAlert('Your cart is empty', 'error');
                return;
            }
            if(!Auth.getUser()) {
                Auth.showAlert('Please log in to checkout', 'error');
                window.location.href = 'login.html';
                return;
            }
            
            // Mock checkout process
            checkoutBtn.disabled = true;
            checkoutBtn.innerHTML = 'Processing <span class="loader" style="display:inline-block; width:15px; height:15px; margin-left:10px; border-width:2px; vertical-align:middle;"></span>';
            
            setTimeout(async () => {
                await Cart.clearCart();
                Auth.showAlert('Payment successful! Order placed.', 'success');
                checkoutBtn.disabled = false;
                checkoutBtn.textContent = 'Proceed to Checkout';
            }, 1500);
        });
    }
});
