package models

type User struct {
	Username      string `gorm:"primaryKey; unique"`
	Password      []byte `gorm:"not null" json:"-"`
	OperatorRefer string ""
}
