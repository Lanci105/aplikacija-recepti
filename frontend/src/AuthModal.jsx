// Prijavno okno združuje obrazca za prijavo in registracijo ter ju poveže z auth API-jem.
import { useEffect, useRef, useState } from "react";
import "./AuthModal.css";

// Naslov REST API-ja za uporabniške račune.
const AUTH_URL = "http://localhost:8080/api/auth";

function AuthModal({ onClose, onLogin }) {
  // Stanja obrazca, napak, potrdil in nalaganja.
  const [nacin, setNacin] = useState("prijava");
  const [ime, setIme] = useState("");
  const [email, setEmail] = useState("");
  const [geslo, setGeslo] = useState("");
  const [potrditevGesla, setPotrditevGesla] = useState("");
  const [napaka, setNapaka] = useState("");
  const [sporocilo, setSporocilo] = useState("");
  const [nalaganje, setNalaganje] = useState(false);
  const prviVnos = useRef(null);

  useEffect(() => {
    // Ob odprtju postavi kazalec v prvo polje in omogoči zapiranje z Escape.
    prviVnos.current?.focus();
    function obTipki(event) {
      if (event.key === "Escape") onClose();
    }
    document.addEventListener("keydown", obTipki);
    return () => document.removeEventListener("keydown", obTipki);
  }, [onClose, nacin]);

  function spremeniNacin(novNacin) {
    // Preklop med obrazcema počisti staro napako in gesla.
    setNacin(novNacin);
    setNapaka("");
    setSporocilo("");
    setGeslo("");
    setPotrditevGesla("");
  }

  async function oddajObrazec(event) {
    // Pošlje prijavne ali registracijske podatke in prikaže odgovor API-ja.
    event.preventDefault();
    setNapaka("");
    setSporocilo("");
    if (nacin === "registracija" && geslo !== potrditevGesla) {
      setNapaka("Gesli se ne ujemata. Preveri vnos.");
      return;
    }

    setNalaganje(true);
    try {
      const pot = nacin === "registracija" ? "/registracija" : "/prijava";
      const telo = nacin === "registracija"
        ? { ime, email, geslo, potrditevGesla }
        : { email, geslo };
      const odgovor = await fetch(`${AUTH_URL}${pot}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(telo),
      });
      const podatki = await odgovor.json().catch(() => ({}));
      if (!odgovor.ok) {
        throw new Error(podatki.sporocilo || "Zahteve ni bilo mogoče izvesti. Poskusi znova.");
      }

      if (nacin === "registracija") {
        setEmail(podatki.email || email.trim());
        setIme("");
        setGeslo("");
        setPotrditevGesla("");
        setNacin("prijava");
        setSporocilo("Račun je ustvarjen. Zdaj se lahko prijaviš.");
      } else {
        onLogin(podatki);
        onClose();
      }
    } catch (napakaZahteve) {
      setNapaka(napakaZahteve.message || "Povezava z zaledjem ni uspela. Poskusi znova.");
    } finally {
      setNalaganje(false);
    }
  }

  return (
    <div className="auth-ozadje" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <section className="auth-okno" role="dialog" aria-modal="true" aria-labelledby="auth-naslov">
        <button className="auth-zapri" type="button" aria-label="Zapri okno" onClick={onClose}>×</button>
        <p className="auth-oznaka">MOJA KUHARSKA ZBIRKA</p>
        <h2 id="auth-naslov">{nacin === "prijava" ? "Dobrodošla nazaj" : "Ustvari svoj račun"}</h2>
        <p className="auth-uvod">
          {nacin === "prijava"
            ? "Prijavi se in nadaljuj z odkrivanjem dobrih idej."
            : "Ustvari račun in se pridruži naši skupnosti ljubiteljev kuhanja."}
        </p>

        {sporocilo && <p className="auth-uspeh" role="status">{sporocilo}</p>}
        {napaka && <p className="auth-napaka" role="alert">{napaka}</p>}

        <form className="auth-obrazec" onSubmit={oddajObrazec}>
          {nacin === "registracija" && (
            <label>
              Ime
              <input ref={prviVnos} autoComplete="name" value={ime} onChange={(event) => setIme(event.target.value)} maxLength={80} required />
            </label>
          )}
          <label>
            E-poštni naslov
            <input
              ref={nacin === "prijava" ? prviVnos : undefined}
              type="email"
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              maxLength={254}
              required
            />
          </label>
          <label>
            Geslo
            <input
              type="password"
              autoComplete={nacin === "prijava" ? "current-password" : "new-password"}
              value={geslo}
              onChange={(event) => setGeslo(event.target.value)}
              minLength={nacin === "registracija" ? 8 : undefined}
              maxLength={64}
              required
            />
            {nacin === "registracija" && <small className="auth-namig">Naj bo dolgo vsaj 8 znakov.</small>}
          </label>
          {nacin === "registracija" && (
            <label>
              Ponovi geslo
              <input
                type="password"
                autoComplete="new-password"
                value={potrditevGesla}
                onChange={(event) => setPotrditevGesla(event.target.value)}
                maxLength={64}
                required
              />
            </label>
          )}
          <button className="auth-glavni-gumb" type="submit" disabled={nalaganje}>
            {nalaganje ? "Prosim počakaj …" : nacin === "prijava" ? "Prijava" : "Ustvari račun"}
          </button>
        </form>

        {/* Spodnja povezava uporabniku omogoči prehod na drug obrazec. */}
        <p className="auth-preklop">
          {nacin === "prijava" ? "Še nimaš računa?" : "Že imaš račun?"}{" "}
          <button type="button" onClick={() => spremeniNacin(nacin === "prijava" ? "registracija" : "prijava")}>
            {nacin === "prijava" ? "Ustvari ga tukaj" : "Prijavi se"}
          </button>
        </p>
      </section>
    </div>
  );
}

export default AuthModal;
