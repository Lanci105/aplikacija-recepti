package backend;

import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

// Pretvori napake validacije vhodnih polj v kratko sporočilo, ki ga frontend prikaže.
@RestControllerAdvice
public class AuthNapakaHandler {

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, String>> neveljavenVnos(MethodArgumentNotValidException napaka) {
        // Vrne prvo uporabniku razumljivo napako validacije.
        String sporocilo = napaka.getBindingResult().getFieldErrors().stream()
                .findFirst()
                .map(fieldError -> fieldError.getDefaultMessage())
                .orElse("Preveri vnesene podatke.");
        return ResponseEntity.badRequest().body(Map.of("sporocilo", sporocilo));
    }
}
