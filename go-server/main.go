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

func homePage(w http.ResponseWriter, _ *http.Request) {
	fmt.Println("Endpoint hit: Home Endpoint")
	fmt.Fprintf(w, "Welcome To Home Page")
}

func handleRequests() {
	var router = mux.NewRouter().StrictSlash(true)
	controllers.InitialMigration()

	// homepage
	router.HandleFunc("/", homePage)
	router.HandleFunc("/home", homePage)
	// operator handle
	router.HandleFunc("/login", services.SLoginOperator)                     // achive token
	router.HandleFunc("/register", services.SCreateOperator).Methods("POST") // create a user

	// user handlers
	router.HandleFunc("/gen/login", services.SLogin)                                          // achive token
	router.HandleFunc("/gen/register/{opname}", services.SCreateUser).Methods("POST")         // create a user
	router.HandleFunc("/gen/assign/{username}", services.SAssignEvent).Methods("POST")        // assign an event to a user
	router.HandleFunc("/gen/remove/{username}", services.SRemoveConnection).Methods("DELETE") // remove an event to a user
	router.HandleFunc("/gen/users/{username}", services.SGetUserList).Methods("GET")

	// tickets handlers
	router.HandleFunc("/gen/tickets/{opname}", services.SCreateTicket).Methods("POST")   // ticket creation
	router.HandleFunc("/gen/tickets/{opname}", services.SDeleteTicket).Methods("DELETE") // ticket deletion

	// gen- event handlers
	router.HandleFunc("/gen/events/{opname}", services.SDeleteEvent).Methods("DELETE")
	router.HandleFunc("/gen/events/{opname}", services.SCreateEvent).Methods("POST") // create an event
	router.HandleFunc("/gen/events/{username}", services.SGetEventList).Methods("GET")
	router.HandleFunc("/gen/admins/{username}", services.SGetAllUserList).Methods("GET")

	// event handlers
	router.HandleFunc("/api/events/{username}", services.SGetEvnetListUser).Methods("GET")    // get list of events
	router.HandleFunc("/api/events/stats/{username}", services.SGetEventStats).Methods("GET") // get stats on an event

	// ticket handlers
	router.HandleFunc("/api/tickets/{username}", services.STicketList).Methods("GET") // pagination

	// live handlers
	router.HandleFunc("/live/check-in/{username}", services.STicketCI).Methods("POST")  // ticket check-in
	router.HandleFunc("/live/check-out/{username}", services.STicketCO).Methods("POST") // ticket check-out

	router.HandleFunc("/gen/QR/{username}", services.SGenerateQR).Methods("GET")

	log.Output(1, "server is up and running!")

	// log.Fatal(http.ListenAndServe(":80", router))
	err := http.ListenAndServeTLS(":443", "tls/server.crt", "tls/server.key", nil)
	if err != nil {
		log.Fatal("ListenAndServe: ", err)
	}
}

func main() {
	handleRequests()
}
