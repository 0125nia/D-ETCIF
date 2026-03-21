// Package utils
// D-ETCIF-backend/pkg/utils/hash.go
package utils

import (
	"D-ETCIF-backend/internal/model"

	"golang.org/x/crypto/bcrypt"
)

func CheckPassword(hashedPassword, password string) error {
	return bcrypt.CompareHashAndPassword([]byte(hashedPassword), []byte(password))
}

func HashUserPasswords(users []*model.User) []*model.User {
	for _, user := range users {
		hashedPassword, _ := bcrypt.GenerateFromPassword([]byte(user.Password), bcrypt.DefaultCost)
		user.Password = string(hashedPassword)
	}
	return users
}

func HashPassword(password string) (string, error) {
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	if err != nil {
		return "", err
	}
	return string(hashedPassword), nil
}
