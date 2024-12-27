#include <Arduino.h>
#include "config/config.h"
#include "config/credentials.h"
#include "core/wifi_manager.h"
#include "core/mqtt_manager.h"
#include "controllers/lock_controller.h"
#include "controllers/led_controller.h"
#include "services/command_processor.h"
#include "services/telemetry_service.h"
#include "security/token_validator.h"
#include "security/access_control.h"
#include "utils/logger.h"

// Глобальні об'єкти
Logger logger;
WiFiManager wifiManager(WIFI_SSID, WIFI_PASSWORD);
MQTTManager mqttManager(MQTT_SERVER, MQTT_PORT, MQTT_USER, MQTT_PASSWORD, DEVICE_ID);
LockController lockController;
LedController ledController;
TokenValidator tokenValidator;
AccessControl accessControl(tokenValidator);
CommandProcessor commandProcessor(lockController, tokenValidator);
TelemetryService telemetryService(lockController, wifiManager);

// Обробник команд MQTT
void handleCommand(const String& message) {
    bool success = commandProcessor.processCommand(message);
    if (!success) {
        logger.error("Command processing failed");
    }
}

// Ініціалізація
void setup() {
    Serial.begin(115200);
    logger.info("Device starting...");

    // Підключення до WiFi
    if (!wifiManager.connect()) {
        logger.error("Failed to connect to WiFi");
        ESP.restart();
    }

    // Налаштування MQTT
    mqttManager.setCommandCallback(handleCommand);
    if (!mqttManager.connect()) {
        logger.error("Failed to connect to MQTT");
    }

    logger.info("Device initialized successfully");
}

// Головний цикл
void loop() {
    // Оновлення мережевих з'єднань
    wifiManager.update();
    mqttManager.update();

    // Оновлення стану замка
    lockController.update();

    // Оновлення індикації
    ledController.setConnected(wifiManager.isConnected() && mqttManager.isConnected());
    ledController.setLockState(lockController.getState().lock_state == LockState::LOCKED);
    ledController.update();

    // Відправка телеметрії
    if (telemetryService.shouldUpdate() && mqttManager.isConnected()) {
        Telemetry telemetry = telemetryService.collectTelemetry();
        String telemetryJson = telemetryService.serializeTelemetry(telemetry);
        
        if (mqttManager.publish("device/" DEVICE_ID "/telemetry", telemetryJson)) {
            telemetryService.markUpdated();
        }
    }

    // Затримка для економії ресурсів
    delay(100);
}

// Обробник помилок
void handleError(const String& error) {
    logger.error(error);
    ledController.setError(true);
}

// Обробник переривань для кнопки скидання
void IRAM_ATTR resetButtonISR() {
    ESP.restart();
}