package com.roomhotel.roomhotel.config;

import com.roomhotel.roomhotel.entity.Category;
import com.roomhotel.roomhotel.entity.Room;
import com.roomhotel.roomhotel.repository.CategoryRepository;
import com.roomhotel.roomhotel.repository.RoomRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class DataInitializer {

    @Bean
    CommandLineRunner initData(RoomRepository roomRepository,
                               CategoryRepository categoryRepository) {
        return args -> {

            // creamos las categorías primero — las habitaciones las referencian
            // el check de count() evita duplicados si el servidor se reinicia
            if (categoryRepository.count() == 0) {

                Category suite = categoryRepository.save(Category.builder()
                        .title("Suite")
                        .description("Habitaciones de lujo con amenities premium y servicios exclusivos.")
                        .imageUrl("https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=400")
                        .build());

                Category estandar = categoryRepository.save(Category.builder()
                        .title("Estándar")
                        .description("Habitaciones cómodas y funcionales con excelente relación precio-calidad.")
                        .imageUrl("https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=400")
                        .build());

                Category departamento = categoryRepository.save(Category.builder()
                        .title("Departamento")
                        .description("Espacios independientes con cocina equipada, ideales para estadías largas.")
                        .imageUrl("https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=400")
                        .build());

                Category hostel = categoryRepository.save(Category.builder()
                        .title("Hostel")
                        .description("Alojamiento económico para viajeros y mochileros con ambiente social.")
                        .imageUrl("https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=400")
                        .build());

                Category bedAndBreakfast = categoryRepository.save(Category.builder()
                        .title("Bed & Breakfast")
                        .description("Alojamiento con desayuno incluido en ambientes acogedores y personalizados.")
                        .imageUrl("https://images.unsplash.com/photo-1542718610-a1d656d1884c?w=400")
                        .build());

                System.out.println("5 categorías cargadas correctamente desde DataInitializer");

                // creamos las habitaciones solo si no existen
                if (roomRepository.count() == 0) {
                    roomRepository.save(Room.builder()
                            .name("Suite Presidencial")
                            .description("Habitación de lujo con vista panorámica, jacuzzi privado y servicio de mayordomo las 24 horas.")
                            .category(suite)
                            .price(350.0)
                            .imageRoom("https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=400")
                            .build());

                    roomRepository.save(Room.builder()
                            .name("Habitación Doble Estándar")
                            .description("Cómoda habitación para dos personas con cama queen size y desayuno incluido.")
                            .category(estandar)
                            .price(120.0)
                            .imageRoom("https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=400")
                            .build());

                    roomRepository.save(Room.builder()
                            .name("Departamento Familiar")
                            .description("Amplio departamento con dos habitaciones, cocina equipada e ideal para familias.")
                            .category(departamento)
                            .price(200.0)
                            .imageRoom("https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=400")
                            .build());

                    roomRepository.save(Room.builder()
                            .name("Hostel Cama Compartida")
                            .description("Cama en habitación compartida con casillero personal. Ideal para mochileros.")
                            .category(hostel)
                            .price(25.0)
                            .imageRoom("https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=400")
                            .build());

                    roomRepository.save(Room.builder()
                            .name("Suite Junior")
                            .description("Suite elegante con sala de estar separada y amenities de lujo.")
                            .category(suite)
                            .price(220.0)
                            .imageRoom("https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=400")
                            .build());

                    roomRepository.save(Room.builder()
                            .name("Cabaña de Montaña")
                            .description("Acogedora cabaña con chimenea, vista a la montaña y desayuno casero incluido.")
                            .category(bedAndBreakfast)
                            .price(180.0)
                            .imageRoom("https://images.unsplash.com/photo-1542718610-a1d656d1884c?w=400")
                            .build());

                    roomRepository.save(Room.builder()
                            .name("Habitación Simple Económica")
                            .description("Habitación cómoda y funcional para viajeros solos con excelente relación precio-calidad.")
                            .category(estandar)
                            .price(65.0)
                            .imageRoom("https://images.unsplash.com/photo-1505693314120-0d443867891c?w=400")
                            .build());

                    roomRepository.save(Room.builder()
                            .name("Loft Industrial")
                            .description("Moderno loft con diseño industrial, techos altos y ubicación céntrica.")
                            .category(departamento)
                            .price(160.0)
                            .imageRoom("https://images.unsplash.com/photo-1536376072261-38c75010e6c9?w=400")
                            .build());

                    roomRepository.save(Room.builder()
                            .name("Hostel Privado Doble")
                            .description("Habitación privada en hostel con baño compartido. Lo mejor de ambos mundos.")
                            .category(hostel)
                            .price(55.0)
                            .imageRoom("https://images.unsplash.com/photo-1520277739336-7bf67edfa768?w=400")
                            .build());

                    roomRepository.save(Room.builder()
                            .name("Bed & Breakfast Colonial")
                            .description("Encantadora habitación en casona colonial con jardín y desayuno artesanal.")
                            .category(bedAndBreakfast)
                            .price(95.0)
                            .imageRoom("https://images.unsplash.com/photo-1444201983204-c43cbd584d93?w=400")
                            .build());

                    System.out.println("10 habitaciones cargadas correctamente desde DataInitializer");
                }
            }
        };
    }
}
