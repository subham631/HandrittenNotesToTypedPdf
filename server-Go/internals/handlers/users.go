package handlers

import (
	"database/sql"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"net/http"

	"github.com/SudipSarkar1193/GreekGod-Go-server/internals/types"
	
)
func New(db *sql.DB) http.HandlerFunc {

	return func(w http.ResponseWriter, r *http.Request) {

		if r.Method != http.MethodPost {
			http.Error(w, fmt.Sprintf("%v HTTP method is not allowed", r.Method), http.StatusBadRequest)
			return
		}

		var user types.User

		err := json.NewDecoder(r.Body).Decode(&user)
		// ⭐⭐ Explaination :

		/*
			1. r.Body contains the body of the HTTP request, typically in JSON format, that is sent to the server.

			2. json.NewDecoder(r.Body) creates a new JSON decoder to read and parse the JSON data from the r.Body.

			3. .Decode(&student) attempts to decode (unmarshal) the JSON data into the student struct. The &student is a pointer to the student struct, which means the decoded data will be stored directly into this struct.

			So, essentially, this line reads the JSON payload from the request body and decodes it into the Go struct named student.

		*/
		if err != nil {
			if errors.Is(err, io.EOF) {
				//io.EOF is a sentinel error in Go that indicates the end of input (end of a file or stream), commonly returned by functions when there is no more data to read.

				http.Error(w, fmt.Sprintf("no data to read: %v", err.Error()), http.StatusBadRequest)
				return

			} else {
				// Handle other decoding errors

				http.Error(w, fmt.Sprintf("failed to decode JSON: %v", err.Error()), http.StatusInternalServerError)
				return
			}
		}

		existingUserWithEmail, _ := database.RetrieveUser(db, user.Email)

		existingUserWithUsername, _ := database.RetrieveUser(db, user.Username)

		if existingUserWithEmail != nil {
			http.Error(w, fmt.Sprintf("User with the email : %v already exists", existingUserWithEmail.Email), http.StatusBadRequest)
			return
		}
		if existingUserWithUsername != nil {
			http.Error(w, fmt.Sprintf("User with the username : %v already exists", existingUserWithUsername.Username), http.StatusBadRequest)
			return
		}

		var validate *validator.Validate

		validate = validator.New(validator.WithRequiredStructEnabled())

		if err := validate.Struct(&user); err != nil {
			if _, ok := err.(*validator.InvalidValidationError); ok {
				http.Error(w, "validate Struct error", http.StatusBadRequest)
				fmt.Println(err)
				return
			}

			response.ValidateResponse(w, err)
			return
		}

		//Everything is fine till now

		hashpass, err := password.HashPassword(user.Password)

		if err != nil {
			http.Error(w, fmt.Sprintf("failed to encrypt the password : %v", err.Error()), http.StatusInternalServerError)
			return
		}

		user.Password = hashpass

		user_id, err := database.InsertNewUser(db, &user)
		if err != nil {
			http.Error(w, fmt.Sprintf("Database error : %v", err), http.StatusInternalServerError)
			return
		}
		token, err := tokens.GenerateVerifyToken(&user)

		if err != nil {
			http.Error(w, fmt.Sprintf("Could not generate tokens : %v", err.Error()), http.StatusInternalServerError)
			return
		}

		// Send tokens as JSON response
		tokenResponse := map[string]string{
			"verify_token": token,
		}

		//insert otp to database :
		otp := GenerateRandomString()

		database.InsertNewOTP(db, otp, user_id)

		if err := email.SendOTPEmail(user.Email, otp); err != nil {
			http.Error(w, fmt.Sprintf("Failed to send OTP %v", err), http.StatusInternalServerError)
			return
		}

		emptyResponse := response.CreateResponse(tokenResponse, http.StatusCreated, "User created Successfully", "<DeveloperMessage>", "<UserMessage>", false, "Err")

		response.WriteResponse(w, emptyResponse)

	}
}