package controllers

import (
	"net/http"

	"github.com/JaswantSingh41/Peopleconnect/database"
	"github.com/JaswantSingh41/Peopleconnect/models"
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

// // in memory for now
// var rooms = []models.Room{}

func CreateRoom(c *gin.Context) {
	var room models.Room

	if err := c.BindJSON(&room); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid input"})
		return
	}

	room.ID = uuid.New().String()

	// save room to db
	if err := database.DB.Create(&room).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Could not create room"})
		return
	}
	// rooms = append(rooms, room)

	c.JSON(http.StatusOK, room)
}

func GetRooms(c *gin.Context) {
	var rooms []models.Room

	if err := database.DB.Find(&rooms).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failded to fetch rooms"})
		return
	}
	c.JSON(http.StatusOK, rooms)
}
