package com.roomhotel.roomhotel.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.List;

@Entity
@Table(name = "USERS")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
// implementacion necesaria por contrato para que Spring Security sepa si es un user con auth,con permisos y si está activo
public class User implements UserDetails {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    @Column(nullable = false)
    private String firstName;

    @NotBlank
    @Column(nullable = false)
    private String lastName;

    // validacion de email, no puede ser nulo y debe ser unico
    @Email
    @NotBlank
    @Column(nullable = false,unique = true)
    private String email;

    // validacion de password, no puede ser nulo
    @NotBlank
    @Column(nullable = false)
    private String password;

    // rol del user, no puede ser nulo y se guarda como string en la base de datos
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Role role;

    // metodos de UserDetails implementados para que User sea autosuficiente
    @Override
    public Collection<? extends GrantedAuthority> getAuthorities(){
        //convierte enum Role en el formato que Spring Security entiende
        return List.of(new SimpleGrantedAuthority(role.name()));
    }

    @Override
    public String getUsername(){
        //usa getUsername como identificador y devuelve el email, que es unico y se usa para loguearse
        return email;
    }
    // el password se obtiene del campo password
    @Override
    public boolean isAccountNonExpired() { return true; }
    // los usuarios están activos, no bloqueados ni expirados
    @Override
    public boolean isAccountNonLocked() { return true; }
    // las credenciales no expiran, el token JWT se encarga de eso
    @Override
    public boolean isCredentialsNonExpired() { return true; }
    // el user está habilitado
    @Override
    public boolean isEnabled() { return true; }
    @Override
    public String getPassword() {
        return password;
    }


}
