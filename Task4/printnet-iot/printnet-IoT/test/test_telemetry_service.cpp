#include <unity.h>
#include <ArduinoJson.h>
#include "../src/services/telemetry_service.h"
#include "../src/controllers/lock_controller.h"
#include "../src/core/wifi_manager.h"
#include "test_config.h"

LockController* lock_controller;
WiFiManager* wifi_manager;
TelemetryService* telemetry_service;

void setUp(void) {
    lock_controller = new LockController();
    wifi_manager = new WiFiManager(TEST_WIFI_SSID, TEST_WIFI_PASSWORD);
    telemetry_service = new TelemetryService(*lock_controller, *wifi_manager);
}

void tearDown(void) {
    delete telemetry_service;
    delete wifi_manager;
    delete lock_controller;
}

void test_collect_telemetry() {
    Telemetry telemetry = telemetry_service->collectTelemetry();
    
    TEST_ASSERT_EQUAL(LockState::LOCKED, telemetry.lock_state);
    TEST_ASSERT_TRUE(telemetry.is_door_closed);
    TEST_ASSERT_GREATER_THAN(0, telemetry.uptime);
}

void test_serialize_telemetry() {
    Telemetry telemetry = telemetry_service->collectTelemetry();
    String json = telemetry_service->serializeTelemetry(telemetry);
    
    StaticJsonDocument<512> doc;
    DeserializationError error = deserializeJson(doc, json);
    
    TEST_ASSERT_FALSE(error);
    TEST_ASSERT_EQUAL(static_cast<int>(telemetry.lock_state), doc["lock_state"].as<int>());
    TEST_ASSERT_EQUAL(telemetry.is_door_closed, doc["is_door_closed"].as<bool>());
}

void test_update_interval() {
    TEST_ASSERT_TRUE(telemetry_service->shouldUpdate());
    
    telemetry_service->markUpdated();
    TEST_ASSERT_FALSE(telemetry_service->shouldUpdate());
    
    delay(5100);  // Трохи більше 5 секунд
    TEST_ASSERT_TRUE(telemetry_service->shouldUpdate());
}

void test_battery_voltage() {
    Telemetry telemetry = telemetry_service->collectTelemetry();
    TEST_ASSERT_GREATER_OR_EQUAL(0.0f, telemetry.battery_voltage);
    TEST_ASSERT_LESS_OR_EQUAL(4.2f, telemetry.battery_voltage);
}

void run_telemetry_service_tests() {
    RUN_TEST(test_collect_telemetry);
    RUN_TEST(test_serialize_telemetry);
    RUN_TEST(test_update_interval);
    RUN_TEST(test_battery_voltage);
}