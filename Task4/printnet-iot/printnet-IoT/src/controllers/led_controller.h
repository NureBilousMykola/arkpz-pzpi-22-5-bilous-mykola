#pragma once
#include <Arduino.h>
#include "../config/pins.h"

class LedController {
public:
    LedController();
    void setConnected(bool connected);
    void setError(bool error);
    void setLockState(bool locked);
    void update();

private:
    bool is_connected;
    bool has_error;
    bool is_locked;
    unsigned long last_blink;
};