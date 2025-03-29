package middlewares

import (
	"fmt"

	"net/http"
	"os"

	"strings"

	"github.com/golang-jwt/jwt/v5"
)

// AuthMiddleware verifies the access token from the request header
func AuthMiddleware(next http.HandlerFunc) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {

		// log.Printf("DEBUG: AuthMiddleware hit, Path: %s, Method: %s\n", r.URL.Path, r.Method)
		// log.Println()
		var jwtSecret = []byte(os.Getenv("JWT_SECRET_KEY"))
		authHeader := r.Header.Get("Authorization")

		if authHeader == "" || !strings.HasPrefix(authHeader, "Bearer ") {
			http.Error(w, "Authorization header is required !", http.StatusUnauthorized)
			return
		}

		tokenStr := strings.TrimPrefix(authHeader, "Bearer ")

		// Parse and validate the token
		token, err := jwt.Parse(tokenStr, func(token *jwt.Token) (interface{}, error) {
			if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
				return nil, fmt.Errorf("unexpected signing method: %v", token.Header["alg"])
			}
			return jwtSecret, nil
		})

		if err != nil || !token.Valid { // !token.Valid: If the token itself is invalid (e.g., incorrect signature or expired)
			http.Error(w, "Invalid or expired token", http.StatusUnauthorized)
			return
		}

		// Extract user information from token claims
		claims, ok := token.Claims.(jwt.MapClaims)

		if ok && token.Valid {
			// Attach user ID or other details to request context
			r.Header.Set("userID", fmt.Sprintf("%v", claims["sub"]))
			r.Header.Set("username", fmt.Sprintf("%v", claims["name"]))
		} else {
			http.Error(w, "Could not parse token claims", http.StatusUnauthorized)
			return
		}

		next.ServeHTTP(w, r)
	}
}
