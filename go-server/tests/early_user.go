package main

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"

	"github.com/jinzhu/gorm"
	_ "github.com/jinzhu/gorm/dialects/sqlite"
)

var db *gorm.DB
var err error

type MyUser struct {
	gorm.Model
	Name  string
	Email string
}

func InitialMigration() {
	log.Output(1, "Initial Migration Starting... ")
	db, err = gorm.Open("sqlite3", "server_db.db")
	if err != nil {
		fmt.Println(err.Error())
		panic("Failed to connect to database!")
	}
	defer db.Close()
	db.AutoMigrate(&MyUser{})
}

func AllUsers(w http.ResponseWriter, r *http.Request) {
	fmt.Println("Endpoint hit: All Users Endpoint")
	db, err = gorm.Open("sqlite3", "test.db")
	if err != nil {
		fmt.Println(err.Error())
		panic("Failed to connect to database!")
	}
	defer db.Close()
	var users []MyUser
	db.Find(&users)
	json.NewEncoder(w).Encode(users)

}

func CreateUser(w http.ResponseWriter, r *http.Request) {
	fmt.Println("Endpoint hit: Create MyUser Endpoint")
	db, err = gorm.Open("sqlite3", "test.db")
	if err != nil {
		fmt.Println(err.Error())
		panic("Failed to connect to database!")
	}

	defer db.Close()
	vars := r.URL.Query()
	name := vars.Get("name")
	email := vars.Get("email")

	db.Create(&MyUser{Name: name, Email: email})
	fmt.Fprintf(w, "New MyUser Created Successfully")
}

func UserLogin(w http.ResponseWriter, r *http.Request) {
	fmt.Println("Got Login")
	fmt.Fprintf(w, `{token:"1234567"}`)
}

func FindUsers(w http.ResponseWriter, r *http.Request) {
	fmt.Println("Endpoint hit: Find MyUser Endpoint")
	db, err = gorm.Open("sqlite3", "test.db")
	if err != nil {
		fmt.Println(err.Error())
		panic("Failed to connect to database!")
	}
	defer db.Close()
	vars := r.URL.Query()
	name := vars.Get("username")

	var users []MyUser
	db.Where("Name = ?", name).Find(&users)
	json.NewEncoder(w).Encode(users)

}
