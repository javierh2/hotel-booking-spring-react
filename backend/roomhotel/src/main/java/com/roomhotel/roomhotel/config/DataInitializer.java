package com.roomhotel.roomhotel.config;

import com.roomhotel.roomhotel.entity.Category;
import com.roomhotel.roomhotel.entity.Role;
import com.roomhotel.roomhotel.entity.Room;
import com.roomhotel.roomhotel.entity.User;
import com.roomhotel.roomhotel.repository.CategoryRepository;
import com.roomhotel.roomhotel.repository.RoomRepository;
import com.roomhotel.roomhotel.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.List;

@Configuration
public class DataInitializer {

        // PasswordEncoder se inyecta por constructor — es un @Bean de SecurityConfig
        // no usamos @RequiredArgsConstructor porque esta clase ya tiene un @Bean method
        // con parámetros propios — Lombok y los @Bean params se mezclan mal en este
        // caso
        private final PasswordEncoder passwordEncoder;

        public DataInitializer(PasswordEncoder passwordEncoder) {
                this.passwordEncoder = passwordEncoder;
        }

        @Bean
        CommandLineRunner initData(RoomRepository roomRepository,
                        CategoryRepository categoryRepository,
                        UserRepository userRepository) {
                return args -> {

                        // Usuario admin por defecto
                        // se crea solo si no existe ningún usuario en la DB
                        // con PostgreSQL y ddl-auto=update los datos persisten entre reinicios
                        // por eso el guard count() == 0 es crítico — evita duplicar en cada arranque
                        if (userRepository.count() == 0) {
                                userRepository.save(User.builder()
                                                .firstName("Dev")
                                                .lastName("Admin")
                                                .email("dev@admin.com")
                                                // encode() aplica BCrypt con 10 rondas — nunca guardar password en
                                                // texto plano
                                                .password(passwordEncoder.encode("admin1234"))
                                                .role(Role.ROLE_ADMIN)
                                                .build());
                                System.out.println(">>> Usuario admin creado: dev@admin.com / admin1234");
                        }

                        // Categorías y rooms
                        // el guard anidado garantiza que las rooms solo se crean si las categorías
                        // tampoco existen — evita rooms sin categoría si el init se interrumpió
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

                                System.out.println(">>> 5 categorías cargadas correctamente desde DataInitializer");

                                if (roomRepository.count() == 0) {

                                        roomRepository.save(Room.builder()
                                                        .name("Suite Presidencial en Bariloche")
                                                        .description("Habitación de lujo con vista panorámica, jacuzzi privado y servicio de mayordomo las 24 horas.")
                                                        .category(suite)
                                                        .price(350.0)
                                                        .images(List.of(
                                                                        "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=400",
                                                                        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQoo4h0bFXygxNSzoY2HHbODt0O7dN0PxL-Nw&s",
                                                                        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT_cgobyf63s-HNAWYGi2HsBN_773Ae0Mnf1A&s",
                                                                        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSYEafxhsqZhYpr6-8pLQBQubcO3i4KVO7UhQ&s",
                                                                        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSDhLOJvgC_rdNRB6oxqszcfB4_qAGYvuTaDA&s"))
                                                        .build());

                                        roomRepository.save(Room.builder()
                                                        .name("Habitación Doble Estándar en Buenos Aires")
                                                        .description("Cómoda habitación para dos personas con cama queen size y desayuno incluido.")
                                                        .category(estandar)
                                                        .price(120.0)
                                                        .images(List.of(
                                                                        "https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=400",
                                                                        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTLl8BqSr26q2Iy6rS8C79h9poJb-Qkl8lySQ&s",
                                                                        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSsmMO_w6K6XU5_F4gral_pQzzKF8yc_VnnNw&s",
                                                                        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS7mAa7teD0qkX5fiIv9LsPkllxBjClvSiAFw&s",
                                                                        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQeR3pFPA_cRBSEXziaZxVwjqUsB7fZFJ3VuA&s"))
                                                        .build());

                                        roomRepository.save(Room.builder()
                                                        .name("Departamento Familiar en Mendoza")
                                                        .description("Amplio departamento con dos habitaciones, cocina equipada e ideal para familias.")
                                                        .category(departamento)
                                                        .price(200.0)
                                                        .images(List.of(
                                                                        "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=400",
                                                                        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRa3DgnwVc45GM84P92ZYv9bHSckdf9sXPHOw&s",
                                                                        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQWk7ObNj8tGDxFdp1lKhTltSrc0fL0xPqP9Q&s",
                                                                        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRK7F8g4jvGw894NFtmU6UhS7uvEiss7DgLfQ&s",
                                                                        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQN2OYz2C77KBKSjVU5XIILtcv5P0Io9EPe-g&s"))
                                                        .build());

                                        roomRepository.save(Room.builder()
                                                        .name("Hostel Cama Compartida en Córdoba")
                                                        .description("Cama en habitación compartida con casillero personal. Ideal para mochileros.")
                                                        .category(hostel)
                                                        .price(25.0)
                                                        .images(List.of(
                                                                        "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=400",
                                                                        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQF5domky9uf2EDtqfAL6XeUHw94PCk0N99gg&s",
                                                                        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRX6j7uKUaeVPcFVmz_WRXZiOZ9goTcRgLiow&s",
                                                                        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTQDjxSqCUd6HjoZpStaDtgpx3BvW8UX8fLkg&s",
                                                                        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRgWck8-MetOqncxXoCav7nM5HvXup5AWqjuA&s"))
                                                        .build());

                                        roomRepository.save(Room.builder()
                                                        .name("Suite Junior en Ushuaia")
                                                        .description("Suite elegante con sala de estar separada y amenities de lujo.")
                                                        .category(suite)
                                                        .price(220.0)
                                                        .images(List.of(
                                                                        "https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=400",
                                                                        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRKu2mOEuaZfp-IqWO_rM0-p7DtHyzuYM4qMA&s",
                                                                        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQmMr7FdRc_wAAwYuRBzej7ieHsW2i2NnD96g&s",
                                                                        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTcv-jrpry3AtopWgnMfFLXjZcM8qfSM7QTIA&s",
                                                                        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR14Q5KuEajDZccWgljyCljjCAeAPjucM4rHA&s"))
                                                        .build());

                                        roomRepository.save(Room.builder()
                                                        .name("Cabaña de Montaña en Salta")
                                                        .description("Acogedora cabaña con chimenea, vista a la montaña y desayuno casero incluido.")
                                                        .category(bedAndBreakfast)
                                                        .price(180.0)
                                                        .images(List.of(
                                                                        "https://images.unsplash.com/photo-1542718610-a1d656d1884c?w=400",
                                                                        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSTYp9YGHs5dcWtmu7zoW1W3t3QzRNn9Vqocw&s",
                                                                        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSL0znqMIap0iTxi3xFo70o33zvU1pkUMDFvw&s",
                                                                        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQWgUU7PdgjTySQNFSL5tJg6vF4qapSFF1yoQ&s",
                                                                        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRZo7WWWexkQtkRVztN0Qfrmp8PHx_US96dYQ&s"))
                                                        .build());

                                        roomRepository.save(Room.builder()
                                                        .name("Habitación Simple Económica en Mar del Plata")
                                                        .description("Habitación cómoda y funcional para viajeros solos con excelente relación precio-calidad.")
                                                        .category(estandar)
                                                        .price(65.0)
                                                        .images(List.of(
                                                                        "https://images.unsplash.com/photo-1505693314120-0d443867891c?w=400",
                                                                        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTXebqY132D5R9WQkxQ0FMimjEMq4aWfrcIhg&s",
                                                                        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQTeZCssnQb-tD84J9_g7fkUNkJBtSh1K2BOQ&s",
                                                                        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR2Q2EhnlZjQau_QMWQXrwI8RmtFnjXtUH5XA&s",
                                                                        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTi1rg8DMVlc5DzUDt1UZNwIe-4U2pkNGXJjw&s"))
                                                        .build());

                                        roomRepository.save(Room.builder()
                                                        .name("Loft Industrial en Puerto Iguazú")
                                                        .description("Moderno loft con diseño industrial, techos altos y ubicación céntrica.")
                                                        .category(departamento)
                                                        .price(160.0)
                                                        .images(List.of(
                                                                        "https://images.unsplash.com/photo-1536376072261-38c75010e6c9?w=400",
                                                                        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ8s_TOVpkPdoH7BG5sPlfy6NEgJYkIlO1cyQ&s",
                                                                        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRbF-L0DGfXodcXwN1hwZ9Y3yWJaScG3ep3Gw&s",
                                                                        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTiqgSb8MYgNlrmx5GGnf5JDvu8h7cj4YIvQw&s",
                                                                        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQr9tGSgrKebnjse1dmqG2wcz_UC8veNHMx2Q&s"))
                                                        .build());

                                        roomRepository.save(Room.builder()
                                                        .name("Hostel Privado Doble en El Calafate")
                                                        .description("Habitación privada en hostel con baño compartido. Lo mejor de ambos mundos.")
                                                        .category(hostel)
                                                        .price(55.0)
                                                        .images(List.of(
                                                                        "https://images.unsplash.com/photo-1520277739336-7bf67edfa768?w=400",
                                                                        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRwTTvGfJkDo_rd_7nUCHUkJIJwt_k3MkVTog&s",
                                                                        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRvVLEjuxXjjU1bNB3rQkIGY1WX4Wcp-5quVw&s",
                                                                        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSgGBTH22sv8UwPxrCVzPxdYTKPxYNbEwp_MQ&s",
                                                                        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSNUfY6IRFBhrtF7h68aIKpGxcN3--iIYMd9g&s"))
                                                        .build());

                                        roomRepository.save(Room.builder()
                                                        .name("Bed & Breakfast Colonial en Federación")
                                                        .description("Encantadora habitación en casona colonial con jardín y desayuno artesanal.")
                                                        .category(bedAndBreakfast)
                                                        .price(95.0)
                                                        .images(List.of(
                                                                        "https://images.unsplash.com/photo-1444201983204-c43cbd584d93?w=400",
                                                                        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRMKd0wwYgKvSs23XccAGmV86mLFadIz6YBRQ&s",
                                                                        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS5UAnI2nfWoS-cs5p2B-sJ7OoDnRprb5IiMg&s",
                                                                        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTkBJy9Wijx_Fhawn1WfPQ03mjSpdrFoW7UzQ&s",
                                                                        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT7zNcagBojVTiax712L3PMKWXT8nHj0Wdp4w&s"))
                                                        .build());

                                        System.out.println(
                                                        ">>> 10 habitaciones cargadas correctamente desde DataInitializer");
                                }
                        }
                };
        }
}