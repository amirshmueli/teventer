package controllers

import (
	"fmt"
	"log"
	"server/database"
	"server/models"

	"github.com/jinzhu/gorm"
)

func InitialMigration() {
	log.Output(1, "Initial Migration Starting... ")
	db, err := gorm.Open("sqlite3", database.DB_PATH)
	if err != nil {
		fmt.Println(err.Error())
		panic("Failed to connect to database!")
	}
	defer db.Close()
	db.AutoMigrate(&models.User{}, &models.Event{}, &models.Ticket{}, &models.Operator{}, &models.Connection{})
}
