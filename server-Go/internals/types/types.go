package types

import (
	"time"
)

// User struct for PostgreSQL
type User struct {
	ID            int64       `json:"id"`
	Name          string      `json:"name"`
	PhoneNumber   string      `json:"phoneNumber"`
	Role          string      `json:"role"` // Donor, Recipient, Volunteer
	Location      Location    `json:"location"`
	Donations     []int64     `json:"donations"` // References FoodListing
	Requests      []int64     `json:"requests"`  // References FoodRequest
	VolunteerTasks []int64     `json:"volunteerTasks"` // References VolunteerTask
	Badges        []Badge     `json:"badges"`
	ImpactMetrics ImpactMetrics `json:"impactMetrics"`
	CreatedAt     time.Time   `json:"createdAt"`
	UpdatedAt     time.Time   `json:"updatedAt"`
}

// Location struct for storing latitude and longitude
type Location struct {
	Latitude  float64 `json:"latitude"`
	Longitude float64 `json:"longitude"`
	Address   string  `json:"address"`
}

// Badge struct for tracking user achievements
type Badge struct {
	ID        int64     `json:"id"`
	UserID    int64     `json:"userId"`
	Name      string    `json:"name"` // Example: "Pujo Hero"
	EarnedAt  time.Time `json:"earnedAt"`
}

// ImpactMetrics struct for tracking user contributions
type ImpactMetrics struct {
	MealsDonated int     `json:"mealsDonated"`
	WaterSaved   float64 `json:"waterSaved"` // In liters
	CO2Reduced   float64 `json:"co2Reduced"` // In kg
}
