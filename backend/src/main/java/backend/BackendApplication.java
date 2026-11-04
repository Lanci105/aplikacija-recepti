package backend;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication //glavni razrred appa
public class BackendApplication {

	public static void main(String[] args) {
		SpringApplication.run(BackendApplication.class, args); //zažene spring boot, prvo pove razred za konfiguracijo, args da argumente za zagon
	}

}
