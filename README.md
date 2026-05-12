# Bartol Barac Smještaji

Web aplikacija za rezervaciju smještaja (apartmani, vile, hoteli).

## Tehnologije

- **Frontend:** React + Vite + Tailwind CSS
- **Backend:** Node.js + Express
- **Baza:** MySQL 8 (Docker)

## Pokretanje

### Preduvjeti
- [Node.js](https://nodejs.org/) (v18+)
- [Docker Desktop](https://www.docker.com/products/docker-desktop/)

### 1. Kloniraj repozitorij
```bash
git clone https://github.com/Bartol0109/bartol-barac-smjestaji.git
cd bartol-barac-smjestaji
```

### 2. Postavi environment varijable za backend
```bash
cp backend/.env.example backend/.env
```
Otvori `backend/.env` i popuni email kredencijale (ostatak radi odmah).

### 3. Pokreni MySQL bazu u Dockeru
```bash
docker compose up -d
```
Baza se automatski inicijalizira sa svim tablicama.

### 4. Pokreni backend
```bash
cd backend
npm install
node server.js
```
Backend radi na **http://localhost:5001**

### 5. Pokreni frontend
```bash
# (u novom terminalu, u root folderu projekta)
npm install
npm run dev
```
Frontend radi na **http://localhost:5173** (ili 5174 ako je 5173 zauzet)

## Portovi

| Servis   | Port |
|----------|------|
| Frontend | 5173 |
| Backend  | 5001 |
| MySQL    | 3307 |
