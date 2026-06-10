package com.brainfreezed.profitlense;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableAsync;

@SpringBootApplication
@EnableAsync
public class ProfitlenseApplication {

	public static void main(String[] args) {
		SpringApplication.run(ProfitlenseApplication.class, args);
	}

}
