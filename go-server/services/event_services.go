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
	if _username != mux.Vars(r)["opname"] {
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
RETURN: the deleted event
*/
func SDeleteEvent(w http.ResponseWriter, r *http.Request) {
	fmt.Println("Endpoint: Delete Event")

	vars := r.URL.Query()
	var tokenString = vars.Get("token")

	_username := controllers.Authenticate(w, tokenString)

	if _username == "" {
		return
	}
	if _username != mux.Vars(r)["opname"] {
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

	var eventID = vars.Get("eventID")

	var event2deletet = models.Event{}

	if err := db.Where("ID=?", eventID).First(&event2deletet).Error; err != nil {
		fmt.Println("\t Error at finding event")
		fmt.Println(err)
		w.WriteHeader(http.StatusInternalServerError)
		return
	}
	fmt.Println("\t Event ID verified")

	if err := db.Where("ID=?", eventID).Delete(&event2deletet).Error; err != nil {
		fmt.Println("\t Error at deleting event")
		fmt.Println(err)
		w.WriteHeader(http.StatusInternalServerError)
		return
	}
	fmt.Println("\t Event Deleted")

	if err := db.Where("event_refer=?", eventID).Delete(&models.Connection{EventRefer: eventID}).Error; err != nil {
		fmt.Println("\t Error at deleting connections")
		fmt.Println(err)
	}

	fmt.Println("\t Connections Deleted")
	fmt.Println("\t event deleted successfully")
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"status":  200,
		"eventID": eventID,
	})
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
	eventList := []models.Event{}
	fmt.Printf("\t Searching Events For %s \n", _username)
	if err := db.Where("operator_refer=?", _username).Find(&eventList).Error; err != nil {
		if err == mux.ErrNotFound {
			w.WriteHeader(http.StatusNoContent)
			fmt.Println("\t No Data Found")
			return
		}

		w.WriteHeader(http.StatusInternalServerError)
		fmt.Println(err)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	fmt.Println(eventList)
	if eventList == nil {
		json.NewEncoder(w).Encode(map[string]interface{}{
			"events": []string{},
		})
		return
	}
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

func SGetEvnetListUser(w http.ResponseWriter, r *http.Request) {
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

	fmt.Printf("\t Searching Events For %s \n", _username)

	var connection []models.Connection

	if err := db.Where("user_refer=?", _username).Find(&connection).Error; err != nil {
		if err == mux.ErrNotFound {
			w.WriteHeader(http.StatusNoContent)
			fmt.Println("\t No Data Found")
			return
		}

		w.WriteHeader(http.StatusInternalServerError)
		fmt.Println(err)
		return
	}
	fmt.Println("\t Connection List: Established")
	var eventList []models.Event
	fmt.Println("\t Searching Events Within Connections")

	for _, v := range connection {
		fmt.Println(v.UserRefer)
		if v.UserRefer == _username {
			var e models.Event

			if err := db.Where("ID=?", v.EventRefer).First(&e).Error; err != nil {
				fmt.Println("Error At Searching Event")
				fmt.Println(e)
				w.WriteHeader(http.StatusInternalServerError)
				return
			}
			eventList = append(eventList, e)
		}
	}
	fmt.Printf("\t Found Events %d\n", len(eventList))

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"events": eventList,
	})
}
