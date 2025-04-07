package controllers

import (
	"fmt"
	"net/http"
	"os"
	"strings"

	"github.com/JaswantSingh41/Peopleconnect/database"
	"github.com/JaswantSingh41/Peopleconnect/models"
	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
	"github.com/google/uuid"
	"github.com/gorilla/websocket"
)

var roomParticipants = make(map[string]map[*websocket.Conn]string)

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

	token := c.Query("token")

	parsed, err := jwt.Parse(token, func(token *jwt.Token) (interface{}, error) {
		return []byte(os.Getenv("JWT_SECRET")), nil
	})
	if err != nil || !parsed.Valid {
		conn.WriteMessage(websocket.TextMessage, []byte("unauthorized"))
		conn.Close()
		return
	}
	claims := parsed.Claims.(jwt.MapClaims)
	email := claims["email"].(string)

	var room models.Room
	if err := database.DB.First(&room, "id = ?", roomID).Error; err != nil {
		conn.WriteMessage(websocket.TextMessage, []byte("Room not found"))
		conn.Close()
		return
	}

	// Check if room is full
	if len(roomParticipants[roomID]) >= room.MaxParticipants {
		conn.WriteMessage(websocket.TextMessage, []byte("Room is full"))
		conn.Close()
		return
	}

	if roomParticipants[roomID] == nil {
		roomParticipants[roomID] = make(map[*websocket.Conn]string)
	}
	roomParticipants[roomID][conn] = email
	broadcastParticipants(roomID)

	clients[conn] = roomID

	for {
		_, msg, err := conn.ReadMessage()
		if err != nil {
			fmt.Println("Read error: ", err)
			delete(clients, conn)
			delete(roomParticipants[roomID], conn)
			broadcastParticipants(roomID)
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

func broadcastParticipants(roomID string) {
	usernames := []string{}
	for _, email := range roomParticipants[roomID] {
		usernames = append(usernames, email)
	}
	joined := "PARTICIPANTS:" + strings.Join(usernames, ",")

	for conn := range roomParticipants[roomID] {
		conn.WriteMessage(websocket.TextMessage, []byte(joined))
	}
}
