package com.quotaapp.backend.exception;

public class InvalidRegistrationDataException extends RuntimeException {
    
    public InvalidRegistrationDataException(String message) {
        super(message);
    }
    
    public InvalidRegistrationDataException(String message, Throwable cause) {
        super(message, cause);
    }
}
