package com.udeci.gestionreservas.service;

import com.udeci.gestionreservas.model.Sala;
import java.util.List;
import java.util.Optional;

public interface SalaService {
    List<Sala> findAllSalas();
    Optional<Sala> findSalaById(Long id);
    Sala createSala(Sala sala, Long userId);
    Sala updateSala(Long id, Sala salaDetails, Long userId);
    void deleteSala(Long id, Long userId);
}