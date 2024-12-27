#pragma once
#include <Arduino.h>

enum class CommandType {
    LOCK,
    UNLOCK,
    STATUS_REQUEST,
    CONFIG_UPDATE,
    RESET
};

struct Command {
    CommandType type;
    char token[64];
    uint32_t timestamp;
    char payload[256];
};