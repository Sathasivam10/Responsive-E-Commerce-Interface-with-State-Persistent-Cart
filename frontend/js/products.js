let allProducts = [];

async function fetchProducts() {
    const loader = document.getElementById('loader');
    const grid = document.getElementById('product-grid');
    
    if (loader) loader.style.display = 'block';
    
    try {
        const response = await fetch(`${API_BASE}/products`);
        if (response.ok) {
            allProducts = await response.json();
            renderProducts(allProducts);
        }
    } catch (error) {
        console.error('Error fetching products:', error);
        Auth.showAlert('Failed to load products', 'error');
    } finally {
        if (loader) loader.style.display = 'none';
    }
}

function renderProducts(products) {
    const grid = document.getElementById('product-grid');
    if (!grid) return;
    
    grid.innerHTML = '';
    
    if (products.length === 0) {
        grid.innerHTML = '<div class="empty-state"><p>No products found.</p></div>';
        return;
    }

    products.forEach(product => {
        const card = document.createElement('div');
        card.className = 'card';
        card.innerHTML = `
            <div class="card-img-wrapper">
                <img src="${product.image_url}" alt="${product.name}" loading="lazy">
            </div>
            <div class="card-body">
                <h3 class="card-title">${product.name}</h3>
                <p class="card-desc">${product.description}</p>
                <div class="card-price price-currency">${parseFloat(product.price).toLocaleString('en-IN')}</div>
                <button class="btn btn-primary full-width add-to-cart-btn" data-id="${product.product_id}">
                    Add to Cart
                </button>
            </div>
        `;
        grid.appendChild(card);
    });

    // Attach event listeners
    document.querySelectorAll('.add-to-cart-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const productId = parseInt(e.target.dataset.id);
            const product = allProducts.find(p => p.product_id === productId);
            if (product) Cart.addItem(product);
        });
    });
}

// Search functionality
document.addEventListener('DOMContentLoaded', () => {
    fetchProducts();
    
    const searchInput = document.getElementById('search-input');
    if(searchInput) {
        searchInput.addEventListener('input', (e) => {
            const query = e.target.value.toLowerCase();
            const filtered = allProducts.filter(p => 
                p.name.toLowerCase().includes(query) || 
                p.description.toLowerCase().includes(query)
            );
            renderProducts(filtered);
        });
    }
});
