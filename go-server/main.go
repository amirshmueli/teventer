package main

import (
	"fmt"
	"log"
	"net/http"
	"server/controllers"
	"server/services"

	"github.com/gorilla/mux"
)

var DATABASE_PATH = "database/server_db.db"

func homePage(w http.ResponseWriter, r *http.Request) {
	fmt.Println("Endpoint hit: Home Endpoint")
	fmt.Fprintf(w, "Welcome To Home Page")
}

func handleRequests() {
	var router = mux.NewRouter().StrictSlash(true)
	controllers.InitialMigration()

	// homepage
	router.HandleFunc("/", homePage)

	// user handlers
	router.HandleFunc("/login", services.SLogin)                         // achive token
	router.HandleFunc("/register", services.SCreateUser).Methods("POST") // create a user

	// token
	router.HandleFunc("/api/refresh", nil).Methods("POST") // refresh the token //TODO create

	// event handlers
	router.HandleFunc("/api/events/{username}", services.SCreateEvent).Methods("POST")        // create an event
	router.HandleFunc("/api/events/{username}", services.SGetEventList).Methods("GET")        // get list of events
	router.HandleFunc("/api/events/stats/{username}", services.SGetEventStats).Methods("GET") // get stats on an event

	// ticket handlers
	router.HandleFunc("/api/tickets/{username}", services.STicketList).Methods("GET")    // pagination
	router.HandleFunc("/api/tickets/{username}", services.SCreateTicket).Methods("POST") // ticket creation
	router.HandleFunc("/api/tickets/{username}", nil).Methods("DELETE")                  // ticket deletion

	// live handlers
	router.HandleFunc("/api/check-in/{username}", services.STicketCI).Methods("POST")  // ticket check-in
	router.HandleFunc("/api/check-out/{username}", services.STicketCO).Methods("POST") // ticket check-out
	/*
		headers := handlers.AllowedHeaders([]string{"X-Requested-With", "Content-Type", "Authorization"})
		methods := handlers.AllowedMethods([]string{"POST", "GET"})
		origins := handlers.AllowedOrigins([]string{"*"})
		handlers.CORS(headers, methods, origins)(router)
	*/

	log.Output(1, "server is up and running!")
	log.Fatal(http.ListenAndServe(":80", router))
}

func main() {
	handleRequests()
}
