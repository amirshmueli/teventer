package models

type Event struct {
	ID    string `gorm:"primaryKey"`
	Title string `gorm:"not null"`

	OperatorRefer string `json:"-"`

	Capacity uint32
	Current  uint32 `json:"-"`

	StartTime string
	EndTime   string
}
