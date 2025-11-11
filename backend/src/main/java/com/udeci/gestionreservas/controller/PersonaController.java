package com.udeci.gestionreservas.controller;

import com.udeci.gestionreservas.model.Persona;
import com.udeci.gestionreservas.service.PersonaService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@RestController
@RequestMapping("/api/personas")
public class PersonaController {

    @Autowired
    private PersonaService personaService;

    @GetMapping
    public List<Persona> getAllPersonas(@RequestHeader("X-User-ID") Long userId) {
        return personaService.findAllPersonas(userId);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Persona> getPersonaById(@PathVariable Long id) {
        return personaService.findPersonaById(id)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PostMapping
    public Persona createPersona(@RequestBody Persona persona, @RequestHeader("X-User-ID") Long userId) {
        return personaService.createPersona(persona, userId);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Persona> updatePersona(@PathVariable Long id, @RequestBody Persona personaDetails, @RequestHeader("X-User-ID") Long userId) {
        try {
            Persona updatedPersona = personaService.updatePersona(id, personaDetails, userId);
            return ResponseEntity.ok(updatedPersona);
        } catch (ResponseStatusException e) {
            throw e;
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePersona(@PathVariable Long id, @RequestHeader("X-User-ID") Long userId) {
        try {
            personaService.deletePersona(id, userId);
            return ResponseEntity.noContent().build();
        } catch (ResponseStatusException e) {
            throw e;
        }
    }
}
