#include <unity.h>
#include "../src/controllers/lock_controller.h"

LockController* lock_controller;

void setUp(void) {
    lock_controller = new LockController();
}

void tearDown(void) {
    delete lock_controller;
}

void test_lock_initial_state() {
    DeviceState state = lock_controller->getState();
    TEST_ASSERT_EQUAL(LockState::LOCKED, state.lock_state);
}

void test_unlock_operation() {
    bool result = lock_controller->unlock();
    TEST_ASSERT_TRUE(result);
    
    DeviceState state = lock_controller->getState();
    TEST_ASSERT_EQUAL(LockState::UNLOCKED, state.lock_state);
}

void test_lock_operation() {
    lock_controller->unlock();  // Спочатку розблокуємо
    
    bool result = lock_controller->lock();
    TEST_ASSERT_TRUE(result);
    
    DeviceState state = lock_controller->getState();
    TEST_ASSERT_EQUAL(LockState::LOCKED, state.lock_state);
}

void test_auto_lock_timeout() {
    lock_controller->unlock();
    
    // Емулюємо проходження часу
    delay(35000);  // 35 секунд
    lock_controller->update();
    
    DeviceState state = lock_controller->getState();
    TEST_ASSERT_EQUAL(LockState::LOCKED, state.lock_state);
}

void test_door_sensor() {
    lock_controller->update();
    DeviceState state = lock_controller->getState();
    
    // Перевіряємо, що стан дверей зчитується
    TEST_ASSERT_TRUE(state.is_door_closed);
}

void run_lock_controller_tests() {
    RUN_TEST(test_lock_initial_state);
    RUN_TEST(test_unlock_operation);
    RUN_TEST(test_lock_operation);
    RUN_TEST(test_auto_lock_timeout);
    RUN_TEST(test_door_sensor);
}