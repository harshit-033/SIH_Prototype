package com.sih.inspection.exception;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.ConstraintViolationException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.DisabledException;
import org.springframework.security.authentication.LockedException;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.servlet.NoHandlerFoundException;

import java.util.List;

/**
 * Centralized exception handling for all REST controllers.
 * <p>
 * Returns a consistent {@link ApiError} payload for all error scenarios.
 * Securely handles authentication failures without leaking account existence to prevent user enumeration.
 * </p>
 */
@RestControllerAdvice
public class GlobalExceptionHandler {

    private static final Logger log = LoggerFactory.getLogger(GlobalExceptionHandler.class);

    /**
     * Handles @Valid / @Validated bean validation failures on request bodies.
     */
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiError> handleValidationException(
            MethodArgumentNotValidException ex,
            HttpServletRequest request) {

        List<ApiError.FieldViolation> violations = ex.getBindingResult()
                .getFieldErrors()
                .stream()
                .map(fe -> new ApiError.FieldViolation(fe.getField(), fe.getDefaultMessage()))
                .toList();

        log.warn("Validation failed for request [{}]: {} field error(s)",
                request.getRequestURI(), violations.size());

        ApiError error = ApiError.of(
                HttpStatus.BAD_REQUEST.value(),
                "Validation Failed",
                "Request contains invalid fields",
                request.getRequestURI(),
                violations
        );

        return ResponseEntity.badRequest().body(error);
    }

    /**
     * Handles @Validated constraint violations on path variables / query params.
     */
    @ExceptionHandler(ConstraintViolationException.class)
    public ResponseEntity<ApiError> handleConstraintViolation(
            ConstraintViolationException ex,
            HttpServletRequest request) {

        List<ApiError.FieldViolation> violations = ex.getConstraintViolations()
                .stream()
                .map(cv -> new ApiError.FieldViolation(
                        cv.getPropertyPath().toString(),
                        cv.getMessage()))
                .toList();

        log.warn("Constraint violation on request [{}]", request.getRequestURI());

        ApiError error = ApiError.of(
                HttpStatus.BAD_REQUEST.value(),
                "Constraint Violation",
                "Request parameters failed validation",
                request.getRequestURI(),
                violations
        );

        return ResponseEntity.badRequest().body(error);
    }

    /**
     * Handles invalid credentials and user-not-found authentication failures.
     * Prevents user enumeration by returning an identical 401 response contract.
     */
    @ExceptionHandler({
            InvalidCredentialsException.class,
            BadCredentialsException.class,
            UsernameNotFoundException.class
    })
    public ResponseEntity<ApiError> handleInvalidCredentials(
            AuthenticationException ex,
            HttpServletRequest request) {

        log.warn("Authentication failed for request [{}]: {}", request.getRequestURI(), ex.getMessage());

        ApiError error = ApiError.of(
                HttpStatus.UNAUTHORIZED.value(),
                "Unauthorized",
                "Invalid email or password",
                request.getRequestURI()
        );

        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(error);
    }

    /**
     * Handles disabled, suspended, or locked account login attempts.
     */
    @ExceptionHandler({
            AccountDisabledException.class,
            DisabledException.class,
            LockedException.class
    })
    public ResponseEntity<ApiError> handleAccountDisabled(
            AuthenticationException ex,
            HttpServletRequest request) {

        log.warn("Authentication rejected for inactive/disabled account on [{}]: {}",
                request.getRequestURI(), ex.getMessage());

        ApiError error = ApiError.of(
                HttpStatus.FORBIDDEN.value(),
                "Forbidden",
                ex.getMessage() != null ? ex.getMessage() : "Account is disabled. Please contact an administrator.",
                request.getRequestURI()
        );

        return ResponseEntity.status(HttpStatus.FORBIDDEN).body(error);
    }

    /**
     * Handles generic Spring Security AuthenticationException.
     */
    @ExceptionHandler(AuthenticationException.class)
    public ResponseEntity<ApiError> handleGenericAuthenticationException(
            AuthenticationException ex,
            HttpServletRequest request) {

        log.warn("Authentication error on [{}]: {}", request.getRequestURI(), ex.getMessage());

        ApiError error = ApiError.of(
                HttpStatus.UNAUTHORIZED.value(),
                "Unauthorized",
                "Authentication failed",
                request.getRequestURI()
        );

        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(error);
    }

    /**
     * Handles authorization access denied (403 Forbidden).
     */
    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<ApiError> handleAccessDenied(
            AccessDeniedException ex,
            HttpServletRequest request) {

        log.warn("Access denied for request [{}]: {}", request.getRequestURI(), ex.getMessage());

        ApiError error = ApiError.of(
                HttpStatus.FORBIDDEN.value(),
                "Forbidden",
                "You do not have permission to access this resource",
                request.getRequestURI()
        );

        return ResponseEntity.status(HttpStatus.FORBIDDEN).body(error);
    }

    /**
     * Handles 404 Not Found when no handler matches the request.
     */
    @ExceptionHandler(NoHandlerFoundException.class)
    public ResponseEntity<ApiError> handleNotFound(
            NoHandlerFoundException ex,
            HttpServletRequest request) {

        log.debug("No handler found for [{} {}]", ex.getHttpMethod(), request.getRequestURI());

        ApiError error = ApiError.of(
                HttpStatus.NOT_FOUND.value(),
                "Not Found",
                "The requested resource does not exist",
                request.getRequestURI()
        );

        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
    }

    /**
     * Catch-all for any unhandled exception.
     * Logs the full exception internally but returns a safe generic message to the client.
     */
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiError> handleGenericException(
            Exception ex,
            HttpServletRequest request) {

        log.error("Unhandled exception on request [{}]: {}", request.getRequestURI(), ex.getMessage(), ex);

        ApiError error = ApiError.of(
                HttpStatus.INTERNAL_SERVER_ERROR.value(),
                "Internal Server Error",
                "An unexpected error occurred. Please try again later.",
                request.getRequestURI()
        );

        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
    }
}
