#pragma once
#include <Arduino.h>
#include "../models/device_state.h"
#include "../config/pins.h"

class LockController {
public:
    LockController();
    bool unlock();
    bool lock();
    void update();
    DeviceState getState();

private:
    DeviceState state;
    uint32_t unlock_time;
    bool checkDoorSensor();
    void updateBatteryVoltage();
};