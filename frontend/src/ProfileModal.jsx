import { useEffect, useRef, useState } from "react";
import "./AuthModal.css";

const AUTH_URL = "http://localhost:8080/api/auth";

function ProfileModal({ uporabnik, onClose, onSaved }) {
  const [ime, setIme] = useState(uporabnik.ime || "");
  const [email, setEmail] = useState(uporabnik.email || "");
  const [trenutnoGeslo, setTrenutnoGeslo] = useState("");
  const [novoGeslo, setNovoGeslo] = useState("");
  const [napaka, setNapaka] = useState("");
  const [nalaganje, setNalaganje] = useState(false);
  const prviVnos = useRef(null);

  useEffect(() => {
    prviVnos.current?.focus();
    function obTipki(event) { if (event.key === "Escape") onClose(); }
    document.addEventListener("keydown", obTipki);
    return () => document.removeEventListener("keydown", obTipki);
  }, [onClose]);

  async function shraniProfil(event) {
    event.preventDefault();
    setNapaka("");
    setNalaganje(true);
    try {
      const odgovor = await fetch(`${AUTH_URL}/jaz`, {
        method: "PUT", headers: { "Content-Type": "application/json" }, credentials: "include",
        body: JSON.stringify({ ime, email, trenutnoGeslo, novoGeslo }),
      });
      const podatki = await odgovor.json().catch(() => ({}));
      if (!odgovor.ok) throw new Error(podatki.sporocilo || "Profila ni bilo mogoče shraniti.");
      onSaved(podatki);
      onClose();
    } catch (napakaZahteve) {
      setNapaka(napakaZahteve.message || "Povezava z zaledjem ni uspela.");
    } finally { setNalaganje(false); }
  }

  return (
    <div className="auth-ozadje" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <section className="auth-okno" role="dialog" aria-modal="true" aria-labelledby="profil-naslov">
        <button className="auth-zapri" type="button" aria-label="Zapri okno" onClick={onClose}>×</button>
        <p className="auth-oznaka">MOJ RAČUN</p>
        <h2 id="profil-naslov">Uredi profil</h2>
        <p className="auth-uvod">Posodobi ime ali e-poštni naslov. Geslo lahko spremeniš spodaj.</p>
        {napaka && <p className="auth-napaka" role="alert">{napaka}</p>}
        <form className="auth-obrazec" onSubmit={shraniProfil}>
          <label>Ime<input ref={prviVnos} autoComplete="name" value={ime} onChange={(event) => setIme(event.target.value)} maxLength={80} required /></label>
          <label>E-poštni naslov<input type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} maxLength={254} required /></label>
          <label>Trenutno geslo <span className="auth-namig">(potrebno samo za spremembo gesla)</span><input type="password" autoComplete="current-password" value={trenutnoGeslo} onChange={(event) => setTrenutnoGeslo(event.target.value)} /></label>
          <label>Novo geslo <span className="auth-namig">(pusti prazno, če ga ne želiš spremeniti)</span><input type="password" autoComplete="new-password" value={novoGeslo} onChange={(event) => setNovoGeslo(event.target.value)} minLength={novoGeslo ? 8 : undefined} maxLength={64} /></label>
          <button className="auth-glavni-gumb" type="submit" disabled={nalaganje}>{nalaganje ? "Shranjujem …" : "Shrani spremembe"}</button>
        </form>
      </section>
    </div>
  );
}

export default ProfileModal;
