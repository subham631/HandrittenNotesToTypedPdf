package database

import (
	"database/sql"
	"fmt"
	"log"

	"github.com/SudipSarkar1193/GreekGod-Go-server/internals/types"
	_ "github.com/lib/pq"
)

func ConnectToDatabase(connectionString string) *sql.DB {

	db, err := sql.Open("postgres", connectionString)
	if err != nil {
		panic(err)
	}

	err = db.Ping()
	if err != nil {
		panic(err)
	}

	fmt.Println("Successfully connected!")
	return db
}

func DisplayData(db *sql.DB) {
	fmt.Println()
	fmt.Println("INSIDE func DisplayData")
	fmt.Println()
	// Replace 'your_table' with the name of your table
	rows, err := db.Query("SELECT * FROM quizzes")
	if err != nil {
		log.Fatal("r =>", err)
	}
	defer rows.Close()

	// Get column names for formatting
	columns, err := rows.Columns()
	if err != nil {
		log.Fatal("c =>", err)
	}

	// Iterate over rows and print each row
	for rows.Next() {
		// Create a slice of `interface{}` to hold each column’s data
		values := make([]interface{}, len(columns))
		for i := range values {
			values[i] = new(interface{})
		}

		// Scan the row into the values slice
		if err := rows.Scan(values...); err != nil {
			log.Fatal(err)
		}

		// Print the row data
		for i, val := range values {
			fmt.Printf("%s: %v ", columns[i], *(val.(*interface{})))
			fmt.Println()
		}
		fmt.Println()
		fmt.Println()
	}

	// Check for errors after loop
	if err := rows.Err(); err != nil {
		log.Fatal(">p>", err)
	}
}


func InsertUser(db *sql.DB, user *types.User) (int64, error) {
	query := `INSERT INTO users (name, phone_number, role, latitude, longitude, address, created_at, updated_at)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id`
	var userID int64
	err := db.QueryRow(query, user.Name, user.PhoneNumber, user.Role, user.Location.Latitude,
		user.Location.Longitude, user.Location.Address, user.CreatedAt, user.UpdatedAt).Scan(&userID)
	if err != nil {
		return 0, err
	}
	return userID, nil
}