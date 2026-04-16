// Package controller
// D-ETCIF-backend/internal/controller/tracker.go
package controller

import (
	"errors"
	"net/http"
	"strconv"

	"D-ETCIF-backend/internal/model"
	"D-ETCIF-backend/internal/service"
	"D-ETCIF-backend/pkg/utils"

	"github.com/gin-gonic/gin"
)

type TrackerController struct {
	trackerService *service.TrackerService
}

func NewTrackerController() *TrackerController {
	return &TrackerController{
		trackerService: service.NewTrackerService(),
	}
}

func mustAuthStudentID(c *gin.Context) (string, bool) {
	userIDValue, ok := c.Get("userID")
	if !ok {
		utils.Unauthorized(c, "未授权")
		return "", false
	}

	userID, ok := userIDValue.(int64)
	if !ok {
		utils.Unauthorized(c, "用户身份无效")
		return "", false
	}

	return strconv.FormatInt(userID, 10), true
}

func (tc *TrackerController) TrackPre(c *gin.Context) {
	var event model.PreEvent
	if err := c.ShouldBindJSON(&event); err != nil {
		utils.BadRequest(c, "无效的参数")
		return
	}

	studentID, ok := mustAuthStudentID(c)
	if !ok {
		return
	}
	event.StudentID = studentID

	if err := tc.trackerService.TrackPre(&event); err != nil {
		var dropErr *service.TrackerDropError
		if errors.As(err, &dropErr) {
			c.JSON(http.StatusAccepted, utils.Response{
				Code:    http.StatusAccepted,
				Message: "dropped",
				Data:    gin.H{"accepted": false, "reason": dropErr.Reason},
			})
			return
		}
		utils.InternalServerError(c, "存储失败")
		return
	}

	utils.Infof("收到实验前埋点: %+v", event)
	utils.Success(c, gin.H{"message": "success", "accepted": true})
}

func (tc *TrackerController) TrackMid(c *gin.Context) {
	var event model.MidEvent
	if err := c.ShouldBindJSON(&event); err != nil {
		utils.BadRequest(c, "无效的参数")
		return
	}

	studentID, ok := mustAuthStudentID(c)
	if !ok {
		return
	}
	event.StudentID = studentID

	if err := tc.trackerService.TrackMid(&event); err != nil {
		var dropErr *service.TrackerDropError
		if errors.As(err, &dropErr) {
			c.JSON(http.StatusAccepted, utils.Response{
				Code:    http.StatusAccepted,
				Message: "dropped",
				Data:    gin.H{"accepted": false, "reason": dropErr.Reason},
			})
			return
		}
		utils.InternalServerError(c, "存储失败")
		return
	}

	utils.Infof("收到实验中埋点: %+v", event)
	utils.Success(c, gin.H{"message": "success", "accepted": true})
}

func (tc *TrackerController) TrackPost(c *gin.Context) {
	var event model.PostEvent
	if err := c.ShouldBindJSON(&event); err != nil {
		utils.BadRequest(c, "无效的参数")
		return
	}

	studentID, ok := mustAuthStudentID(c)
	if !ok {
		return
	}
	event.StudentID = studentID

	if err := tc.trackerService.TrackPost(&event); err != nil {
		var dropErr *service.TrackerDropError
		if errors.As(err, &dropErr) {
			c.JSON(http.StatusAccepted, utils.Response{
				Code:    http.StatusAccepted,
				Message: "dropped",
				Data:    gin.H{"accepted": false, "reason": dropErr.Reason},
			})
			return
		}
		utils.InternalServerError(c, "存储失败")
		return
	}

	utils.Infof("收到实验后埋点: %+v", event)
	utils.Success(c, gin.H{"message": "success", "accepted": true})
}
