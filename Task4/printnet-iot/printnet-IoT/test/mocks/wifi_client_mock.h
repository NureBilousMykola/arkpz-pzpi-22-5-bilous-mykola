#pragma once

#include <unity.h>
#include <Arduino.h>

class WiFiClientMock {
public:
    bool connect(const char* host, uint16_t port) { return true; }
    bool connected() { return true; }
    void stop() {}
    size_t write(const uint8_t* buf, size_t size) { return size; }
    int available() { return 0; }
    int read() { return 0; }
};