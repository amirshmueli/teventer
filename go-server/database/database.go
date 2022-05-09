package database

import (
	"fmt"

	"github.com/jinzhu/gorm"
	_ "github.com/jinzhu/gorm/dialects/sqlite"
)

var DB_PATH = "database/server_db.db"

func OpenDaDatabase() (*gorm.DB, error) {

	db, err := gorm.Open("sqlite3", DB_PATH)
	if err != nil {
		fmt.Println(err.Error())
		return nil, err
	}
	//log.Output(2, "SQL DB opened")
	return db, nil
}
