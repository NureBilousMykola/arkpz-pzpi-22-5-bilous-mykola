#pragma once
#include <Arduino.h>
#include <WiFi.h>
#include "../config/config.h"
#include "../utils/logger.h"

class WiFiManager {
public:
    WiFiManager(const char* ssid, const char* password);
    bool connect();
    bool reconnect();
    void update();
    bool isConnected();
    int getSignalStrength();
    String getLocalIP();

private:
    const char* ssid;
    const char* password;
    bool connected;
    unsigned long lastReconnectAttempt;
    const unsigned long RECONNECT_INTERVAL = 5000; // 5 секунд
    Logger logger;

    void setupWiFi();
    void handleDisconnect();
};