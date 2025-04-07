package models

type Message struct {
	ID      string `gorm:"primaryKey" json:"id"`
	RoomID  string `json:"room_id"`
	Sender  string `json:"sender"`
	Content string `json:"content"`
}
