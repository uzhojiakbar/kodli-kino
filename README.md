# 🎬 Kodli Kino Bot - Professional Edition

Modern va professional struktura bilan qurilgan Telegram kino va serial bot. Bu bot foydalanuvchilarga kino kodlari orqali filmlar va seriallar yuboradi hamda to'liq admin paneli bilan boshqariladi.

## 📋 Loyiha Haqida

**Kodli Kino Bot** - bu Telegram botida foydalanuvchilarga kino va serial kodlari orqali videolar yuboruvchi va admin paneli bilan to'liq boshqariladigan professional system. Bot SQLite3 ma'lumotlar bazasi bilan ishlaydi va foydalanuvchilardan majburiy kanalga obuna bo'lishni talab qiladi.

### ✨ Asosiy Xususiyatlar

- 🎥 **Kino Boshqaruvi** - Kinolarni kod orqali yuborish va boshqarish
- 📺 **Serial Boshqaruvi** - Seriallarni va qismlarni to'liq boshqarish
- 👥 **Foydalanuvchi Boshqaruvi** - Avtomatik ro'yxatga olish va statistika
- 🔐 **Admin Paneli** - To'liq admin boshqaruv paneli
- 📢 **Majburiy Obuna** - Kanalga obuna bo'lish talab qilish
- 📊 **Real-time Statistika** - To'liq hisobotlar va tahlil
- 📨 **Ommaviy Xabar** - Barcha foydalanuvchilarga xabar yuborish
- 🏗️ **Professional Struktura** - Modulli va kengaytiriladigan arxitektura

## 🏗️ Professional Loyiha Tuzilishi

```
kodli-kino/
├── src/                           # Asosiy source kod
│   ├── config/                    # Konfiguratsiya fayllari
│   │   └── env.js                 # Environment sozlamalari
│   ├── database/                  # Ma'lumotlar bazasi moduli
│   │   ├── init.js                # Database initializatsiya
│   │   ├── userRepository.js      # User CRUD operatsiyalar
│   │   ├── filmRepository.js      # Film CRUD operatsiyalar
│   │   ├── serialRepository.js    # Serial CRUD operatsiyalar
│   │   ├── adminRepository.js     # Admin CRUD operatsiyalar
│   │   └── channelRepository.js   # Channel CRUD operatsiyalar
│   ├── handlers/                  # Event handlerlar
│   │   ├── messageHandler.js      # Message handler
│   │   ├── callbackHandler.js     # Callback query handler
│   │   └── callbacks/             # Callback modullari
│   │       ├── filmCallbacks.js   # Film callback handlers
│   │       ├── serialCallbacks.js # Serial callback handlers
│   │       ├── adminCallbacks.js  # Admin callback handlers
│   │       ├── channelCallbacks.js# Channel callback handlers
│   │       ├── statsCallbacks.js  # Statistika callback handlers
│   │       └── broadcastCallbacks.js # Broadcast callback handlers
│   ├── services/                  # Business logic
│   │   ├── contentService.js      # Kontent yuborish xizmati
│   │   └── adminService.js        # Admin xizmatlari
│   ├── middlewares/               # Middleware funksiyalar
│   │   └── subscribeCheck.js      # Obuna tekshirish middleware
│   └── index.js                   # Entry point
├── .env                           # Environment o'zgaruvchilar
├── .gitignore                     # Git ignore sozlamalari
├── package.json                   # NPM konfiguratsiya
├── README.md                      # Dokumentatsiya
└── bot.db                         # SQLite3 database
```

### � Modullar va Vazifalar

#### **config/** - Konfiguratsiya
- `env.js` - Environment o'zgaruvchilarni boshqarish

#### **database/** - Ma'lumotlar Bazasi
- `init.js` - Bazani ishga tushirish va jadvallar yaratish
- `*Repository.js` - Har bir entity uchun CRUD operatsiyalar

#### **handlers/** - Event Handlerlar
- `messageHandler.js` - Barcha xabarlarni boshqarish
- `callbackHandler.js` - Callback querylarni marshrutlash
- `callbacks/` - Har bir funksiya uchun alohida callback handler

#### **services/** - Business Logic
- `contentService.js` - Kino/serial yuborish logikasi
- `adminService.js` - Statistika va broadcast xizmatlari

#### **middlewares/** - Middleware
- `subscribeCheck.js` - Obuna tekshirish middleware

## 🛠️ Texnologiyalar

- **Node.js** - Backend muhit
- **node-telegram-bot-api** - Telegram Bot API
- **SQLite3** - Ma'lumotlar bazasi
- **dotenv** - Environment o'zgaruvchilar

**Eslatma**: Loyihada Mongoose ham o'rnatilgan lekin ishlatilmaydi. Barcha ma'lumotlar SQLite3 orqali boshqariladi.

## ⚙️ O'rnatish va Sozlash

### 1. Loyihani Klonlash

```bash
git clone <repository-url>
cd kodli-kino
```

### 2. Bog'liqliklarni O'rnatish

```bash
npm install
```

### 3. Environment O'zgaruvchilarni Sozlash

`.env` faylini yarating va quyidagi ma'lumotlarni to'ldiring:

```bash
# Telegram Bot Token (BotFather dan olinadi)
TELEGRAM_BOT_TOKEN=your_bot_token_here

# Ma'lumotlar bazasi fayl yo'li
dbPath=./bot.db

# Telegram kanal ID (videolar yuklash uchun)
TELEGRAM_CHANNEL_ID=@your_channel_username
```

### 4. Botni Ishga Tushirish

```bash
# Production uchun
npm start

# Development uchun (nodemon bilan)
npm run dev
```

## 📊 Ma'lumotlar Bazasi Tuzilishi

Bot SQLite3 ma'lumotlar bazasidan foydalanadi:

### `users` - Foydalanuvchilar
```sql
CREATE TABLE users (
  id INTEGER PRIMARY KEY,
  userId TEXT UNIQUE,
  joinedAt TEXT DEFAULT CURRENT_TIMESTAMP
);
```

### `films` - Kinolar
```sql
CREATE TABLE films (
  id INTEGER PRIMARY KEY,
  code INTEGER UNIQUE,
  postId TEXT UNIQUE,
  videoHash TEXT NOT NULL,
  count INTEGER DEFAULT 0
);
```

### `serials` - Seriallar
```sql
CREATE TABLE serials (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  code INTEGER UNIQUE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  createdAt TEXT DEFAULT CURRENT_TIMESTAMP
);
```

### `serial_episodes` - Serial Qismlari
```sql
CREATE TABLE serial_episodes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  serialCode INTEGER NOT NULL,
  episodeNumber INTEGER NOT NULL,
  postId TEXT UNIQUE,
  videoHash TEXT NOT NULL,
  count INTEGER DEFAULT 0,
  FOREIGN KEY (serialCode) REFERENCES serials(code)
);
```

### `admins` - Adminlar
```sql
CREATE TABLE admins (
  adminId TEXT UNIQUE NOT NULL PRIMARY KEY
);
```

### `MajburiyKanal` - Majburiy Kanallar
```sql
CREATE TABLE MajburiyKanal (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT UNIQUE NOT NULL,
  name TEXT UNIQUE NOT NULL
);
```

## 🎯 Bot Funksiyalari

### Foydalanuvchi Uchun:
- **Kino Qidirish**: Raqamli kod kiritish orqali film olish
- **Serial Qidirish**: Serial kodi orqali barcha qismlarni ko'rish
- **Obuna Tekshirish**: Majburiy kanallarga obuna bo'lish

### Admin Uchun:

#### 🎬 Kino Boshqaruvi
- Yangi kino qo'shish
- Kino o'chirish (`/delFilm <code>`)
- Kino qidirish

#### 📺 Serial Boshqaruvi
- Serial qo'shish (`/addSerial Nomi | Ma'lumot`)
- Qism qo'shish (`/addEpisode <serial_kodi>`)
- Seriallar ro'yxati
- Serial o'chirish (`/delSerial <code>`)

#### 👥 Admin Boshqaruvi
- Admin qo'shish (`/addAdmin <user_id>`)
- Admin o'chirish (`/delAdmin <user_id>`)
- Adminlar ro'yxati

#### 📢 Kanal Boshqaruvi
- Kanal qo'shish (`/q_kanal @username`)
- Kanal o'chirish
- Kanallar ro'yxati

#### 📊 Statistika
- Kunlik/haftalik/oylik/yillik hisobotlar
- Jami foydalanuvchilar
- Jami kinolar va seriallar
- Serial qismlari statistikasi

#### 📨 Ommaviy Xabar
- Oddiy xabar yuborish
- Forward xabar yuborish

## 🔧 Asosiy Komandalar

### Admin Komandalar:
```bash
/addAdmin <user_id>          # Yangi admin qo'shish
/delAdmin <user_id>       # Admin o'chirish
/q_kanal @username           # Majburiy kanal qo'shish
/delFilm <code>              # Kino o'chirish
/addSerial Nomi | Ma'lumot   # Yangi serial qo'shish
/addEpisode <serial_kodi>    # Serial qismi qo'shish
/delSerial <code>            # Serial o'chirish
```

## 📱 Bot Interfeysi

### Admin Panel:
```
🛠️ Admin panelga xush kelibsiz!
┌─────────────────────────┐
│ 🎬 Kino │ 📺 Serial     │
├─────────────────────────┤
│ 📋 Adminlar │ 📢 Kanallar│
├─────────────────────────┤
│ 📊 Statistika │ ✉️ Habar │
└─────────────────────────┘
```

### Foydalanuvchi Interfeysi:
- Kino/Serial kodi kiritish
- Serial qismlari tugmalari
- Obuna tekshirish
- Majburiy kanallar ro'yxati

## 🚀 Deployment

### Local Server:
```bash
npm start
```

### PM2 bilan:
```bash
pm2 start src/index.js --name "kodli-kino-bot"
pm2 save
pm2 startup
```

### Docker bilan:
```dockerfile
FROM node:18
WORKDIR /app
COPY package*.json ./
RUN npm install --production
COPY . .
EXPOSE 3000
CMD ["npm", "start"]
```

## 🏛️ Arxitektura Prinsiplari

### Clean Architecture
- **Separation of Concerns** - Har bir modul o'z vazifasini bajaradi
- **Dependency Injection** - Modullar bir-biriga bog'liq emas
- **Single Responsibility** - Har bir funksiya bitta vazifani bajaradi

### Design Patterns
- **Repository Pattern** - Ma'lumotlar bazasi bilan ishlash
- **Service Layer** - Business logic ajratilgan
- **Handler Pattern** - Event handlerlar modulli

## 🔒 Xavfsizlik

- Environment o'zgaruvchilar `.env` faylida
- Admin huquqlari bazada saqlanadi
- Video forward himoyasi
- SQL injection himoyasi (parameterized queries)

## 🐛 Debugging

Botda xatoliklarni kuzatish:
```javascript
console.log("User:", userId);
console.error("Xatolik:", error.message);
```

## 📝 Litsenziya

Bu loyiha MIT litsenziyasi ostida tarqatiladi.

## 👨‍💻 Dasturchi

**Murodillayev Hojiakbar**  
Telegram: [@anonim_opisis](https://t.me/anonim_opisis)

## 🤝 Hissa Qo'shish

1. Fork qiling
2. Feature branch yarating (`git checkout -b feature/AmazingFeature`)
3. Commit qiling (`git commit -m 'Add some AmazingFeature'`)
4. Push qiling (`git push origin feature/AmazingFeature`)
5. Pull Request oching

## ❓ FAQ

### Q: Botni qanday ishga tushiraman?
A: `.env` faylini to'ldiring va `npm start` buyrug'ini bajaring.

### Q: Serial funksiyasi qanday ishlaydi?
A: Avval serial qo'shing (`/addSerial`), keyin qismlarni qo'shing (`/addEpisode`).

### Q: Ma'lumotlar bazasi qaerda saqlanadi?
A: `bot.db` fayli loyiha ildizida avtomatik yaratiladi.

### Q: Yangi feature qanday qo'shaman?
A: Tegishli modulga (handlers/services) yangi funksiya qo'shing.

### Q: Eski bot.js dan migration qanday?
A: Yangi struktura to'liq ishlaydi, `.env` ni yangilang va `npm start` bajaring.

---

**Muhim:** Professional struktura kodni oson boshqarish, kengaytirish va debug qilishni ta'minlaydi!
