package main

import (
	"context"
	"database/sql"
	"log"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"log/slog"

	"firebase.google.com/go/v4/auth"

	"github.com/SudipSarkar1193/GreekGod-Go-server/internals/config"
	"github.com/SudipSarkar1193/GreekGod-Go-server/internals/database"
	"github.com/SudipSarkar1193/GreekGod-Go-server/internals/handlers"
	"github.com/SudipSarkar1193/GreekGod-Go-server/internals/middlewares"
	"github.com/gorilla/mux"
	"github.com/rs/cors"
)

// Route struct to store API endpoints
type Route struct {
	Path    string
	Method  string
	Handler http.HandlerFunc
	Auth    bool // Apply authentication middleware if true
}

// Function to return all API routes
func getRoutes(db *sql.DB, client *auth.Client) []Route {
	return []Route{
		//{"/api/users/new", "POST", handlers.New(db), false},

	}
}

// Register routes dynamically using Gorilla Mux
func registerRoutes(router *mux.Router, db *sql.DB, client *auth.Client) {
	for _, route := range getRoutes(db, client) {
		handler := route.Handler

		if route.Auth {
			handler = middlewares.AuthMiddleware(handler)
		}

		router.HandleFunc(route.Path, handler).Methods(route.Method)

		log.Printf("Registered route: %s [%s]", route.Path, route.Method)
	}
}

func main() {
	// Load configuration and connect to database
	cfg := config.MustLoad()
	db := database.ConnectToDatabase(cfg.PsqlInfo)

	if err := config.LoadEnvFile(".env"); err != nil {
		slog.Warn("Error loading .env file", slog.String("error", err.Error()))
	}

	// Initialize Firebase Auth client
	client := handlers.InitializeFirebaseApp()

	// Configure CORS
	c := cors.New(cors.Options{
		AllowedOrigins:   []string{"http://localhost:5173", "https://try-your-gyan.vercel.app"},
		AllowedMethods:   []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowedHeaders:   []string{"Content-Type", "Authorization", "Access-Control-Allow-Origin"},
		AllowCredentials: true,
	})

	// Initialize router
	router := mux.NewRouter() ;

	// Register routes dynamically
	registerRoutes(router, db, client)

	// Wrap with CORS middleware
	handler := c.Handler(router)
	handler = middlewares.CoopMiddleware(handler)

	// Setup HTTP server
	server := http.Server{
		Addr:    cfg.Addr,
		Handler: handler,
	}

	// Graceful shutdown setup
	done := make(chan os.Signal, 1)
	signal.Notify(done, os.Interrupt, syscall.SIGINT, syscall.SIGTERM)

	go func() {
		if err := server.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			log.Fatal("Failed to start server:", err)
		} else {
			slog.Info("Server started at", slog.String("PORT", cfg.Addr))
		}
	}()

	<-done
	slog.Info("Shutting down the server...")

	// Gracefully shutdown the server with a timeout
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	if err := server.Shutdown(ctx); err != nil {
		slog.Error("Failed to shut down server", slog.String("Error", err.Error()))
	} else {
		slog.Info("Server shut down successfully")
	}
}

// import (
// 	"fmt"
// 	"os"

// 	"github.com/SudipSarkar1193/GreekGod-Go-server/internals/config"
// 	//"github.com/SudipSarkar1193/GreekGod-Go-server/internals/database"
// 	"github.com/SudipSarkar1193/GreekGod-Go-server/internals/handlers"
// )
// func main(){
// 	// 	// Load configuration and connect to database
//  	//cfg := config.MustLoad()
// 	// db := database.ConnectToDatabase(cfg.PsqlInfo)
// 	// fmt.Println("database ->",db);
// 	if err := config.LoadEnvFile(".env");err !=nil{
// 		fmt.Println("Error loading env")
// 	}
// 	data := os.Getenv("FIREBASE_SERVICE_ACCOUNT")
// 	fmt.Println("data ->",data)
// 	fmt.Println("--------------------------------**-----------------------------");
// 	client:= handlers.InitializeFirebaseApp();
	
// 	fmt.Println("client -->>",client);
// }