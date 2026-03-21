// Package utils
// D-ETCIF-backend/pkg/utils/csv.go

package utils

import (
	"encoding/csv"
	"fmt"
	"os"

	"D-ETCIF-backend/internal/model"
)

func IsCSVEmpty(filePath string) (bool, error) {
	f, err := os.Open(filePath)
	if err != nil {
		return false, err
	}
	defer f.Close()

	reader := csv.NewReader(f)
	reader.FieldsPerRecord = -1 // 允许每行字段数不固定

	records, err := reader.ReadAll()
	if err != nil {
		return false, err
	}

	return len(records) <= 1, nil // 只有表头或没有数据
}

func ParseCSV2Users(filePath string) ([]*model.User, error) {
	// 1. 打开 CSV 文件
	f, err := os.Open(filePath)
	if err != nil {
		return nil, err
	}
	defer f.Close()

	// 2. 创建 CSV 读取器
	reader := csv.NewReader(f)
	reader.FieldsPerRecord = -1 // 允许每行字段数不固定

	// 3. 读取 CSV 文件内容
	records, err := reader.ReadAll()
	if err != nil {
		return nil, err
	}

	// 4. 解析 CSV 内容到 User 结构体切片
	var users []*model.User
	for i, record := range records {
		if i == 0 {
			continue // 跳过表头
		}
		if len(record) < 5 {
			continue // 跳过字段数不足的行
		}

		user := &model.User{
			ID:         ParseInt64(record[0]),
			UserNumber: record[1],
			Name:       record[2],
			Password:   record[3],
			Role:       ParseInt8(record[4]),
		}
		users = append(users, user)
	}

	return users, nil
}

func ParseInt64(s string) int64 {
	var i int64
	fmt.Sscanf(s, "%d", &i)
	return i
}

func ParseInt8(s string) int8 {
	var i int8
	fmt.Sscanf(s, "%d", &i)
	return i
}
