package com.udeci.gestionreservas.service;

import com.udeci.gestionreservas.model.Persona;
import java.util.List;
import java.util.Optional;

public interface PersonaService {
    List<Persona> findAllPersonas(Long requestingUserId);
    Optional<Persona> findPersonaById(Long id);
    Persona createPersona(Persona persona, Long requestingUserId);
    Persona updatePersona(Long id, Persona personaDetails, Long requestingUserId);
    void deletePersona(Long id, Long requestingUserId);
}