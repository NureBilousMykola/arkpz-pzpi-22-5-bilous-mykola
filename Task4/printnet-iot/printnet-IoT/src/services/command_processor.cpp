#include "command_processor.h"

CommandProcessor::CommandProcessor(LockController& lc, TokenValidator& tv)
    : lockController(lc), tokenValidator(tv) {}

bool CommandProcessor::processCommand(const String& payload) {
    StaticJsonDocument<512> doc;
    DeserializationError error = deserializeJson(doc, payload);
    
    if (error) {
        logger.error("Failed to parse command: " + String(error.c_str()));
        return false;
    }

    Command cmd;
    cmd.type = static_cast<CommandType>(doc["type"].as<int>());
    strlcpy(cmd.token, doc["token"] | "", sizeof(cmd.token));
    cmd.timestamp = doc["timestamp"] | 0;
    strlcpy(cmd.payload, doc["payload"] | "", sizeof(cmd.payload));

    if (!validateCommand(cmd)) {
        return false;
    }

    switch (cmd.type) {
        case CommandType::LOCK:
            return handleLockCommand(cmd);
        case CommandType::UNLOCK:
            return handleUnlockCommand(cmd);
        case CommandType::STATUS_REQUEST:
            return handleStatusRequest(cmd);
        case CommandType::CONFIG_UPDATE:
            return handleConfigUpdate(cmd);
        case CommandType::RESET:
            ESP.restart();
            return true;
        default:
            logger.error("Unknown command type");
            return false;
    }
}

bool CommandProcessor::validateCommand(const Command& cmd) {
    return tokenValidator.validateToken(cmd.token);
}

bool CommandProcessor::handleLockCommand(const Command& cmd) {
    logger.info("Processing lock command");
    return lockController.lock();
}

bool CommandProcessor::handleUnlockCommand(const Command& cmd) {
    logger.info("Processing unlock command");
    return lockController.unlock();
}

bool CommandProcessor::handleStatusRequest(const Command& cmd) {
    logger.info("Processing status request");
    return true;
}

bool CommandProcessor::handleConfigUpdate(const Command& cmd) {
    logger.info("Processing config update");
    StaticJsonDocument<256> configDoc;
    DeserializationError error = deserializeJson(configDoc, cmd.payload);
    
    if (error) {
        logger.error("Failed to parse config update");
        return false;
    }

    // Оновлення конфігурації
    return true;
}