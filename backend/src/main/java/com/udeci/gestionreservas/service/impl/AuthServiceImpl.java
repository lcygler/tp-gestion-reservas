package com.udeci.gestionreservas.service.impl;

import com.udeci.gestionreservas.model.Persona;
import com.udeci.gestionreservas.repository.PersonaRepository;
import com.udeci.gestionreservas.service.AuthService;
import com.udeci.gestionreservas.controller.AuthController.LoginRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class AuthServiceImpl implements AuthService {

    @Autowired
    private PersonaRepository personaRepository;

    @Override
    public Optional<Persona> login(LoginRequest loginRequest) {
        Optional<Persona> personaOptional = personaRepository.findByEmail(loginRequest.email());

        if (personaOptional.isPresent()) {
            Persona persona = personaOptional.get();
            if (loginRequest.password().equals(persona.getPassword())) {
                persona.setPassword(null);
                return Optional.of(persona);
            }
        }
        return Optional.empty();
    }
}