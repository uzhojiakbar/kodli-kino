# 🎬 Kodli Kino Bot

Telegram orqali kino kodni berish va foydalanuvchilar bilan ishlash uchun mo'ljallangan bot. Bu bot foydalanuvchilarga kino kodlari orqali filmlar yuboradi va admin paneli orqali to'liq boshqariladi.

## 📋 Loyiha Haqida

**Kodli Kino Bot** - bu Telegram botida foydalanuvchilarga kino kodlari orqali videolar yuboruvchi va admin paneli bilan to'liq boshqariladigan system. Bot SQLite3 ma'lumotlar bazasi bilan ishlaydi va foydalanuvchilardan majburiy kanalga obuna bo'lishni talab qiladi.

### ✨ Asosiy Xususiyatlar

- 🎥 **Kino Kodi Orqali Video Yuborish** - Foydalanuvchilar kino kodini kiritganda mos video yuboriladi
- 👥 **Foydalanuvchi Boshqaruvi** - Avtomatik ro'yxatga olish va statistika
- 🔐 **Admin Paneli** - Kinolar, adminlar, kanallar boshqaruvi
- 📢 **Majburiy Obuna** - Kanalga obuna bo'lish talabi
- 📊 **Statistika** - Real vaqt statistikasi
- 📨 **Ommaviy Xabar** - Barcha foydalanuvchilarga xabar yuborish

## 🏗️ Loyiha Tuzilishi

```
kodli-kino/
├── bot.js                          # Asosiy bot fayli
├── package.json                    # Loyiha bog'liqliklariqni
├── .env                           # Muhim ma'lumotlar (yaratilishi kerak)
├── bot.db                         # SQLite3 ma'lumotlar bazasi
├── env-config.txt                 # Environment o'zgaruvchilar namunasi
└── commands/
    └── SubscribeCheck/
        └── index.js               # Obuna tekshirish funksiyasi
```

### 📋 Fayllar haqida:

- **Ishlatilayotgan fayllar**: `bot.js`, `commands/SubscribeCheck/index.js`, `package.json`
- **Qo'shimcha fayllar**: `bot copy.js` (eski versiya), `models/` (Mongoose modellari - ishlatilmaydi), `commands/adminSend.js`, `commands/sendMessageToAll.js`, `commands/adminpanel/`

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

Bot SQLite3 ma'lumotlar bazasidan foydalanadi va quyidagi jadvallar bilan ishlaydi:

### `users` jadvali

```sql
CREATE TABLE users (
  id INTEGER PRIMARY KEY,
  userId TEXT UNIQUE,
  joinedAt TEXT DEFAULT CURRENT_TIMESTAMP
);
```

### `films` jadvali

```sql
CREATE TABLE films (
  id INTEGER PRIMARY KEY,
  code INTEGER UNIQUE,
  postId TEXT UNIQUE,
  videoHash TEXT NOT NULL,
  count INTEGER DEFAULT 0
);
```

### `admins` jadvali

```sql
CREATE TABLE admins (
  adminId TEXT UNIQUE NOT NULL PRIMARY KEY
);
```

### `MajburiyKanal` jadvali

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
- **Obuna Tekshirish**: Majburiy kanallarga obuna bo'lish

### Admin Uchun:

- **🎬 Kino Boshqaruvi**:
  - Yangi kino qo'shish
  - Kino o'chirish
  - Kino qidirish
- **👥 Admin Boshqaruvi**:
  - Yangi admin qo'shish (`/addAdmin <user_id>`)
  - Admin o'chirish (`/removeAdmin <user_id>`)
  - Adminlar ro'yxati
- **📢 Kanal Boshqaruvi**:
  - Majburiy kanal qo'shish (`/q_kanal @username`)
  - Kanal o'chirish
  - Kanallar ro'yxati
- **📊 Statistika**:
  - Kunlik/haftalik/oylik/yillik foydalanuvchilar
  - Jami kinolar va foydalanuvchilar soni
- **📨 Ommaviy Xabar**:
  - Oddiy xabar yuborish
  - Forward xabar yuborish

**Muhim**: Barcha admin funksiyalar SQLite3 ma'lumotlar bazasi orqali boshqariladi.

## 🔧 Asosiy Komandalar

### Admin Komandalar:

- `/addAdmin <user_id>` - Yangi admin qo'shish
- `/removeAdmin <user_id>` - Admin o'chirish
- `/q_kanal @username` - Majburiy kanal qo'shish
- `/delFilm <code>` - Kino o'chirish

## 📱 Bot Interfeysi

Bot inline keyboard tugmalari orqali boshqariladi:

### Admin Panel:

```
🛠️ Admin panelga xush kelibsiz!
┌─────────────────┐
│ 🎬 Kino         │
├─────────────────┤
│ 📋 Adminlar │ 📢 Kanallar │
├─────────────────┤
│ 📊 Statistika │ ✉️ Habar yuborish │
└─────────────────┘
```

### Foydalanuvchi Interfeysi:

- Kino kodi kiritish
- Obuna tekshirish tugmasi
- Majburiy kanallar ro'yxati

## 🚀 Deployment

### Local Server:

```bash
npm start
```

### PM2 bilan:

```bash
pm2 start bot.js --name "kodli-kino-bot"
pm2 save
pm2 startup
```

### Docker bilan:

```dockerfile
# Dockerfile
FROM node:18
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 3000
CMD ["npm", "start"]
```

## 🔒 Xavfsizlik

- Bot tokeni va boshqa maxfiy ma'lumotlar `.env` faylida saqlanadi
- Admin huquqlari faqat tasdiqlangan foydalanuvchilarga beriladi
- Ma'lumotlar bazasi lokal tarzda saqlanadi
- Video fayllar forward qilish himoyasi bilan yuboriladi

## 🐛 Debugging va Logging

Bot console.log orqali asosiy harakatlarni logga yozadi:

- Foydalanuvchi qo'shilishi
- Admin amallarí
- Xatolik xabarlar
- Obuna tekshirish natijalari

## 📝 Litsenziya

Bu loyiha MIT litsenziyasi ostida tarqatiladi.

## 👨‍💻 Dasturchi

**Murodillayev Hojiakbar**  
Telegram: [@anonim_opisis](https://t.me/anonim_opisis)

## 🤝 Hissa Qo'shish

1. Loyihani fork qiling
2. Yangi branch yarating (`git checkout -b feature/AmazingFeature`)
3. O'zgarishlaringizni commit qiling (`git commit -m 'Add some AmazingFeature'`)
4. Branch'ni push qiling (`git push origin feature/AmazingFeature`)
5. Pull Request oching

## ❓ Savol-Javoblar

### Q: Bot ishlamayapti, nima qilish kerak?

A: Avval `.env` fayl to'g'ri to'ldirilganini tekshiring, keyin `npm install` bajaring.

### Q: Yangi admin qo'sha olmayman?

A: Siz admin ekanligingizni tekshiring va foydalanuvchi ID ni to'g'ri kiritdingizni tasdiqlang. `/addAdmin <user_id>` formatida kiriting.

### Q: Video yuklashda xatolik chiqyapti?

A: `TELEGRAM_CHANNEL_ID` to'g'ri kiritilganini va bot kanal adminı ekanligini tekshiring.

### Q: Ma'lumotlar bazasi o'chib ketdi?

A: `bot.db` fayli mavjudligini tekshiring, agar yo'q bo'lsa avtomatik yaratiladi.

### Q: Mongoose bilan ishlashim kerakmi?

A: Yo'q, bu bot faqat SQLite3 bilan ishlaydi. `models/` papkasidagi fayllar ishlatilmaydi.

---

**Muhim:** Bot ishlatishdan oldin barcha environment o'zgaruvchilarni to'ldiring va botga kerakli ruxsatlarni bering.
