// DOM Content Loaded
document.addEventListener('DOMContentLoaded', function() {
    fetchBooks('all');
    setupEventListeners();
});

// Fetch books from server based on category
function fetchBooks(category) {
    const url = category === 'all' ? '/books' : `/books?category=${category}`;
    
    fetch(url)
        .then(response => response.json())
        .then(books => {
            displayBooks(books);
        })
        .catch(error => {
            console.error('Error fetching books:', error);
        });
}

// Display books
function displayBooks(books) {
    const booksContainer = document.getElementById('books-container');
    booksContainer.innerHTML = '';
    
    books.forEach(book => {
        const bookElement = createBookElement(book);
        booksContainer.appendChild(bookElement);
    });
}

// Create book card element
function createBookElement(book) {
    const bookCard = document.createElement('div');
    bookCard.className = 'book-card';
    
    bookCard.innerHTML = `
        <div class="book-image">
            <img src="${book.image}" alt="${book.title}">
        </div>
        <div class="book-info">
            <h3 class="book-title">${book.title}</h3>
            <p class="book-author">by ${book.author}</p>
            <p class="book-price">£${book.price.toFixed(2)}</p>
            <button class="add-to-cart" data-id="${book.id}">Add to Cart</button>
        </div>
    `;
    
    return bookCard;
}

// Setup event listeners
function setupEventListeners() {
    // Filter buttons
    const filterButtons = document.querySelectorAll('.filter-btn');
    filterButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Remove active class from all buttons
            filterButtons.forEach(btn => btn.classList.remove('active'));
            
            // Add active class to clicked button
            this.classList.add('active');
            
            // Filter books
            const filter = this.getAttribute('data-filter');
            fetchBooks(filter);
        });
    });
    
    // Add to cart buttons (delegation)
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('add-to-cart')) {
            const bookId = parseInt(e.target.getAttribute('data-id'));
            addToCart(bookId);
        }
    });
    
    // Cart button
    document.getElementById('cart-btn').addEventListener('click', function() {
        openCart();
    });
    
    // Close modal
    document.querySelector('.close').addEventListener('click', function() {
        closeCart();
    });
    
    // Click outside modal to close
    window.addEventListener('click', function(e) {
        const modal = document.getElementById('cart-modal');
        if (e.target === modal) {
            closeCart();
        }
    });
    
    // Contact form
    document.getElementById('contact-form').addEventListener('submit', function(e) {
        e.preventDefault();
        alert('Thank you for your message! We will get back to you soon.');
        this.reset();
    });
}

// CTA button scroll to books
document.querySelector('.cta-btn').addEventListener('click', function() {
    document.getElementById('books').scrollIntoView({ behavior: 'smooth' });
});