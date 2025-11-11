package com.udeci.gestionreservas.service.impl;

import com.udeci.gestionreservas.model.Persona;
import com.udeci.gestionreservas.model.Sala;
import com.udeci.gestionreservas.repository.PersonaRepository;
import com.udeci.gestionreservas.repository.SalaRepository;
import com.udeci.gestionreservas.service.SalaService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Optional;

@Service
public class SalaServiceImpl implements SalaService {

    @Autowired
    private SalaRepository salaRepository;

    @Autowired
    private PersonaRepository personaRepository;

    private void checkAdmin(Long userId) {
        Persona requestingUser = personaRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Usuario no válido"));
        if (!"ADMIN".equals(requestingUser.getRol())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "No tienes permiso para realizar esta acción");
        }
    }

    @Override
    public List<Sala> findAllSalas() {
        return salaRepository.findAll();
    }

    @Override
    public Optional<Sala> findSalaById(Long id) {
        return salaRepository.findById(id);
    }

    @Override
    public Sala createSala(Sala sala, Long userId) {
        checkAdmin(userId);
        return salaRepository.save(sala);
    }

    @Override
    public Sala updateSala(Long id, Sala salaDetails, Long userId) {
        checkAdmin(userId);
        return salaRepository.findById(id).map(s -> {
            s.setNombre(salaDetails.getNombre());
            s.setCapacidad(salaDetails.getCapacidad());
            return salaRepository.save(s);
        }).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Sala no encontrada"));
    }

    @Override
    public void deleteSala(Long id, Long userId) {
        checkAdmin(userId);
        if (!salaRepository.existsById(id)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Sala no encontrada");
        }
        salaRepository.deleteById(id);
    }
}