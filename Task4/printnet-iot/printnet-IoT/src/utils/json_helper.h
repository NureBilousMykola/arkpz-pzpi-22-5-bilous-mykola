#pragma once
#include <Arduino.h>
#include <ArduinoJson.h>
#include "logger.h"

class JsonHelper {
public:
    static bool parseJson(const String& input, JsonDocument& doc);
    static String serializeJson(const JsonDocument& doc);
    static bool validateJsonSchema(const JsonDocument& doc, const char* schema);
    static void addCommonFields(JsonDocument& doc);

private:
    static Logger logger;
};
