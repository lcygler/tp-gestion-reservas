package com.udeci.gestionreservas.service;

import com.udeci.gestionreservas.model.Articulo;
import java.util.List;
import java.util.Optional;

public interface ArticuloService {
    List<Articulo> findAllArticulos();
    Optional<Articulo> findArticuloById(Long id);
    Articulo createArticulo(Articulo articulo, Long userId);
    Articulo updateArticulo(Long id, Articulo articuloDetails, Long userId);
    void deleteArticulo(Long id, Long userId);
}