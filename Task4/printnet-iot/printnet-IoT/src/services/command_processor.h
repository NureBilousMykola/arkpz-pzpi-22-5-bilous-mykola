#pragma once
#include <Arduino.h>
#include <ArduinoJson.h>
#include "../models/command.h"
#include "../controllers/lock_controller.h"
#include "../utils/logger.h"
#include "../security/token_validator.h"

class CommandProcessor {
public:
    CommandProcessor(LockController& lockController, TokenValidator& tokenValidator);
    bool processCommand(const String& payload);
    
private:
    LockController& lockController;
    TokenValidator& tokenValidator;
    Logger logger;
    
    bool handleLockCommand(const Command& cmd);
    bool handleUnlockCommand(const Command& cmd);
    bool handleStatusRequest(const Command& cmd);
    bool handleConfigUpdate(const Command& cmd);
    bool validateCommand(const Command& cmd);
};