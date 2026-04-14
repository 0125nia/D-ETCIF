// Package service
// D-ETCIF-backend/internal/service/user.go
package service

import (
	"D-ETCIF-backend/internal/model"
	"D-ETCIF-backend/pkg/utils"

	"gorm.io/gorm"
)

type UserService struct {
	db *gorm.DB
}

func NewUserService(db *gorm.DB) *UserService {
	return &UserService{db: db}
}

func (s *UserService) GetUserByID(id int64) (*model.User, error) {
	var user model.User
	if err := s.db.First(&user, id).Error; err != nil {
		return nil, err
	}
	return &user, nil
}

func (s *UserService) GetUserByNumberAndRole(userNumber string, role int8) (*model.User, error) {
	var user model.User
	if err := s.db.Where("user_number = ? AND role = ?", userNumber, role).First(&user).Error; err != nil {
		return nil, err
	}
	return &user, nil
}

func (s *UserService) updatePassword(user *model.User) error {
	hashedPassword, err := utils.HashPassword(user.Password)
	if err != nil {
		return err
	}
	user.Password = hashedPassword
	return s.db.Save(user).Error
}

func (s *UserService) UpdateUser(user *model.User) error {
	user.UpdatedAt = utils.NowTime() // 更新修改时间
	return s.db.Save(user).Error
}

func (s *UserService) BatchCreateUsers(users []*model.User) error {
	users = utils.HashUserPasswords(users) // 批量哈希密码
	users = utils.SetUserTimestamps(users) // 批量设置时间戳
	return s.db.Create(&users).Error
}

func (s *UserService) CreateUsersFromCSV(filePath string) error {
	users, err := utils.ParseCSV2Users(filePath)
	if err != nil {
		return err
	}
	return s.BatchCreateUsers(users)
}
