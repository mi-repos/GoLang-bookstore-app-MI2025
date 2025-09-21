package main

import (
	"encoding/json"
	"fmt"
	"html/template"
	"log"
	"net/http"
	"strconv"
)

// Book struct represents a book in the store
type Book struct {
	ID       int     `json:"id"`
	Title    string  `json:"title"`
	Author   string  `json:"author"`
	Price    float64 `json:"price"`
	Category string  `json:"category"`
	Image    string  `json:"image"`
}

// CartItem represents an item in the shopping cart
type CartItem struct {
	Book     Book `json:"book"`
	Quantity int  `json:"quantity"`
}

// Global variables (in a real app, use a database)
var books []Book
var cart []CartItem

func main() {
	// Initialize sample data
	initData()
	
	// Setup routes
	http.HandleFunc("/", indexHandler)
	http.HandleFunc("/books", booksHandler)
	http.HandleFunc("/add-to-cart", addToCartHandler)
	http.HandleFunc("/cart", cartHandler)
	http.HandleFunc("/update-cart", updateCartHandler)
	http.HandleFunc("/checkout", checkoutHandler)
	
	// Serve static files
	http.Handle("/static/", http.StripPrefix("/static/", http.FileServer(http.Dir("static"))))
	
	// Start server
	fmt.Println("Server starting on :8080")
	log.Fatal(http.ListenAndServe(":8080", nil))
}

func initData() {
	books = []Book{
		{
			ID:       1,
			Title:    "The Great Gatsby",
			Author:   "F. Scott Fitzgerald",
			Price:    12.99,
			Category: "fiction",
			Image:    "https://placehold.co/300x400/34495e/ffffff?text=The+Great+Gatsby",
		},
		{
			ID:       2,
			Title:    "Mockingbird",
			Author:   "Harper Lee",
			Price:    11.50,
			Category: "fiction",
			Image:    "https://placehold.co/300x400/34495e/ffffff?text=Mockingbird",
		},
		{
			ID:       3,
			Title:    "1984",
			Author:   "George Orwell",
			Price:    10.25,
			Category: "fiction",
			Image:    "https://placehold.co/300x400/34495e/ffffff?text=1984",
		},
		{
			ID:       4,
			Title:    "Pride and Prejudice",
			Author:   "Jane Austen",
			Price:    9.99,
			Category: "fiction",
			Image:    "https://placehold.co/300x400/34495e/ffffff?text=Pride+and+Prejudice",
		},
		{
			ID:       5,
			Title:    "The Hobbit",
			Author:   "J.R.R. Tolkien",
			Price:    14.95,
			Category: "fantasy",
			Image:    "https://placehold.co/300x400/34495e/ffffff?text=The+Hobbit",
		},
		{
			ID:       6,
			Title:    "Harry Potter and the Philosopher's Stone",
			Author:   "J.K. Rowling",
			Price:    15.99,
			Category: "fantasy",
			Image:    "https://placehold.co/300x400/34495e/ffffff?text=Harry+Potter",
		},
		{
			ID:       7,
			Title:    "The Diary of a Young Girl",
			Author:   "Anne Frank",
			Price:    8.75,
			Category: "non-fiction",
			Image:    "https://placehold.co/300x400/34495e/ffffff?text=Diary+of+a+Young+Girl",
		},
		{
			ID:       8,
			Title:    "Sapiens: A Brief History of Humankind",
			Author:   "Yuval Noah Harari",
			Price:    18.99,
			Category: "non-fiction",
			Image:    "https://placehold.co/300x400/34495e/ffffff?text=Sapiens",
		},
	}
}

func indexHandler(w http.ResponseWriter, r *http.Request) {
	tmpl, err := template.ParseFiles("templates/index.html")
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	
	data := struct {
		Books []Book
	}{
		Books: books,
	}
	
	tmpl.Execute(w, data)
}

func booksHandler(w http.ResponseWriter, r *http.Request) {
	category := r.URL.Query().Get("category")
	
	var filteredBooks []Book
	if category == "" || category == "all" {
		filteredBooks = books
	} else {
		for _, book := range books {
			if book.Category == category {
				filteredBooks = append(filteredBooks, book)
			}
		}
	}
	
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(filteredBooks)
}

func addToCartHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}
	
	bookID, err := strconv.Atoi(r.FormValue("bookId"))
	if err != nil {
		http.Error(w, "Invalid book ID", http.StatusBadRequest)
		return
	}
	
	// Find the book
	var book Book
	for _, b := range books {
		if b.ID == bookID {
			book = b
			break
		}
	}
	
	if book.ID == 0 {
		http.Error(w, "Book not found", http.StatusNotFound)
		return
	}
	
	// Check if book is already in cart
	found := false
	for i, item := range cart {
		if item.Book.ID == bookID {
			cart[i].Quantity++
			found = true
			break
		}
	}
	
	if !found {
		cart = append(cart, CartItem{Book: book, Quantity: 1})
	}
	
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"success": true,
		"message": "Book added to cart",
		"count":   len(cart),
	})
}

func cartHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(cart)
}

func updateCartHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}
	
	bookID, err := strconv.Atoi(r.FormValue("bookId"))
	if err != nil {
		http.Error(w, "Invalid book ID", http.StatusBadRequest)
		return
	}
	
	action := r.FormValue("action")
	
	for i, item := range cart {
		if item.Book.ID == bookID {
			if action == "increase" {
				cart[i].Quantity++
			} else if action == "decrease" {
				cart[i].Quantity--
				if cart[i].Quantity <= 0 {
					cart = append(cart[:i], cart[i+1:]...)
				}
			} else if action == "remove" {
				cart = append(cart[:i], cart[i+1:]...)
			}
			break
		}
	}
	
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"success": true,
		"cart":    cart,
	})
}

func checkoutHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}
	
	// In a real application, you would process the payment here
	cart = []CartItem{} // Clear the cart
	
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"success": true,
		"message": "Checkout successful!",
	})
}