#include "telemetry_service.h"

TelemetryService::TelemetryService(LockController& lc, WiFiManager& wm)
    : lockController(lc), wifiManager(wm), lastUpdate(0) {}

Telemetry TelemetryService::collectTelemetry() {
    DeviceState state = lockController.getState();
    
    Telemetry telemetry;
    telemetry.lock_state = state.lock_state;
    telemetry.is_door_closed = state.is_door_closed;
    telemetry.battery_voltage = getBatteryVoltage();
    telemetry.wifi_signal_strength = wifiManager.getSignalStrength();
    telemetry.uptime = millis();
    telemetry.last_command_time = state.last_command_time;
    telemetry.error_count = getErrorCount();
    
    return telemetry;
}

String TelemetryService::serializeTelemetry(const Telemetry& telemetry) {
    StaticJsonDocument<512> doc;
    
    doc["lock_state"] = static_cast<int>(telemetry.lock_state);
    doc["is_door_closed"] = telemetry.is_door_closed;
    doc["battery_voltage"] = telemetry.battery_voltage;
    doc["wifi_signal"] = telemetry.wifi_signal_strength;
    doc["uptime"] = telemetry.uptime;
    doc["last_command"] = telemetry.last_command_time;
    doc["error_count"] = telemetry.error_count;

    String output;
    serializeJson(doc, output);
    return output;
}

bool TelemetryService::shouldUpdate() {
    return (millis() - lastUpdate) >= UPDATE_INTERVAL;
}

void TelemetryService::markUpdated() {
    lastUpdate = millis();
}

float TelemetryService::getBatteryVoltage() {
    return analogRead(Pins::BATTERY_VOLTAGE_PIN) * (3.3 / 4095.0) * 2;
}

uint32_t TelemetryService::getErrorCount() {
    // Реалізація підрахунку помилок
    return 0;
}