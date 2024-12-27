#pragma once
#include "device_state.h"

struct Telemetry {
    LockState lock_state;
    bool is_door_closed;
    float battery_voltage;
    int wifi_signal_strength;
    uint32_t uptime;
    uint32_t last_command_time;
    uint32_t error_count;
    String device_id;
};