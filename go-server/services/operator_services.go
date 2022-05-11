package services

import (
	"encoding/json"
	"fmt"
	"net/http"
	"server/controllers"
	"server/database"
	"server/models"

	"golang.org/x/crypto/bcrypt"
)

func SCreateOperator(w http.ResponseWriter, r *http.Request) {
	fmt.Println("ENDPOINT: Create User")
	w.Header().Set("Content-Type", "application/json")

	db, err := database.OpenDaDatabase()
	if err != nil {
		w.WriteHeader(http.StatusLocked)
		return
	}
	defer db.Close()

	// parsing request
	data, err := controllers.ParseRequest(r)
	if err != nil {
		fmt.Println(err.Error())
		fmt.Fprintf(w, `{"error": "Body Parse Error"}`)
		panic("Could Not Parse Registration Data!")
	}
	for _, v := range data {
		if v == "" {
			w.WriteHeader(http.StatusBadRequest)
			fmt.Println("\t (CU) ERROR: Empty Field")
		}
	}
	username, password, email := data["Username"].(string), data["Password"].(string), data["Email"].(string)

	if password == "" {
		fmt.Println("\t No Password Passed")
		w.WriteHeader(http.StatusBadRequest)
		return
	}

	encrypted_password, err := bcrypt.GenerateFromPassword([]byte(password), BCRYPT_LVL)
	if err != nil {
		fmt.Println("\t (CU) ERROR: Could Not Generate Password")
		w.WriteHeader(http.StatusInternalServerError)
		return
	}

	var operator = models.Operator{
		Username: username,
		Password: encrypted_password,
		Email:    email,
	}

	fmt.Printf("\t CREDS: %s %s\n", username, password)
	if err := db.Create(operator).Error; err != nil {
		fmt.Println("\t Could Not Register User!")
		fmt.Println(err)
		w.WriteHeader(http.StatusInternalServerError)
		// json.NewEncoder(w).Encode(map[string]string{
		// 	"error":   "Registration Error",
		// 	"message": "Username Is Already Taken",
		// })

		return
	}

	json.NewEncoder(w).Encode(operator)
	fmt.Printf("\t User Created Successfully: %s", operator.Username)
}

func SLoginOperator(w http.ResponseWriter, r *http.Request) {
	fmt.Println("ENDPOINT: Login ")
	w.Header().Set("Content-Type", "application/json")

	db, err := database.OpenDaDatabase()
	if err != nil {
		w.WriteHeader(http.StatusLocked)
		return
	}
	defer db.Close()

	vars := r.URL.Query()
	username := vars.Get("username")
	password := vars.Get("password")

	fmt.Printf("\t As %s | %s \n", username, password)
	var operator models.Operator

	if err := db.Where("Username=?", username).Find(&operator).Error; err != nil {
		fmt.Fprintf(w, `{"error": "wrong credentials"}`)
		fmt.Println("\t Error: User Does Not Exist")
		w.WriteHeader(http.StatusUnauthorized)
		return
	}

	if err = bcrypt.CompareHashAndPassword(operator.Password, []byte(password)); err != nil {
		fmt.Fprintf(w, `{"error": "wrong credentials"}`)
		fmt.Println("\t Error: Wrong Password")
		w.WriteHeader(http.StatusUnauthorized)
		return
	}

	// user is logged in
	// authentication creation

	tokenString, err := controllers.CreateToken(username)

	if err != nil {
		fmt.Println("\t Error: Token Generation Error")
		fmt.Println(err)
		w.WriteHeader(http.StatusInternalServerError)
		return
	}

	fmt.Println("\t Logged In Successfully")
	json.NewEncoder(w).Encode(map[string]string{
		"token": tokenString,
	})
}
