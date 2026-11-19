package backend;

import java.util.Map;
import java.util.Optional;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;

@RestController
@RequestMapping("/api/auth/priljubljeni")
public class PriljubljeniController {

    private static final String SESSION_USER_ID = "uporabnikId";
    private final UporabnikRepository uporabnikRepository;
    private final ReceptRepository receptRepository;

    public PriljubljeniController(UporabnikRepository uporabnikRepository, ReceptRepository receptRepository) {
        this.uporabnikRepository = uporabnikRepository;
        this.receptRepository = receptRepository;
    }

    @GetMapping
    @Transactional(readOnly = true)
    public ResponseEntity<?> pridobiPriljubljene(HttpServletRequest zahteva) {
        Optional<Uporabnik> uporabnik = prijavljeniUporabnik(zahteva);
        if (uporabnik.isEmpty()) return neprijavljen();
        return ResponseEntity.ok(uporabnik.get().getPriljubljeniRecepti());
    }

    @PutMapping("/{receptId}")
    @Transactional
    public ResponseEntity<?> dodajMedPriljubljene(@PathVariable Long receptId, HttpServletRequest zahteva) {
        Optional<Uporabnik> uporabnik = prijavljeniUporabnik(zahteva);
        if (uporabnik.isEmpty()) return neprijavljen();
        Optional<Recept> recept = receptRepository.findById(receptId);
        if (recept.isEmpty()) return ResponseEntity.notFound().build();
        Uporabnik racun = uporabnik.get();
        racun.getPriljubljeniRecepti().add(recept.get());
        uporabnikRepository.save(racun);
        return ResponseEntity.ok(recept.get());
    }

    @DeleteMapping("/{receptId}")
    @Transactional
    public ResponseEntity<?> odstraniIzPriljubljenih(@PathVariable Long receptId, HttpServletRequest zahteva) {
        Optional<Uporabnik> uporabnik = prijavljeniUporabnik(zahteva);
        if (uporabnik.isEmpty()) return neprijavljen();
        Uporabnik racun = uporabnik.get();
        racun.getPriljubljeniRecepti().removeIf(recept -> recept.getId().equals(receptId));
        uporabnikRepository.save(racun);
        return ResponseEntity.noContent().build();
    }

    private Optional<Uporabnik> prijavljeniUporabnik(HttpServletRequest zahteva) {
        HttpSession seja = zahteva.getSession(false);
        if (seja == null || !(seja.getAttribute(SESSION_USER_ID) instanceof Long uporabnikId)) return Optional.empty();
        return uporabnikRepository.findById(uporabnikId);
    }

    private ResponseEntity<?> neprijavljen() {
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("sporocilo", "Za ogled priljubljenih se prijavi."));
    }
}
