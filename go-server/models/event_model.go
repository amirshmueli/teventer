package models

type Event struct {
	ID    string `gorm:"primaryKey"`
	Title string `gorm:"not null"`

	OperatorRefer string `json:"-"`

	Capacity uint32
	Current  uint32

	StartTime string
	EndTime   string
}
