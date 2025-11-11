package com.udeci.gestionreservas.service;

import com.udeci.gestionreservas.model.Persona;
import com.udeci.gestionreservas.controller.AuthController.LoginRequest;

import java.util.Optional;

public interface AuthService {
    Optional<Persona> login(LoginRequest loginRequest);
}