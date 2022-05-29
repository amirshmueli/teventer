package controllers

import (
	"encoding/json"
	"fmt"
	"net/http"
	"server/database"
	"server/models"
	"time"
)

const (
	CHECKIN  = "check-in"
	CHECKOUT = "check-out"
)

func LiveHandler(w http.ResponseWriter, r *http.Request, action string) {
	var Body map[string]string
	if err := json.NewDecoder(r.Body).Decode(&Body); err != nil {
		fmt.Println("\t Check-X Bad Request")
		w.WriteHeader(http.StatusBadRequest)
		return
	}

	db, err := database.OpenDaDatabase()
	if err != nil {
		w.WriteHeader(http.StatusLocked)
		return
	}
	var actualTicket models.Ticket
	var eventID, ticketID = Body["eventID"], Body["ticketID"]
	fmt.Printf("\t Searching for [%s] \\ [%s]\n", eventID, ticketID)
	if eventID == "" || ticketID == "" {
		fmt.Println("\t Check-X missing argument")
		w.WriteHeader(http.StatusBadRequest)
		return
	}

	if err := db.Where("event_refer=? AND ticket_id=?", eventID, ticketID).Find(&actualTicket).Error; err != nil {
		fmt.Println("\t error at accessing db")
		fmt.Println(err)
		w.WriteHeader(http.StatusNotFound)
		return
	}
	fmt.Println("\t Found Ticket")

	if actualTicket.Status && action == CHECKIN {
		w.WriteHeader(200)
		json.NewEncoder(w).Encode(map[string]interface{}{
			"status":  300,
			"message": "Already Checked In",
			"guest":   actualTicket.Name + " " + actualTicket.LastName,
		})
		return
	}

	switch action {
	case CHECKIN:
		actualTicket.Status = true
	case CHECKOUT:
		actualTicket.Status = false
	}
	db.LogMode(true)
	fmt.Printf("\t updating ticket %t \n", actualTicket.Status)

	actualTicket.TimeIn = time.Now().String()
	x := db.Model(&models.Ticket{}).Where("event_refer=? AND ticket_id=?", actualTicket.EventRefer, actualTicket.TicketID)
	x.Update("status", actualTicket.Status)
	err = x.Error

	if err != nil {
		fmt.Println("\t ERROR: DB ACCESS ERROR")
		fmt.Println(err)
		w.WriteHeader(http.StatusInternalServerError)
		return
	}
	//fmt.Printf("\t $$$$[%d]", affected)
	// if affected == 0 {
	// 	if action == CHECKIN {
	// 		json.NewEncoder(w).Encode(map[string]interface{}{
	// 			"status":  500,
	// 			"message": "Unkown Event Or Ticket",
	// 		})
	// 		return
	// 	}
	// 	json.NewEncoder(w).Encode(map[string]interface{}{
	// 		"status":  200,
	// 		"message": "Already Left",
	// 	})
	// 	return
	//}

	var message string

	switch action {
	case CHECKIN:
		message = "Guest Checked In"
	case CHECKOUT:
		message = "Guest Has Left"
	}

	json.NewEncoder(w).Encode(map[string]interface{}{
		"status":  200,
		"message": message,
		"ticket":  &actualTicket,
	})
}
