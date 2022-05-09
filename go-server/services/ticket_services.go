package services

import (
	"encoding/json"
	"fmt"
	"net/http"
	"server/controllers"
	"server/database"
	"server/models"
	"strconv"

	"github.com/google/uuid"
	"github.com/gorilla/mux"
	"github.com/jinzhu/gorm"
)

func SCreateTicket(w http.ResponseWriter, r *http.Request) {
	/*
	   eventId, Name, LastName, Email, Price, Type
	*/
	fmt.Println("ENDPOINT: Create Ticket")

	w.Header().Set("Content-Type", "application/json")
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
	// authentication completed

	var regTicket models.Ticket

	if err := json.NewDecoder(r.Body).Decode(&regTicket); err != nil {
		fmt.Println(err)
		fmt.Println("\t (CT) ERROR: Could Not Prase")
		w.WriteHeader(http.StatusBadRequest)
		return
	}

	regTicket.ID = uuid.New().String()
	regTicket.TicketID = uuid.New().String()
	db, err := database.OpenDaDatabase()
	if err != nil {
		w.WriteHeader(http.StatusLocked)
		return
	}
	// TODO: check ticket fields
	if err := db.Create(regTicket).Error; err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		fmt.Println("\t (CT) ERROR: DB error")
		fmt.Println(err)
		return
	}

	json.NewEncoder(w).Encode(regTicket)
	fmt.Println("\t Ticket Created Successfully")

}

func STicketList(w http.ResponseWriter, r *http.Request) {
	fmt.Println("ENDPOINT: Get Ticket List")

	w.Header().Set("Content-Type", "application/json")
	vars := r.URL.Query()
	var tokenString = vars.Get("token")
	_username := controllers.Authenticate(w, tokenString)

	if _username == "" {
		return
	}

	if _username != mux.Vars(r)["username"] {
		w.WriteHeader(http.StatusUnauthorized)
		return
	}
	// authenticated

	db, err := database.OpenDaDatabase()
	if err != nil {
		w.WriteHeader(http.StatusLocked)
		fmt.Println(err)
		return
	}

	var query = r.URL.Query()
	var eventID = query.Get("eventID")

	offset, err1 := strconv.Atoi(query.Get("offset"))
	limit, err2 := strconv.Atoi(query.Get("limit"))
	if err1 != nil || err2 != nil {
		w.WriteHeader(http.StatusBadRequest)
		fmt.Println("\t Missing Parameters")
		return
	}
	var tickets = []models.Ticket{}
	var search = "%" + query.Get("search") + "%"
	var op bool = false
	if query.Get("status") == "1" {
		op = true
	}
	paginDB := ticketPagination(&tickets, db, eventID, offset, limit, op, search)
	err = paginDB.Error
	if err != nil {
		fmt.Println("\n PAGINATION: database search error")
		w.WriteHeader(http.StatusInternalServerError)
		return
	}
	var max int
	paginDB.Count(&max)
	json.NewEncoder(w).Encode(map[string]interface{}{
		"tickets": &tickets,
		"Max":     &max,
	})
	w.Header().Set("Content-Type", "application/json")
	fmt.Println("\n Ticket List Was Sent \n ")
}

func ticketPagination(tickets *[]models.Ticket, db *gorm.DB, eventID string, offset int, limit int, status bool, search string) *gorm.DB {
	return db.Where("event_refer=? AND name LIKE ? AND status IS ?", eventID, search, status).Limit(limit).Offset(offset).Find(&tickets)
}
