package com.collabflow.domain.chat.exception;

/**
 * Thrown when a chat-related business rule is violated.
 */
public class ChatException extends RuntimeException {

    public ChatException(String message) {
        super(message);
    }

    public ChatException(String message, Throwable cause) {
        super(message, cause);
    }
}
