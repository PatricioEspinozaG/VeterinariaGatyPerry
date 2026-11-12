package cl.gatyperry.pacientes.mascotas.service;

import cl.gatyperry.pacientes.mascotas.dto.MascotaParaCitaResponse;
import cl.gatyperry.pacientes.mascotas.repository.MascotaRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
public class MascotaGestionService {

    private final MascotaRepository repository;

    public MascotaGestionService(MascotaRepository repository) {
        this.repository = repository;
    }

    @Transactional(readOnly = true)
    public MascotaParaCitaResponse obtener(Long id) {
        return repository.findById(id)
            .map(MascotaParaCitaResponse::from)
            .orElseThrow(() -> new ResponseStatusException(
                HttpStatus.NOT_FOUND,
                "Mascota no encontrada"
            ));
    }
}