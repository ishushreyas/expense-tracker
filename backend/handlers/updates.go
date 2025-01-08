package handlers

import (
	"encoding/json"
	"fmt"
	"net/http"
	"time"

	"cloud.google.com/go/storage"
	"github.com/gorilla/mux"
	"github.com/jackc/pgx/v5/pgxpool"
)

type Story struct {
	ID        int64     `json:"id"`
	Username  string    `json:"username"`
	Content   string    `json:"content"`
	ImageURL  string    `json:"image_url,omitempty"`
	Timestamp time.Time `json:"timestamp"`
}

type Handler struct {
	db      *pgxpool.Pool
	storage *storage.Client
	bucket  string
}

func NewHandler(db *pgxpool.Pool, storage *storage.Client, bucketName string) *Handler {
	return &Handler{
		db:      db,
		storage: storage,
		bucket:  bucketName,
	}
}

// GetStories retrieves all stories, ordered by timestamp
func (h *Handler) GetStories(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	
	rows, err := h.db.Query(ctx, `
		SELECT id, username, content, image_url, timestamp 
		FROM stories 
		ORDER BY timestamp DESC
	`)
	if err != nil {
		http.Error(w, "Failed to fetch stories", http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	var stories []Story
	for rows.Next() {
		var story Story
		err := rows.Scan(&story.ID, &story.Username, &story.Content, &story.ImageURL, &story.Timestamp)
		if err != nil {
			http.Error(w, "Failed to scan story", http.StatusInternalServerError)
			return
		}
		stories = append(stories, story)
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(stories)
}

// CreateStory handles creating a new story with optional image upload
func (h *Handler) CreateStory(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	
	// Parse multipart form for file upload
	err := r.ParseMultipartForm(10 << 20) // 10 MB max
	if err != nil {
		http.Error(w, "Failed to parse form", http.StatusBadRequest)
		return
	}

	content := r.FormValue("content")
	username := r.FormValue("username")

	var imageURL string
	
	// Handle image upload if present
	file, header, err := r.FormFile("image")
	if err == nil {
		defer file.Close()
		
		// Generate unique filename
		filename := fmt.Sprintf("stories/%d_%s", time.Now().Unix(), header.Filename)
		
		// Create new bucket object
		obj := h.storage.Bucket(h.bucket).Object(filename)
		writer := obj.NewWriter(ctx)
		
		// Copy file to Firebase Storage
		if _, err := writer.Write([]byte{}); err != nil {
			http.Error(w, "Failed to upload image", http.StatusInternalServerError)
			return
		}
		
		if err := writer.Close(); err != nil {
			http.Error(w, "Failed to close writer", http.StatusInternalServerError)
			return
		}
		
		// Get public URL
		imageURL = fmt.Sprintf("https://storage.googleapis.com/%s/%s", h.bucket, filename)
	}

	// Insert story into database
	var story Story
	err = h.db.QueryRow(ctx, `
		INSERT INTO stories (username, content, image_url, timestamp)
		VALUES ($1, $2, $3, NOW())
		RETURNING id, username, content, image_url, timestamp
	`, username, content, imageURL).Scan(
		&story.ID, &story.Username, &story.Content, &story.ImageURL, &story.Timestamp,
	)

	if err != nil {
		http.Error(w, "Failed to create story", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(story)
}

// DeleteStory handles story deletion
func (h *Handler) DeleteStory(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	vars := mux.Vars(r)
	id := vars["id"]

	// First get the story to check if it has an image
	var imageURL string
	err := h.db.QueryRow(ctx, "SELECT image_url FROM stories WHERE id = $1", id).Scan(&imageURL)
	if err != nil {
		http.Error(w, "Story not found", http.StatusNotFound)
		return
	}

	// Delete image from Firebase if it exists
	if imageURL != "" {
		obj := h.storage.Bucket(h.bucket).Object(imageURL)
		if err := obj.Delete(ctx); err != nil {
			// Log error but continue with story deletion
			fmt.Printf("Failed to delete image: %v\n", err)
		}
	}

	// Delete story from database
	_, err = h.db.Exec(ctx, "DELETE FROM stories WHERE id = $1", id)
	if err != nil {
		http.Error(w, "Failed to delete story", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusNoContent)
}

// SetupRoutes configures the routes for the stories API
func (h *Handler) SetupRoutes(r *mux.Router) {
	r.HandleFunc("/stories", h.GetStories).Methods("GET")
	r.HandleFunc("/stories", h.CreateStory).Methods("POST")
	r.HandleFunc("/stories/{id}", h.DeleteStory).Methods("DELETE")
}
