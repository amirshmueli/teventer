package models

type Error struct {
	Err    string `json:"error"`
	Status string `json:"status"`
}
