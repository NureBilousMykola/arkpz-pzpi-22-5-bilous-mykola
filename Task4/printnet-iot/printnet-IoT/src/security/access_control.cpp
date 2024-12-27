#include "access_control.h"

AccessControl::AccessControl(TokenValidator& tokenValidator)
    : tokenValidator(tokenValidator), maintenanceMode(false) {}

bool AccessControl::checkAccess(const char* token, CommandType commandType) {
    if (!tokenValidator.validateToken(token)) {
        logger.error("Invalid token");
        return false;
    }

    if (!validatePermissions(commandType)) {
        logger.error("Insufficient permissions");
        return false;
    }

    if (!checkTimeRestrictions()) {
        logger.error("Operation not allowed at this time");
        return false;
    }

    return true;
}

bool AccessControl::isLockingAllowed() {
    if (maintenanceMode) return false;
    return true;
}

bool AccessControl::isUnlockingAllowed() {
    if (maintenanceMode) return false;
    return checkTimeRestrictions();
}

void AccessControl::setMaintenanceMode(bool enabled) {
    maintenanceMode = enabled;
    logger.info(String("Maintenance mode ") + (enabled ? "enabled" : "disabled"));
}

bool AccessControl::validatePermissions(CommandType commandType) {
    // Реалізація перевірки прав доступу
    return true;
}

bool AccessControl::checkTimeRestrictions() {
    // Реалізація перевірки часових обмежень
    return true;
}