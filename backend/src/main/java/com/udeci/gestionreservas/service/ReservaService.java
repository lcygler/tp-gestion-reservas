package com.udeci.gestionreservas.service;

import com.udeci.gestionreservas.model.Reserva;
import java.util.List;
import java.util.Optional;

public interface ReservaService {
    List<Reserva> findAllReservas();
    Optional<Reserva> findReservaById(Long id);
    Reserva createReserva(Reserva reserva);
    Reserva updateReserva(Long id, Reserva reservaDetails, Long userId);
    void deleteReserva(Long id, Long userId);
}