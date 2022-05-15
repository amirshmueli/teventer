package services

import (
	"encoding/json"
	"errors"
	"fmt"
	"net/http"
	"server/controllers"
	"server/database"
	"server/models"
	"strconv"

	"github.com/gorilla/mux"
	"github.com/jinzhu/gorm"
	_ "github.com/jinzhu/gorm/dialects/sqlite"
	"golang.org/x/crypto/bcrypt"
)

const (
	BCRYPT_LVL    = 14
	MESSAGE_TAKEN = ""
)

func SCreateUser(w http.ResponseWriter, r *http.Request) {
	fmt.Println("ENDPOINT: Create User")
	w.Header().Set("Content-Type", "application/json")

	vars := r.URL.Query()
	var tokenString = vars.Get("token")
	operatorRef := controllers.Authenticate(w, tokenString)

	if operatorRef == "" {
		return
	}
	if operatorRef != mux.Vars(r)["opname"] {
		w.WriteHeader(http.StatusConflict)
		return
	}
	// auth compeleted

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
	username, password := data["Username"].(string), data["Password"].(string)

	if password == "" {
		fmt.Println("\t No Password Passed")
		w.WriteHeader(http.StatusBadRequest)
		return
	}

	if username == "" {
		fmt.Println("\t No Username Passed")
		w.WriteHeader(http.StatusBadRequest)
		return
	}

	encrypted_password, err := bcrypt.GenerateFromPassword([]byte(password), BCRYPT_LVL)
	if err != nil {
		fmt.Println("\t (CU) ERROR: Could Not Generate Password")
		w.WriteHeader(http.StatusInternalServerError)
		return
	}

	var user = models.User{
		Username:      username,
		Password:      encrypted_password,
		OperatorRefer: operatorRef,
	}

	if err := db.Create(user).Error; err != nil {
		fmt.Println("\t Could Not Register User!")
		fmt.Println(err)
		w.WriteHeader(http.StatusInternalServerError)
		// json.NewEncoder(w).Encode(map[string]string{
		// 	"error":   "Registration Error",
		// 	"message": "Username Is Already Taken",
		// })

		return
	}

	json.NewEncoder(w).Encode(map[string]interface{}{
		"user":   user,
		"status": 200,
	})
	fmt.Printf("\t User Created Successfully: %s", user.Username)
}

func SRemoveUser(w http.ResponseWriter, r *http.Request) {
	fmt.Println("ENDPOINT: Remove User")
	fmt.Fprintf(w, "Removed User")
}

func SLogin(w http.ResponseWriter, r *http.Request) {
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
	var user models.User

	if err := db.Where("Username=?", username).Find(&user).Error; err != nil {
		fmt.Fprintf(w, `{"error": "wrong credentials"}`)
		fmt.Println("\t Error: User Does Not Exist")
		w.WriteHeader(http.StatusUnauthorized)
		return
	}

	if err = bcrypt.CompareHashAndPassword(user.Password, []byte(password)); err != nil {
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

func SAssignEvent(w http.ResponseWriter, r *http.Request) {
	fmt.Println("Endpoint: Assign Event")

	vars := r.URL.Query()
	var tokenString = vars.Get("token")

	_username := controllers.Authenticate(w, tokenString) //! watch for same op and user name

	if _username == "" {
		return
	}
	if _username != mux.Vars(r)["username"] {
		w.WriteHeader(http.StatusConflict)
		return
	}
	// auth compeleted

	db, err := database.OpenDaDatabase()
	if err != nil {
		w.WriteHeader(http.StatusLocked)
		return
	}
	defer db.Close()

	// verify input
	// connect with db

	var data map[string]string
	if err := json.NewDecoder(r.Body).Decode(&data); err != nil {
		fmt.Println("Body Decode Error")
		fmt.Println(err)
		w.WriteHeader(http.StatusBadRequest)
		return
	}

	fmt.Println("\t Verifing Information:")
	var eventID = data["EventID"]
	var e_username = data["Username"]

	var status = localAssign(w, e_username, eventID)

	if status != 0 {
		w.WriteHeader(status)
		return
	}

}

func localAssign(w http.ResponseWriter, UserRefer string, EventRefer string) int {

	db, err := database.OpenDaDatabase()
	if err != nil {
		return http.StatusLocked
	}
	defer db.Close()

	var event models.Event
	if err := db.Where("ID=?", EventRefer).First(&event).Error; err != nil || errors.Is(err, gorm.ErrRecordNotFound) {
		fmt.Println("\t DB search event error")
		fmt.Println(err)
		return http.StatusNoContent
	}
	fmt.Println("\t\t Event Verified.")

	var user models.User
	if err := db.Where("username=?", UserRefer).First(&user).Error; err != nil || errors.Is(err, gorm.ErrRecordNotFound) {
		fmt.Println("\t DB search event error")
		fmt.Println(err)
		return http.StatusNoContent
	}
	fmt.Println("\t\t User Verified.")

	var conn = models.Connection{
		UserRefer:  user.Username,
		EventRefer: event.ID,
	}

	var temp models.Connection
	if err := db.Where("user_refer=? AND event_refer=?", conn.UserRefer, conn.EventRefer).First(temp).Error; !errors.Is(err, gorm.ErrRecordNotFound) {
		fmt.Println("\t already connected")
		return http.StatusAlreadyReported
	}

	if err := db.Create(&conn).Error; err != nil {
		fmt.Println("\t error creating connection")
		fmt.Println(err)
		return http.StatusInternalServerError
	}

	json.NewEncoder(w).Encode(map[string]interface{}{
		"status": 200,
	})
	w.WriteHeader(http.StatusCreated)
	return 0
}

func SGetUserList(w http.ResponseWriter, r *http.Request) {
	fmt.Println("Endpoint: Get Events Users Event")
	w.Header().Set("Content-Type", "application/json")
	vars := r.URL.Query()
	var tokenString = vars.Get("token")

	_username := controllers.Authenticate(w, tokenString) //! watch for same op and user name

	if _username == "" {
		return
	}
	if _username != mux.Vars(r)["username"] {
		w.WriteHeader(http.StatusConflict)
		return
	}
	// auth compeleted

	db, err := database.OpenDaDatabase()
	if err != nil {
		w.WriteHeader(http.StatusLocked)
		return
	}
	defer db.Close()

	var offset, err1 = strconv.Atoi(vars.Get(("offset")))
	var limit, err2 = strconv.Atoi(vars.Get(("limit")))

	if err1 != nil || err2 != nil {
		fmt.Println("\t Error: Offset Or Limit Is Null")
		w.WriteHeader(http.StatusBadRequest)
		return
	}

	var searchPhrase = vars.Get("search")
	var eventID = vars.Get("eventID")

	if eventID == "" {
		fmt.Println("\t No event id passesd")
		w.WriteHeader(http.StatusBadRequest)
		return
	}

	var users []models.User
	var connections []models.Connection

	// get connections
	var searcher = "%" + searchPhrase + "%"
	var connectionDB = db.Where("event_refer=? AND user_refer LIKE ?", eventID, searcher).Offset(offset).Limit(limit).Find(&connections)
	if connectionDB.Error != nil {
		fmt.Println("\t Error: DB search Error")
		fmt.Println(connectionDB.Error)
		w.WriteHeader(http.StatusInternalServerError)
		return
	}

	var usersName []string
	for _, v := range connections {
		var user models.User
		fmt.Printf("\t Searching User: %s...\n", v.UserRefer)
		if err := db.Where("username=?", v.UserRefer).First(&user).Error; err != nil {
			fmt.Println("\t Error: Can Not Find Connection")
			continue
		}
		fmt.Println("\t Found.")
		users = append(users, user)
	}

	for _, v := range users {
		usersName = append(usersName, v.Username)
	}

	var max int
	connectionDB.Count(&max)

	json.NewEncoder(w).Encode(map[string]interface{}{
		"Max":   max,
		"Users": &usersName,
	})
}

func SGetAllUserList(w http.ResponseWriter, r *http.Request) {
	fmt.Println("Endpoint: Get Events Users All")
	w.Header().Set("Content-Type", "application/json")
	vars := r.URL.Query()
	var tokenString = vars.Get("token")

	_username := controllers.Authenticate(w, tokenString) //! watch for same op and user name

	if _username == "" {
		return
	}
	if _username != mux.Vars(r)["username"] {
		w.WriteHeader(http.StatusConflict)
		return
	}
	// auth compeleted

	db, err := database.OpenDaDatabase()
	if err != nil {
		w.WriteHeader(http.StatusLocked)
		return
	}

	var offset, err1 = strconv.Atoi(vars.Get(("offset")))
	var limit, err2 = strconv.Atoi(vars.Get(("limit")))

	if err1 != nil || err2 != nil {
		fmt.Println("\t Error: Offset Or Limit Is Null")
		w.WriteHeader(http.StatusBadRequest)
		return
	}

	var searchPhrase = "%" + vars.Get("search") + "%"

	var users []models.User
	var connection = db.Where("operator_refer=? AND username LIKE ?", _username, searchPhrase).Limit(limit).Offset(offset).Find(&users)
	if err := connection.Error; err != nil {
		fmt.Println("\t Error: Searching Users")
		w.WriteHeader(http.StatusInternalServerError)
		return
	}

	var max int
	connection.Count(&max)

	json.NewEncoder(w).Encode(map[string]interface{}{
		"Max":   max,
		"Users": users,
	})
}
