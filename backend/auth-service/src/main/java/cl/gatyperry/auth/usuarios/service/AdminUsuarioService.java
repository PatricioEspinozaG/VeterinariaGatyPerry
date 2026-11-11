package cl.gatyperry.auth.usuarios.service;

import cl.gatyperry.auth.usuarios.dto.AdminUsuarioUpdateRequest;
import cl.gatyperry.auth.usuarios.dto.UsuarioResponse;
import cl.gatyperry.auth.usuarios.model.Rol;
import cl.gatyperry.auth.usuarios.model.Usuario;
import cl.gatyperry.auth.usuarios.repository.UsuarioRepository;
import java.util.Locale;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
public class AdminUsuarioService {

    private final UsuarioRepository repository;

    public AdminUsuarioService(UsuarioRepository repository) {
        this.repository = repository;
    }

    @Transactional(readOnly = true)
    public Page<UsuarioResponse> listar(Long adminId, int pagina, int tamano) {
        verificarAdmin(adminId);

        if (pagina < 0 || tamano < 1 || tamano > 100) {
            throw new ResponseStatusException(
                HttpStatus.BAD_REQUEST, "Paginación inválida"
            );
        }

        return repository.findAll(
            PageRequest.of(pagina, tamano, Sort.by("id").ascending())
        ).map(UsuarioResponse::from);
    }

    @Transactional(readOnly = true)
    public UsuarioResponse obtener(Long adminId, Long id) {
        verificarAdmin(adminId);
        return UsuarioResponse.from(buscar(id));
    }

    @Transactional
    public UsuarioResponse actualizar(
        Long adminId,
        Long id,
        AdminUsuarioUpdateRequest request
    ) {
        verificarAdmin(adminId);
        Usuario usuario = buscar(id);

        if (id.equals(adminId)
            && (!request.activo() || request.rol() != Rol.ADMIN)) {
            throw new ResponseStatusException(
                HttpStatus.CONFLICT,
                "No puedes desactivar ni quitar el rol de tu propia cuenta"
            );
        }

        String email = request.email().trim().toLowerCase(Locale.ROOT);
        repository.findByEmailIgnoreCase(email)
            .filter(existente -> !existente.getId().equals(id))
            .ifPresent(existente -> {
                throw new ResponseStatusException(
                    HttpStatus.CONFLICT, "El correo ya está registrado"
                );
            });

        usuario.setNombre(request.nombre().trim());
        usuario.setApellidos(request.apellidos().trim());
        usuario.setEmail(email);
        usuario.setTelefono(request.telefono().trim());
        usuario.setRegion(request.region().trim());
        usuario.setComuna(request.comuna().trim());
        usuario.setDireccion(
            request.direccion() == null
                ? null : request.direccion().trim()
        );
        usuario.setRol(request.rol());
        usuario.setActivo(request.activo());

        return UsuarioResponse.from(repository.save(usuario));
    }

    @Transactional
    public void desactivar(Long adminId, Long id) {
        verificarAdmin(adminId);

        if (id.equals(adminId)) {
            throw new ResponseStatusException(
                HttpStatus.CONFLICT,
                "No puedes desactivar tu propia cuenta"
            );
        }

        Usuario usuario = buscar(id);
        usuario.setActivo(false);
        repository.save(usuario);
    }

    private void verificarAdmin(Long adminId) {
        Usuario admin = repository.findById(adminId)
            .orElseThrow(() -> new ResponseStatusException(
                HttpStatus.FORBIDDEN, "Acceso denegado"
            ));

        if (!admin.isActivo() || admin.getRol() != Rol.ADMIN) {
            throw new ResponseStatusException(
                HttpStatus.FORBIDDEN, "Acceso denegado"
            );
        }
    }

    private Usuario buscar(Long id) {
        return repository.findById(id)
            .orElseThrow(() -> new ResponseStatusException(
                HttpStatus.NOT_FOUND, "Usuario no encontrado"
            ));
    }
}