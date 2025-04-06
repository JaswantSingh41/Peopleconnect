package routes

import (
	"github.com/JaswantSingh41/Peopleconnect/controllers"
	"github.com/JaswantSingh41/Peopleconnect/middleware"
	"github.com/gin-gonic/gin"
)

func RegisterRoutes(r *gin.Engine) {
	api := r.Group("/api")

	api.POST("/signup", controllers.SignUp)
	api.POST("/login", controllers.Login)
	api.POST("/rooms", controllers.CreateRoom)
	api.GET("/rooms", controllers.GetRooms)

	protected := api.Group("/")
	protected.Use(middleware.AuthMiddleware())
	protected.GET("/room/:id", controllers.GetRoomByID)
}
