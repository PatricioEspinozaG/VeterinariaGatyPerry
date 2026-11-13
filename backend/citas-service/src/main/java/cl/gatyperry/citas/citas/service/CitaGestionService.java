package cl.gatyperry.citas.citas.service;

import cl.gatyperry.citas.citas.dto.CitaReprogramacionRequest;
import cl.gatyperry.citas.citas.dto.CitaRequest;
import cl.gatyperry.citas.citas.dto.CitaResponse;
import cl.gatyperry.citas.citas.model.Cita;
import cl.gatyperry.citas.citas.model.EstadoCita;
import cl.gatyperry.citas.citas.repository.CitaRepository;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Objects;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
public class CitaGestionService {

    private static final List<EstadoCita> ESTADOS_ACTIVOS = List.of(
        EstadoCita.PENDIENTE,
        EstadoCita.CONFIRMADA
    );

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
        LocalDateTime fechaHora = validarFechaFutura(request);

        clienteClient.verificarClienteActivo(userId, tokenPersonal);
        mascotaClient.verificarPropiedadParaPersonal(
            request.mascotaId(),
            userId,
            tokenPersonal
        );

        HorarioCitas.exigirLibre(
            repository.existsByFechaHoraAndEstadoIn(
                fechaHora,
                ESTADOS_ACTIVOS
            )
        );

        Cita cita = new Cita();
        cita.setUserId(userId);
        aplicarDatos(cita, request, fechaHora);
        cita.setEstado(EstadoCita.PENDIENTE);

        return CitaResponse.from(GuardadoCita.guardar(repository, cita));
    }

    @Transactional
    public CitaResponse reprogramar(
        Long id,
        CitaReprogramacionRequest cambios,
        String tokenPersonal
    ) {
        Cita cita = buscar(id);

        if (cita.getEstado() == EstadoCita.COMPLETADA
            || cita.getEstado() == EstadoCita.CANCELADA) {
            throw new ResponseStatusException(
                HttpStatus.CONFLICT,
                "Esta cita ya no se puede reprogramar"
            );
        }

        if (!Objects.equals(cita.getVersion(), cambios.version())) {
            throw new ResponseStatusException(
                HttpStatus.CONFLICT,
                "La cita fue modificada; vuelve a consultarla"
            );
        }

        CitaRequest request = cambios.cita();
        LocalDateTime fechaHora = validarFechaFutura(request);

        clienteClient.verificarClienteActivo(
            cita.getUserId(),
            tokenPersonal
        );
        mascotaClient.verificarPropiedadParaPersonal(
            request.mascotaId(),
            cita.getUserId(),
            tokenPersonal
        );

        HorarioCitas.exigirLibre(
            repository.existsByFechaHoraAndEstadoInAndIdNot(
                fechaHora,
                ESTADOS_ACTIVOS,
                id
            )
        );

        aplicarDatos(cita, request, fechaHora);
        return CitaResponse.from(GuardadoCita.guardar(repository, cita));
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

    private LocalDateTime validarFechaFutura(CitaRequest request) {
        return HorarioCitas.validar(request.fecha(), request.hora());
    }

    private void aplicarDatos(
        Cita cita,
        CitaRequest request,
        LocalDateTime fechaHora
    ) {
        cita.setMascotaId(request.mascotaId());
        cita.setServicio(request.servicio().trim());
        cita.setFechaHora(fechaHora);
        cita.setMotivo(request.motivo().trim());
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