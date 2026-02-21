package com.idoso.uber.domain.model;

public class Enuns {

    private StatusCorrida statusCorrida;

    public static final String CADASTRO = "CADASTRO";
    public static final String ATUALIZACAO = "ATUALIZACAO";
    public static final String EXCLUSAO = "EXCLUSAO";
    public static final String TROCA_STATUS = "TROCA_STATUS";

    public static final String MOTORISTA = "MOTORISTA";
    public static final String IDOSO = "IDOSO";
    public static final String CORRIDA = "CORRIDA";
    public static final String RELACIONAMENTO = "RELACIONAMENTO";
    public static final String ENDERECO = "ENDERECO";

    public enum StatusCorrida {
        SOLICITADA, ACEITA, EM_ANDAMENTO, FINALIZADA, CANCELADA
    }

    public enum TipoAcao {
        CADASTRO, ATUALIZACAO, EXCLUSAO, TROCA_STATUS, PAUSAR, RETOMAR
    }

    public enum EntidadeAfetada {
        MOTORISTA, IDOSO, CORRIDA, RELACIONAMENTO, ENDERECO
    }

    public StatusCorrida getEnumStatusCorrida() {
        return statusCorrida;
    }

    public void setEnumStatusCorrida(StatusCorrida statusCorrida) {
        this.statusCorrida = statusCorrida;
    }

    public static String getTipoAcao(String tipoAcao) {
        switch (tipoAcao) {
            case CADASTRO:
                return "CADASTRO";
            case ATUALIZACAO:
                return "ATUALIZACAO";
            case EXCLUSAO:
                return "EXCLUSAO";
            case TROCA_STATUS:
                return "TROCA_STATUS";
            case "PAUSAR":
                return "PAUSAR";
            case "RETOMAR":
                return "RETOMAR";
            default:
                return null;
        }
    }

    public static String getEntidadeAfetada(String entidadeAfetada) {
        switch (entidadeAfetada) {
            case MOTORISTA:
                return "MOTORISTA";
            case IDOSO:
                return "IDOSO";
            case CORRIDA:
                return "CORRIDA";
            case RELACIONAMENTO:
                return "RELACIONAMENTO";
            case ENDERECO:
                return "ENDERECO";
            default:
                return null;
        }
    }

}
