package com.roomhotel.roomhotel.exception;

// Esta excepción se lanza cuando buscamos algo que no existe
// Por ejemplo: buscar una habitación con id=X que no está en la base de datos
// El GlobalExceptionHandler la convierte en una respuesta HTTP 404
public class ResourceNotFoundException extends RuntimeException {

    // Constructor que recibe el mensaje de error
    // Ejemplo: "Habitación no encontrada con id: X"
    public ResourceNotFoundException(String message) {
        super(message); // Le pasa el mensaje a la clase padre RuntimeException
    }
}