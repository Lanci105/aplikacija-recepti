package backend;

import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.transaction.annotation.Transactional;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;

@Tag(name = "Recepti", description = "Dodajanje, prikaz, urejanje in brisanje receptov")
@RestController 
@RequestMapping("/api/recepti") //kje je metoda dosegljiva
public class ReceptController {

    private final ReceptRepository receptRepository; //polje final za to da je vedno isti repozitorij
    private final UporabnikRepository uporabnikRepository;
    private final KomentarRepository komentarRepository;

    public ReceptController(ReceptRepository receptRepository, UporabnikRepository uporabnikRepository, KomentarRepository komentarRepository) {
        this.receptRepository = receptRepository;
        this.uporabnikRepository = uporabnikRepository;
        this.komentarRepository = komentarRepository;
    }

    //pridobi recepte
    @Operation(summary = "Pridobi vse recepte", description = "Vrne vse recepte iz podatkovne baze.")
    @GetMapping
    public List<Recept> pridobiVse() {
        return receptRepository.findAll();
    }

    //pridobi en recept po id
    @Operation(summary = "Pridobi recept po ID-ju", description = "Vrne en recept ali odgovor 404, če recept ne obstaja.")
    @GetMapping("/{id}")
    public ResponseEntity<Recept> pridobiEnega(@PathVariable Long id) {
        Optional<Recept> recept = receptRepository.findById(id);
        return recept.map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    //nov recept
    @Operation(summary = "Dodaj recept", description = "Shrani nov recept v podatkovno bazo.")
    @PostMapping
    @Transactional
    public ResponseEntity<?> dodaj(@Valid @RequestBody Recept recept, HttpServletRequest zahteva) {
        Uporabnik avtor = prijavljeniUporabnik(zahteva);
        if (avtor == null) return neprijavljen();
        recept.setAvtor(avtor);
        Recept shranjenRecept = receptRepository.save(recept);
        return ResponseEntity.status(HttpStatus.CREATED).body(shranjenRecept);
    }

    //posodobi obstoječi recept
    @Operation(summary = "Posodobi recept", description = "Posodobi obstoječi recept ali vrne 404, če recept ne obstaja.")
    @PutMapping("/{id}")
    @Transactional
    public ResponseEntity<?> posodobi(
            @PathVariable Long id,
            @Valid @RequestBody Recept noviPodatki,
            HttpServletRequest zahteva) {

        Uporabnik trenutniUporabnik = prijavljeniUporabnik(zahteva);
        if (trenutniUporabnik == null) return neprijavljen();

        Optional<Recept> najdenRecept = receptRepository.findById(id);

        if (najdenRecept.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        Recept recept = najdenRecept.get();
        if (recept.getAvtor() == null || !recept.getAvtor().getId().equals(trenutniUporabnik.getId())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("sporocilo", "Urediš lahko samo svoje recepte."));
        }
        recept.setIme(noviPodatki.getIme());
        recept.setOpis(noviPodatki.getOpis());
        recept.setSlika(noviPodatki.getSlika());
        recept.setSestavine(noviPodatki.getSestavine());
        recept.setNavodila(noviPodatki.getNavodila());
        recept.setCasPriprave(noviPodatki.getCasPriprave());
        recept.setStPorcij(noviPodatki.getStPorcij());
        recept.setZahtevnost(noviPodatki.getZahtevnost());
        recept.setKategorije(noviPodatki.getKategorije());
        recept.setVrstaObroka(noviPodatki.getVrstaObroka());

        return ResponseEntity.ok(receptRepository.save(recept));
    }

    //zbriše recept
    @Operation(summary = "Izbriši recept", description = "Izbriše recept ali vrne 404, če recept ne obstaja.")
    @DeleteMapping("/{id}")
    @Transactional
    public ResponseEntity<?> izbrisi(@PathVariable Long id, HttpServletRequest zahteva) {
        Uporabnik trenutniUporabnik = prijavljeniUporabnik(zahteva);
        if (trenutniUporabnik == null) return neprijavljen();
        Recept recept = receptRepository.findById(id).orElse(null);
        if (recept == null) return ResponseEntity.notFound().build();
        if (recept.getAvtor() == null || !recept.getAvtor().getId().equals(trenutniUporabnik.getId())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("sporocilo", "Izbrišeš lahko samo svoje recepte."));
        }

        komentarRepository.deleteByRecept_Id(id);
        uporabnikRepository.findByPriljubljeniRecepti_Id(id).forEach(uporabnik -> {
            uporabnik.getPriljubljeniRecepti().removeIf(priljubljen -> priljubljen.getId().equals(id));
            uporabnikRepository.save(uporabnik);
        });
        receptRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    private Uporabnik prijavljeniUporabnik(HttpServletRequest zahteva) {
        HttpSession seja = zahteva.getSession(false);
        if (seja == null || !(seja.getAttribute("uporabnikId") instanceof Long uporabnikId)) return null;
        return uporabnikRepository.findById(uporabnikId).orElse(null);
    }

    private ResponseEntity<?> neprijavljen() {
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("sporocilo", "Za dodajanje in urejanje receptov se prijavi."));
    }

    //iskanje po delu imena recepta
    @GetMapping("/iskanje/ime")
    public List<Recept> isciPoImenu(@RequestParam String ime) {
        return receptRepository.findByImeContainingIgnoreCase(ime);
    }

    //recepti v največ nekaj minut
    @GetMapping("/iskanje/cas")
    public List<Recept> isciPoCasu(@RequestParam int doMinut) {
        return receptRepository.findByCasPripraveLessThanEqual(doMinut);
    }

    //iskanje po kategoriji
    @GetMapping("/iskanje/kategorija")
    public List<Recept> isciPoKategoriji(@RequestParam String kategorija) {
        return receptRepository.findByKategorijeContainingIgnoreCase(kategorija);
    }

    //iskanje po vrsti
    @GetMapping("/iskanje/obrok")
    public List<Recept> isciPoVrstiObroka(@RequestParam String vrsta) {
        return receptRepository.findByVrstaObrokaIgnoreCase(vrsta);
    }
}
