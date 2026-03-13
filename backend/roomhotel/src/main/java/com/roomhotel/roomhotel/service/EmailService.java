package com.roomhotel.roomhotel.service;

import lombok.RequiredArgsConstructor;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

// lógica y servicio de email
@Service
@RequiredArgsConstructor
public class EmailService {
    // JMS es el bean que spring boot autoconfigura con los datos de properties
    private final JavaMailSender mailSender;

    // envia email de confirmación con datos del User
    public void sendRegistrationConfirmation(String toEmail, String firstName){
        SimpleMailMessage message = new SimpleMailMessage();

        // from es el remitente de Mailtrap
        message.setFrom("noreply@digitalbooking.com");
        message.setTo(toEmail);
        message.setSubject("¡Bienvenido/a a Digital Booking, " + firstName + "! Esperamos que encuentre su lugar en el mundo");
        message.setText(buildEmailBody(firstName, toEmail)); // funcion "builder"

        mailSender.send(message);
    }

    // cuerpo del email
    private String buildEmailBody(String firstName, String email){
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

}
