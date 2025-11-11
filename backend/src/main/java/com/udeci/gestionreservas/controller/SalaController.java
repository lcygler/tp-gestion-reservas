package com.udeci.gestionreservas.controller;

import com.udeci.gestionreservas.model.Sala;
import com.udeci.gestionreservas.service.SalaService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@RestController
@RequestMapping("/api/salas")
public class SalaController {

    @Autowired
    private SalaService salaService;

    @GetMapping
    public List<Sala> getAllSalas() {
        return salaService.findAllSalas();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Sala> getSalaById(@PathVariable Long id) {
        return salaService.findSalaById(id)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PostMapping
    public Sala createSala(@RequestBody Sala sala, @RequestHeader("X-User-ID") Long userId) {
        return salaService.createSala(sala, userId);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Sala> updateSala(@PathVariable Long id, @RequestBody Sala salaDetails, @RequestHeader("X-User-ID") Long userId) {
        try {
            Sala updatedSala = salaService.updateSala(id, salaDetails, userId);
            return ResponseEntity.ok(updatedSala);
        } catch (ResponseStatusException e) {
            throw e;
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteSala(@PathVariable Long id, @RequestHeader("X-User-ID") Long userId) {
        try {
            salaService.deleteSala(id, userId);
            return ResponseEntity.noContent().build();
        } catch (ResponseStatusException e) {
            throw e;
        }
    }
}
