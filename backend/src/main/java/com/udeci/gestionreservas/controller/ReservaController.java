package com.udeci.gestionreservas.controller;

import com.udeci.gestionreservas.model.Reserva;
import com.udeci.gestionreservas.service.ReservaService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@RestController
@RequestMapping("/api/reservas")
public class ReservaController {

    @Autowired
    private ReservaService reservaService;

    @GetMapping
    public List<Reserva> getAllReservas() {
        return reservaService.findAllReservas();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Reserva> getReservaById(@PathVariable Long id) {
        return reservaService.findReservaById(id)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PostMapping
    public Reserva createReserva(@RequestBody Reserva reserva) {
        return reservaService.createReserva(reserva);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Reserva> updateReserva(@PathVariable Long id, @RequestBody Reserva reservaDetails, @RequestHeader("X-User-ID") Long userId) {
        try {
            Reserva updatedReserva = reservaService.updateReserva(id, reservaDetails, userId);
            return ResponseEntity.ok(updatedReserva);
        } catch (ResponseStatusException e) {
            throw e;
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteReserva(@PathVariable Long id, @RequestHeader("X-User-ID") Long userId) {
        try {
            reservaService.deleteReserva(id, userId);
            return ResponseEntity.noContent().build();
        } catch (ResponseStatusException e) {
            throw e;
        }
    }
}
