package cl.gatyperry.clinica.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import jakarta.persistence.Version;
import java.time.Instant;
import java.time.LocalDateTime;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "atenciones")
@Getter
@Setter
@NoArgsConstructor
public class Atencion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    @Setter(AccessLevel.NONE)
    private Long id;

    @Column(name = "mascota_id", nullable = false)
    private Long mascotaId;

    @Column(name = "cita_id")
    private Long citaId;

    @Column(name = "fecha_atencion", nullable = false)
    private LocalDateTime fechaAtencion;

    @Column(name = "motivo", nullable = false, length = 200)
    private String motivo;

    @Column(name = "diagnostico", nullable = false, length = 2000)
    private String diagnostico;

    @Column(name = "tratamiento", length = 2000)
    private String tratamiento;

    @Column(name = "observaciones", length = 4000)
    private String observaciones;

    @Column(name = "profesional_responsable", nullable = false, length = 120)
    private String profesionalResponsable;

    @Column(name = "registrado_por", nullable = false)
    @Setter(AccessLevel.NONE)
    private Long registradoPor;

    @Column(name = "actualizado_por", nullable = false)
    private Long actualizadoPor;

    @Column(name = "creado_en", nullable = false, updatable = false)
    private Instant creadoEn;

    @Column(name = "actualizado_en", nullable = false)
    private Instant actualizadoEn;

    @Enumerated(EnumType.STRING)
    @Column(name = "estado", nullable = false, length = 20)
    private EstadoRegistro estado = EstadoRegistro.ACTIVA;

    @Column(name = "motivo_anulacion", length = 500)
    private String motivoAnulacion;

    @Version
    @Column(name = "version", nullable = false)
    @Setter(AccessLevel.NONE)
    private Long version;

    public void registrar(Long userId) {
        registradoPor = userId;
        actualizadoPor = userId;
    }

    public void anular(String motivo, Long userId) {
        estado = EstadoRegistro.ANULADA;
        motivoAnulacion = motivo;
        actualizadoPor = userId;
    }

    @PrePersist
    void alCrear() {
        Instant ahora = Instant.now();
        creadoEn = ahora;
        actualizadoEn = ahora;
    }

    @PreUpdate
    void alActualizar() {
        actualizadoEn = Instant.now();
    }
}
