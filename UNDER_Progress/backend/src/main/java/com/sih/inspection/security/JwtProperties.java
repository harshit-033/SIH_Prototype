package com.sih.inspection.security;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

/**
 * Strongly-typed configuration properties for JWT token generation and validation.
 */
@Component
@ConfigurationProperties(prefix = "application.security.jwt")
public class JwtProperties {

    /**
     * Secret signing key for HMAC-SHA256. Defaults to development key if not supplied via JWT_SECRET.
     */
    private String secretKey = "404E635266556A586E3272357538782F413F4428472B4B6250645367566B5970";

    /**
     * Expiration time in milliseconds (default: 86400000 ms = 24 hours).
     */
    private long expiration = 86400000L;

    public String getSecretKey() {
        return secretKey;
    }

    public void setSecretKey(String secretKey) {
        this.secretKey = secretKey;
    }

    public long getExpiration() {
        return expiration;
    }

    public void setExpiration(long expiration) {
        this.expiration = expiration;
    }
}
