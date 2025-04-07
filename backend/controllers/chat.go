package controllers

import (
	"fmt"
	"net/http"
	"strings"

	"github.com/JaswantSingh41/Peopleconnect/database"
	"github.com/JaswantSingh41/Peopleconnect/models"
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/gorilla/websocket"
)

var upgrader = websocket.Upgrader{
	CheckOrigin: func(r *http.Request) bool {
		return true
	},
}

var clients = make(map[*websocket.Conn]string)

func ChatHandler(c *gin.Context) {
	roomID := c.Param("id")

	conn, err := upgrader.Upgrade(c.Writer, c.Request, nil)
	if err != nil {
		fmt.Println("WebSocket upgrade error: ", err)
		return
	}

	defer conn.Close()

	clients[conn] = roomID

	for {
		_, msg, err := conn.ReadMessage()
		if err != nil {
			fmt.Println("Read error: ", err)
			delete(clients, conn)
			break
		}

		// broadcast message to user with same room id
		for client, rid := range clients {
			if rid == roomID {
				err := client.WriteMessage(websocket.TextMessage, msg)
				if err != nil {
					fmt.Println("Write error:", err)
					client.Close()
					delete(clients, client)
				}
			}
		}

		// save message to DB
		msgText := string(msg)
		parts := strings.SplitN(msgText, ": ", 2)
		if len(parts) == 2 {
			sender := parts[0]
			content := parts[1]

			newMessage := models.Message{
				ID:      uuid.New().String(),
				RoomID:  roomID,
				Sender:  sender,
				Content: content,
			}
			database.DB.Create(&newMessage)
		}
	}
}

func GetMessages(c *gin.Context) {
	roomID := c.Param("id")
	var messages []models.Message

	if err := database.DB.Where("room_id = ?", roomID).Find(&messages).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch messages"})
		return
	}

	c.JSON(http.StatusOK, messages)
}
