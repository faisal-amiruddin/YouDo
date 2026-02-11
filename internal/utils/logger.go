package utils

import (
	"fmt"
	"log"
	"os"
	"strings"
	"time"
)

type Logger struct {
	debug *log.Logger
	info *log.Logger
	warn *log.Logger
	error *log.Logger
}

type LogLevel int

const (
	DEBUG LogLevel = iota
	INFO
	WARN
	ERROR
)

var (
	logger   *Logger
	logLevel LogLevel
)

func parseLogLevel(level string) LogLevel {
	switch strings.ToLower(level) {
		case "debug":
			return DEBUG
		case "info":
			return INFO
		case "warn":
			return WARN
		case "error":
			return ERROR
		default:
			return INFO
	}
}

func InitLogger(level string) {
	logLevel = parseLogLevel(level)

	logger = &Logger{
		debug: log.New(os.Stdout, "DEBUG: ", log.Ldate|log.Ltime|log.Lshortfile),
		info: log.New(os.Stdout, "INFO: ", log.Ldate|log.Ltime),
		warn: log.New(os.Stdout, "WARN: ", log.Ldate|log.Ltime),
		error: log.New(os.Stdout, "ERROR: ", log.Ldate|log.Ltime|log.Lshortfile),
	}
}

func Debug(format string, v ...interface{}) {
	if logLevel <= DEBUG && logger != nil {
		logger.debug.Output(2, fmt.Sprintf(format, v...))
	}
}

func Info(format string, v ...interface{}) {
	if logLevel <= DEBUG && logger != nil {
		logger.info.Output(2, fmt.Sprintf(format, v...))
	}
}

func Warn(format string, v ...interface{}) {
	if logLevel <= DEBUG && logger != nil {
		logger.warn.Output(2, fmt.Sprintf(format, v...))
	}
}

func Error(format string, v ...interface{}) {
	if logLevel <= DEBUG && logger != nil {
		logger.error.Output(2, fmt.Sprintf(format, v...))
	}
}

func LogRequest(method, path, ip string, duration time.Duration) {
	Info("[%s] %s - IP: %s - Duration: %v", method, path, ip, duration)
}