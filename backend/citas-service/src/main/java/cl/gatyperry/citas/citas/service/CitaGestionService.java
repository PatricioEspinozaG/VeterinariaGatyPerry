package cl.gatyperry.citas.citas.service;

import cl.gatyperry.citas.citas.dto.CitaResponse;
import cl.gatyperry.citas.citas.repository.CitaRepository;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
public class CitaGestionService {

    private final CitaRepository repository;

    public CitaGestionService(CitaRepository repository) {
        this.repository = repository;
    }

    @Transactional(readOnly = true)
    public List<CitaResponse> listarTodas() {
        return repository.findAllByOrderByFechaHoraDesc()
            .stream()
            .map(CitaResponse::from)
            .toList();
    }

    @Transactional(readOnly = true)
    public CitaResponse obtener(Long id) {
        return repository.findById(id)
            .map(CitaResponse::from)
            .orElseThrow(() -> new ResponseStatusException(
                HttpStatus.NOT_FOUND,
                "Cita no encontrada"
            ));
    }
}