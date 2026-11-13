package cl.gatyperry.clinica.controller;

import cl.gatyperry.clinica.service.DependenciaRemotaException;
import org.springframework.dao.OptimisticLockingFailureException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ProblemDetail;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class ApiExceptionHandler {

    @ExceptionHandler(OptimisticLockingFailureException.class)
    ProblemDetail manejarConflictoDeVersion(
        OptimisticLockingFailureException exception
    ) {
        return ProblemDetail.forStatusAndDetail(
            HttpStatus.CONFLICT,
            "El registro fue modificado por otra solicitud; vuelve a consultarlo"
        );
    }

    @ExceptionHandler(DependenciaRemotaException.class)
    ProblemDetail manejarDependenciaRemota(
        DependenciaRemotaException exception
    ) {
        return ProblemDetail.forStatusAndDetail(
            HttpStatus.SERVICE_UNAVAILABLE,
            exception.getMessage()
        );
    }
}
