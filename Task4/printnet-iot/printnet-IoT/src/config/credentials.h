#pragma once

// WiFi налаштування
#define WIFI_SSID "PrintNet_WiFi"
#define WIFI_PASSWORD "your_password"

// MQTT налаштування
#define MQTT_SERVER "mqtt.printnet.com"
#define MQTT_PORT 1883
#define MQTT_USER "device"
#define MQTT_PASSWORD "device_password"

// Налаштування пристрою
#define DEVICE_ID "vending-001"
#define LOCK_OPEN_TIME 30000
#define STATUS_UPDATE_INTERVAL 5000
#define AUTO_LOCK true