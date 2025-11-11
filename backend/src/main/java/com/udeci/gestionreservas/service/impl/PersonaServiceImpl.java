package com.udeci.gestionreservas.service.impl;

import com.udeci.gestionreservas.model.Persona;
import com.udeci.gestionreservas.repository.PersonaRepository;
import com.udeci.gestionreservas.service.PersonaService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Optional;

@Service
public class PersonaServiceImpl implements PersonaService {

    @Autowired
    private PersonaRepository personaRepository;

    private void checkAdmin(Long requestingUserId) {
        Persona requestingUser = personaRepository.findById(requestingUserId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Usuario no válido"));
        if (!"ADMIN".equals(requestingUser.getRol())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "No tienes permiso para realizar esta acción");
        }
    }

    @Override
    public List<Persona> findAllPersonas(Long requestingUserId) {
        Persona requestingUser = personaRepository.findById(requestingUserId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Usuario no válido"));

        if ("ADMIN".equals(requestingUser.getRol())) {
            return personaRepository.findAll();
        } else {
            return List.of(requestingUser);
        }
    }

    @Override
    public Optional<Persona> findPersonaById(Long id) {
        return personaRepository.findById(id);
    }

    @Override
    public Persona createPersona(Persona persona, Long requestingUserId) {
        checkAdmin(requestingUserId);
        return personaRepository.save(persona);
    }

    @Override
    public Persona updatePersona(Long id, Persona personaDetails, Long requestingUserId) {
        checkAdmin(requestingUserId);
        return personaRepository.findById(id).map(persona -> {
            persona.setNombre(personaDetails.getNombre());
            persona.setEmail(personaDetails.getEmail());
            persona.setRol(personaDetails.getRol());
            if (personaDetails.getPassword() != null && !personaDetails.getPassword().isEmpty()) {
                persona.setPassword(personaDetails.getPassword());
            }
            return personaRepository.save(persona);
        }).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Persona no encontrada"));
    }

    @Override
    public void deletePersona(Long id, Long requestingUserId) {
        checkAdmin(requestingUserId);
        if (!personaRepository.existsById(id)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Persona no encontrada");
        }
        personaRepository.deleteById(id);
    }
}