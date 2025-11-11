package com.udeci.gestionreservas.controller;

import com.udeci.gestionreservas.model.Articulo;
import com.udeci.gestionreservas.service.ArticuloService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@RestController
@RequestMapping("/api/articulos")
public class ArticuloController {

    @Autowired
    private ArticuloService articuloService;

    @GetMapping
    public List<Articulo> getAllArticulos() {
        return articuloService.findAllArticulos();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Articulo> getArticuloById(@PathVariable Long id) {
        return articuloService.findArticuloById(id)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PostMapping
    public Articulo createArticulo(@RequestBody Articulo articulo, @RequestHeader("X-User-ID") Long userId) {
        return articuloService.createArticulo(articulo, userId);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Articulo> updateArticulo(@PathVariable Long id, @RequestBody Articulo articuloDetails, @RequestHeader("X-User-ID") Long userId) {
        try {
            Articulo updatedArticulo = articuloService.updateArticulo(id, articuloDetails, userId);
            return ResponseEntity.ok(updatedArticulo);
        } catch (ResponseStatusException e) {
            throw e;
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteArticulo(@PathVariable Long id, @RequestHeader("X-User-ID") Long userId) {
        try {
            articuloService.deleteArticulo(id, userId);
            return ResponseEntity.noContent().build();
        } catch (ResponseStatusException e) {
            throw e;
        }
    }
}
