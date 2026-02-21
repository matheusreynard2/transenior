package com.idoso.uber.application.exception;

public class RelacionamentoJaExistenteException extends RuntimeException {

    public RelacionamentoJaExistenteException() {
        super("Já existe o relacionamento entre este motorista e este idoso.");
    }

    public RelacionamentoJaExistenteException(String message) {
        super(message);
    }
}
