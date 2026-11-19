package backend;

import java.nio.charset.StandardCharsets;
import java.util.Locale;
import java.util.Map;

import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

// REST API za registracijo, prijavo, preverjanje seje in odjavo uporabnika.
@Validated
@Tag(name = "Uporabniški račun", description = "Registracija, prijava, preverjanje prijave in odjava")
@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private static final String SESSION_USER_ID = "uporabnikId";
    private final UporabnikRepository uporabnikRepository;
    private final PasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    public AuthController(UporabnikRepository uporabnikRepository) {
        this.uporabnikRepository = uporabnikRepository;
    }

    @Operation(summary = "Registriraj uporabnika", description = "Ustvari račun. Geslo se shrani kot zgoščena vrednost.")
    @PostMapping("/registracija")
    public ResponseEntity<?> registracija(@Valid @RequestBody RegistracijaZahteva zahteva) {
        // E-pošto poenoti, preveri podvojitve in varno zgosti geslo pred shranjevanjem.
        String email = normalizirajEmail(zahteva.email());
        if (!zahteva.geslo().equals(zahteva.potrditevGesla())) {
            return ResponseEntity.badRequest().body(Map.of("sporocilo", "Vneseni gesli se ne ujemata."));
        }
        if (zahteva.geslo().getBytes(StandardCharsets.UTF_8).length > 72) {
            return ResponseEntity.badRequest().body(Map.of("sporocilo", "Geslo je predolgo. Uporabi največ 72 bajtov."));
        }
        if (uporabnikRepository.existsByEmail(email)) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(Map.of("sporocilo", "S tem e-poštnim naslovom račun že obstaja."));
        }

        Uporabnik novUporabnik = new Uporabnik(
                zahteva.ime().trim(), email, passwordEncoder.encode(zahteva.geslo()));
        try {
            return ResponseEntity.status(HttpStatus.CREATED).body(javniPodatki(uporabnikRepository.save(novUporabnik)));
        } catch (DataIntegrityViolationException napaka) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(Map.of("sporocilo", "S tem e-poštnim naslovom račun že obstaja."));
        }
    }

    @Operation(summary = "Prijavi uporabnika", description = "Preveri podatke in ustvari prijavljeno sejo.")
    @PostMapping("/prijava")
    public ResponseEntity<?> prijava(
            @Valid @RequestBody PrijavaZahteva zahteva,
            HttpServletRequest zahtevaHttp) {
        // Ob uspešni prijavi v sejo shrani samo ID uporabnika, ne gesla.
        String email = normalizirajEmail(zahteva.email());
        Uporabnik uporabnik = uporabnikRepository.findByEmail(email).orElse(null);
        if (uporabnik == null || !passwordEncoder.matches(zahteva.geslo(), uporabnik.getGesloHash())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("sporocilo", "E-poštni naslov ali geslo nista pravilna."));
        }

        HttpSession seja = zahtevaHttp.getSession(true);
        zahtevaHttp.changeSessionId();
        seja.setMaxInactiveInterval(8 * 60 * 60);
        seja.setAttribute(SESSION_USER_ID, uporabnik.getId());
        return ResponseEntity.ok(javniPodatki(uporabnik));
    }

    @Operation(summary = "Preveri prijavljenega uporabnika")
    @GetMapping("/jaz")
    public ResponseEntity<?> prijavljeniUporabnik(HttpServletRequest zahtevaHttp) {
        // Frontend ob odprtju strani pokliče ta endpoint, da obnovi stanje prijave.
        HttpSession seja = zahtevaHttp.getSession(false);
        if (seja == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("sporocilo", "Uporabnik ni prijavljen."));
        }
        Object id = seja.getAttribute(SESSION_USER_ID);
        if (!(id instanceof Long uporabnikId)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("sporocilo", "Uporabnik ni prijavljen."));
        }
        return uporabnikRepository.findById(uporabnikId)
                .<ResponseEntity<?>>map(uporabnik -> ResponseEntity.ok(javniPodatki(uporabnik)))
                .orElseGet(() -> ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(Map.of("sporocilo", "Uporabnik ni prijavljen.")));
    }

    @Operation(summary = "Posodobi profil prijavljenega uporabnika")
    @PutMapping("/jaz")
    public ResponseEntity<?> posodobiProfil(@Valid @RequestBody PosodobitevProfilaZahteva zahteva, HttpServletRequest zahtevaHttp) {
        HttpSession seja = zahtevaHttp.getSession(false);
        if (seja == null || !(seja.getAttribute(SESSION_USER_ID) instanceof Long uporabnikId)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("sporocilo", "Za urejanje profila se prijavi."));
        }
        Uporabnik uporabnik = uporabnikRepository.findById(uporabnikId).orElse(null);
        if (uporabnik == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("sporocilo", "Uporabnik ni prijavljen."));

        String email = normalizirajEmail(zahteva.email());
        if (uporabnikRepository.existsByEmailAndIdNot(email, uporabnikId)) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(Map.of("sporocilo", "Ta e-poštni naslov že uporablja drug račun."));
        }
        boolean spreminjaGeslo = zahteva.novoGeslo() != null && !zahteva.novoGeslo().isBlank();
        if (spreminjaGeslo && (zahteva.novoGeslo().length() < 8 || zahteva.novoGeslo().length() > 64)) {
            return ResponseEntity.badRequest().body(Map.of("sporocilo", "Novo geslo mora imeti od 8 do 64 znakov."));
        }
        if (spreminjaGeslo && (zahteva.trenutnoGeslo() == null || !passwordEncoder.matches(zahteva.trenutnoGeslo(), uporabnik.getGesloHash()))) {
            return ResponseEntity.badRequest().body(Map.of("sporocilo", "Za spremembo gesla vnesi pravilno trenutno geslo."));
        }
        uporabnik.setIme(zahteva.ime().trim());
        uporabnik.setEmail(email);
        if (spreminjaGeslo) {
            if (zahteva.novoGeslo().getBytes(StandardCharsets.UTF_8).length > 72) {
                return ResponseEntity.badRequest().body(Map.of("sporocilo", "Geslo je predolgo. Uporabi največ 72 bajtov."));
            }
            uporabnik.setGesloHash(passwordEncoder.encode(zahteva.novoGeslo()));
        }
        try {
            return ResponseEntity.ok(javniPodatki(uporabnikRepository.save(uporabnik)));
        } catch (DataIntegrityViolationException napaka) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(Map.of("sporocilo", "Ta e-poštni naslov že uporablja drug račun."));
        }
    }

    @Operation(summary = "Odjavi uporabnika", description = "Zaključi trenutno uporabniško sejo.")
    @PostMapping("/odjava")
    public ResponseEntity<Void> odjava(HttpServletRequest zahtevaHttp) {
        // Prekliče strežniško sejo, če ta obstaja.
        HttpSession seja = zahtevaHttp.getSession(false);
        if (seja != null) {
            seja.invalidate();
        }
        return ResponseEntity.noContent().build();
    }

    private String normalizirajEmail(String email) {
        return email.trim().toLowerCase(Locale.ROOT);
    }

    private JavniUporabnik javniPodatki(Uporabnik uporabnik) {
        return new JavniUporabnik(uporabnik.getId(), uporabnik.getIme(), uporabnik.getEmail());
    }

    // Zahtevana polja in validacijska pravila registracijskega obrazca.
    public record RegistracijaZahteva(
            @NotBlank(message = "Vnesi ime.") @Size(max = 80, message = "Ime je lahko dolgo največ 80 znakov.") String ime,
            @NotBlank(message = "Vnesi e-poštni naslov.") @Email(message = "Vnesi veljaven e-poštni naslov.") @Size(max = 254, message = "E-poštni naslov je predolg.") String email,
            @NotBlank(message = "Vnesi geslo.") @Size(min = 8, max = 64, message = "Geslo mora imeti od 8 do 64 znakov.") String geslo,
            @NotBlank(message = "Ponovno vnesi geslo.") String potrditevGesla) {
    }

    // Vhodna polja prijavnega obrazca.
    public record PrijavaZahteva(
            @NotBlank(message = "Vnesi e-poštni naslov.") @Email(message = "Vnesi veljaven e-poštni naslov.") String email,
            @NotBlank(message = "Vnesi geslo.") String geslo) {
    }

    public record PosodobitevProfilaZahteva(
            @NotBlank(message = "Vnesi ime.") @Size(max = 80, message = "Ime je lahko dolgo največ 80 znakov.") String ime,
            @NotBlank(message = "Vnesi e-poštni naslov.") @Email(message = "Vnesi veljaven e-poštni naslov.") @Size(max = 254, message = "E-poštni naslov je predolg.") String email,
            String trenutnoGeslo,
            @Size(max = 64, message = "Novo geslo je predolgo.") String novoGeslo) {
    }

    // Javni odgovor API-ja; namenoma ne vsebuje zgoščenega gesla.
    public record JavniUporabnik(Long id, String ime, String email) {
    }
}
