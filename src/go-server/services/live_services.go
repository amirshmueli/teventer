package services

import (
	"fmt"
	"net/http"
	"server/controllers"

	"github.com/gorilla/mux"
)

func STicketCI(w http.ResponseWriter, r *http.Request) {
	fmt.Println("ENDPOINT: Check-In")
	TicketWrapper(w, r, controllers.CHECKIN)
}

func STicketCO(w http.ResponseWriter, r *http.Request) {
	fmt.Println("ENDPOINT: Check-Out")
	TicketWrapper(w, r, controllers.CHECKOUT)
}

func TicketWrapper(w http.ResponseWriter, r *http.Request, op string) {
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

	controllers.LiveHandler(w, r, op)
}
