package cl.gatyperry.pacientes.mascotas.service;

import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import cl.gatyperry.pacientes.mascotas.dto.MascotaRequest;
import cl.gatyperry.pacientes.mascotas.dto.MascotaResponse;
import cl.gatyperry.pacientes.mascotas.model.Mascota;
import cl.gatyperry.pacientes.mascotas.repository.MascotaRepository;

@Service
public class MascotaService {

    private final MascotaRepository repository;

    public MascotaService(MascotaRepository repository) {
        this.repository = repository;
    }

    @Transactional(readOnly = true)
    public List<MascotaResponse> listar(String userId) {
        validarUserId(userId);

        return repository.findAllByUserIdOrderByNombreAsc(userId).stream()
            .map(MascotaResponse::from)
            .toList();
    }

    @Transactional(readOnly = true)
    public MascotaResponse obtener(Long id, String userId) {
        return MascotaResponse.from(buscarMascota(id, userId));
    }

    @Transactional
    public MascotaResponse crear(String userId, MascotaRequest request) {
        validarUserId(userId);

        Mascota mascota = new Mascota();
        mascota.setUserId(userId);
        aplicarDatos(mascota, request);

        // La base de datos genera el ID al guardar.
        return MascotaResponse.from(repository.save(mascota));
    }

    @Transactional
    public MascotaResponse actualizar(Long id, String userId, MascotaRequest request) {
        Mascota mascota = buscarMascota(id, userId);
        aplicarDatos(mascota, request);

        return MascotaResponse.from(repository.save(mascota));
    }

    @Transactional
    public void eliminar(Long id, String userId) {
        Mascota mascota = buscarMascota(id, userId);
        repository.delete(mascota);
    }

    private Mascota buscarMascota(Long id, String userId) {
        validarUserId(userId);

        return repository.findByIdAndUserId(id, userId)
            .orElseThrow(() -> new ResponseStatusException(
                HttpStatus.NOT_FOUND,
                "Mascota no encontrada"
            ));
    }

    private void validarUserId(String userId) {
        if (userId == null || userId.isBlank()) {
            throw new ResponseStatusException(
                HttpStatus.BAD_REQUEST,
                "userId es obligatorio"
            );
        }
    }

    private void aplicarDatos(Mascota mascota, MascotaRequest request) {
        mascota.setNombre(request.nombre().trim());
        mascota.setEspecie(request.especie().trim());
        mascota.setRaza(request.raza().trim());
        mascota.setEdad(request.edad());
        mascota.setSexo(request.sexo() == null ? null : request.sexo().trim());
        mascota.setNotas(request.notas() == null ? null : request.notas().trim());
    }
}
