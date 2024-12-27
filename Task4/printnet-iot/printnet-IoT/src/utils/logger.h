#pragma once
#include <Arduino.h>

enum class LogLevel {
    DEBUG,
    INFO,
    WARNING,
    ERROR
};

class Logger {
public:
    Logger(bool serialEnabled = true);
    void debug(const String& message);
    void info(const String& message);
    void warning(const String& message);
    void error(const String& message);
    void setLogLevel(LogLevel level);

private:
    bool serialEnabled;
    LogLevel currentLevel;
    
    void log(LogLevel level, const String& message);
    String getLevelString(LogLevel level);
    String getTimestamp();
};
