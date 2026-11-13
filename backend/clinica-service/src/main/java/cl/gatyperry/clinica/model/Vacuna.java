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
import java.time.LocalDate;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "vacunas")
@Getter
@Setter
@NoArgsConstructor
public class Vacuna {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    @Setter(AccessLevel.NONE)
    private Long id;

    @Column(name = "mascota_id", nullable = false)
    private Long mascotaId;

    @Column(name = "atencion_id")
    private Long atencionId;

    @Column(name = "nombre_vacuna", nullable = false, length = 160)
    private String nombreVacuna;

    @Column(name = "fecha_aplicacion", nullable = false)
    private LocalDate fechaAplicacion;

    @Column(name = "profesional_responsable", nullable = false, length = 120)
    private String profesionalResponsable;

    @Column(name = "lote", length = 120)
    private String lote;

    @Column(name = "observaciones", length = 2000)
    private String observaciones;

    @Column(name = "proxima_dosis")
    private LocalDate proximaDosis;

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
