package com.udeci.gestionreservas.service.impl;

import com.udeci.gestionreservas.model.Articulo;
import com.udeci.gestionreservas.model.Persona;
import com.udeci.gestionreservas.repository.ArticuloRepository;
import com.udeci.gestionreservas.repository.PersonaRepository;
import com.udeci.gestionreservas.service.ArticuloService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Optional;

@Service
public class ArticuloServiceImpl implements ArticuloService {

    @Autowired
    private ArticuloRepository articuloRepository;

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
    public List<Articulo> findAllArticulos() {
        return articuloRepository.findAll();
    }

    @Override
    public Optional<Articulo> findArticuloById(Long id) {
        return articuloRepository.findById(id);
    }

    @Override
    public Articulo createArticulo(Articulo articulo, Long userId) {
        checkAdmin(userId);
        return articuloRepository.save(articulo);
    }

    @Override
    public Articulo updateArticulo(Long id, Articulo articuloDetails, Long userId) {
        checkAdmin(userId);
        return articuloRepository.findById(id).map(art -> {
            art.setNombre(articuloDetails.getNombre());
            art.setDisponible(articuloDetails.isDisponible());
            return articuloRepository.save(art);
        }).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Artículo no encontrado"));
    }

    @Override
    public void deleteArticulo(Long id, Long userId) {
        checkAdmin(userId);
        if (!articuloRepository.existsById(id)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Artículo no encontrado");
        }
        articuloRepository.deleteById(id);
    }
}