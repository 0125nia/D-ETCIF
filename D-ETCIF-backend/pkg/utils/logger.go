// Package utils
// D-ETCIF-backend/pkg/utils/logger.go
package utils

import (
	"io"
	"os"
	"path/filepath"
	"time"

	"github.com/sirupsen/logrus"
)

var LogrusObj *logrus.Logger

func init() {
	LogrusObj = logrus.New()
	LogrusObj.SetLevel(logrus.DebugLevel)
	LogrusObj.SetFormatter(&logrus.TextFormatter{
		ForceColors:   true,
		FullTimestamp: true,
	})

	writer, err := getLogWriter()
	if err != nil {
		LogrusObj.Warnf("日志文件初始化失败: %v", err)
		LogrusObj.SetOutput(os.Stdout)
		return
	}
	LogrusObj.SetOutput(writer)
}

func getLogWriter() (io.Writer, error) {
	logDir := "./logs"
	if err := os.MkdirAll(logDir, 0o755); err != nil {
		return nil, err
	}
	fileName := filepath.Join(logDir, time.Now().Format("2006-01-02")+".log")
	file, err := os.OpenFile(fileName, os.O_APPEND|os.O_CREATE|os.O_WRONLY, 0o644)
	if err != nil {
		return nil, err
	}
	return io.MultiWriter(os.Stdout, file), nil
}

// Info 打印信息日志
func Info(args ...interface{}) {
	LogrusObj.Info(args...)
}

// Error 打印错误日志
func Error(args ...interface{}) {
	LogrusObj.Error(args...)
}

// Warn 打印警告日志
func Warn(args ...interface{}) {
	LogrusObj.Warn(args...)
}

// Debug 打印调试日志
func Debug(args ...interface{}) {
	LogrusObj.Debug(args...)
}

// Infof 支持格式化字符串的信息日志 (类似 fmt.Sprintf)
func Infof(format string, args ...interface{}) {
	LogrusObj.Infof(format, args...)
}

// Errorf 支持格式化字符串的错误日志
func Errorf(format string, args ...interface{}) {
	LogrusObj.Errorf(format, args...)
}
