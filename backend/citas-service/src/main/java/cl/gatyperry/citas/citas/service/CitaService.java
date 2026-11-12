package cl.gatyperry.citas.citas.service;

import cl.gatyperry.citas.citas.dto.CitaRequest;
import cl.gatyperry.citas.citas.dto.CitaResponse;
import cl.gatyperry.citas.citas.model.Cita;
import cl.gatyperry.citas.citas.model.EstadoCita;
import cl.gatyperry.citas.citas.repository.CitaRepository;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
public class CitaService {

    private static final ZoneId ZONA_CLINICA = ZoneId.of("America/Santiago");

    private final CitaRepository repository;
    private final MascotaClient mascotaClient;

    public CitaService(
        CitaRepository repository,
        MascotaClient mascotaClient
    ) {
        this.repository = repository;
        this.mascotaClient = mascotaClient;
    }

    @Transactional(readOnly = true)
    public List<CitaResponse> listarPropias(Long userId) {
        return repository.findAllByUserIdOrderByFechaHoraDesc(userId)
            .stream()
            .map(CitaResponse::from)
            .toList();
    }

    @Transactional(readOnly = true)
    public CitaResponse obtenerPropia(Long id, Long userId) {
        return CitaResponse.from(buscarPropia(id, userId));
    }

    @Transactional
    public CitaResponse crear(
        Long userId,
        String token,
        CitaRequest request
    ) {
        LocalDateTime fechaHora = LocalDateTime.of(
            request.fecha(),
            request.hora()
        );

        if (!fechaHora.isAfter(LocalDateTime.now(ZONA_CLINICA))) {
            throw new ResponseStatusException(
                HttpStatus.BAD_REQUEST,
                "La fecha y hora deben ser futuras"
            );
        }

        mascotaClient.verificarPropiedad(request.mascotaId(), token);

        Cita cita = new Cita();
        cita.setUserId(userId);
        cita.setMascotaId(request.mascotaId());
        cita.setServicio(request.servicio().trim());
        cita.setFechaHora(fechaHora);
        cita.setMotivo(request.motivo().trim());
        cita.setEstado(EstadoCita.PENDIENTE);

        return CitaResponse.from(repository.save(cita));
    }

    @Transactional
    public CitaResponse cancelarPropia(Long id, Long userId) {
        Cita cita = buscarPropia(id, userId);

        if (cita.getEstado() != EstadoCita.PENDIENTE
            && cita.getEstado() != EstadoCita.CONFIRMADA) {
            throw new ResponseStatusException(
                HttpStatus.CONFLICT,
                "Esta cita ya no se puede cancelar"
            );
        }

        cita.setEstado(EstadoCita.CANCELADA);
        return CitaResponse.from(repository.save(cita));
    }

    private Cita buscarPropia(Long id, Long userId) {
        return repository.findByIdAndUserId(id, userId)
            .orElseThrow(() -> new ResponseStatusException(
                HttpStatus.NOT_FOUND,
                "Cita no encontrada"
            ));
    }
}