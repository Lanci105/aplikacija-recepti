
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

---

# US-04: Urejanje uporabniškega profila

**ID:** US-04
**Odgovorni član:** Ivona Duraković Djordjević

## Uporabniška zgodba

Kot prijavljena uporabnica želim urediti ime in e-poštni naslov svojega profila, da so podatki v računu pravilni.

## Sprejemni kriteriji (Acceptance Criteria)

### 1. Uspešna sprememba podatkov

- **Given:** Uporabnica je prijavljena in odprla zavihek »Moj profil«.
- **When:** Vnese veljavno ime in e-poštni naslov ter shrani spremembe.
- **Then:** Sistem shrani podatke in na profilu prikaže posodobljeno ime ter e-poštni naslov.

### 2. Neveljaven e-poštni naslov

- **Given:** Uporabnica ureja svoj profil.
- **When:** Vnese e-poštni naslov v neveljavni obliki in shrani spremembe.
- **Then:** Sistem prikaže sporočilo o neveljavnem naslovu in podatkov ne spremeni.

### 3. E-poštni naslov je že zaseden

- **Given:** Drug račun že uporablja vneseni e-poštni naslov.
- **When:** Uporabnica shrani spremembo profila s tem naslovom.
- **Then:** Sistem prikaže sporočilo, da je naslov že zaseden, in obdrži obstoječe podatke.

### 4. Sprememba gesla

- **Given:** Uporabnica je v obrazcu za urejanje profila izbrala tudi spremembo gesla.
- **When:** Vnese pravilno trenutno geslo in veljavno novo geslo.
- **Then:** Sistem shrani novo geslo; če je trenutno geslo napačno, spremembe gesla ne shrani in prikaže napako.

## Podrobnosti implementacije

- V navigaciji je zavihek »Moj profil«, ki je viden prijavljenemu uporabniku.
- Profilni zaslon prikaže ime in e-pošto ter odpre obrazec za urejanje.
- Frontend pošlje spremembe v zaledje; prijava se preveri prek uporabniške seje.
- Backend preveri obvezne podatke, obliko in enoličnost e-pošte.
- Sprememba gesla je neobvezna; ob spremembi se zahteva trenutno geslo, novo geslo pa se shrani v zgoščeni obliki.

## GitHub – nalogi

| ID | Naziv naloge | Opis | Odgovorni |
|---|---|---|---|
| TASK-07 | Profilni zavihek in obrazec | Prikaz profila ter obrazca za spremembo imena, e-pošte in neobvezno gesla. | Ivona Duraković Djordjević |
| TASK-08 | Shranjevanje sprememb profila | Preverjanje prijave, veljavnosti in enoličnosti podatkov ter shranjevanje posodobljenega profila. | Ivona Duraković Djordjević |

---

# US-05: Dodajanje in brisanje komentarja

**ID:** US-05
**Odgovorni član:** Ivona Duraković Djordjević

## Uporabniška zgodba

Kot prijavljena uporabnica želim dodati komentar k receptu in po potrebi izbrisati svoj komentar, da lahko delim svoje izkušnje in popravim lastno objavo.

## Sprejemni kriteriji (Acceptance Criteria)

### 1. Uspešna objava komentarja

- **Given:** Uporabnica je prijavljena in si ogleduje recept.
- **When:** Vnese komentar z besedilom in ga objavi.
- **Then:** Sistem shrani komentar ter ga prikaže pri receptu z imenom avtorice in datumom objave.

### 2. Prazno ali predolgo besedilo

- **Given:** Uporabnica je odprla obrazec za komentar.
- **When:** Odda prazen komentar ali besedilo, daljše od 1500 znakov.
- **Then:** Sistem komentarja ne shrani in prikaže ustrezno napako.

### 3. Uspešen izbris lastnega komentarja

- **Given:** Prijavljena uporabnica je avtorica prikazanega komentarja.
- **When:** Izbere »Izbriši komentar« in potrdi izbris.
- **Then:** Sistem izbriše komentar in ga odstrani s seznama pri receptu.

### 4. Poskus izbrisa tujega komentarja

- **Given:** Prijavljena uporabnica ni avtorica komentarja.
- **When:** Poskusi izbrisati ta komentar.
- **Then:** Sistem izbrisa ne dovoli in komentar ostane prikazan.

## Podrobnosti implementacije

- Komentar vsebuje besedilo, avtorja, recept in čas objave.
- Za dodajanje in brisanje komentarja mora biti uporabnik prijavljen.
- Obrazec in seznam komentarjev sta na strani podrobnosti recepta.
- Backend preveri, da je uporabnik ob brisanju avtor komentarja.
- Pri brisanju recepta se odstranijo tudi njegovi komentarji.

## GitHub – nalogi

| ID | Naziv naloge | Opis | Odgovorni |
|---|---|---|---|
| TASK-09 | Obrazec in prikaz komentarjev | Dodajanje komentarja na strani recepta ter prikaz avtorja, datuma in besedila. | Ivona Duraković Djordjević |
| TASK-10 | Brisanje lastnega komentarja | Omogočanje izbrisa komentarja avtorju ter zavrnitev izbrisa komentarjev drugih uporabnikov. | Ivona Duraković Djordjević |

---

# US-06: Ocenjevanje recepta

**ID:** US-06
**Odgovorni član:** Ivona Duraković Djordjević

## Uporabniška zgodba

Kot prijavljen uporabnik želim oceniti recept z lestvico od 1 do 5 zvezdic, kjer je 1 najnižja in 5 najvišja ocena, da lahko izrazim svoje mnenje in pomagam drugim pri izbiri jedi.

## Sprejemni kriteriji (Acceptance Criteria)

### 1. Uspešna ocena

- **Given:** Uporabnik je prijavljen in si ogleduje recept.
- **When:** Izbere oceno od 1 do 5 zvezdic (1 je najnižja, 5 najvišja) in objavi obrazec.
- **Then:** Sistem shrani oceno in jo prikaže ob njegovem komentarju.

### 2. Neveljavna ocena

- **Given:** Uporabnik oddaja oceno recepta.
- **When:** Vnese oceno, nižjo od 1 ali višjo od 5.
- **Then:** Sistem zavrne vnos in ne shrani ocene.

### 3. Prikaz povprečne ocene

- **Given:** Receptu je bila oddana vsaj ena ocena.
- **When:** Uporabnik odpre podrobnosti recepta.
- **Then:** Sistem prikaže povprečje ocen in število oddanih ocen.

### 4. Ocena brez prijave

- **Given:** Obiskovalec ni prijavljen in si ogleduje recept.
- **When:** Želi oddati oceno.
- **Then:** Sistem mu ponudi prijavo in ocene ne shrani.

## Podrobnosti implementacije

- Ocena je celo število od 1 do 5; 1 pomeni najnižjo, 5 pa najvišjo oceno. Shranjena je skupaj s komentarjem uporabnika.
- Backend zavrne oceno izven dovoljenega razpona.
- Frontend prikaže izbrane zvezdice pri vsakem komentarju ter izračunano povprečje in število ocen.
- Povprečje se izračuna iz ocen trenutno prikazanih komentarjev.

## GitHub – nalogi

| ID | Naziv naloge | Opis | Odgovorni |
|---|---|---|---|
| TASK-11 | Izbira ocene | Dodajanje izbire ocene od 1 do 5 v obrazec za komentar in prikaz zvezdic. | Ivona Duraković Djordjević |
| TASK-12 | Preverjanje in prikaz povprečja | Preverjanje dovoljenega razpona ocene ter prikaz povprečne ocene in števila ocen pri receptu. | Ivona Duraković Djordjević |
