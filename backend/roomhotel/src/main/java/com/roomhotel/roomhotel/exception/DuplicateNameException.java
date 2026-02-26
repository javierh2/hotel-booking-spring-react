package com.roomhotel.roomhotel.exception;

// Esta excepción se lanza cuando intentamos crear una habitación
// con un nombre que ya existe en la base de datos
// El GlobalExceptionHandler la convierte en una respuesta HTTP 409
public class DuplicateNameException extends RuntimeException {

    public DuplicateNameException(String message) {
        super(message);
    }
}