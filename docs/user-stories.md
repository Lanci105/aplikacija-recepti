
# US-01: Iskanje receptov po imenu

**ID:** US-01  
**Odgovorni član:** Nejc

## Uporabniška zgodba

Kot uporabnik želim iskati recepte po njihovem imenu, da lahko najdem recept, ki ga želim pripraviti.

## Sprejemni kriteriji (Acceptance Criteria)

### 1. Uspešno iskanje

- **Given:** Uporabnik je na strani »Vsi recepti«.
- **When:** V iskalno polje vnese ime obstoječega recepta.
- **Then:** Sistem prikaže recepte, katerih ime vsebuje vneseni izraz.

### 2. Iskanje neobstoječega recepta

- **Given:** Uporabnik je na strani »Vsi recepti«.
- **When:** V iskalno polje vnese ime recepta, ki ne obstaja.
- **Then:** Sistem prikaže prazen seznam z obvestilom »Ni najdenih receptov«.

### 3. Prazno iskalno polje

- **Given:** Uporabnik je predhodno iskal recepte.
- **When:** Izbriše vsebino iskalnega polja.
- **Then:** Sistem ponovno prikaže vse razpoložljive recepte.

### 4. Iskanje z velikimi in malimi črkami

- **Given:** Uporabnik je na strani »Vsi recepti«.
- **When:** Vnese ime recepta z drugačno kombinacijo velikih in malih črk.
- **Then:** Sistem prikaže ustrezne rezultate ne glede na velikost črk.

## Podrobnosti implementacije

- Na strani »Vsi recepti« je prikazano iskalno polje.
- Uporabnik lahko išče recepte glede na njihovo ime.
- Rezultati se posodabljajo ob vnosu besedila.
- Iskanje ne razlikuje med velikimi in malimi črkami.
- Če ni zadetkov, se prikaže obvestilo »Ni najdenih receptov«.

## GitHub – nalogi 

| ID | Naziv naloge | Opis | Odgovorni |
|---|---|---|---|
| TASK-01 | Izdelava iskalnega polja | Dodajanje iskalnega polja na stran »Vsi recepti«. | Nejc |
| TASK-02 | Implementacija iskanja | Omogočanje iskanja receptov po imenu in prikaz ustreznih rezultatov. | Nejc |

---

# US-02: Registracija uporabnika

**ID:** US-02
**Odgovorni član:** Lana Horvat

## Uporabniška zgodba

Kot obiskovalka želim ustvariti uporabniški račun, da lahko uporabljam funkcionalnosti, ki so na voljo prijavljenim uporabnikom.

## Sprejemni kriteriji (Acceptance Criteria)

### 1. Uspešna registracija

- **Given:** Obiskovalka je na strani za registracijo in vnese veljavno ime, e-poštni naslov ter geslo in potrditev gesla se ujemata.
- **When:** Izbere možnost »Registracija«.
- **Then:** Sistem ustvari račun in prikaže potrditev, da se lahko uporabnica prijavi.

### 2. Neveljavni ali manjkajoči podatki

- **Given:** Obiskovalka je na strani za registracijo.
- **When:** Pusti obvezno polje prazno, vnese neveljaven e-poštni naslov ali vnese gesli, ki se ne ujemata, in odda obrazec.
- **Then:** Sistem prikaže ustrezno sporočilo pri neveljavnem polju in računa ne ustvari.

### 3. E-poštni naslov je že uporabljen

- **Given:** V sistemu že obstaja račun z vnesenim e-poštnim naslovom.
- **When:** Obiskovalka odda registracijski obrazec s tem naslovom.
- **Then:** Sistem prikaže sporočilo, da je naslov že uporabljen, in novega računa ne ustvari.

## Podrobnosti implementacije

- V Reactovem uporabniškem vmesniku bo stran z obrazcem za registracijo.
- Obrazec bo vseboval ime, e-poštni naslov, geslo in potrditev gesla.
- Backend v Spring Bootu bo preveril obvezna polja, obliko e-poštnega naslova, ujemanje gesel in enoličnost e-poštnega naslova.
- Uporabniški račun bo shranjen v PostgreSQL tabeli za uporabnike. Geslo bo shranjeno kot varna zgoščena vrednost, ne kot navadno besedilo.
- Po uspešni registraciji bo uporabnica preusmerjena na prijavo.

## GitHub – nalogi

| ID | Naziv naloge | Opis | Odgovorni |
|---|---|---|---|
| TASK-03 | Registracijski obrazec | Izdelava Reactovega obrazca za ime, e-poštni naslov, geslo in potrditev gesla ter prikaz napak pri vnosu. | Lana Horvat |
| TASK-04 | Registracija v zaledju | Izdelava registracijskega API-ja, preverjanje podatkov in shranjevanje novega uporabnika v PostgreSQL. | Lana Horvat |

## INVEST

Zgodba je vrednostna za obiskovalko, omejena na ustvarjanje računa, ocenljiva in preverljiva z navedenimi kriteriji. Lahko se razvija ločeno od prijave; podrobnosti preverjanja in shranjevanja se lahko dogovorijo med implementacijo.

---

# US-03: Prijava uporabnika

**ID:** US-03
**Odgovorni član:** Lana Horvat

## Uporabniška zgodba

Kot registrirana uporabnica se želim prijaviti v svoj račun, da lahko dostopam do funkcionalnosti za prijavljene uporabnike.

## Sprejemni kriteriji (Acceptance Criteria)

### 1. Uspešna prijava

- **Given:** Uporabnica ima ustvarjen račun in je na strani za prijavo.
- **When:** Vnese pravilen e-poštni naslov in geslo ter izbere »Prijava«.
- **Then:** Sistem jo prijavi in prikaže stran z recepti oziroma stran, ki jo je želela odpreti.

### 2. Nepravilni podatki za prijavo

- **Given:** Uporabnica je na strani za prijavo.
- **When:** Vnese napačen e-poštni naslov ali geslo in odda obrazec.
- **Then:** Sistem je ne prijavi in prikaže sporočilo, da podatki za prijavo niso pravilni.

### 3. Manjkajoči podatki

- **Given:** Uporabnica je na strani za prijavo.
- **When:** Pusti e-poštni naslov ali geslo prazno in odda obrazec.
- **Then:** Sistem označi manjkajoče polje in uporabnice ne prijavi.

## Podrobnosti implementacije

- V Reactovem uporabniškem vmesniku bo stran z obrazcem za e-poštni naslov in geslo.
- Backend v Spring Bootu bo preveril podatke za prijavo in primerjal geslo z varno zgoščeno vrednostjo, shranjeno za uporabniški račun.
- Po uspešni prijavi bo aplikacija vzpostavila prijavljeno uporabniško sejo, ki jo bodo lahko uporabljale zaščitene funkcionalnosti.
- Sporočilo za napačen e-poštni naslov in napačno geslo bo enako, da sistem ne razkriva, ali račun s tem naslovom obstaja.

## GitHub – nalogi

| ID | Naziv naloge | Opis | Odgovorni |
|---|---|---|---|
| TASK-05 | Prijavni obrazec | Izdelava Reactovega obrazca za e-poštni naslov in geslo ter prikaz napak pri manjkajočih podatkih. | Lana Horvat |
| TASK-06 | Prijava v zaledju | Preverjanje uporabniških podatkov, vzpostavitev prijavljene seje in obravnava neuspešne prijave. | Lana Horvat |

## INVEST

Zgodba je vrednostna, omejena na prijavo obstoječe uporabnice, ocenljiva in preverljiva z navedenimi kriteriji. Od registracije je ločena: prijavo je mogoče razviti in preverjati z že obstoječim testnim računom.
