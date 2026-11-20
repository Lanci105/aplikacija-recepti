# Frontend aplikacije Recepti

Frontend je uporabniški del aplikacije. Narejen je z Reactom, zgrajen z Vite in se z REST API-jem povezuje na Spring Boot backend.

## Datoteke

- `src/App.jsx` vsebuje strani, obrazec za recepte, prikaz kartic ter klice do backenda.
- `src/App.css` določa videz aplikacije, kartic, obrazca in prilagoditev za manjše zaslone.
- `src/main.jsx` zažene React in prikaže komponento `App`.
- `src/index.css` določa osnovne sloge za celotno stran.
- `index.html` vsebuje element `root`, kamor React vstavi aplikacijo.
- `vite.config.js` nastavlja Vite in njegov Reactov vtičnik.
- `eslint.config.js` določa pravila za preverjanje JavaScript kode.
- `package.json` vsebuje seznam ukazov ter knjižnic. Ker je JSON, vanj ni dovoljeno dodajati komentarjev.

## Zagon

V terminalu vstopi v mapo `frontend` in zaženi:

```sh
npm run dev
```

Za delovanje aplikacije mora biti zagnan tudi backend na naslovu `http://localhost:8081`.

## Ukazi

- `npm run dev` zažene razvojni strežnik.
- `npm run build` pripravi produkcijsko različico v mapi `dist`.
- `npm run lint` preveri kodo z ESLintom.
- `npm run preview` lokalno prikaže zgrajeno različico.
