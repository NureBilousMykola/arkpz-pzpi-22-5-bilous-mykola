#pragma once
#include <Arduino.h>
#include "../utils/logger.h"

struct TokenInfo {
    String token;
    unsigned long expiration;
    uint32_t permissions;
};

class TokenValidator {
public:
    TokenValidator();
    bool validateToken(const char* token);
    void updateToken(const String& newToken, unsigned long expirationTime);
    bool isTokenExpired();
    void clearToken();

private:
    TokenInfo currentToken;
    Logger logger;
    
    bool verifyTokenFormat(const char* token);
    bool checkTokenExpiration();
};