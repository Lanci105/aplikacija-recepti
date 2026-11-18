import { useEffect, useRef, useState } from "react";
import "./App.css";

//povezava z api in obrazci
const API_URL = "http://localhost:8080/api/recepti";
const kategorije = ["Vegansko", "Vegetarijansko", "Pescetarijansko", "Visokobeljakovinsko", "Visokokalorično", "Brez glutena", "Brez laktoze", "Drugo"];
const vrsteObroka = ["Zajtrk", "Kosilo", "Večerja", "Sladica", "Prigrizek"];

//privzete vrednosti
const prazenRecept = {
  ime: "",
  opis: "",
  slika: "",
  navodila: "",
  casPriprave: "",
  stPorcij: "2",
  zahtevnost: "Srednje",
  kategorije: "",
  vrstaObroka: "",
};

//sestavine iz besedila v seznam da jih lahko pokažemo z alinejami.
function razdeliSestavine(besedilo = "") {
  const locilo = besedilo.includes("\n") ? /\r?\n/ : /,\s*/;
  const sestavine = besedilo.split(locilo).map((sestavina) => sestavina.trim()).filter(Boolean);
  return sestavine.length ? sestavine : [""];
}

//vsak korak priprave v svoj element seznama.
function razdeliKorake(besedilo = "") {
  const koraki = besedilo.split(/\r?\n/).map((korak) => korak.trim()).filter(Boolean);
  return koraki.length ? koraki : [""];
}

//več kategorij za recepte
function razdeliKategorije(besedilo = "") {
  return besedilo.split(/[,;\n]/).map((kategorija) => kategorija.trim()).filter(Boolean);
}

//random recepti za priljubljene
function izberiNakljucneRecepte(seznam, stevilo = 3) {
  const premesani = [...seznam];
  for (let i = premesani.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [premesani[i], premesani[j]] = [premesani[j], premesani[i]];
  }
  return premesani.slice(0, stevilo);
}

//poenoti zapis vrste obroka, da se stare vrednosti »Sladice« pokažejo kot »Sladica«.
function normalizirajVrstoObroka(vrsta) {
  const besedilo = vrsta.trim().replace(/\s+/g, " ");
  return besedilo.toLocaleLowerCase("sl-SI") === "sladice" ? "Sladica" : besedilo;
}

//stare in nove oblike zahtevnosti prikaže z enakimi oznakami.
function normalizirajZahtevnost(zahtevnost = "") {
  const vrednost = zahtevnost.trim().toLocaleLowerCase("sl-SI");
  if (vrednost === "lahka" || vrednost === "lahko") return "Lahko";
  if (vrednost === "srednja" || vrednost === "srednje") return "Srednje";
  if (vrednost === "težka" || vrednost === "težko") return "Težko";
  return zahtevnost.trim();
}

//odstrani podvojene možnosti
function odstraniPodvojeneMoznosti(seznam) {
  const videne = new Set();
  return seznam.map(normalizirajVrstoObroka).filter((moznost) => {
    const kljuc = moznost.toLocaleLowerCase("sl-SI");
    if (!kljuc || videne.has(kljuc)) return false;
    videne.add(kljuc);
    return true;
  });
}

//poenoti stare ali napačno zapisane kategorije.
function normalizirajKategorijo(kategorija) {
  const besedilo = kategorija.trim().replace(/\s+/g, " ");
  const kljuc = besedilo.toLocaleLowerCase("sl-SI").replace(/\s+/g, "");
  if (kljuc === "vegeterijansko" || kljuc === "vegetarijansko") return "Vegetarijansko";
  if (kljuc === "visokokalorično") return "Visokokalorično";
  return besedilo;
}

//ustvariključ kategorije
function kljucKategorije(kategorija) {
  return normalizirajKategorijo(kategorija).toLocaleLowerCase("sl-SI").replace(/\s+/g, "");
}

//odstrani ponovljene kategorije in tisto ki sem jo dala stran
function odstraniPodvojeneKategorije(seznam) {
  const videne = new Set();
  return seznam.map(normalizirajKategorijo).filter((kategorija) => {
    const kljuc = kljucKategorije(kategorija);
    if (!kljuc || kljuc === "mediteransko" || videne.has(kljuc)) return false;
    videne.add(kljuc);
    return true;
  });
}

function App() {
  //stanje aplikacije - recepti, obrazec, filtri, trenutno odprta stran in sporočila.
  const [recepti, setRecepti] = useState([]);
  const [priljubljeni, setPriljubljeni] = useState([]);
  const [filtri, setFiltri] = useState({ zahtevnost: "", kategorija: "", vrstaObroka: "" });
  const [recept, setRecept] = useState(prazenRecept);
  const [sestavine, setSestavine] = useState([""]);
  const [koraki, setKoraki] = useState([""]);
  const [urejanjeId, setUrejanjeId] = useState(null);
  const [odprtiRecept, setOdprtiRecept] = useState(null);
  const [aktivnaStran, setAktivnaStran] = useState("domov");
  const [meniMobilniOdprt, setMeniMobilniOdprt] = useState(false);
  const [prejsnjaStran, setPrejsnjaStran] = useState("domov");
  const [napaka, setNapaka] = useState("");
  const [nalaganje, setNalaganje] = useState(true);
  const [nalaganjeSlike, setNalaganjeSlike] = useState(false);
  const [meniKategorijOdprt, setMeniKategorijOdprt] = useState(false);
  const vnosSlike = useRef(null);
  const kategorijeRef = useRef(null);
  const [iskanje, setIskanje] = useState("");

  //po uspešnem shranjevanju pripravi prazen obrazec za naslednji recept.
  function ponastaviObrazec() {
    setRecept(prazenRecept);
    setSestavine([""]);
    setKoraki([""]);
    setUrejanjeId(null);
    if (vnosSlike.current) vnosSlike.current.value = "";
  }

  //pridobi recepte iz string boota in posodobi prikaz na strani.
  async function naloziRecepte() {
    setNapaka("");
    setNalaganje(true);

    try {
      const odgovor = await fetch(API_URL);
      if (!odgovor.ok) throw new Error("Recepte ni bilo mogoče naložiti.");
      const nalozeniRecepti = await odgovor.json();
      setRecepti(nalozeniRecepti);
      setPriljubljeni(izberiNakljucneRecepte(nalozeniRecepti, 4));
    } catch {
      setNapaka("Povezava z backendom ni uspela. Preveri, ali ta deluje na portu 8080.");
    } finally {
      setNalaganje(false);
    }
  }

  //naloži recepte iz baze.
  useEffect(() => {
    naloziRecepte();
  }, []);

  //meni kategorij zapre ob kliku zunaj njega ali tipki Escape.
  useEffect(() => {
    if (!meniKategorijOdprt) return undefined;
    function zapriObZunanjemKliku(event) {
      if (!kategorijeRef.current?.contains(event.target)) setMeniKategorijOdprt(false);
    }
    function zapriZEscape(event) {
      if (event.key === "Escape") setMeniKategorijOdprt(false);
    }
    document.addEventListener("mousedown", zapriObZunanjemKliku);
    document.addEventListener("keydown", zapriZEscape);
    return () => {
      document.removeEventListener("mousedown", zapriObZunanjemKliku);
      document.removeEventListener("keydown", zapriZEscape);
    };
  }, [meniKategorijOdprt]);

  //shrani vnos v obrazcu v reactovo stanje.
  function spremeniPolje(event) {
    const { name, value } = event.target;
    setRecept((trenutni) => ({ ...trenutni, [name]: value }));
  }

  //doda ali odstrani kategorijo, prepreči podvojene stare zapise.
  function spremeniKategorijo(kategorija, izbrana) {
    const trenutne = razdeliKategorije(recept.kategorije);
    const nove = izbrana
      ? [...trenutne.filter((vrednost) => kljucKategorije(vrednost) !== kljucKategorije(kategorija)), kategorija]
      : trenutne.filter((vrednost) => kljucKategorije(vrednost) !== kljucKategorije(kategorija));
    setRecept((trenutni) => ({ ...trenutni, kategorije: nove.join(", ") }));
  }

  //posodabi  sestavino ali korak priprave.
  function spremeniSestavino(index, vrednost) {
    setSestavine((trenutne) => trenutne.map((sestavina, i) => (i === index ? vrednost : sestavina)));
  }

  function spremeniKorak(index, vrednost) {
    setKoraki((trenutni) => trenutni.map((korak, i) => (i === index ? vrednost : korak)));
  }

  //preveri sliko jo zmanjša in shrani v obrazec kot podatkovni URL.
  function izberiSliko(event) {
    const datoteka = event.target.files?.[0];
    if (!datoteka) return;
    if (!datoteka.type.startsWith("image/")) {
      setNapaka("Izberi slikovno datoteko, na primer JPG, PNG ali WebP.");
      event.target.value = "";
      return;
    }
    if (datoteka.size > 2 * 1024 * 1024) {
      setNapaka("Slika je lahko velika največ 2 MB.");
      event.target.value = "";
      return;
    }

    setNalaganjeSlike(true);
    const bralnik = new FileReader();
    bralnik.onload = () => {
      const izvor = new Image();
      izvor.onload = () => {
        try {
          const meja = 1400;
          const razmerje = Math.min(1, meja / Math.max(izvor.width, izvor.height));
          const platno = document.createElement("canvas");
          platno.width = Math.max(1, Math.round(izvor.width * razmerje));
          platno.height = Math.max(1, Math.round(izvor.height * razmerje));
          platno.getContext("2d").drawImage(izvor, 0, 0, platno.width, platno.height);
          setRecept((trenutni) => ({ ...trenutni, slika: platno.toDataURL("image/jpeg", 0.82) }));
          setNapaka("");
        } catch {
          setRecept((trenutni) => ({ ...trenutni, slika: String(bralnik.result) }));
          setNapaka("");
        } finally {
          setNalaganjeSlike(false);
        }
      };
      izvor.onerror = () => {
        setNalaganjeSlike(false);
        setNapaka("Izbrane slike ni bilo mogoče odpreti. Poskusi z JPG ali PNG.");
      };
      izvor.src = String(bralnik.result);
    };
    bralnik.onerror = () => {
      setNalaganjeSlike(false);
      setNapaka("Slike ni bilo mogoče prebrati.");
    };
    bralnik.readAsDataURL(datoteka);
  }

  //preveri podatke obrazca in pošlje post (nov zapis) ali put (urejanje) backendu.
  async function shraniRecept(event) {
    event.preventDefault();
    setNapaka("");
    if (nalaganjeSlike) {
      setNapaka("Počakaj, da se slika naloži, nato shrani recept.");
      return;
    }

    const seznamSestavin = sestavine.map((sestavina) => sestavina.trim()).filter(Boolean);
    if (seznamSestavin.length === 0) {
      setNapaka("Dodaj vsaj eno sestavino.");
      return;
    }

    const sestavineBesedilo = seznamSestavin.join("\n");
    if (sestavineBesedilo.length > 3000) {
      setNapaka("Vse sestavine skupaj so lahko dolge največ 3000 znakov.");
      return;
    }

    const seznamKorakov = koraki.map((korak) => korak.trim()).filter(Boolean);
    if (seznamKorakov.length === 0) {
      setNapaka("Dodaj vsaj en korak priprave.");
      return;
    }
    const navodilaBesedilo = seznamKorakov.join("\n");
    if (navodilaBesedilo.length > 3000) {
      setNapaka("Vsi koraki priprave skupaj so lahko dolgi največ 3000 znakov.");
      return;
    }

    const podatki = {
      ...recept,
      sestavine: sestavineBesedilo,
      navodila: navodilaBesedilo,
      casPriprave: Number(recept.casPriprave),
      stPorcij: Number(recept.stPorcij),
    };

    const url = urejanjeId ? `${API_URL}/${urejanjeId}` : API_URL;
    const metoda = urejanjeId ? "PUT" : "POST";

    try {
      const odgovor = await fetch(url, {
        method: metoda,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(podatki),
      });

      if (!odgovor.ok) {
        const podrobnost = await odgovor.text();
        throw new Error(`Recepta ni bilo mogoče shraniti (${odgovor.status}). ${podrobnost}`);
      }

      ponastaviObrazec();
      await naloziRecepte();
    } catch (error) {
      setNapaka(error.message);
    }
  }

  //izpolni obrazec z izbranim receptom in preklopi na urejanje.
  function zacniUrejanje(izbraniRecept) {
    setOdprtiRecept(null);
    setAktivnaStran("dodaj");
    setRecept({
      ime: izbraniRecept.ime ?? "",
      opis: izbraniRecept.opis ?? "",
      slika: izbraniRecept.slika ?? "",
      casPriprave: izbraniRecept.casPriprave ?? "",
      stPorcij: izbraniRecept.stPorcij || 2,
      zahtevnost: normalizirajZahtevnost(izbraniRecept.zahtevnost ?? "Srednje"),
      kategorije: izbraniRecept.kategorije ?? "",
      vrstaObroka: izbraniRecept.vrstaObroka ?? "",
    });
    setSestavine(razdeliSestavine(izbraniRecept.sestavine));
    setKoraki(razdeliKorake(izbraniRecept.navodila));
    setUrejanjeId(izbraniRecept.id);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  //po potrditvi izbriše recept prek apija in ponovno naloži seznam.
  async function izbrisiRecept(id) {
    if (!window.confirm("Ali res želiš izbrisati ta recept?")) return false;

    try {
      const odgovor = await fetch(`${API_URL}/${id}`, { method: "DELETE" });
      if (!odgovor.ok) throw new Error("Recepta ni bilo mogoče izbrisati.");
      await naloziRecepte();
      return true;
    } catch (error) {
      setNapaka(error.message);
      return false;
    }
  }

  //zaapre način urejanja in počisti njegove podatke.
  function prekliciUrejanje() {
    ponastaviObrazec();
  }

  //odpre podrobno stran recepta.
  function odpriRecept(item) {
    setPrejsnjaStran(aktivnaStran);
    setOdprtiRecept(item);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  //ko klikneš na eno izbrano kategorijo na strani odpre
  function odpriSekcijo(id) {
    const sekcija = document.getElementById(id);
    if (sekcija) sekcija.scrollIntoView({ behavior: "smooth", block: "start" });
    else {
      setAktivnaStran("vsi");
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }

  //seznami za razdelke in recepti, ki ustrezajo filtrom.
  const beljakovinski = recepti.filter((item) => /protein|beljakovin/i.test(item.kategorije || ""));
  const hitroPripravljeni = recepti.filter((item) => Number(item.casPriprave) > 0 && Number(item.casPriprave) <= 30);
  const vegetarijanski = recepti.filter((item) => /vegetar|vegansko|pescet/i.test(item.kategorije || ""));
  const izbraneKategorije = razdeliKategorije(recept.kategorije);
  const stareKategorije = odstraniPodvojeneKategorije(izbraneKategorije).filter((kategorija) => !kategorije.some((znana) => kljucKategorije(znana) === kljucKategorije(kategorija)));
  const vseKategorije = odstraniPodvojeneKategorije([...kategorije, ...recepti.flatMap((item) => razdeliKategorije(item.kategorije))]);
  const vseVrsteObrokov = odstraniPodvojeneMoznosti([...vrsteObroka, ...recepti.map((item) => item.vrstaObroka).filter((vrsta) => vrsta && !vrsta.toLocaleLowerCase("sl-SI").startsWith("brunch"))]);
  const vseZahtevnosti = odstraniPodvojeneMoznosti(["Lahko", "Srednje", "Težko", ...recepti.map((item) => normalizirajZahtevnost(item.zahtevnost || "")).filter(Boolean)]);
  const filtriraniRecepti = recepti.filter((item) => {
    const iskaniIzraz = iskanje.trim().toLocaleLowerCase("sl-SI");

    const imeUstreza = (item.ime || "")
        .toLocaleLowerCase("sl-SI")
        .includes(iskaniIzraz);

    const zahtevnostUstreza =
        !filtri.zahtevnost ||
        normalizirajZahtevnost(item.zahtevnost || "").toLocaleLowerCase("sl-SI") ===
        normalizirajZahtevnost(filtri.zahtevnost).toLocaleLowerCase("sl-SI");

    const kategorijaUstreza =
        !filtri.kategorija ||
        razdeliKategorije(item.kategorije).some(
            (kategorija) =>
                kljucKategorije(kategorija) === kljucKategorije(filtri.kategorija)
        );

    const obrokUstreza =
        !filtri.vrstaObroka ||
        normalizirajVrstoObroka(item.vrstaObroka || "").toLocaleLowerCase("sl-SI") ===
        normalizirajVrstoObroka(filtri.vrstaObroka).toLocaleLowerCase("sl-SI");

    return (
        imeUstreza &&
        zahtevnostUstreza &&
        kategorijaUstreza &&
        obrokUstreza
    );
  });
  const zadnjaDvaRecepta = [...recepti].sort((a, b) => Number(b.id) - Number(a.id)).slice(0, 2);
  const prikazaniRecepti = aktivnaStran === "dodaj" ? zadnjaDvaRecepta : aktivnaStran === "vsi" ? filtriraniRecepti : recepti;

  //glavna postavitev - navigacija in izbrana stran/  podrobnosti recepta.
  return (
    <div className="aplikacija">
      <nav className="zgornji-meni" aria-label="Glavni meni">
        <button className="znamka" type="button" onClick={() => { setOdprtiRecept(null); setAktivnaStran("domov"); setMeniMobilniOdprt(false); window.scrollTo({ top: 0, behavior: "smooth" }); }}>
          <span className="znamka-ikona" aria-hidden="true">✿</span>
          <span className="znamka-besedilo"><strong>Recepti<span className="znamka-pikica">.</span></strong><small>MOJA KUHARSKA ZBIRKA</small></span>
        </button>
        <button className="gumb-meni" type="button" aria-label={meniMobilniOdprt ? "Zapri meni" : "Odpri meni"} aria-expanded={meniMobilniOdprt} onClick={() => setMeniMobilniOdprt((odprt) => !odprt)}>
          <span /><span /><span />
        </button>
        <div className={`meni-povezave ${meniMobilniOdprt ? "odprt" : ""}`}>
          <button className={aktivnaStran === "domov" && !odprtiRecept ? "meni-povezava izbrana" : "meni-povezava"} type="button" onClick={() => { setOdprtiRecept(null); setAktivnaStran("domov"); setMeniMobilniOdprt(false); window.scrollTo({ top: 0, behavior: "smooth" }); }}>Domov</button>
          <button className={aktivnaStran === "vsi" && !odprtiRecept ? "meni-povezava izbrana" : "meni-povezava"} type="button" onClick={() => { setOdprtiRecept(null); setAktivnaStran("vsi"); setMeniMobilniOdprt(false); window.scrollTo({ top: 0, behavior: "smooth" }); }}>Vsi recepti</button>
          <button className="meni-dodaj" type="button" onClick={() => { setOdprtiRecept(null); setAktivnaStran("dodaj"); setMeniMobilniOdprt(false); window.scrollTo({ top: 0, behavior: "smooth" }); }}>＋ Dodaj svoj recept</button>
        </div>
      </nav>

      <main className={`stran ${aktivnaStran === "domov" && !odprtiRecept ? "stran-domov" : ""} ${aktivnaStran === "vsi" ? "stran-vsi" : ""}`}>
      {odprtiRecept ? (
        //podrobni prikaz izbranega recepta  sestavin in korakov.
        <section className="pogled-recepta kartica">
          <button className="nazaj-gumb" type="button" onClick={() => { setOdprtiRecept(null); setAktivnaStran(prejsnjaStran); }}>← Nazaj</button>
          <div className="glava-podrobnosti">
            {odprtiRecept.slika && <img className="slika-podrobnosti" src={odprtiRecept.slika} alt={`Slika jedi: ${odprtiRecept.ime}`} />}
            <div>
              <p className="oznaka">RECEPT</p>
              <h2>{odprtiRecept.ime}</h2>
              <p className="opis-podrobnosti">{odprtiRecept.opis || "Kratek opis ni dodan."}</p>
              <p className="meta-podrobnosti">{odprtiRecept.casPriprave} min · {odprtiRecept.stPorcij || "—"} porcij · {normalizirajZahtevnost(odprtiRecept.zahtevnost || "Zahtevnost ni določena")}</p>
              <p className="oznaki">{[odprtiRecept.kategorije, odprtiRecept.vrstaObroka].filter(Boolean).join(" · ")}</p>
            </div>
          </div>
          <div className="razdelek-podrobnosti">
            <h3>Sestavine</h3>
            <ul className="sestavine-kartice">
              {razdeliSestavine(odprtiRecept.sestavine).map((sestavina, index) => <li key={`sestavina-${index}`}>{sestavina}</li>)}
            </ul>
          </div>
          <div className="razdelek-podrobnosti">
            <h3>Postopek priprave</h3>
            <ol className="koraki-kartice">
              {razdeliKorake(odprtiRecept.navodila).map((korak, index) => <li key={`korak-${index}`}>{korak}</li>)}
            </ol>
          </div>
          <div className="gumbi gumbi-kartice">
            <button className="stranski-gumb" type="button" onClick={() => zacniUrejanje(odprtiRecept)}>Uredi</button>
            <button className="brisanje-gumb" type="button" onClick={async () => { if (await izbrisiRecept(odprtiRecept.id)) setOdprtiRecept(null); }}>Izbriši</button>
          </div>
        </section>
      ) : aktivnaStran === "domov" ? (
        <>
          {/* dmača stran z uvodom, bližnjicami in izbranimi recepti. */}
          <section className="uvodna-pasica">
            <div className="uvodna-vsebina">
              <p className="oznaka">DOBRODOŠLI V MOJI KUHINJI</p>
              <h1>Recepti, ki dišijo po domu.</h1>
              <p>Odkrij nove ideje za vsak dan, shrani svoje najljubše in deli jedi, ki jih rad pripravljaš.</p>
              <div className="uvodna-gumbi">
                <button className="glavni-gumb" type="button" onClick={() => { setAktivnaStran("vsi"); window.scrollTo({ top: 0, behavior: "smooth" }); }}>Razišči recepte</button>
                <button className="uvodna-povezava" type="button" onClick={() => { setAktivnaStran("dodaj"); window.scrollTo({ top: 0, behavior: "smooth" }); }}>＋ Dodaj svoj recept</button>
              </div>
            </div>
            <div className="uvodna-slika">
              {recepti.find((item) => item.slika)?.slika
                ? <img src={recepti.find((item) => item.slika).slika} alt="Izbrana jed iz zbirke receptov" />
                : <div className="uvodna-slika-nadomestek"><span>✿</span><p>Dobro in domače</p></div>}
              <div className="plavajoca-oznaka"><span>✦</span> Ideje za vsak dan</div>
            </div>
          </section>

          <div className="domov-uvod">
            <p className="oznaka">NAVDIH ZA KUHANJE</p>
            <h2>Izberi, kaj ti danes zadiši</h2>
            <p>Prebrskaj zbirko po okusu, času priprave ali priložnosti.</p>
          </div>

          <div className="predlogi-kategorij">
            <button type="button" onClick={() => odpriSekcijo("priljubljeni")}><span>♡</span><strong>Priljubljeni</strong><small>Recepti iz tvoje zbirke</small></button>
            <button type="button" onClick={() => odpriSekcijo("beljakovinski")}><span>✦</span><strong>Visoko beljakovinski</strong><small>Nasitne ideje po treningu</small></button>
            <button type="button" onClick={() => odpriSekcijo("hitri")}><span>◷</span><strong>Hitro pripravljeno</strong><small>Manj časa v kuhinji</small></button>
          </div>

          {napaka && <p className="napaka" role="alert">{napaka}</p>}
          {nalaganje && <p>Nalagam recepte …</p>}
          {!nalaganje && recepti.length === 0 && <div className="prazno-domov"><h2>Začni svojo zbirko</h2><p>Dodaj prvi recept in kmalu se bodo tukaj pojavile tvoje kuharske ideje.</p><button className="glavni-gumb" type="button" onClick={() => setAktivnaStran("dodaj")}>Dodaj svoj prvi recept</button></div>}

          {!nalaganje && recepti.length > 0 && <>
            <section className="domov-razdelek" id="priljubljeni">
              <div className="domov-razdelek-glava"><div><p className="oznaka">TVOJA ZBIRKA</p><h2>Priljubljeni recepti</h2></div><button type="button" onClick={() => setAktivnaStran("vsi")}>Vsi recepti <span>→</span></button></div>
              <div className="domov-mreza">{priljubljeni.map((item) => <button className="domov-recept" type="button" key={item.id} onClick={() => odpriRecept(item)}>
                <div className="domov-recept-slika">{item.slika ? <img src={item.slika} alt="" /> : <span>✿</span>}</div>
                <div className="domov-recept-info"><small>{item.vrstaObroka || "Domači recept"}</small><h3>{item.ime}</h3><p>{item.casPriprave ? `${item.casPriprave} min` : "Čas ni določen"} <span>·</span> {normalizirajZahtevnost(item.zahtevnost || "Za vsakogar")}</p></div>
                <span className="domov-recept-puščica">↗</span>
              </button>)}</div>
            </section>
            {beljakovinski.length > 0 && <section className="domov-razdelek manjši-razdelek" id="beljakovinski"><div className="domov-razdelek-glava"><div><p className="oznaka">DOBRO IN NASITNO</p><h2>Visoko beljakovinski</h2></div></div><div className="domov-mreza">{beljakovinski.slice(0, 4).map((item) => <button className="domov-recept" type="button" key={item.id} onClick={() => odpriRecept(item)}><div className="domov-recept-slika">{item.slika ? <img src={item.slika} alt="" /> : <span>✿</span>}</div><div className="domov-recept-info"><small>{item.kategorije}</small><h3>{item.ime}</h3><p>{item.casPriprave || "—"} min · {item.stPorcij || "—"} porcij</p></div><span className="domov-recept-puščica">↗</span></button>)}</div></section>}
            {hitroPripravljeni.length > 0 && <section className="domov-razdelek manjši-razdelek" id="hitri"><div className="domov-razdelek-glava"><div><p className="oznaka">KO SE MUDI</p><h2>Pripravljeno v 30 minutah</h2></div></div><div className="domov-mreza">{hitroPripravljeni.slice(0, 4).map((item) => <button className="domov-recept" type="button" key={item.id} onClick={() => odpriRecept(item)}><div className="domov-recept-slika">{item.slika ? <img src={item.slika} alt="" /> : <span>✿</span>}</div><div className="domov-recept-info"><small>{item.vrstaObroka || "Hitro in dobro"}</small><h3>{item.ime}</h3><p>{item.casPriprave} min · {normalizirajZahtevnost(item.zahtevnost || "Za vsakogar")}</p></div><span className="domov-recept-puščica">↗</span></button>)}</div></section>}
            {vegetarijanski.length > 0 && <section className="domov-razdelek manjši-razdelek"><div className="domov-razdelek-glava"><div><p className="oznaka">RASTLINSKE IDEJE</p><h2>Vegetarijanski izbor</h2></div></div><div className="domov-mreza">{vegetarijanski.slice(0, 4).map((item) => <button className="domov-recept" type="button" key={item.id} onClick={() => odpriRecept(item)}><div className="domov-recept-slika">{item.slika ? <img src={item.slika} alt="" /> : <span>✿</span>}</div><div className="domov-recept-info"><small>{item.kategorije}</small><h3>{item.ime}</h3><p>{item.casPriprave || "—"} min · {item.vrstaObroka || "Domače"}</p></div><span className="domov-recept-puščica">↗</span></button>)}</div></section>}
          </>}

          <section className="poziv-k-receptu"><div><p className="oznaka">TVOJA KUHINJA, TVOJA ZGODBA</p><h2>Imaš recept, ki ga obožuješ?</h2><p>Shrani ga v svojo zbirko, da ga boš vedno našla.</p></div><button className="glavni-gumb" type="button" onClick={() => { setAktivnaStran("dodaj"); window.scrollTo({ top: 0, behavior: "smooth" }); }}>＋ Dodaj svoj recept</button></section>
        </>
      ) : (
      <>
      <header className="glava">
        <p className="oznaka">MOJA KUHARSKA ZBIRKA</p>
        <h1>{aktivnaStran === "vsi" ? "Vsi recepti" : "Dodaj svoj recept"}</h1>
        <p>{aktivnaStran === "vsi" ? "Prebrskaj svojo zbirko jedi." : "Shrani svojo najljubšo jed v kuharsko zbirko."}</p>
      </header>

      {aktivnaStran === "dodaj" && <>
      {/* obrazec za dodajanje ali urejanje recepta. */}
      <section className="kartica obrazec-kartica">
        <h2>{urejanjeId ? "Uredi recept" : "Dodaj recept"}</h2>

        <form onSubmit={shraniRecept}>
          <label>
            Ime recepta
            <input name="ime" value={recept.ime} onChange={spremeniPolje} required />
          </label>

          <label>
            Slika recepta
            <input ref={vnosSlike} type="file" accept="image/*" onChange={izberiSliko} />
          </label>
          {nalaganjeSlike && <p role="status">Pripravljam sliko za shranjevanje …</p>}
          {recept.slika && (
            <div className="predogled-slike">
              <img src={recept.slika} alt="Predogled izbrane slike recepta" />
              <button className="stranski-gumb" type="button" onClick={() => {
                setRecept((trenutni) => ({ ...trenutni, slika: "" }));
                if (vnosSlike.current) vnosSlike.current.value = "";
              }}>
                Odstrani sliko
              </button>
            </div>
          )}

          <label>
            Kratek opis
            <textarea
              name="opis"
              maxLength={1000}
              value={recept.opis}
              onChange={spremeniPolje}
              placeholder="Na kratko opiši jed."
            />
          </label>

          <fieldset className="seznam-sestavin">
            <legend>Sestavine</legend>
            {sestavine.map((sestavina, index) => (
              <div className="vnos-sestavine" key={index}>
                <span className="pikica" aria-hidden="true">•</span>
                <input
                  aria-label={`Sestavina ${index + 1}`}
                  value={sestavina}
                  onChange={(event) => spremeniSestavino(index, event.target.value)}
                  placeholder={`Sestavina ${index + 1}, npr. 200 g moke`}
                  maxLength={3000}
                  required
                />
                {sestavine.length > 1 && (
                  <button
                    className="odstrani-sestavino"
                    type="button"
                    aria-label={`Odstrani sestavino ${index + 1}`}
                    onClick={() => setSestavine((trenutne) => trenutne.filter((_, i) => i !== index))}
                  >
                    ×
                  </button>
                )}
              </div>
            ))}
            <button className="dodaj-sestavino" type="button" onClick={() => setSestavine((trenutne) => [...trenutne, ""])}>
              + Dodaj sestavino
            </button>
          </fieldset>

          <fieldset className="seznam-sestavin">
            <legend>Postopek priprave</legend>
            {koraki.map((korak, index) => (
              <div className="vnos-koraka" key={index}>
                <label className="oznaka-koraka" htmlFor={`korak-${index}`}>{index + 1}. Korak</label>
                <textarea
                  id={`korak-${index}`}
                  value={korak}
                  onChange={(event) => spremeniKorak(index, event.target.value)}
                  placeholder={`Opiši ${index + 1}. korak priprave.`}
                  maxLength={3000}
                  required
                />
                {koraki.length > 1 && (
                  <button
                    className="odstrani-sestavino"
                    type="button"
                    aria-label={`Odstrani ${index + 1}. korak`}
                    onClick={() => setKoraki((trenutni) => trenutni.filter((_, i) => i !== index))}
                  >×</button>
                )}
              </div>
            ))}
            <button className="dodaj-sestavino" type="button" onClick={() => setKoraki((trenutni) => [...trenutni, ""])}>
              + Dodaj korak
            </button>
          </fieldset>

          <div className="polja-v-vrsti">
            <label>
              Čas priprave (minute)
              <input type="number" min="1" name="casPriprave" value={recept.casPriprave} onChange={spremeniPolje} required />
            </label>
            <label>
              Število porcij
              <input type="number" min="1" name="stPorcij" value={recept.stPorcij} onChange={spremeniPolje} required />
            </label>
            <label>
              Zahtevnost
              <select name="zahtevnost" value={recept.zahtevnost} onChange={spremeniPolje} required>
                <option value="Lahko">Lahko</option>
                <option value="Srednje">Srednje</option>
                <option value="Težko">Težko</option>
              </select>
            </label>
            <div className="polje-kategorij" ref={kategorijeRef}>
              <span className="naslov-polja-kategorij">Kategorije <small>Izbereš lahko več možnosti</small></span>
              <button
                className={`sprozilnik-kategorij ${meniKategorijOdprt ? "odprt" : ""}`}
                type="button"
                aria-haspopup="dialog"
                aria-expanded={meniKategorijOdprt}
                aria-controls="meni-kategorij"
                onClick={() => setMeniKategorijOdprt((odprto) => !odprto)}
              >
                <span className={izbraneKategorije.length ? "povzetek-kategorij izbran" : "povzetek-kategorij"}>
                  {izbraneKategorije.length === 0
                    ? "Izberi kategorije"
                    : izbraneKategorije.length === 1
                      ? izbraneKategorije[0]
                      : `${izbraneKategorije[0]} + še ${izbraneKategorije.length - 1}`}
                </span>
                <span className="puščica-kategorij" aria-hidden="true">⌄</span>
              </button>
              {meniKategorijOdprt && (
                <div className="meni-kategorij" id="meni-kategorij" role="dialog" aria-label="Izbira kategorij">
                  <div className="glava-menija-kategorij">
                    <span>Izberi kategorije</span>
                    {izbraneKategorije.length > 0 && <button type="button" onClick={() => setRecept((trenutni) => ({ ...trenutni, kategorije: "" }))}>Počisti izbor</button>}
                  </div>
                  <div className="moznosti-kategorij">
                    {[...stareKategorije, ...kategorije].map((kategorija) => (
                      <label className="vrstica-kategorije" key={kategorija}>
                        <input
                          type="checkbox"
                          checked={izbraneKategorije.some((izbrana) => kljucKategorije(izbrana) === kljucKategorije(kategorija))}
                          onChange={(event) => spremeniKategorijo(kategorija, event.target.checked)}
                        />
                        <span>{kategorija}{stareKategorije.includes(kategorija) ? " (obstoječa)" : ""}</span>
                      </label>
                    ))}
                  </div>
                  <div className="noga-menija-kategorij">
                    <span>{izbraneKategorije.length} izbranih</span>
                    <button className="glavni-gumb" type="button" onClick={() => setMeniKategorijOdprt(false)}>Končano</button>
                  </div>
                </div>
              )}
            </div>
            <label>
              Vrsta obroka
              <select name="vrstaObroka" value={recept.vrstaObroka} onChange={spremeniPolje}>
                <option value="">Izberi vrsto obroka</option>
                {recept.vrstaObroka && !recept.vrstaObroka.toLocaleLowerCase("sl-SI").startsWith("brunch") && !vrsteObroka.some((vrsta) => normalizirajVrstoObroka(vrsta).toLocaleLowerCase("sl-SI") === normalizirajVrstoObroka(recept.vrstaObroka).toLocaleLowerCase("sl-SI")) && <option value={recept.vrstaObroka}>{normalizirajVrstoObroka(recept.vrstaObroka)} (obstoječa)</option>}
                {vrsteObroka.map((vrsta) => {
                  const staraVrednost = recept.vrstaObroka && normalizirajVrstoObroka(recept.vrstaObroka).toLocaleLowerCase("sl-SI") === normalizirajVrstoObroka(vrsta).toLocaleLowerCase("sl-SI") ? recept.vrstaObroka : vrsta;
                  return <option key={vrsta} value={staraVrednost}>{vrsta}</option>;
                })}
              </select>
            </label>
          </div>

          {napaka && <p className="napaka" role="alert">{napaka}</p>}

          <div className="gumbi gumbi-obrazca">
            <button className="glavni-gumb" type="submit" disabled={nalaganjeSlike}>
              {nalaganjeSlike ? "Nalaganje slike …" : urejanjeId ? "Shrani spremembe" : "Dodaj recept"}
            </button>
            {urejanjeId && <button className="stranski-gumb" type="button" onClick={prekliciUrejanje}>Prekliči</button>}
          </div>
        </form>
      </section>
      </>}

      <section className="seznam">
        {/* seznam receptov na strani vsi recepti so nad njim filtri. */}
        <div className="naslov-seznama">
          <h2>{aktivnaStran === "dodaj" ? "Nedavno dodani" : "Vsi recepti"}</h2>
          <span>{prikazaniRecepti.length}</span>
        </div>

        {aktivnaStran === "vsi" && (
            <>
            <div className="iskalnik-receptov">
              <input
                  type="search"
                  placeholder="Išči recept po imenu ..."
                  value={iskanje}
                  onChange={(event) => setIskanje(event.target.value)}
              />
            </div>

            <div className="filtri-receptov" aria-label="Filtri receptov">
            <label>
              Zahtevnost
              <select value={filtri.zahtevnost} onChange={(event) => setFiltri((trenutni) => ({ ...trenutni, zahtevnost: event.target.value }))}>
                <option value="">Vse zahtevnosti</option>
                {vseZahtevnosti.map((zahtevnost) => <option key={zahtevnost} value={zahtevnost}>{zahtevnost}</option>)}
              </select>
            </label>
            <label>
              Kategorija
              <select value={filtri.kategorija} onChange={(event) => setFiltri((trenutni) => ({ ...trenutni, kategorija: event.target.value }))}>
                <option value="">Vse kategorije</option>
                {vseKategorije.map((kategorija) => <option key={kategorija} value={kategorija}>{kategorija}</option>)}
              </select>
            </label>
            <label>
              Vrsta obroka
              <select value={filtri.vrstaObroka} onChange={(event) => setFiltri((trenutni) => ({ ...trenutni, vrstaObroka: event.target.value }))}>
                <option value="">Vse vrste obroka</option>
                {vseVrsteObrokov.map((vrsta) => <option key={vrsta} value={vrsta}>{vrsta}</option>)}
              </select>
            </label>
              {(filtri.zahtevnost || filtri.kategorija || filtri.vrstaObroka || iskanje) && (
                  <button
                      className="ponastavi-filtre"
                      type="button"
                      onClick={() => {
                        setFiltri({
                          zahtevnost: "",
                          kategorija: "",
                          vrstaObroka: "",
                        });
                        setIskanje("");
                      }}
                  >
                    Počisti filtre
                  </button>
              )}
          </div></>
        )}

        {napaka && <p className="napaka" role="alert">{napaka}</p>}
        {nalaganje && <p>Nalagam recepte …</p>}
        {!nalaganje && recepti.length === 0 && <div className="prazno"><p>Za zdaj še ni receptov.</p>{aktivnaStran === "vsi" && <button className="glavni-gumb" type="button" onClick={() => setAktivnaStran("dodaj")}>Dodaj prvi recept</button>}</div>}
        {!nalaganje && recepti.length > 0 && aktivnaStran === "vsi" && prikazaniRecepti.length === 0 && <p className="prazno">Za izbrane filtre ni receptov. Poskusi z drugačno kombinacijo.</p>}

        <div className="mreza">
          {prikazaniRecepti.map((item) => {
            return (
              <article className="kartica recept-kartica" key={item.id}>
                <h3>{item.ime}</h3>
                <div className="okvir-slike">
                  {item.slika
                    ? <img className="slika-recepta" src={item.slika} alt={`Slika jedi: ${item.ime}`} />
                    : <div className="brez-slike">Slika ni dodana</div>}
                </div>
                <p className="opis-recepta">{item.opis || "Kratek opis ni dodan."}</p>
                <p className="meta">
                  {item.casPriprave} min · {item.stPorcij || "—"} porcij · {normalizirajZahtevnost(item.zahtevnost || "Zahtevnost ni določena")}
                  {item.kategorije && ` · ${item.kategorije}`}
                  {item.vrstaObroka && ` · ${item.vrstaObroka}`}
                </p>

                <button className="vec-gumb" type="button" onClick={() => odpriRecept(item)}>Več</button>

                <div className="gumbi gumbi-kartice">
                  <button className="stranski-gumb" type="button" onClick={() => zacniUrejanje(item)}>Uredi</button>
                  <button className="brisanje-gumb" type="button" onClick={() => izbrisiRecept(item.id)}>Izbriši</button>
                </div>
              </article>
            );
          })}
        </div>
      </section>
      </>
      )}
    </main>
    </div>
  );
}

export default App;
