// Cart functionality
let cartCount = 0;

// Add to cart
function addToCart(bookId) {
    const formData = new FormData();
    formData.append('bookId', bookId);
    
    fetch('/add-to-cart', {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            updateCartCount(data.count);
            showNotification('Book added to cart!');
        }
    })
    .catch(error => {
        console.error('Error adding to cart:', error);
    });
}

// Remove from cart
function removeFromCart(bookId) {
    updateCartItem(bookId, 'remove');
}

// Update quantity
function updateQuantity(bookId, change) {
    const action = change > 0 ? 'increase' : 'decrease';
    updateCartItem(bookId, action);
}

// Update cart item
function updateCartItem(bookId, action) {
    const formData = new FormData();
    formData.append('bookId', bookId);
    formData.append('action', action);
    
    fetch('/update-cart', {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            updateCartDisplay();
        }
    })
    .catch(error => {
        console.error('Error updating cart:', error);
    });
}

// Update cart count
function updateCartCount(count) {
    cartCount = count;
    document.getElementById('cart-count').textContent = cartCount;
}

// Open cart
function openCart() {
    updateCartDisplay();
    document.getElementById('cart-modal').style.display = 'block';
}

// Close cart
function closeCart() {
    document.getElementById('cart-modal').style.display = 'none';
}

// Update cart display
function updateCartDisplay() {
    fetch('/cart')
        .then(response => response.json())
        .then(cart => {
            const cartItems = document.getElementById('cart-items');
            const cartTotal = document.getElementById('cart-total');
            
            cartItems.innerHTML = '';
            
            if (cart.length === 0) {
                cartItems.innerHTML = '<p>Your cart is empty.</p>';
                cartTotal.textContent = '0.00';
                updateCartCount(0);
                return;
            }
            
            let total = 0;
            
            cart.forEach(item => {
                const itemTotal = item.book.price * item.quantity;
                total += itemTotal;
                
                const cartItem = document.createElement('div');
                cartItem.className = 'cart-item';
                cartItem.innerHTML = `
                    <div class="cart-item-info">
                        <h4>${item.book.title}</h4>
                        <p>$${item.book.price.toFixed(2)} each</p>
                    </div>
                    <div class="cart-item-controls">
                        <button class="quantity-btn minus" data-id="${item.book.id}">-</button>
                        <span class="quantity">${item.quantity}</span>
                        <button class="quantity-btn plus" data-id="${item.book.id}">+</button>
                        <button class="remove-btn" data-id="${item.book.id}">Remove</button>
                    </div>
                `;
                
                cartItems.appendChild(cartItem);
            });
            
            cartTotal.textContent = total.toFixed(2);
            updateCartCount(cart.reduce((total, item) => total + item.quantity, 0));
            
            // Add event listeners to cart buttons
            document.querySelectorAll('.quantity-btn.minus').forEach(btn => {
                btn.addEventListener('click', function() {
                    const id = parseInt(this.getAttribute('data-id'));
                    updateQuantity(id, -1);
                });
            });
            
            document.querySelectorAll('.quantity-btn.plus').forEach(btn => {
                btn.addEventListener('click', function() {
                    const id = parseInt(this.getAttribute('data-id'));
                    updateQuantity(id, 1);
                });
            });
            
            document.querySelectorAll('.remove-btn').forEach(btn => {
                btn.addEventListener('click', function() {
                    const id = parseInt(this.getAttribute('data-id'));
                    removeFromCart(id);
                });
            });
            
            // Checkout button
            document.getElementById('checkout-btn').addEventListener('click', function() {
                checkout();
            });
        })
        .catch(error => {
            console.error('Error fetching cart:', error);
        });
}

// Checkout
function checkout() {
    fetch('/checkout', {
        method: 'POST'
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            alert('Thank you for your purchase! Your order has been placed.');
            updateCartDisplay();
            closeCart();
        }
    })
    .catch(error => {
        console.error('Error during checkout:', error);
    });
}

// Show notification
function showNotification(message) {
    const notification = document.createElement('div');
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        background-color: #27ae60;
        color: white;
        padding: 1rem;
        border-radius: 4px;
        z-index: 1000;
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.opacity = '0';
        notification.style.transition = 'opacity 0.5s';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 500);
    }, 2000);
}