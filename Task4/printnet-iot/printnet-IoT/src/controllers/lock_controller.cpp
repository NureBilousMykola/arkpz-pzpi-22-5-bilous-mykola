#include "lock_controller.h"

LockController::LockController() {
    pinMode(Pins::LOCK_PIN, OUTPUT);
    pinMode(Pins::DOOR_SENSOR_PIN, INPUT_PULLUP);
    digitalWrite(Pins::LOCK_PIN, LOW);
    state.lock_state = LockState::LOCKED;
}

bool LockController::unlock() {
    digitalWrite(Pins::LOCK_PIN, HIGH);
    state.lock_state = LockState::UNLOCKED;
    unlock_time = millis();
    return true;
}

bool LockController::lock() {
    digitalWrite(Pins::LOCK_PIN, LOW);
    state.lock_state = LockState::LOCKED;
    return true;
}

void LockController::update() {
    state.is_door_closed = checkDoorSensor();
    updateBatteryVoltage();
}

DeviceState LockController::getState() {
    return state;
}

bool LockController::checkDoorSensor() {
    return digitalRead(Pins::DOOR_SENSOR_PIN);
}

void LockController::updateBatteryVoltage() {
    float voltage = analogRead(Pins::BATTERY_VOLTAGE_PIN) * (3.3 / 4095.0) * 2;
    state.battery_voltage = voltage;
}