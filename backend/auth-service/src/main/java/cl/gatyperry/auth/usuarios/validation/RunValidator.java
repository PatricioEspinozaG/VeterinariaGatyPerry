package cl.gatyperry.auth.usuarios.validation;

import java.util.Locale;

public final class RunValidator {

    private RunValidator() {
    }

    public static String normalizar(String run) {
        return run.trim()
            .toUpperCase(Locale.ROOT)
            .replaceAll("[.\\s-]", "");
    }

    public static boolean esValido(String run) {
        if (run == null || !run.matches("\\d{7,8}[0-9K]")) {
            return false;
        }

        int suma = 0;
        int factor = 2;
        for (int i = run.length() - 2; i >= 0; i--) {
            suma += Character.digit(run.charAt(i), 10) * factor;
            factor = factor == 7 ? 2 : factor + 1;
        }

        int resultado = 11 - (suma % 11);
        char digitoEsperado = resultado == 11
            ? '0'
            : resultado == 10 ? 'K' : Character.forDigit(resultado, 10);
        return run.charAt(run.length() - 1) == digitoEsperado;
    }
}
