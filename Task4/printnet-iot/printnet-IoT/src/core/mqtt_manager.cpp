#include "mqtt_manager.h"

MQTTManager::MQTTManager(const char* server, int port, const char* username,
                        const char* password, const char* clientId)
    : server(server), port(port), username(username), 
      password(password), clientId(clientId), lastReconnectAttempt(0) {
    setupMQTT();
}

void MQTTManager::setupMQTT() {
    mqttClient.setClient(wifiClient);
    mqttClient.setServer(server, port);
    mqttClient.setCallback([this](char* topic, byte* payload, unsigned int length) {
        this->handleCallback(topic, payload, length);
    });
}

bool MQTTManager::connect() {
    logger.info("Connecting to MQTT...");
    
    if (mqttClient.connect(clientId, username, password)) {
        logger.info("MQTT connected");
        mqttClient.subscribe(constructCommandTopic().c_str());
        return true;
    }
    
    logger.error("MQTT connection failed, rc=" + String(mqttClient.state()));
    return false;
}

bool MQTTManager::reconnect() {
    if (millis() - lastReconnectAttempt < RECONNECT_INTERVAL) {
        return false;
    }

    lastReconnectAttempt = millis();
    return connect();
}

void MQTTManager::update() {
    if (!mqttClient.connected() && !reconnect()) {
        return;
    }
    mqttClient.loop();
}

bool MQTTManager::publish(const char* topic, const String& payload) {
    return mqttClient.publish(topic, payload.c_str());
}

void MQTTManager::setCommandCallback(CommandCallback callback) {
    commandCallback = callback;
}

bool MQTTManager::isConnected() {
    return mqttClient.connected();
}

void MQTTManager::handleCallback(char* topic, byte* payload, unsigned int length) {
    String message;
    message.reserve(length);
    for (unsigned int i = 0; i < length; i++) {
        message += (char)payload[i];
    }

    if (commandCallback) {
        commandCallback(message);
    }
}

String MQTTManager::constructCommandTopic() {
    return String("device/") + clientId + "/command";
}

String MQTTManager::constructTelemetryTopic() {
    return String("device/") + clientId + "/telemetry";
}