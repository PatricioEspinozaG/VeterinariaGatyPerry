package cl.gatyperry.auth.usuarios.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "SESIONES_REFRESH")
public class SesionRefresh {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ID")
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "USUARIO_ID", nullable = false)
    private Usuario usuario;

    @Column(name = "FAMILIA_ID", nullable = false)
    private UUID familiaId;

    @Column(name = "TOKEN_HASH", nullable = false, length = 64)
    private String tokenHash;

    @Column(name = "CREADO_EN", nullable = false)
    private Instant creadoEn;

    @Column(name = "EXPIRA_EN", nullable = false)
    private Instant expiraEn;

    @Column(name = "USADO_EN")
    private Instant usadoEn;

    @Column(name = "REVOCADO_EN")
    private Instant revocadoEn;

    protected SesionRefresh() {
        // Requerido por JPA.
    }

    public SesionRefresh(
        Usuario usuario,
        UUID familiaId,
        String tokenHash,
        Instant creadoEn,
        Instant expiraEn
    ) {
        this.usuario = usuario;
        this.familiaId = familiaId;
        this.tokenHash = tokenHash;
        this.creadoEn = creadoEn;
        this.expiraEn = expiraEn;
    }

    public Long getId() {
        return id;
    }

    public Usuario getUsuario() {
        return usuario;
    }

    public UUID getFamiliaId() {
        return familiaId;
    }

    public String getTokenHash() {
        return tokenHash;
    }

    public Instant getCreadoEn() {
        return creadoEn;
    }

    public Instant getExpiraEn() {
        return expiraEn;
    }

    public Instant getUsadoEn() {
        return usadoEn;
    }

    public Instant getRevocadoEn() {
        return revocadoEn;
    }

    public void marcarUsado(Instant instante) {
        this.usadoEn = instante;
    }

    public void revocar(Instant instante) {
        this.revocadoEn = instante;
    }
}