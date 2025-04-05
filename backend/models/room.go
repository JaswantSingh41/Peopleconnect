package models

type Room struct {
	ID              string `json:"id"`
	Topic           string `json:"topic"`
	Language        string `json:"language"`
	MaxParticipants int    `json:"maxParticipants"`
}
