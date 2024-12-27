#include "token_validator.h"

TokenValidator::TokenValidator() {
    clearToken();
}

bool TokenValidator::validateToken(const char* token) {
    if (!verifyTokenFormat(token)) {
        logger.error("Invalid token format");
        return false;
    }

    if (String(token) != currentToken.token) {
        logger.error("Token mismatch");
        return false;
    }

    if (checkTokenExpiration()) {
        logger.error("Token expired");
        return false;
    }

    return true;
}

void TokenValidator::updateToken(const String& newToken, unsigned long expirationTime) {
    currentToken.token = newToken;
    currentToken.expiration = millis() + expirationTime;
    logger.info("Token updated");
}

bool TokenValidator::isTokenExpired() {
    return checkTokenExpiration();
}

void TokenValidator::clearToken() {
    currentToken.token = "";
    currentToken.expiration = 0;
    currentToken.permissions = 0;
}

bool TokenValidator::verifyTokenFormat(const char* token) {
    // Мінімальна довжина токена
    if (strlen(token) < 32) return false;
    
    // Перевірка на допустимі символи
    for (size_t i = 0; token[i] != '\0'; i++) {
        if (!isalnum(token[i]) && token[i] != '-' && token[i] != '_') {
            return false;
        }
    }
    
    return true;
}

bool TokenValidator::checkTokenExpiration() {
    return millis() > currentToken.expiration;
}