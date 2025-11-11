package com.udeci.gestionreservas.service.impl;

import com.udeci.gestionreservas.model.*;
import com.udeci.gestionreservas.repository.*;
import com.udeci.gestionreservas.service.ReservaService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Optional;

@Service
public class ReservaServiceImpl implements ReservaService {

    @Autowired
    private ReservaRepository reservaRepository;
    @Autowired
    private PersonaRepository personaRepository;
    @Autowired
    private SalaRepository salaRepository;
    @Autowired
    private ArticuloRepository articuloRepository;

    private void checkAdmin(Long userId) {
        Persona requestingUser = personaRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Usuario no válido"));
        if (!"ADMIN".equals(requestingUser.getRol())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "No tienes permiso para realizar esta acción");
        }
    }

    @Override
    public List<Reserva> findAllReservas() {
        return reservaRepository.findAll();
    }

    @Override
    public Optional<Reserva> findReservaById(Long id) {
        return reservaRepository.findById(id);
    }

    @Override
    public Reserva createReserva(Reserva reserva) {
        Persona persona = personaRepository.findById(reserva.getPersona().getId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Persona no encontrada con id: " + reserva.getPersona().getId()));
        reserva.setPersona(persona);

        if (reserva.getSala() != null && reserva.getSala().getId() != null) {
            Sala sala = salaRepository.findById(reserva.getSala().getId())
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Sala no encontrada con id: " + reserva.getSala().getId()));
            reserva.setSala(sala);
            reserva.setArticulo(null);
        } else if (reserva.getArticulo() != null && reserva.getArticulo().getId() != null) {
            Articulo articulo = articuloRepository.findById(reserva.getArticulo().getId())
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Articulo no encontrado con id: " + reserva.getArticulo().getId()));
            reserva.setArticulo(articulo);
            reserva.setSala(null);
        } else {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Debe especificar un id de sala o de artículo");
        }

        return reservaRepository.save(reserva);
    }

    @Override
    public Reserva updateReserva(Long id, Reserva reservaDetails, Long userId) {
        Persona requestingUser = personaRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Usuario no válido"));

        return reservaRepository.findById(id).map(reserva -> {
            if (!"ADMIN".equals(requestingUser.getRol()) && !reserva.getPersona().getId().equals(userId)) {
                throw new ResponseStatusException(HttpStatus.FORBIDDEN, "No tienes permiso para actualizar esta reserva");
            }
            Persona persona = personaRepository.findById(reservaDetails.getPersona().getId())
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Persona no encontrada con id: " + reservaDetails.getPersona().getId()));
            reserva.setPersona(persona);

            if (reservaDetails.getSala() != null && reservaDetails.getSala().getId() != null) {
                Sala sala = salaRepository.findById(reservaDetails.getSala().getId())
                        .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Sala no encontrada con id: " + reservaDetails.getSala().getId()));
                reserva.setSala(sala);
                reserva.setArticulo(null);
            } else if (reservaDetails.getArticulo() != null && reservaDetails.getArticulo().getId() != null) {
                Articulo articulo = articuloRepository.findById(reservaDetails.getArticulo().getId())
                        .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Articulo no encontrado con id: " + reservaDetails.getArticulo().getId()));
                reserva.setArticulo(articulo);
                reserva.setSala(null);
            } else {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Debe especificar un id de sala o de artículo");
            }

            reserva.setFechaHoraInicio(reservaDetails.getFechaHoraInicio());
            reserva.setFechaHoraFin(reservaDetails.getFechaHoraFin());
            return reservaRepository.save(reserva);
        }).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Reserva no encontrada"));
    }

    @Override
    public void deleteReserva(Long id, Long userId) {
        Persona requestingUser = personaRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Usuario no válido"));

        Reserva reserva = reservaRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Reserva no encontrada"));

        if (!"ADMIN".equals(requestingUser.getRol()) && !reserva.getPersona().getId().equals(userId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "No tienes permiso para eliminar esta reserva");
        }

        reservaRepository.deleteById(id);
    }
}