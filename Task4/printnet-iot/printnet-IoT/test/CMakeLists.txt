cmake_minimum_required(VERSION 3.16)

# Ім'я проекту
set(PROJECT_NAME "printnet_iot_test")
project(${PROJECT_NAME})

# Додаємо тести
add_executable(simple_test simple_test.cpp)
target_link_libraries(simple_test Unity)