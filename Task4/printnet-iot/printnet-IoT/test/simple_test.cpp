#include <Arduino.h>
#include <unity.h>

// Базовий тест GPIO
void test_led_builtin_pin_number(void) {
    TEST_ASSERT_EQUAL(2, LED_BUILTIN);
}

// Тест цифрового виводу
void test_led_state_high(void) {
    digitalWrite(LED_BUILTIN, HIGH);
    TEST_ASSERT_EQUAL(HIGH, digitalRead(LED_BUILTIN));
}

void test_led_state_low(void) {
    digitalWrite(LED_BUILTIN, LOW);
    TEST_ASSERT_EQUAL(LOW, digitalRead(LED_BUILTIN));
}

void setup() {
    delay(2000);    // Даємо час на стабілізацію
    pinMode(LED_BUILTIN, OUTPUT);
    UNITY_BEGIN();  // Початок тестування
    RUN_TEST(test_led_builtin_pin_number);
    RUN_TEST(test_led_state_high);
    RUN_TEST(test_led_state_low);
    UNITY_END();    // Кінець тестування
}

void loop() {
    // Нічого не робимо
    digitalWrite(LED_BUILTIN, HIGH);
    delay(100);
    digitalWrite(LED_BUILTIN, LOW);
    delay(100);
}