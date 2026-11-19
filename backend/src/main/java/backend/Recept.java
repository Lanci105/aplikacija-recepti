package backend;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.validation.constraints.Size;

@Entity //razred označimo kot entiteto da ga lahko shrnaimo v zbirko
public class Recept {

    @Id //main ključ
    @GeneratedValue(strategy = GenerationType.IDENTITY) //naredi id samodejnu vsakemu novemu receptu
    private Long id; //deklaracija

    private String ime;
    @Column(length = 1000)
    private String opis;
    @Column(columnDefinition = "TEXT")
    private String slika;
    @Column(length = 3000)
    @Size(max = 3000, message = "Sestavine so lahko dolge največ 3000 znakov.")
    private String sestavine;
    @Column(length = 3000)
    @Size(max = 3000, message = "Navodila so lahko dolga največ 3000 znakov.")
    private String navodila;
    private int casPriprave;
    private int stPorcij;
    private String zahtevnost;
    private String kategorije;
    private String vrstaObroka;

    public Recept() {
    }

    public Long getId() {
        return id;
    }

    public String getIme() {
        return ime;
    }

    public void setIme(String ime) {
        this.ime = ime;
    }

    public String getOpis() {
        return opis;
    }

    public void setOpis(String opis) {
        this.opis = opis;
    }

    public String getSlika() {
        return slika;
    }

    public void setSlika(String slika) {
        this.slika = slika;
    }

    public String getSestavine() {
        return sestavine;
    }

    public void setSestavine(String sestavine) {
        this.sestavine = sestavine;
    }

    public String getNavodila() {
        return navodila;
    }

    public void setNavodila(String navodila) {
        this.navodila = navodila;
    }

    public int getCasPriprave() {
        return casPriprave;
    }

    public void setCasPriprave(int casPriprave) {
        this.casPriprave = casPriprave;
    }

    public int getStPorcij() {
        return stPorcij;
    }

    public void setStPorcij(int stPorcij) {
        this.stPorcij = stPorcij;
    }

    public String getZahtevnost() {
        return zahtevnost;
    }

    public void setZahtevnost(String zahtevnost) {
        this.zahtevnost = zahtevnost;
    }

    public String getKategorije() {
        return kategorije;
    }

    public void setKategorije(String kategorije) {
        this.kategorije = kategorije;
    }

    public String getVrstaObroka() {
        return vrstaObroka;
    }

    public void setVrstaObroka(String vrstaObroka) {
        this.vrstaObroka = vrstaObroka;
    }
}
