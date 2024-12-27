#include "json_helper.h"

Logger JsonHelper::logger;

bool JsonHelper::parseJson(const String& input, JsonDocument& doc) {
    DeserializationError error = deserializeJson(doc, input);
    if (error) {
        logger.error("JSON parsing failed: " + String(error.c_str()));
        return false;
    }
    return true;
}

String JsonHelper::serializeJson(const JsonDocument& doc) {
    String output;
    serializeJson(doc);
    return output;
}

bool JsonHelper::validateJsonSchema(const JsonDocument& doc, const char* schema) {
    // Базова перевірка наявності обов'язкових полів
    // В реальному проекті тут має бути повноцінна валідація схеми
    return true;
}

void JsonHelper::addCommonFields(JsonDocument& doc) {
    doc["timestamp"] = millis();
    doc["device_id"] = "vending-001"; // Має братися з конфігурації
    doc["version"] = "1.0.0";
}