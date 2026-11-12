package cl.gatyperry.auth.usuarios.service;

import cl.gatyperry.auth.usuarios.dto.ClienteParaCitaResponse;
import cl.gatyperry.auth.usuarios.model.Rol;
import cl.gatyperry.auth.usuarios.repository.UsuarioRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
public class ClienteConsultaService {

    private final UsuarioRepository repository;

    public ClienteConsultaService(UsuarioRepository repository) {
        this.repository = repository;
    }

    @Transactional(readOnly = true)
    public ClienteParaCitaResponse obtenerClienteActivo(Long id) {
        var usuario = repository.findById(id)
            .orElseThrow(() -> new ResponseStatusException(
                HttpStatus.NOT_FOUND,
                "Cliente no encontrado"
            ));

        if (!usuario.isActivo() || usuario.getRol() != Rol.CLIENTE) {
            throw new ResponseStatusException(
                HttpStatus.NOT_FOUND,
                "Cliente no encontrado"
            );
        }

        return ClienteParaCitaResponse.from(usuario);
    }
}