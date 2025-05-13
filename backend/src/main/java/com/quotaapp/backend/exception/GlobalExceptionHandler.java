package com.quotaapp.backend.exception;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import org.springframework.dao.DataAccessException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import com.quotaapp.backend.dto.ApiResponse;

import jakarta.validation.ConstraintViolation;
import jakarta.validation.ConstraintViolationException;
import lombok.extern.slf4j.Slf4j;

@RestControllerAdvice
@Slf4j
public class GlobalExceptionHandler {

    /**
     * Handle validation exceptions
     *
     * @param ex the exception
     * @return the response entity
     */
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiResponse<Void>> handleValidationExceptions(MethodArgumentNotValidException ex) {
        List<String> errors = new ArrayList<>();

        ex.getBindingResult().getAllErrors().forEach(error -> {
            String fieldName = ((FieldError) error).getField();
            String errorMessage = error.getDefaultMessage();
            errors.add(fieldName + ": " + errorMessage);
        });

        log.error("Validation error: {}", errors);
        return ResponseEntity.badRequest().body(ApiResponse.error("Validation failed", errors));
    }

    /**
     * Handle constraint violation exceptions
     *
     * @param ex the exception
     * @return the response entity
     */
    @ExceptionHandler(ConstraintViolationException.class)
    public ResponseEntity<ApiResponse<Void>> handleConstraintViolationException(ConstraintViolationException ex) {
        List<String> errors = new ArrayList<>();

        for (ConstraintViolation<?> violation : ex.getConstraintViolations()) {
            errors.add(violation.getPropertyPath() + ": " + violation.getMessage());
        }

        log.error("Constraint violation: {}", errors);
        return ResponseEntity.badRequest().body(ApiResponse.error("Validation failed", errors));
    }

    /**
     * Handle invalid verification code exceptions
     *
     * @param ex the exception
     * @return the response entity
     */
    @ExceptionHandler(InvalidVerificationCodeException.class)
    public ResponseEntity<ApiResponse<Void>> handleInvalidVerificationCodeException(InvalidVerificationCodeException ex) {
        log.error("Invalid verification code: {}", ex.getMessage());
        return ResponseEntity.badRequest().body(ApiResponse.error(ex.getMessage()));
    }

    /**
     * Handle invalid registration data exceptions
     *
     * @param ex the exception
     * @return the response entity
     */
    @ExceptionHandler(InvalidRegistrationDataException.class)
    public ResponseEntity<ApiResponse<Void>> handleInvalidRegistrationDataException(InvalidRegistrationDataException ex) {
        log.error("Invalid registration data: {}", ex.getMessage());
        return ResponseEntity.badRequest().body(ApiResponse.error(ex.getMessage()));
    }

    /**
     * Handle bad credentials exceptions
     *
     * @param ex the exception
     * @return the response entity
     */
    @ExceptionHandler(BadCredentialsException.class)
    public ResponseEntity<ApiResponse<Void>> handleBadCredentialsException(BadCredentialsException ex) {
        log.error("Bad credentials: {}", ex.getMessage());
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(ApiResponse.error("Invalid username or password"));
    }

    /**
     * Handle database exceptions
     *
     * @param ex the exception
     * @return the response entity
     */
    @ExceptionHandler(DataAccessException.class)
    public ResponseEntity<ApiResponse<Void>> handleDataAccessException(DataAccessException ex) {
        log.error("Database error: {}", ex.getMessage(), ex);

        String errorMessage = "A database error occurred";
        if (ex.getMessage() != null) {
            // Check for null value constraint violations
            if (ex.getMessage().contains("null value") && ex.getMessage().contains("violates not-null constraint")) {
                errorMessage = "Required database field is missing. Please check your input.";

                // Extract the column name if possible
                if (ex.getMessage().contains("column \"")) {
                    String columnName = ex.getMessage().substring(
                            ex.getMessage().indexOf("column \"") + 8,
                            ex.getMessage().indexOf("\"", ex.getMessage().indexOf("column \"") + 8)
                    );
                    errorMessage = "Required field '" + columnName + "' is missing. Please check your input.";
                }
            }
        }

        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(ApiResponse.error(errorMessage));
    }

    /**
     * Handle all other exceptions
     *
     * @param ex the exception
     * @return the response entity
     */
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiResponse<Void>> handleAllExceptions(Exception ex) {
        log.error("Unexpected error", ex);
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponse.error("An unexpected error occurred. Please try again later."));
    }
}
