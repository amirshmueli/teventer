package services

import (
	"encoding/json"
	"errors"
	"fmt"
	"image/png"
	"net/http"
	"server/controllers"
	"server/database"
	"server/models"
	"strconv"

	"github.com/boombuler/barcode"
	"github.com/boombuler/barcode/qr"
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
	if _username != mux.Vars(r)["opname"] {
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

	json.NewEncoder(w).Encode(map[string]interface{}{
		"status": 200,
		"ticket": regTicket,
	})
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

	paginDB := ticketPagination(&tickets, db, eventID, offset, limit, query.Get("status"), search)
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

func ticketPagination(tickets *[]models.Ticket, db *gorm.DB, eventID string, offset int, limit int, status string, search string) *gorm.DB {
	if status == "2" {
		return db.Where("event_refer=? AND name LIKE ?", eventID, search).Limit(limit).Offset(offset).Find(&tickets)
	}
	return db.Where("event_refer=? AND name LIKE ? AND status IS ?", eventID, search, status).Limit(limit).Offset(offset).Find(&tickets)
}

func SGenerateQR(w http.ResponseWriter, r *http.Request) {
	fmt.Println("ENDPOINT: QR generation")

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

	eventID := vars.Get("eventID")
	ticketID := vars.Get("ticketID")

	db, err := database.OpenDaDatabase()
	if err != nil {
		w.WriteHeader(http.StatusLocked)
		return
	}
	defer db.Close()

	if err := db.Where(db.Where("ticket_id=? AND event_refer=?", ticketID, eventID)).First(&models.Ticket{}).Error; err != nil || errors.Is(err, gorm.ErrRecordNotFound) {
		fmt.Println("\t Error Could Not Find Ticket")
		w.WriteHeader(http.StatusNoContent)
		return
	}

	var qr_url = fmt.Sprintf("www.teventer.com/ticket/%s/%s", eventID, ticketID)

	qrCode, _ := qr.Encode(qr_url, qr.L, qr.Auto)
	qrCode, _ = barcode.Scale(qrCode, 512, 512)

	png.Encode(w, qrCode)
}

func SDeleteTicket(w http.ResponseWriter, r *http.Request) {
	fmt.Println("ENDPOINT: DELETE TICKET")
	w.Header().Set("Content-Type", "application/json")
	vars := r.URL.Query()
	var tokenString = vars.Get("token")
	_username := controllers.Authenticate(w, tokenString)

	if _username == "" {
		return
	}

	if _username != mux.Vars(r)["opname"] {
		w.WriteHeader(http.StatusUnauthorized)
		return
	}

	eventID := vars.Get("eventID")
	ticketID := vars.Get("ticketID")

	db, err := database.OpenDaDatabase()
	if err != nil {
		w.WriteHeader(http.StatusLocked)
		return
	}
	defer db.Close()

	if err := db.Where("event_refer=? AND ticket_id=?", eventID, ticketID).Delete(&models.Ticket{}).Error; err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		fmt.Println("error at deleting ticket")
		return
	}

	json.NewEncoder(w).Encode(map[string]string{
		"ticketID": ticketID,
		"eventID":  eventID,
	})

}
