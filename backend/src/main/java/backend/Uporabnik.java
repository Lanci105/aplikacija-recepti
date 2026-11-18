package backend;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

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
}
