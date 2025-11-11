package com.udeci.gestionreservas.controller;

import com.udeci.gestionreservas.model.Persona;
import com.udeci.gestionreservas.service.AuthService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private AuthService authService;

    public static record LoginRequest(String email, String password) {}

    @PostMapping("/login")
    public ResponseEntity<Persona> login(@RequestBody LoginRequest loginRequest) {
        Optional<Persona> personaOptional = authService.login(loginRequest);

        if (personaOptional.isPresent()) {
            return ResponseEntity.ok(personaOptional.get());
        }

        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
    }
}
