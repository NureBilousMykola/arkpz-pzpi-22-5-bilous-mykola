#include "logger.h"

Logger::Logger(bool serialEnabled) 
    : serialEnabled(serialEnabled), currentLevel(LogLevel::INFO) {
    if (serialEnabled && !Serial) {
        Serial.begin(115200);
    }
}

void Logger::debug(const String& message) {
    log(LogLevel::DEBUG, message);
}

void Logger::info(const String& message) {
    log(LogLevel::INFO, message);
}

void Logger::warning(const String& message) {
    log(LogLevel::WARNING, message);
}

void Logger::error(const String& message) {
    log(LogLevel::ERROR, message);
}

void Logger::setLogLevel(LogLevel level) {
    currentLevel = level;
}

void Logger::log(LogLevel level, const String& message) {
    if (level < currentLevel || !serialEnabled) return;

    String output = getTimestamp() + " [" + getLevelString(level) + "] " + message;
    Serial.println(output);
}

String Logger::getLevelString(LogLevel level) {
    switch (level) {
        case LogLevel::DEBUG: return "DEBUG";
        case LogLevel::INFO: return "INFO";
        case LogLevel::WARNING: return "WARN";
        case LogLevel::ERROR: return "ERROR";
        default: return "UNKNOWN";
    }
}

String Logger::getTimestamp() {
    unsigned long ms = millis();
    unsigned long seconds = ms / 1000;
    unsigned long minutes = seconds / 60;
    unsigned long hours = minutes / 60;
    
    return String(hours) + ":" + 
           String(minutes % 60) + ":" + 
           String(seconds % 60) + "." + 
           String(ms % 1000);
}