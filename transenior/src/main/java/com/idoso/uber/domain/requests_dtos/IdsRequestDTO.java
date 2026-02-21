package com.idoso.uber.domain.requests_dtos;

import java.util.List;

public class IdsRequestDTO {
    private List<Long> ids;

    public List<Long> getIds() {
        return ids;
    }

    public void setIds(List<Long> ids) {
        this.ids = ids;
    }
}
