package models

type Ticket struct {
	ID string `gorm:"primaryKey"`

	Name     string
	LastName string
	Email    string

	Type  string
	Price float32

	EventRefer string
	TicketID   string `json:"ticketID"`

	TimeIn string
	Status bool
}
