package com.idoso.uber.application.util;

/**
 * Verifica se um valor é válido (não null, não string vazia, não Integer 0).
 * Utilize em todas as verificações de null do projeto.
 */
public final class VerificarNull {

    private VerificarNull() {
    }

    /**
     * Retorna o próprio valor se passar nas validações (não null, não string vazia, não Integer 0);
     * retorna null caso contrário. Permite uso dentro de if: if (VerificarNull.verificarNull(x) != null) { ... }
     */
    @SuppressWarnings("unchecked")
    public static <T> T verificarNull(Object valor) {
        if (valor == null || valor instanceof String s && s.isEmpty() || valor instanceof Integer i && i == 0)
            throw new IllegalArgumentException("Valor não pode ser null, string vazia ou Integer 0");
        return (T) valor;
    }
}
