#include <unity.h>
#include <Arduino.h>

// Підключаємо всі тестові набори
extern void run_lock_controller_tests();
extern void run_command_processor_tests();
extern void run_telemetry_service_tests();

void setup() {
    delay(2000);
    UNITY_BEGIN();
    
    run_lock_controller_tests();
    run_command_processor_tests();
    run_telemetry_service_tests();
    
    UNITY_END();
}

void loop() {
}

