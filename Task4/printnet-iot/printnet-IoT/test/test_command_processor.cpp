#include <unity.h>
#include <ArduinoJson.h>
#include "../src/services/command_processor.h"
#include "../src/controllers/lock_controller.h"
#include "../src/security/token_validator.h"

LockController* lock_controller;
TokenValidator* token_validator;
CommandProcessor* command_processor;

void setUp(void) {
    lock_controller = new LockController();
    token_validator = new TokenValidator();
    command_processor = new CommandProcessor(*lock_controller, *token_validator);
}

void tearDown(void) {
    delete command_processor;
    delete token_validator;
    delete lock_controller;
}

void test_process_lock_command() {
    StaticJsonDocument<200> doc;
    doc["type"] = static_cast<int>(CommandType::LOCK);
    doc["token"] = "valid_token";
    doc["timestamp"] = millis();
    
    String command;
    serializeJson(doc, command);
    
    bool result = command_processor->processCommand(command);
    TEST_ASSERT_TRUE(result);
    
    DeviceState state = lock_controller->getState();
    TEST_ASSERT_EQUAL(LockState::LOCKED, state.lock_state);
}

void test_process_unlock_command() {
    StaticJsonDocument<200> doc;
    doc["type"] = static_cast<int>(CommandType::UNLOCK);
    doc["token"] = "valid_token";
    doc["timestamp"] = millis();
    
    String command;
    serializeJson(doc, command);
    
    bool result = command_processor->processCommand(command);
    TEST_ASSERT_TRUE(result);
    
    DeviceState state = lock_controller->getState();
    TEST_ASSERT_EQUAL(LockState::UNLOCKED, state.lock_state);
}

void test_invalid_command_format() {
    String invalid_command = "invalid json";
    bool result = command_processor->processCommand(invalid_command);
    TEST_ASSERT_FALSE(result);
}

void test_invalid_token() {
    StaticJsonDocument<200> doc;
    doc["type"] = static_cast<int>(CommandType::UNLOCK);
    doc["token"] = "invalid_token";
    doc["timestamp"] = millis();
    
    String command;
    serializeJson(doc, command);
    
    bool result = command_processor->processCommand(command);
    TEST_ASSERT_FALSE(result);
}

void run_command_processor_tests() {
    RUN_TEST(test_process_lock_command);
    RUN_TEST(test_process_unlock_command);
    RUN_TEST(test_invalid_command_format);
    RUN_TEST(test_invalid_token);
}