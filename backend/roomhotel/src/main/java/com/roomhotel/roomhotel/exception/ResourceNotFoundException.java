package com.roomhotel.roomhotel.exception;

// Esta excepción se lanza cuando buscamos algo que no existe
public class ResourceNotFoundException extends RuntimeException {
    public ResourceNotFoundException(String message) {
        super(message);
    }
}