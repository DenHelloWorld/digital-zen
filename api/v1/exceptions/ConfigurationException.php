<?php

/**
 * Custom exception for configuration-related errors
 * 
 * This exception should be thrown when required configuration is missing or invalid,
 * allowing consuming code to distinguish configuration errors from other runtime errors.
 */
class ConfigurationException extends RuntimeException {
    /**
     * Create a new configuration exception
     * 
     * @param string $message Error message describing the configuration issue
     * @param int $code Optional error code
     * @param Throwable|null $previous Optional previous exception for exception chaining
     */
    public function __construct($message = "", $code = 0, Throwable $previous = null) {
        parent::__construct($message, $code, $previous);
    }
}
