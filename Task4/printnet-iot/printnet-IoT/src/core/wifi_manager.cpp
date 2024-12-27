#include "wifi_manager.h"

WiFiManager::WiFiManager(const char* ssid, const char* password)
    : ssid(ssid), password(password), connected(false), lastReconnectAttempt(0) {
    setupWiFi();
}

void WiFiManager::setupWiFi() {
    WiFi.mode(WIFI_STA);
    WiFi.setAutoReconnect(true);
    WiFi.persistent(true);
}

bool WiFiManager::connect() {
    logger.info("Connecting to WiFi...");
    WiFi.begin(ssid, password);

    int attempts = 0;
    while (WiFi.status() != WL_CONNECTED && attempts < 20) {
        delay(500);
        attempts++;
    }

    connected = (WiFi.status() == WL_CONNECTED);
    if (connected) {
        logger.info("WiFi connected. IP: " + WiFi.localIP().toString());
    } else {
        logger.error("WiFi connection failed");
    }

    return connected;
}

bool WiFiManager::reconnect() {
    if (millis() - lastReconnectAttempt < RECONNECT_INTERVAL) {
        return false;
    }

    lastReconnectAttempt = millis();
    return connect();
}

void WiFiManager::update() {
    if (!isConnected()) {
        handleDisconnect();
    }
}

bool WiFiManager::isConnected() {
    return WiFi.status() == WL_CONNECTED;
}

int WiFiManager::getSignalStrength() {
    return WiFi.RSSI();
}

String WiFiManager::getLocalIP() {
    return WiFi.localIP().toString();
}

void WiFiManager::handleDisconnect() {
    if (connected) {
        logger.warning("WiFi connection lost");
        connected = false;
    }
    reconnect();
}