package services

import (
	"encoding/json"
	"fmt"
	"net/http"
	"server/controllers"
	"server/database"
	"server/models"
	"time"

	"github.com/google/uuid"
	"github.com/gorilla/mux"
	_ "github.com/jinzhu/gorm/dialects/sqlite"
)

/* SCreateEvent - POST
GET: title, start-time, end-time, capacity
RETURN: the created event
*/
func SCreateEvent(w http.ResponseWriter, r *http.Request) {
	fmt.Println("Endpoint: Create Event")

	vars := r.URL.Query()
	tokenString := vars.Get("token")

	_username := controllers.Authenticate(w, tokenString)

	if _username == "" {
		return
	}
	if _username != mux.Vars(r)["username"] {
		w.WriteHeader(http.StatusConflict)
		return
	}
	// auth complete

	db, err := database.OpenDaDatabase()
	if err != nil {
		w.WriteHeader(http.StatusLocked)
		return
	}
	defer db.Close()

	// service
	var declareEvent models.Event

	if err := json.NewDecoder(r.Body).Decode(&declareEvent); err != nil {
		fmt.Println("\t (CE) ERROR: Bad Request")
		fmt.Println(err)
		w.WriteHeader(http.StatusBadRequest)
		return
	}

	declareEvent.ID = uuid.New().String()
	declareEvent.OperatorRefer = _username

	//TODO CHECK USER EXIST

	if t, err := time.Parse("2006-01-02T15:04:05.000Z", declareEvent.StartTime); err != nil || declareEvent.Title == "" || t.IsZero() {
		fmt.Println("\t (CE) ERROR: Missing Field")
		w.WriteHeader(http.StatusBadRequest)
		return
	}

	if err := db.Create(declareEvent).Error; err != nil {
		fmt.Println("\t (CE) ERROR: DB error")
		fmt.Println(err)
		w.WriteHeader(http.StatusInternalServerError)
		return
	}

	fmt.Println("\t (CE) Event Created")

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(declareEvent)

}

/* SDeleteEvent - DELETE
GET: event-id
RETURN: the created event
*/
func SDeleteEvent(w http.ResponseWriter, r *http.Request) {
	fmt.Println("Endpoint: Delete Event")
}

/* SGetEventList - GET
GET: event-id
RETURN: {events:[{...}, {...}]}
*/
func SGetEventList(w http.ResponseWriter, r *http.Request) {
	fmt.Println("Endpoint: Get Events")

	vars := r.URL.Query()
	var tokenString = vars.Get("token")

	_username := controllers.Authenticate(w, tokenString)

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

	// searching events
	var eventList []models.Event
	fmt.Printf("\t Searching Events For %s \n", _username)
	if err := db.Where("operator_refer=?", _username).Find(&eventList).Error; err != nil {
		if err == mux.ErrNotFound {
			w.WriteHeader(http.StatusNoContent)
			fmt.Println("\t No Data Found")
			return
		}

		w.WriteHeader(http.StatusInternalServerError)
		fmt.Println(err)
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"events": eventList,
	})
}

/* SGetEventStats - GET
GET: event-id
RETURN: {title:"metallica", stats:{capacity:int, current:int}}
*/
func SGetEventStats(w http.ResponseWriter, r *http.Request) {

	/*
		token
		ID
	*/

	w.Header().Set("Content-Type", "application/json")
	fmt.Println("ENDPOINT: Get Stats")

	vars := r.URL.Query()
	var tokenString = vars.Get("token")
	var eventID = vars.Get("eventID")
	_username := controllers.Authenticate(w, tokenString)

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

	// get stats and handle
	var eventChosen models.Event

	if err := db.Where("ID=?", eventID).First(&eventChosen).Error; err != nil {
		fmt.Println(err)
		w.WriteHeader(http.StatusNoContent)
		fmt.Println("\tStats Event Not Found")
		return
	}

	var capacity, current = eventChosen.Capacity, eventChosen.Current

	if err := json.NewEncoder(w).Encode(map[string]interface{}{
		"Title": eventChosen.Title,
		"Stats": map[string]uint32{
			"Capacity": capacity,
			"Current":  current,
		},
	}); err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		return
	}
	//fmt.Printf("\t Sent Stats For %s %s \n", eventChosen.Title, eventChosen.StartTime)
}
