package com.quotaapp.backend.exception;

/**
 * Exception thrown when a vehicle has insufficient quota
 */
public class InsufficientQuotaException extends RuntimeException {
    
    private static final long serialVersionUID = 1L;
    
    public InsufficientQuotaException(String message) {
        super(message);
    }
    
    public InsufficientQuotaException(String message, Throwable cause) {
        super(message, cause);
    }
}
