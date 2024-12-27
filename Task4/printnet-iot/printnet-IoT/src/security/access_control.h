#pragma once
#include <Arduino.h>
#include "token_validator.h"
#include "../models/device_state.h"
#include "../utils/logger.h"
#include <models/command.h>

class AccessControl {
public:
    AccessControl(TokenValidator& tokenValidator);
    bool checkAccess(const char* token, CommandType commandType);
    bool isLockingAllowed();
    bool isUnlockingAllowed();
    void setMaintenanceMode(bool enabled);

private:
    TokenValidator& tokenValidator;
    bool maintenanceMode;
    Logger logger;

    bool validatePermissions(CommandType commandType);
    bool checkTimeRestrictions();
};