package backend;

import java.time.Instant;

import org.hibernate.annotations.CreationTimestamp;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

@Entity
@Table(name = "komentar")
public class Komentar {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "recept_id", nullable = false)
    @JsonIgnore
    private Recept recept;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "avtor_id", nullable = false)
    @JsonIgnore
    private Uporabnik avtor;

    @Column(nullable = false, length = 1500)
    private String vsebina;

    @Column(nullable = false)
    private int ocena;

    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private Instant ustvarjeno;

    protected Komentar() { }

    public Komentar(Recept recept, Uporabnik avtor, String vsebina, int ocena) {
        this.recept = recept;
        this.avtor = avtor;
        this.vsebina = vsebina;
        this.ocena = ocena;
    }

    public Long getId() { return id; }
    public String getVsebina() { return vsebina; }
    public int getOcena() { return ocena; }
    public Instant getUstvarjeno() { return ustvarjeno; }
    @JsonIgnore public Recept getRecept() { return recept; }
    @JsonIgnore public Uporabnik getAvtor() { return avtor; }
    @JsonProperty(access = JsonProperty.Access.READ_ONLY) public Long getAvtorId() { return avtor.getId(); }
    @JsonProperty(access = JsonProperty.Access.READ_ONLY) public String getAvtorIme() { return avtor.getIme(); }
}
