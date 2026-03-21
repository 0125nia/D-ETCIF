// Package utils
// D-ETCIF-backend/pkg/utils/jwt.go
package utils

import (
	"time"

	"github.com/golang-jwt/jwt/v5"
)

var jwtKey = []byte("detcif_key")

type Claims struct {
	UserID int64 `json:"user_id"`
	Role   int8  `json:"role"`
	jwt.RegisteredClaims
}

func GenerateToken(userID int64, role int8) (string, error) {
	expirationTime := time.Now().Add(24 * time.Hour)
	claims := &Claims{
		UserID: userID,
		Role:   role,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(expirationTime),
		},
	}
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString(jwtKey)
}

func ParseToken(tokenStr string) (*Claims, error) {
	claims := &Claims{}
	token, err := jwt.ParseWithClaims(tokenStr, claims, func(token *jwt.Token) (interface{}, error) {
		return jwtKey, nil
	})
	if err != nil {
		return nil, err
	}
	if !token.Valid {
		return nil, err
	}
	return claims, nil
}

func IsTokenExpired(tokenStr string) bool {
	claims, err := ParseToken(tokenStr)
	if err != nil {
		return true
	}
	return claims.ExpiresAt.Before(time.Now())
}
