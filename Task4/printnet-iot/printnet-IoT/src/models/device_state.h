#pragma once
#include <Arduino.h>

enum class LockState {
    LOCKED,
    UNLOCKED,
    ERROR
};

struct DeviceState {
    LockState lock_state;
    bool is_door_closed;
    bool is_connected;
    uint32_t last_status_update;
    uint32_t last_command_time;
    float battery_voltage;
    int wifi_signal_strength;
};