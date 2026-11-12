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
public class CitaGestionService {

    private static final ZoneId ZONA_CLINICA =
        ZoneId.of("America/Santiago");

    private final CitaRepository repository;
    private final ClienteClient clienteClient;
    private final MascotaClient mascotaClient;

    public CitaGestionService(
        CitaRepository repository,
        ClienteClient clienteClient,
        MascotaClient mascotaClient
    ) {
        this.repository = repository;
        this.clienteClient = clienteClient;
        this.mascotaClient = mascotaClient;
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
        return CitaResponse.from(buscar(id));
    }

    @Transactional
    public CitaResponse crear(
        Long userId,
        CitaRequest request,
        String tokenPersonal
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

        clienteClient.verificarClienteActivo(userId, tokenPersonal);
        mascotaClient.verificarPropiedadParaPersonal(
            request.mascotaId(),
            userId,
            tokenPersonal
        );

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
    public CitaResponse cambiarEstado(Long id, EstadoCita nuevoEstado) {
        Cita cita = buscar(id);

        if (!transicionPermitida(cita.getEstado(), nuevoEstado)) {
            throw new ResponseStatusException(
                HttpStatus.CONFLICT,
                "Cambio de estado no permitido"
            );
        }

        cita.setEstado(nuevoEstado);
        return CitaResponse.from(repository.save(cita));
    }

    private Cita buscar(Long id) {
        return repository.findById(id)
            .orElseThrow(() -> new ResponseStatusException(
                HttpStatus.NOT_FOUND,
                "Cita no encontrada"
            ));
    }

    private boolean transicionPermitida(
        EstadoCita actual,
        EstadoCita nuevo
    ) {
        return switch (actual) {
            case PENDIENTE ->
                nuevo == EstadoCita.CONFIRMADA
                    || nuevo == EstadoCita.CANCELADA;
            case CONFIRMADA ->
                nuevo == EstadoCita.COMPLETADA
                    || nuevo == EstadoCita.CANCELADA;
            case COMPLETADA, CANCELADA -> false;
        };
    }
}