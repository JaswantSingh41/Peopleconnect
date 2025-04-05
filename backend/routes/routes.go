package routes

import (
	"github.com/JaswantSingh41/Peopleconnect/controllers"
	"github.com/gin-gonic/gin"
)

func RegisterRoutes(r *gin.Engine) {
	api := r.Group("/api")

	api.POST("/signup", controllers.SignUp)
	api.POST("/login", controllers.Login)
}
