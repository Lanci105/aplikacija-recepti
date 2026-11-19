package backend;

import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

@RestController
@RequestMapping("/api/recepti/{receptId}/komentarji")
public class KomentarController {

    private static final String SESSION_USER_ID = "uporabnikId";
    private final KomentarRepository komentarRepository;
    private final ReceptRepository receptRepository;
    private final UporabnikRepository uporabnikRepository;

    public KomentarController(KomentarRepository komentarRepository, ReceptRepository receptRepository, UporabnikRepository uporabnikRepository) {
        this.komentarRepository = komentarRepository;
        this.receptRepository = receptRepository;
        this.uporabnikRepository = uporabnikRepository;
    }

    @GetMapping
    public ResponseEntity<List<Komentar>> komentarji(@PathVariable Long receptId) {
        if (!receptRepository.existsById(receptId)) return ResponseEntity.notFound().build();
        return ResponseEntity.ok(komentarRepository.findByRecept_IdOrderByUstvarjenoDesc(receptId));
    }

    @PostMapping
    @Transactional
    public ResponseEntity<?> dodaj(@PathVariable Long receptId, @Valid @RequestBody NovKomentar zahteva, HttpServletRequest httpZahteva) {
        Uporabnik avtor = prijavljeniUporabnik(httpZahteva);
        if (avtor == null) return neprijavljen();
        Recept recept = receptRepository.findById(receptId).orElse(null);
        if (recept == null) return ResponseEntity.notFound().build();
        Komentar komentar = komentarRepository.save(new Komentar(recept, avtor, zahteva.vsebina().trim(), zahteva.ocena()));
        return ResponseEntity.status(HttpStatus.CREATED).body(komentar);
    }

    @DeleteMapping("/{komentarId}")
    @Transactional
    public ResponseEntity<?> izbrisi(@PathVariable Long receptId, @PathVariable Long komentarId, HttpServletRequest httpZahteva) {
        Uporabnik uporabnik = prijavljeniUporabnik(httpZahteva);
        if (uporabnik == null) return neprijavljen();
        Komentar komentar = komentarRepository.findByIdAndRecept_Id(komentarId, receptId).orElse(null);
        if (komentar == null) return ResponseEntity.notFound().build();
        boolean avtorKomentarja = komentar.getAvtor().getId().equals(uporabnik.getId());
        boolean avtorRecepta = komentar.getRecept().getAvtor() != null && komentar.getRecept().getAvtor().getId().equals(uporabnik.getId());
        if (!avtorKomentarja && !avtorRecepta) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("sporocilo", "Izbrišeš lahko samo svoj komentar ali komentar na svojem receptu."));
        }
        komentarRepository.delete(komentar);
        return ResponseEntity.noContent().build();
    }

    private Uporabnik prijavljeniUporabnik(HttpServletRequest zahteva) {
        HttpSession seja = zahteva.getSession(false);
        if (seja == null || !(seja.getAttribute(SESSION_USER_ID) instanceof Long uporabnikId)) return null;
        return uporabnikRepository.findById(uporabnikId).orElse(null);
    }

    private ResponseEntity<?> neprijavljen() {
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("sporocilo", "Za dodajanje komentarja se prijavi."));
    }

    public record NovKomentar(
            @NotBlank(message = "Komentar ne sme biti prazen.") @Size(max = 1500, message = "Komentar je lahko dolg največ 1500 znakov.") String vsebina,
            @Min(value = 1, message = "Ocena mora biti vsaj 1.") @Max(value = 5, message = "Ocena je lahko največ 5.") int ocena) { }
}
