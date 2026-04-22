package com.roomhotel.roomhotel.service;

import lombok.RequiredArgsConstructor;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.time.temporal.ChronoUnit;

// lógica y servicio de email
@Service
@RequiredArgsConstructor
public class EmailService {
    // JMS es el bean que spring boot autoconfigura con los datos de properties
    private final JavaMailSender mailSender;

    // envia email de confirmación con datos del User al registrarse
    public void sendRegistrationConfirmation(String toEmail, String firstName){
        SimpleMailMessage message = new SimpleMailMessage();

        // from es el remitente de Mailtrap
        message.setFrom("noreply@digitalbooking.com");
        message.setTo(toEmail);
        message.setSubject("¡Bienvenido/a a Digital Booking, " + firstName + "! Esperamos que encuentre su lugar en el mundo");
        message.setText(buildRegistrationEmailBody(firstName, toEmail)); // funcion "builder"

        mailSender.send(message);
    }

    // envia email de confirmación de reserva
    public void sendBookingConfirmation(String toEmail, String firstName, String roomName, LocalDate checkIn, LocalDate checkOut){
        SimpleMailMessage message = new SimpleMailMessage();

        message.setFrom("noreply@digitalbooking.com");
        message.setTo(toEmail);
        message.setSubject("¡Tu reserva en Digital Booking está confirmada! Gracias por confiar en nosotros " + firstName);
        message.setText(buildBookingEmailBody(firstName,roomName,checkIn, checkOut));

        mailSender.send(message);
    }




    // cuerpo del email de registro
    private String buildRegistrationEmailBody(String firstName, String email){
        return """
                Hola %s,
                
                Tu registro en Digital Booking fue existoso.
                
                Tus datos de acceso:
                
                -Email: %s
                
                Podes iniciar sesión en: http://localhost:5173/login
                

                ¡Gracias por registrarte!
                El equipo de Digital Booking
                """.formatted(firstName,email);
    }


    // cuerpo del email de confirmación de reserva
    // DateTimeFormatter convierte LocalDate a formato legible para el usuario (ej: 15/05/2026)
    // ChronoUnit.DAYS.between calcula las noches sin depender de milisegundos haciendolo más legible y seguro
    private String buildBookingEmailBody(
            String firstName,
            String roomName,
            LocalDate checkIn,
            LocalDate checkOut
    ) {
        DateTimeFormatter fmt = DateTimeFormatter.ofPattern("dd/MM/yyyy");
        long nights = ChronoUnit.DAYS.between(checkIn, checkOut);

        return """
                Hola %s,
                
                ¡Tu reserva ha sido confirmada exitosamente!
                
                Detalle de tu reserva:
                
                - Producto: %s
                - Check-in:  %s
                - Check-out: %s
                - Noches:    %d
                
                Podés ver tu historial de reservas en:
                http://localhost:5173/my-bookings
                
                Si tenés alguna consulta, comunicate con nosotros por WhatsApp
                desde la página del producto.
                
                ¡Gracias por elegirnos!
                El equipo de Digital Booking
                """.formatted(firstName, roomName, checkIn.format(fmt), checkOut.format(fmt), nights);
    }

}
