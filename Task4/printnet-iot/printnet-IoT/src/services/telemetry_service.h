#pragma once
#include <Arduino.h>
#include <ArduinoJson.h>
#include "../models/telemetry.h"
#include "../controllers/lock_controller.h"
#include "../core/wifi_manager.h"

class TelemetryService {
public:
    TelemetryService(LockController& lockController, WiFiManager& wifiManager);
    Telemetry collectTelemetry();
    String serializeTelemetry(const Telemetry& telemetry);
    bool shouldUpdate();
    void markUpdated();

private:
    LockController& lockController;
    WiFiManager& wifiManager;
    unsigned long lastUpdate;
    const unsigned long UPDATE_INTERVAL = 5000; // 5 секунд

    float getBatteryVoltage();
    uint32_t getErrorCount();
};