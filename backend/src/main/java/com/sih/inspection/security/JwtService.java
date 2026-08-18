package com.sih.inspection.security;

import com.sih.inspection.auth.entity.AccountStatus;
import com.sih.inspection.auth.entity.Role;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.function.Function;

/**
 * Service for generating, signing, parsing, and validating JSON Web Tokens (JWT).
 * <p>
 * Implements HMAC-SHA256 token signing with externalized secrets and configurable expiration.
 * Tokens carry only non-sensitive claims (subject/email, userId, role, status).
 * </p>
 */
@Service
public class JwtService {

    private final JwtProperties jwtProperties;

    public JwtService(JwtProperties jwtProperties) {
        this.jwtProperties = jwtProperties;
    }

    /**
     * Extracts the subject (email) from the token.
     */
    public String extractUsername(String token) {
        return extractClaim(token, Claims::getSubject);
    }

    /**
     * Extracts token expiration timestamp.
     */
    public Date extractExpiration(String token) {
        return extractClaim(token, Claims::getExpiration);
    }

    /**
     * Extracts a custom claim using a claims resolver function.
     */
    public <T> T extractClaim(String token, Function<Claims, T> claimsResolver) {
        final Claims claims = extractAllClaims(token);
        return claimsResolver.apply(claims);
    }

    /**
     * Extracts the userId claim from the token.
     */
    public Long extractUserId(String token) {
        Object val = extractAllClaims(token).get("userId");
        if (val instanceof Number num) {
            return num.longValue();
        }
        return null;
    }

    /**
     * Extracts the role claim from the token.
     */
    public String extractRole(String token) {
        return (String) extractAllClaims(token).get("role");
    }

    /**
     * Extracts the account status claim from the token.
     */
    public String extractStatus(String token) {
        return (String) extractAllClaims(token).get("status");
    }

    /**
     * Generates a JWT token for a {@link SecurityUser}.
     */
    public String generateToken(UserDetails userDetails) {
        Map<String, Object> claims = new HashMap<>();
        if (userDetails instanceof SecurityUser securityUser) {
            claims.put("userId", securityUser.getId());
            claims.put("role", securityUser.getRole() != null ? securityUser.getRole().name() : null);
            claims.put("status", securityUser.getStatus() != null ? securityUser.getStatus().name() : null);
        }
        return generateToken(claims, userDetails.getUsername());
    }

    /**
     * Generates a JWT token directly with specific claims.
     */
    public String generateToken(Long userId, String email, Role role, AccountStatus status) {
        Map<String, Object> claims = new HashMap<>();
        claims.put("userId", userId);
        claims.put("role", role != null ? role.name() : null);
        claims.put("status", status != null ? status.name() : null);
        return generateToken(claims, email);
    }

    /**
     * Generates a token with custom claims and subject.
     */
    public String generateToken(Map<String, Object> extraClaims, String subject) {
        return buildToken(extraClaims, subject, jwtProperties.getExpiration());
    }

    /**
     * Builds and signs the JWT.
     */
    public String buildToken(Map<String, Object> extraClaims, String subject, long expirationTime) {
        long nowMillis = System.currentTimeMillis();
        Date issuedAt = new Date(nowMillis);
        Date expiration = new Date(nowMillis + expirationTime);

        return Jwts.builder()
                .claims(extraClaims)
                .subject(subject)
                .issuedAt(issuedAt)
                .expiration(expiration)
                .signWith(getSigningKey(), Jwts.SIG.HS256)
                .compact();
    }

    /**
     * Validates whether the token belongs to the given user and has not expired.
     */
    public boolean isTokenValid(String token, UserDetails userDetails) {
        final String username = extractUsername(token);
        return (username != null && username.equalsIgnoreCase(userDetails.getUsername())) && !isTokenExpired(token);
    }

    /**
     * Checks if the token is expired.
     */
    public boolean isTokenExpired(String token) {
        Date expiration = extractExpiration(token);
        return expiration != null && expiration.before(new Date());
    }

    /**
     * Returns configured token expiration time in milliseconds.
     */
    public long getExpirationTime() {
        return jwtProperties.getExpiration();
    }

    /**
     * Parses and extracts all claims from signed JWT.
     */
    public Claims extractAllClaims(String token) {
        return Jwts.parser()
                .verifyWith(getSigningKey())
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    /**
     * Derives HMAC-SHA256 secret key from configured secret property.
     */
    private SecretKey getSigningKey() {
        String secret = jwtProperties.getSecretKey();
        byte[] keyBytes;
        try {
            keyBytes = Decoders.BASE64.decode(secret);
            if (keyBytes.length < 32) {
                keyBytes = secret.getBytes(StandardCharsets.UTF_8);
            }
        } catch (Exception e) {
            keyBytes = secret.getBytes(StandardCharsets.UTF_8);
        }

        if (keyBytes.length < 32) {
            try {
                MessageDigest sha256 = MessageDigest.getInstance("SHA-256");
                keyBytes = sha256.digest(keyBytes);
            } catch (NoSuchAlgorithmException ex) {
                throw new IllegalStateException("SHA-256 algorithm unavailable", ex);
            }
        }

        return Keys.hmacShaKeyFor(keyBytes);
    }
}
