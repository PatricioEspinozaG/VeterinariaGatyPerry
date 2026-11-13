package cl.gatyperry.clinica.service;

public class DependenciaRemotaException extends RuntimeException {

    public DependenciaRemotaException(String mensaje, Throwable causa) {
        super(mensaje, causa);
    }

    public DependenciaRemotaException(String mensaje) {
        super(mensaje);
    }
}
