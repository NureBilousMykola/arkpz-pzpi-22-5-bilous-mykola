#include "led_controller.h"

LedController::LedController() {
    pinMode(Pins::LED_STATUS_PIN, OUTPUT);
    is_connected = false;
    has_error = false;
    is_locked = true;
    last_blink = 0;
}

void LedController::setConnected(bool connected) {
    is_connected = connected;
}

void LedController::setError(bool error) {
    has_error = error;
}

void LedController::setLockState(bool locked) {
    is_locked = locked;
}

void LedController::update() {
    if (has_error) {
        // Швидке блимання при помилці
        if (millis() - last_blink >= 200) {
            digitalWrite(Pins::LED_STATUS_PIN, !digitalRead(Pins::LED_STATUS_PIN));
            last_blink = millis();
        }
    } else if (!is_connected) {
        // Повільне блимання при відсутності з'єднання
        if (millis() - last_blink >= 1000) {
            digitalWrite(Pins::LED_STATUS_PIN, !digitalRead(Pins::LED_STATUS_PIN));
            last_blink = millis();
        }
    } else {
        // Постійне світіння при нормальній роботі
        digitalWrite(Pins::LED_STATUS_PIN, !is_locked);
    }
}