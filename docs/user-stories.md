
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
