#pragma once
#include <Arduino.h>

struct DeviceConfig {
    // WiFi налаштування
    char wifi_ssid[32];
    char wifi_password[64];
    
    // MQTT налаштування
    char mqtt_server[64];
    int mqtt_port;
    char mqtt_user[32];
    char mqtt_password[64];
    char mqtt_client_id[32];
    
    // Налаштування пристрою
    char device_id[37];             // UUID пристрою
    int lock_open_time;             // Час відкритого стану замка (мс)
    int status_update_interval;     // Інтервал оновлення статусу (мс)
    bool auto_lock;                 // Автоматичне закриття
};