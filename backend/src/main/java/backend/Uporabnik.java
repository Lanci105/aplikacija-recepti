package backend;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.JoinTable;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.OrderBy;
import jakarta.persistence.Table;
import java.util.HashSet;
import java.util.Set;

// JPA entiteta za račun; shrani ime, enolični e-poštni naslov in zgoščeno geslo.
@Entity
@Table(name = "uporabnik")
public class Uporabnik {

    // Primarni ključ, ki ga PostgreSQL ustvari samodejno.
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Prikazno ime uporabnika.
    @Column(nullable = false, length = 80)
    private String ime;

    // E-pošta je normalizirana v male črke in enolična za vsak račun.
    @Column(nullable = false, unique = true, length = 254)
    private String email;

    // Hrani BCrypt zgoščeno vrednost, nikoli gesla v navadnem besedilu.
    @Column(nullable = false, name = "geslo_hash", length = 100)
    private String gesloHash;

    @ManyToMany
    @JoinTable(name = "uporabnik_priljubljen_recept",
            joinColumns = @JoinColumn(name = "uporabnik_id"),
            inverseJoinColumns = @JoinColumn(name = "recept_id"))
    @OrderBy("id DESC")
    private Set<Recept> priljubljeniRecepti = new HashSet<>();

    protected Uporabnik() {
    }

    public Uporabnik(String ime, String email, String gesloHash) {
        this.ime = ime;
        this.email = email;
        this.gesloHash = gesloHash;
    }

    public Long getId() {
        return id;
    }

    public String getIme() {
        return ime;
    }

    public String getEmail() {
        return email;
    }

    public String getGesloHash() {
        return gesloHash;
    }

    public Set<Recept> getPriljubljeniRecepti() { return priljubljeniRecepti; }

    public void setIme(String ime) { this.ime = ime; }

    public void setEmail(String email) { this.email = email; }

    public void setGesloHash(String gesloHash) { this.gesloHash = gesloHash; }
}
