package com.idoso.uber;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;

@SpringBootApplication
@EntityScan("com.idoso.uber.domain.model")
@EnableJpaRepositories("com.idoso.uber.infrastructure.repository")
public class UberIdosoApplication {

    public static void main(String[] args) {
        SpringApplication.run(UberIdosoApplication.class, args);
    }
}
