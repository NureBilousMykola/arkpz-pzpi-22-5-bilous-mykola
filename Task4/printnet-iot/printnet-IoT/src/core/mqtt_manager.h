#pragma once
#include <Arduino.h>
#include <PubSubClient.h>
#include <WiFi.h>
#include "../config/config.h"
#include "../utils/logger.h"
#include "../utils/json_helper.h"

typedef std::function<void(const String&)> CommandCallback;

class MQTTManager {
public:
    MQTTManager(const char* server, int port, const char* username, 
                const char* password, const char* clientId);
    bool connect();
    bool reconnect();
    void update();
    bool publish(const char* topic, const String& payload);
    void setCommandCallback(CommandCallback callback);
    bool isConnected();

private:
    WiFiClient wifiClient;
    PubSubClient mqttClient;
    const char* server;
    int port;
    const char* username;
    const char* password;
    const char* clientId;
    CommandCallback commandCallback;
    Logger logger;
    unsigned long lastReconnectAttempt;
    const unsigned long RECONNECT_INTERVAL = 5000;

    void setupMQTT();
    void handleCallback(char* topic, byte* payload, unsigned int length);
    static void staticCallback(char* topic, byte* payload, 
                             unsigned int length, void* instance);
    String constructCommandTopic();
    String constructTelemetryTopic();
};