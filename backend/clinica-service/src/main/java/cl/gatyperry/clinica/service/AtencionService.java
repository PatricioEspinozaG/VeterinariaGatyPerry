package cl.gatyperry.clinica.service;

import cl.gatyperry.clinica.dto.AtencionActualizarRequest;
import cl.gatyperry.clinica.dto.AtencionAnulacionRequest;
import cl.gatyperry.clinica.dto.AtencionCrearRequest;
import cl.gatyperry.clinica.dto.AtencionResponse;
import cl.gatyperry.clinica.dto.HistorialItem;
import cl.gatyperry.clinica.dto.HistorialResponse;
import cl.gatyperry.clinica.dto.VacunaActualizarRequest;
import cl.gatyperry.clinica.dto.VacunaAnulacionRequest;
import cl.gatyperry.clinica.dto.VacunaCrearRequest;
import cl.gatyperry.clinica.dto.VacunaResponse;
import cl.gatyperry.clinica.model.Atencion;
import cl.gatyperry.clinica.model.EstadoRegistro;
import cl.gatyperry.clinica.model.Vacuna;
import cl.gatyperry.clinica.repository.AtencionRepository;
import cl.gatyperry.clinica.repository.VacunaRepository;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
public class AtencionService {

    private static final int LIMITE_MAXIMO_HISTORIAL = 100;
    private static final ZoneId ZONA_CLINICA = ZoneId.of("America/Santiago");

    private final AtencionRepository atencionRepository;
    private final VacunaRepository vacunaRepository;
    private final MascotaClient mascotaClient;
    private final CitaClient citaClient;

    public AtencionService(
        AtencionRepository atencionRepository,
        VacunaRepository vacunaRepository,
        MascotaClient mascotaClient,
        CitaClient citaClient
    ) {
        this.atencionRepository = atencionRepository;
        this.vacunaRepository = vacunaRepository;
        this.mascotaClient = mascotaClient;
        this.citaClient = citaClient;
    }

    @Transactional
    public AtencionResponse crear(
        AtencionCrearRequest request,
        Long userId,
        String token
    ) {
        MascotaClient.MascotaRemota mascota =
            mascotaClient.verificarParaPersonal(request.mascotaId(), token);

        if (request.citaId() != null) {
            CitaClient.CitaRemota cita = citaClient.obtener(
                request.citaId(),
                token
            );
            if (!request.mascotaId().equals(cita.mascotaId())
                || !mascota.userId().equals(Long.toString(cita.userId()))) {
                throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "La cita no corresponde a la mascota y su propietario"
                );
            }
            if ("CANCELADA".equals(cita.estado())) {
                throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "No se puede asociar una atención a una cita cancelada"
                );
            }
        }

        Atencion atencion = new Atencion();
        atencion.setMascotaId(request.mascotaId());
        atencion.setCitaId(request.citaId());
        atencion.setFechaAtencion(request.fechaAtencion());
        atencion.setMotivo(request.motivo().trim());
        atencion.setDiagnostico(request.diagnostico().trim());
        atencion.setTratamiento(trimNullable(request.tratamiento()));
        atencion.setObservaciones(trimNullable(request.observaciones()));
        atencion.setProfesionalResponsable(
            request.profesionalResponsable().trim()
        );
        atencion.registrar(userId);
        return AtencionResponse.from(atencionRepository.saveAndFlush(atencion));
    }

    @Transactional(readOnly = true)
    public AtencionResponse obtener(
        Long id,
        Long userId,
        boolean cliente,
        String token
    ) {
        Atencion atencion = buscarAtencion(id);
        if (cliente) {
            mascotaClient.verificarPropiedad(
                atencion.getMascotaId(),
                userId,
                token
            );
        }
        return AtencionResponse.from(atencion);
    }

    @Transactional
    public AtencionResponse actualizar(
        Long id,
        AtencionActualizarRequest request,
        Long userId
    ) {
        Atencion atencion = buscarAtencion(id);
        verificarVersion(atencion.getVersion(), request.version());
        atencion.setFechaAtencion(request.fechaAtencion());
        atencion.setMotivo(request.motivo().trim());
        atencion.setDiagnostico(request.diagnostico().trim());
        atencion.setTratamiento(trimNullable(request.tratamiento()));
        atencion.setObservaciones(trimNullable(request.observaciones()));
        atencion.setProfesionalResponsable(
            request.profesionalResponsable().trim()
        );
        atencion.setActualizadoPor(userId);
        return AtencionResponse.from(
            atencionRepository.saveAndFlush(atencion)
        );
    }

    @Transactional
    public AtencionResponse anular(
        Long id,
        AtencionAnulacionRequest request,
        Long userId
    ) {
        Atencion atencion = buscarAtencion(id);
        verificarVersion(atencion.getVersion(), request.version());
        verificarActiva(atencion.getEstado());
        atencion.anular(request.motivo().trim(), userId);
        return AtencionResponse.from(
            atencionRepository.saveAndFlush(atencion)
        );
    }

    @Transactional
    public VacunaResponse crearVacuna(
        VacunaCrearRequest request,
        Long userId,
        String token
    ) {
        mascotaClient.verificarParaPersonal(request.mascotaId(), token);
        validarFechaVacuna(request.fechaAplicacion(), request.proximaDosis());
        verificarAtencionVinculada(request.mascotaId(), request.atencionId());

        Vacuna vacuna = new Vacuna();
        vacuna.setMascotaId(request.mascotaId());
        vacuna.setAtencionId(request.atencionId());
        vacuna.setNombreVacuna(request.nombreVacuna().trim());
        vacuna.setFechaAplicacion(request.fechaAplicacion());
        vacuna.setProfesionalResponsable(
            request.profesionalResponsable().trim()
        );
        vacuna.setLote(trimNullable(request.lote()));
        vacuna.setObservaciones(trimNullable(request.observaciones()));
        vacuna.setProximaDosis(request.proximaDosis());
        vacuna.registrar(userId);
        return VacunaResponse.from(vacunaRepository.saveAndFlush(vacuna));
    }

    @Transactional(readOnly = true)
    public VacunaResponse obtenerVacuna(
        Long id,
        Long userId,
        boolean cliente,
        String token
    ) {
        Vacuna vacuna = buscarVacuna(id);
        if (cliente) {
            mascotaClient.verificarPropiedad(
                vacuna.getMascotaId(),
                userId,
                token
            );
        }
        return VacunaResponse.from(vacuna);
    }

    @Transactional
    public VacunaResponse actualizarVacuna(
        Long id,
        VacunaActualizarRequest request,
        Long userId
    ) {
        Vacuna vacuna = buscarVacuna(id);
        verificarVersion(vacuna.getVersion(), request.version());
        validarFechaVacuna(request.fechaAplicacion(), request.proximaDosis());
        vacuna.setNombreVacuna(request.nombreVacuna().trim());
        vacuna.setFechaAplicacion(request.fechaAplicacion());
        vacuna.setProfesionalResponsable(
            request.profesionalResponsable().trim()
        );
        vacuna.setLote(trimNullable(request.lote()));
        vacuna.setObservaciones(trimNullable(request.observaciones()));
        vacuna.setProximaDosis(request.proximaDosis());
        vacuna.setActualizadoPor(userId);
        return VacunaResponse.from(vacunaRepository.saveAndFlush(vacuna));
    }

    @Transactional
    public VacunaResponse anularVacuna(
        Long id,
        VacunaAnulacionRequest request,
        Long userId
    ) {
        Vacuna vacuna = buscarVacuna(id);
        verificarVersion(vacuna.getVersion(), request.version());
        verificarActiva(vacuna.getEstado());
        vacuna.anular(request.motivo().trim(), userId);
        return VacunaResponse.from(vacunaRepository.saveAndFlush(vacuna));
    }

    @Transactional(readOnly = true)
    public HistorialResponse historial(
        Long mascotaId,
        int limite,
        Long userId,
        boolean cliente,
        String token
    ) {
        if (limite < 1 || limite > LIMITE_MAXIMO_HISTORIAL) {
            throw new ResponseStatusException(
                HttpStatus.BAD_REQUEST,
                "limite debe estar entre 1 y " + LIMITE_MAXIMO_HISTORIAL
            );
        }
        if (cliente) {
            mascotaClient.verificarPropiedad(mascotaId, userId, token);
        } else {
            mascotaClient.verificarParaPersonal(mascotaId, token);
        }

        PageRequest pagina = PageRequest.of(0, limite);
        List<HistorialItem> registros = new ArrayList<>();
        atencionRepository
            .findByMascotaIdOrderByFechaAtencionDescIdDesc(mascotaId, pagina)
            .stream()
            .map(this::historialItem)
            .forEach(registros::add);
        vacunaRepository
            .findByMascotaIdOrderByFechaAplicacionDescIdDesc(mascotaId, pagina)
            .stream()
            .map(this::historialItem)
            .forEach(registros::add);

        List<HistorialItem> ordenados = registros.stream()
            .sorted(Comparator.comparing(HistorialItem::fecha).reversed())
            .limit(limite)
            .toList();
        return new HistorialResponse(mascotaId, limite, ordenados);
    }

    private HistorialItem historialItem(Atencion atencion) {
        return new HistorialItem(
            atencion.getId(),
            "ATENCION",
            atencion.getFechaAtencion(),
            atencion.getEstado(),
            atencion.getMotivo(),
            atencion.getDiagnostico(),
            atencion.getTratamiento(),
            null,
            atencion.getProfesionalResponsable()
        );
    }

    private HistorialItem historialItem(Vacuna vacuna) {
        return new HistorialItem(
            vacuna.getId(),
            "VACUNA",
            vacuna.getFechaAplicacion().atStartOfDay(),
            vacuna.getEstado(),
            null,
            null,
            null,
            vacuna.getNombreVacuna(),
            vacuna.getProfesionalResponsable()
        );
    }

    private void verificarAtencionVinculada(Long mascotaId, Long atencionId) {
        if (atencionId == null) {
            return;
        }
        Atencion atencion = buscarAtencion(atencionId);
        if (!mascotaId.equals(atencion.getMascotaId())) {
            throw new ResponseStatusException(
                HttpStatus.CONFLICT,
                "La atención no corresponde a la mascota"
            );
        }
    }

    private void validarFechaVacuna(
        LocalDate fechaAplicacion,
        LocalDate proximaDosis
    ) {
        if (fechaAplicacion.isAfter(LocalDate.now(ZONA_CLINICA))) {
            throw new ResponseStatusException(
                HttpStatus.BAD_REQUEST,
                "La fecha de aplicación no puede estar en el futuro"
            );
        }
        if (proximaDosis != null && !proximaDosis.isAfter(fechaAplicacion)) {
            throw new ResponseStatusException(
                HttpStatus.BAD_REQUEST,
                "La próxima dosis debe ser posterior a la aplicación"
            );
        }
    }

    private Atencion buscarAtencion(Long id) {
        return atencionRepository.findById(id)
            .orElseThrow(() -> new ResponseStatusException(
                HttpStatus.NOT_FOUND,
                "Atención no encontrada"
            ));
    }

    private Vacuna buscarVacuna(Long id) {
        return vacunaRepository.findById(id)
            .orElseThrow(() -> new ResponseStatusException(
                HttpStatus.NOT_FOUND,
                "Vacuna no encontrada"
            ));
    }

    private void verificarVersion(Long versionActual, Long versionRecibida) {
        if (versionActual == null || !versionActual.equals(versionRecibida)) {
            throw new ResponseStatusException(
                HttpStatus.CONFLICT,
                "El registro fue modificado; vuelve a consultarlo"
            );
        }
    }

    private void verificarActiva(EstadoRegistro estado) {
        if (estado == EstadoRegistro.ANULADA) {
            throw new ResponseStatusException(
                HttpStatus.CONFLICT,
                "El registro ya está anulado"
            );
        }
    }

    private String trimNullable(String value) {
        return value == null ? null : value.trim();
    }
}
