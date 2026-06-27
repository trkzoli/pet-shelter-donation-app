# Pawner


## Projekt rövid leírása
A Pawner egy mobilalkalmazás, amelynek célja az állatmenhelyek támogatása adománygyűjtés révén, valamint az, hogy segítse az állatok örökbefogadását. Az alkalmazás lehetőséget biztosít arra, hogy a felhasználók érzelmi kapcsolatot alakítsanak ki a menhelyi kutyákkal, miközben virtuálisan gondozhatják őket és figyelemmel kísérhetik állapotukat.

## Célok
- **Adománygyűjtés támogatása:** Hatékony módszerrel segíteni a menhelyeknek az adományozási folyamatot.
- **Virtuális örökbefogadás és gondozás:** A felhasználók virtuálisan gondozhatják a kutyákat, és követhetik egészségüket.
- **Érzelmi kötődés kialakítása:** A felhasználók kapcsolatot építhetnek ki a támogatott állatokkal.

Technikai megvalósítás
- **Frontend:** *React Native*
- **Backend:** *Node.js*
- **Adatbázis:** *PostgreSQL* 

Link a Figma design projekthez:
- https://www.figma.com/design/BlR0PvuFG8RdR7Q0n1GORH/%C3%81llamvizsga?t=JZjy1tmAypefyxwK-1


## Telepítés és futtatás

A projekt két részből áll: egy **backend** (NestJS) és egy **frontend** (Expo / React Native mobilalkalmazás). Mindkettőt külön kell elindítani.

### Előfeltételek

- **Node.js** és **npm**
- **PostgreSQL** helyileg telepítve és futó állapotban
- **Android eszköz vagy emulátor** — az alkalmazás natív modulokat használ, ezért **Expo Go nem elegendő**, fejlesztői buildet (development build) kell telepíteni
- Külső szolgáltatások ingyenes fiókjai (`.env` szekció):
  - **Stripe** (fizetés, teszt kulcsokkal)
  - **Cloudinary** (kép- és dokumentumfeltöltés)
  - **Gmail** fiók *app password*-del (email küldés)

> Megjegyzés: a telefonnak és a számítógépnek **ugyanazon a Wi-Fi hálózaton** kell lennie, mivel a mobilalkalmazás a számítógép helyi IP-címén keresztül éri el a backendet.


### 1. Backend beállítása és indítása

1. Hozd létre a `.env` fájlt a `backend` mappában a `.env.example` sablon alapján.

2. Töltsd ki a `.env` értékeit (adatbázis-jelszó, JWT titok, Stripe / Cloudinary / Gmail kulcsok). A részletes leírás az egyes változóknál a `.env.example` fájlban található.

3. Hozz létre egy üres PostgreSQL adatbázist a `.env`-ben megadott névvel (alapértelmezetten `pawner_db`). A táblákat az alkalmazás automatikusan létrehozza induláskor.

4. Telepítsd a függőségeket és indítsd el a backendet (alapértelmezetten a **3000**-es porton fut):

   ```bash
   cd backend
   npm install
   npm run start:dev
   ```


### 2. Frontend beállítása és indítása

1. **Állítsd be a backend címét.** Nyisd meg a `frontend/constants/index.ts` fájlt, és cseréld le az `API_BASE_URL` értékét a saját géped helyi IPv4-címére:

   ```ts
   export const API_BASE_URL = 'http://YOUR_LOCAL_IP:3000'; 
   ```

2. Telepítsd és indítsd el a fejlesztői buildet:

   ```bash
   cd frontend
   npm install
   npx expo run:android
   ```


> Fontos: ha a géped IP-címe megváltozik, frissítsd az `API_BASE_URL` értékét.

### Környezeti változók (.env)

A backend minden beállítása a `backend/.env` fájlból jön, amely **nincs verziókezelve**. A `backend/.env.example` sablon a legtöbb értéket már működő alapértelmezéssel tartalmazza (portok, JWT-titok demóhoz, limitek stb.), ezeket **nem kell** módosítani.

**Csak az alábbi, saját fiókhoz kötött értékeket kell kitölteni** a `.env` fájlban:

- **Adatbázis:** `DB_PASSWORD` (a helyi PostgreSQL jelszava); ha nem a `postgres` felhasználót használod, akkor `DB_USERNAME` is
- **Stripe:** `STRIPE_SECRET_KEY`, `STRIPE_PUBLISHABLE_KEY` (teszt kulcsok a Stripe Dashboardról)
- **Cloudinary:** `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`
- **Email (Gmail):** `MAIL_USER`, `MAIL_PASSWORD` (Gmail *app password*, nem a normál jelszó), `MAIL_FROM`


> Fejlesztés alatt: *Török Zoltán*