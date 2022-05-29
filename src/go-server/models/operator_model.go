package models

type Operator struct {
	Username string `gorm:"primaryKey; unique"`
	Password []byte `gorm:"not null"`
	Email    string `gorm:"unique;not null"`
}
