#pragma once
#include <Arduino.h>

namespace Pins {
    // Цифрові піни
    constexpr uint8_t LOCK_PIN = 16;            // Пін для управління замком
    constexpr uint8_t DOOR_SENSOR_PIN = 17;     // Пін датчика дверей
    constexpr uint8_t LED_STATUS_PIN = 2;       // Пін статусного світлодіода
    
    // Аналогові піни
    constexpr uint8_t BATTERY_VOLTAGE_PIN = 34; // Пін для вимірювання напруги батареї
}