# 🎬 Kodli Kino Bot - Funksiyalar Ro'yxati

> **Professional Telegram Kino va Serial Bot**  
> Dasturchi: Murodillayev Hojiakbar (@anonim_opisis)

---

## 📋 Mundarija

1. [Umumiy Funksiyalar](#-umumiy-funksiyalar)
2. [Foydalanuvchi Funksiyalari](#-foydalanuvchi-funksiyalari)
3. [Admin Funksiyalari](#-admin-funksiyalari)
4. [Kino Boshqaruvi](#-kino-boshqaruvi)
5. [Serial Boshqaruvi](#-serial-boshqaruvi)
6. [Admin Boshqaruvi](#-admin-boshqaruvi)
7. [Kanal Boshqaruvi](#-kanal-boshqaruvi)
8. [Statistika va Hisobotlar](#-statistika-va-hisobotlar)
9. [Ommaviy Xabarlar](#-ommaviy-xabarlar)
10. [Texnik Xususiyatlar](#-texnik-xususiyatlar)

---

## 🌟 Umumiy Funksiyalar

### ✅ Avtomatik Ro'yxatdan O'tish
- Har bir yangi foydalanuvchi avtomatik bazaga qo'shiladi
- User ID va qo'shilgan sana saqlanadi
- Takroriy qo'shilishning oldini olish

### 🔐 Majburiy Obuna Tizimi
- Foydalanuvchilardan kanallarga obuna bo'lishni talab qilish
- Real-time obuna tekshirish
- Inline tugmalar bilan qulay interfeys
- Obuna bo'lgandan keyin avtomatik kirish

### 📊 Ma'lumotlar Bazasi
- **SQLite3** - Tez va ishonchli ma'lumotlar bazasi
- Avtomatik jadvallar yaratish
- Cascade o'chirish (serial o'chirilsa, qismlari ham o'chadi)
- Optimallashtirilgan so'rovlar

### 🔒 Xavfsizlik
- Video himoyasi (protect_content)
- Admin huquqlarini tekshirish
- SQL injection dan himoya
- Environment o'zgaruvchilar himoyasi

---

## 👥 Foydalanuvchi Funksiyalari

### 🎬 Kino Qidirish
```
Funksiya: Code orqali kino topish
Kirish: Raqamli kod (masalan: 1001)
Natija: Video file bilan kino yuboriladi
```

**Xususiyatlar:**
- ✅ Kod orqali tez qidirish
- ✅ Video himoyalangan holda yuboriladi
- ✅ Kino ma'lumotlari (description) bilan
- ✅ Bot reklamasi bilan caption
- ✅ Avtomatik ko'rishlar statistikasi

### 📺 Serial Qidirish
```
Funksiya: Code orqali serial topish
Kirish: Raqamli kod (masalan: 2001)
Natija: Barcha qismlar tugmalari bilan xabar
```

**Xususiyatlar:**
- ✅ Serial ma'lumotlari ko'rsatiladi
- ✅ Har bir qism alohida tugma
- ✅ Qismlar soni ko'rsatiladi
- ✅ Inline tugmalar orqali oson tanlash
- ✅ Har bir qism alohida yuboriladi

### 🎥 Serial Qismlarini Ko'rish
```
Funksiya: Serial qismini ko'rish
Kirish: Qism tugmasini bosish
Natija: Tanlangan qism video bilan yuboriladi
```

**Xususiyatlar:**
- ✅ Video himoyalangan holda
- ✅ Qism raqami ko'rsatiladi
- ✅ Qism captioni (agar mavjud bo'lsa)
- ✅ Avtomatik statistika
- ✅ Bot reklamasi

### 📢 Obuna Tekshirish
```
Funksiya: Majburiy kanallarga obuna tekshirish
Jarayon: 
1. Barcha kanallar ro'yxati ko'rsatiladi
2. Har bir kanal uchun inline tugma
3. "Obunani tekshirish" tugmasi
4. Real-time tekshirish
```

**Xususiyatlar:**
- ✅ Ko'p kanallarni qo'llab-quvvatlash
- ✅ Real-time tekshirish
- ✅ Obuna bo'lmagan kanallar ko'rsatiladi
- ✅ Obuna bo'lgandan keyin avtomatik kirish

---

## 🛠️ Admin Funksiyalari

### 🎛️ Admin Panel
```
Kirish: /start yoki istalgan matn (admin uchun)
Interfeys: 6 ta asosiy bo'lim
```

**Admin Panel Tuzilishi:**
```
🎬 Kino          📺 Serial
👥 Adminlar      📢 Kanallar
📊 Statistika    ✉️ Habar yuborish
```

### ⚡ Tez Komandalar
- `/addAdmin <user_id>` - Yangi admin qo'shish
- `/delAdmin <user_id>` - Admin o'chirish
- `/qkanal @username` - Majburiy kanal qo'shish
- `/delkanal @username` - Kanal o'chirish
- `/cancel` - Jarayonni bekor qilish

---

## 🎬 Kino Boshqaruvi

### ➕ Kino Qo'shish

**Jarayon:**
```
1. "🎬 Kino" → "➕ Kino qo'shish"
2. Code kiriting (masalan: 1001)
3. Video yuboring
4. Caption (ixtiyoriy)
5. ✅ Tayyor!
```

**Xususiyatlar:**
- ✅ Unique code tekshirish
- ✅ Video avtomatik kanalga forward
- ✅ File ID saqlash
- ✅ Caption saqlanadi
- ✅ Bekor qilish imkoniyati

**Texnik Detalllar:**
- Video CHANNEL_ID ga forward qilinadi
- file_id bazada saqlanadi
- postId ham saqlanadi
- Caption description sifatida

### 🗑️ Kino O'chirish

**Jarayon:**
```
1. "🎬 Kino" → "🗑 Kino o'chirish"
2. Code kiriting
3. Tasdiqlash
4. ✅ O'chirildi!
```

**Xususiyatlar:**
- ✅ Code mavjudligini tekshirish
- ✅ Film/Serial farqlash
- ✅ Database dan to'liq o'chirish
- ✅ Tasdiqlash xabari

### 🔄 Code O'zgartirish

**Jarayon:**
```
1. "🎬 Kino" → "🔄 Code o'zgartirish"
2. Eski code kiriting
3. Yangi code kiriting
4. ✅ O'zgartirildi!
```

**Xususiyatlar:**
- ✅ Eski code tekshirish
- ✅ Yangi code band emasligini tekshirish
- ✅ Cascade update
- ✅ Xatolar bilan ishlash

### 📋 Kinolar Ro'yxati

**Funksiya:**
```
"🎬 Kino" → "📋 Kinolar ro'yxati"
```

**Ko'rsatiladigan ma'lumotlar:**
- 🔢 Code
- 📝 Description (qisqartirilgan)
- 📅 Qo'shilgan sana
- 📊 Pagination (10 tadan)

**Xususiyatlar:**
- ✅ Sahifalash (10 ta kino/sahifa)
- ✅ Navigatsiya tugmalari
- ✅ Jami kinolar soni
- ✅ Hozirgi sahifa ko'rsatkich

---

## 📺 Serial Boshqaruvi

### ➕ Serial Qo'shish

**Jarayon:**
```
1. "📺 Serial" → "➕ Serial qo'shish"
2. Code kiriting (masalan: 2001)
3. Videolarni ketma-ket yuboring
4. Har bir qism avtomatik sanaladi
5. "💾 Saqlash" tugmasini bosing
```

**Xususiyatlar:**
- ✅ Batch upload - bir necha qismni ketma-ket yuklash
- ✅ Avtomatik qism raqamlash (1, 2, 3, ...)
- ✅ Har bir qism uchun caption
- ✅ Real-time progress ko'rsatish
- ✅ Istalgan vaqtda saqlash yoki bekor qilish

**Texnik Detalllar:**
- Session-based qism qo'shish
- Har bir video kanalga forward
- Qism raqami avtomatik
- Barcha qismlar bitta serial kodida

### ➕ Mavjud Serialga Qism Qo'shish

**Jarayon:**
```
1. "📺 Serial" → "➕ Qism qo'shish"
2. Serial code kiriting
3. Videolarni ketma-ket yuboring
4. "✅ Tugatish" tugmasini bosing
```

**Xususiyatlar:**
- ✅ Mavjud qismlar sonini ko'rsatish
- ✅ Keyingi qism raqamini avtomatik aniqlash
- ✅ Ko'p qism qo'shish imkoniyati
- ✅ Progress tracking
- ✅ Bekor qilish imkoniyati

**Misol:**
```
Serial Code: 2001
Mavjud qismlar: 15 ta
Keyingi qism: 16
→ 16, 17, 18, ... qismlarni qo'shish
```

### 🗑️ Serial O'chirish

**Jarayon:**
```
1. "📺 Serial" → "🗑 Serial o'chirish"
2. Code kiriting
3. ⚠️ Ogohlantirish (barcha qismlar o'chadi)
4. ✅ O'chirildi!
```

**Xususiyatlar:**
- ✅ Cascade o'chirish (barcha qismlar ham)
- ✅ Qismlar soni ko'rsatiladi
- ✅ Tasdiqlash xabari
- ✅ Film/Serial farqlash

### 🗑️ Bitta Qismni O'chirish

**Jarayon:**
```
1. "📺 Serial" → "🗑 Qism o'chirish"
2. Serial code kiriting
3. Qism raqamini kiriting
4. ✅ O'chirildi!
```

**Xususiyatlar:**
- ✅ Qism mavjudligini tekshirish
- ✅ Qolgan qismlar soni
- ✅ Aniq qismni o'chirish
- ✅ Tasdiqlash xabari

### 🔄 Serial Code O'zgartirish

**Jarayon:**
```
1. "📺 Serial" → "🔄 Code o'zgartirish"
2. Eski code kiriting
3. Yangi code kiriting
4. ✅ O'zgartirildi! (barcha qismlar bilan)
```

**Xususiyatlar:**
- ✅ Cascade update
- ✅ Barcha qismlar yangi codega o'tadi
- ✅ Code band emasligini tekshirish
- ✅ Film/Serial farqlash

### 📋 Seriallar Ro'yxati

**Funksiya:**
```
"📺 Serial" → "📋 Seriallar ro'yxati"
```

**Ko'rsatiladigan ma'lumotlar:**
- 🔢 Code
- 📝 Description (qisqartirilgan)
- 📊 Qismlar soni
- 📅 Qo'shilgan sana
- 📄 Pagination

**Xususiyatlar:**
- ✅ Sahifalash (10 ta serial/sahifa)
- ✅ Har bir serial uchun qismlar soni
- ✅ Navigatsiya tugmalari
- ✅ Jami seriallar soni

---

## 👨‍💼 Admin Boshqaruvi

### ➕ Admin Qo'shish

**Komanda:**
```bash
/addAdmin 123456789
```

**Xususiyatlar:**
- ✅ User ID orqali qo'shish
- ✅ Takroriy qo'shishni oldini olish
- ✅ User ID validatsiya
- ✅ Tasdiqlash xabari

**Xato Xabarlari:**
- ❌ User ID xato formati
- ⚠️ Allaqachon admin

### 🗑️ Admin O'chirish

**Komanda:**
```bash
/delAdmin 123456789
```

**Xususiyatlar:**
- ✅ User ID orqali o'chirish
- ✅ Mavjudligini tekshirish
- ✅ Tasdiqlash xabari

**Xato Xabarlari:**
- ❌ User ID xato formati
- ❌ Bunday admin yo'q

### 📋 Adminlar Ro'yxati

**Funksiya:**
```
Admin Panel → "👥 Adminlar"
```

**Ko'rsatiladigan ma'lumotlar:**
- 👤 Admin User ID
- 📊 Jami adminlar soni
- 🔙 Orqaga qaytish

**Xususiyatlar:**
- ✅ Barcha adminlar ro'yxati
- ✅ Copy qilish mumkin (monospace format)
- ✅ Jami adminlar soni

---

## 📢 Kanal Boshqaruvi

### ➕ Majburiy Kanal Qo'shish

**Komanda:**
```bash
/qkanal @kanalUsername
```

**Xususiyatlar:**
- ✅ Bot kanal adminligini tekshirish
- ✅ Kanal/Guruh farqlash
- ✅ Kanal nomini avtomatik olish
- ✅ Takroriy qo'shishni oldini olish

**Tekshirishlar:**
- ✅ Kanal mavjudmi?
- ✅ Bot admin ekanmi?
- ✅ Kanal yoki guruhmi?
- ✅ Allaqachon qo'shilganmi?

**Xato Xabarlari:**
- ❌ Kanal topilmadi
- ❌ Bot admin emas
- ❌ Bu kanal/guruh emas
- ❌ Allaqachon qo'shilgan

### 🗑️ Kanal O'chirish

**Komanda:**
```bash
/delkanal @kanalUsername
```

**Xususiyatlar:**
- ✅ Username orqali o'chirish
- ✅ Mavjudligini tekshirish
- ✅ Tasdiqlash xabari

### 📋 Kanallar Ro'yxati

**Funksiya:**
```
Admin Panel → "📢 Kanallar"
```

**Ko'rsatiladigan ma'lumotlar:**
- 📢 Kanal nomi
- 🔗 Username
- 📊 Jami kanallar soni
- 🗑️ O'chirish tugmasi

**Xususiyatlar:**
- ✅ Barcha majburiy kanallar
- ✅ Har biri uchun o'chirish tugmasi
- ✅ Inline callback bilan o'chirish
- ✅ Real-time yangilanish

---

## 📊 Statistika va Hisobotlar

### 📈 Umumiy Statistika

**Funksiya:**
```
Admin Panel → "📊 Statistika"
```

**Ko'rsatiladigan ma'lumotlar:**

#### 👥 Foydalanuvchilar
- **Bugun:** Bugun qo'shilgan foydalanuvchilar
- **Shu hafta:** Haftada qo'shilganlar
- **Shu oy:** Oyda qo'shilganlar  
- **Shu yil:** Yilda qo'shilganlar
- **Jami:** Barcha foydalanuvchilar

#### 🎬 Kontent Statistikasi
- **Jami kinolar:** Bazadagi barcha kinolar soni
- **Jami seriallar:** Bazadagi barcha seriallar soni
- **Jami qismlar:** Barcha serial qismlarining umumiy soni

**Xususiyatlar:**
- ✅ Real-time ma'lumotlar
- ✅ Vaqt bo'yicha tahlil
- ✅ Kontent statistikasi
- ✅ Qulay formatda ko'rsatish

**Texnik Detalllar:**
```javascript
// Vaqt davrlari
- Bugun: 00:00:00 dan hozir
- Hafta: Dushanba 00:00:00 dan hozir
- Oy: 1-kun 00:00:00 dan hozir
- Yil: 1-yanvar 00:00:00 dan hozir
```

### 📉 Kontent Statistikasi

**Avtomatik Kuzatish:**
- ✅ Har bir kino/qism yuborilganda count oshadi
- ✅ Ko'rilish statistikasi
- ✅ Ommabop kontent aniqlash (kelajakda)

---

## ✉️ Ommaviy Xabarlar

### 📨 Oddiy Xabar Yuborish

**Funksiya:**
```
Admin Panel → "✉️ Habar yuborish" → "💬 Oddiy xabar"
```

**Jarayon:**
```
1. "💬 Oddiy xabar" tugmasini bosing
2. Xabar yuboring (matn, foto, video, audio, file)
3. Barcha foydalanuvchilarga yuboriladi
```

**Qo'llab-quvvatlanadigan Format:**
- ✅ **Matn** xabarlar
- ✅ **Foto** (caption bilan)
- ✅ **Video** (caption bilan)
- ✅ **Audio** (caption bilan)
- ✅ **Document/File** (caption bilan)
- ✅ HTML formatlash

**Xususiyatlar:**
- ✅ Barcha foydalanuvchilarga
- ✅ Progress tracking
- ✅ Muvaffaqiyat/Xato hisobi
- ✅ Yakuniy hisobot

### 📤 Forward Xabar

**Funksiya:**
```
Admin Panel → "✉️ Habar yuborish" → "📤 Forward xabar"
```

**Jarayon:**
```
1. "📤 Forward xabar" tugmasini bosing
2. Istalgan xabarni forward qiling
3. Barcha foydalanuvchilarga forward bo'ladi
```

**Xususiyatlar:**
- ✅ Original xabar formati saqlanadi
- ✅ Barcha media turlar
- ✅ Xabar metadata saqlanadi
- ✅ Progress tracking

### 📊 Broadcast Hisoboti

**Broadcast Tugagach:**
```
✅ Xabar yuborildi!

━━━━━━━━━━━━━━━━━━━
📊 Natijalar:
━━━━━━━━━━━━━━━━━━━

✅ Muvaffaqiyatli: 1250 ta
❌ Xato: 15 ta
📊 Jami: 1265 ta

━━━━━━━━━━━━━━━━━━━
```

**Xususiyatlar:**
- ✅ Real-time progress
- ✅ Success/Fail hisobi
- ✅ Blocking foydalanuvchilarni hisobga olish
- ✅ Yakuniy hisobot

### ❌ Bekor Qilish

**Funksiya:**
```
Broadcast oynasida "❌ Bekor qilish" tugmasi
```

**Xususiyatlar:**
- ✅ Session tozalanadi
- ✅ Tasdiqlash xabari
- ✅ Admin panelga qaytish

---

## 🔧 Texnik Xususiyatlar

### 🏗️ Arxitektura

**Clean Architecture Prinsipi:**
```
Presentation Layer (Handlers)
    ↓
Business Logic Layer (Services)
    ↓
Data Access Layer (Repositories)
    ↓
Database (SQLite3)
```

### 📦 Modullar

#### **Handlers (Event Handlers)**
- `messageHandler.js` - Barcha xabarlarni boshqarish
- `callbackHandler.js` - Callback querylarni routing
- `callbacks/` - Har bir funksiya uchun alohida handler

#### **Services (Business Logic)**
- `contentService.js` - Kontent yuborish logikasi
- `adminService.js` - Admin xizmatlar (statistika, broadcast)

#### **Repositories (Data Access)**
- `userRepository.js` - Foydalanuvchilar CRUD
- `contentRepository.js` - Kontent va items CRUD
- `adminRepository.js` - Adminlar CRUD
- `channelRepository.js` - Kanallar CRUD

#### **Middlewares**
- `subscribeCheck.js` - Obuna tekshirish middleware

### 🗄️ Ma'lumotlar Bazasi

**Jadvallar:**

```sql
-- Foydalanuvchilar
users (id, userId, joinedAt)

-- Contentlar (film/serial)
contents (id, code, type, description, createdAt)

-- Content items (film videolari, serial qismlari)
content_items (id, contentCode, episodeNumber, postId, 
               videoHash, caption, count)

-- Adminlar
admins (adminId)

-- Majburiy kanallar
MajburiyKanal (id, username, name)
```

**Relationships:**
- `contents` ← `content_items` (CASCADE DELETE)
- Bitta content → Ko'p items
- Film → 1 item, Serial → Ko'p items

### 🔄 Session Boshqaruvi

**Session Types:**
```javascript
// Film sessions
{ action: "add_film", step: "waiting_code/waiting_video", code: 1001 }
{ action: "delete_film" }
{ action: "edit_film_code", step: "waiting_old_code/waiting_new_code" }

// Serial sessions
{ action: "add_serial", step: "waiting_code/waiting_episodes", 
  code: 2001, episodeNumber: 1, episodes: [] }
{ action: "delete_serial" }
{ action: "add_episode", step: "waiting_code/waiting_video" }
{ action: "delete_episode", step: "waiting_code/waiting_episode_number" }

// Broadcast sessions
{ action: "broadcast_normal" }
{ action: "broadcast_forward" }
```

**Session Management:**
- ✅ Map strukturasi (chatId → session)
- ✅ /cancel yoki ❌ tugmasi bilan tozalash
- ✅ Tugagandan keyin avtomatik tozalash
- ✅ Step-by-step jarayon

### 🎨 UI/UX Xususiyatlari

**Inline Keyboard:**
- ✅ Qulay navigatsiya
- ✅ Callback query bilan tez javob
- ✅ Dinamik tugmalar
- ✅ Pagination

**Xabarlar Formati:**
- ✅ Markdown formatlash
- ✅ Emoji ikonlar
- ✅ Strukturalangan ko'rinish
- ✅ Progress barlar

**Xato Xabarlari:**
- ✅ Aniq va tushunarli
- ✅ Yechim taklif qilish
- ✅ Misol ko'rsatish
- ✅ Friendly ton

### ⚡ Performance

**Optimizatsiyalar:**
- ✅ Parameterized queries (SQL injection oldini olish)
- ✅ Index'lar (code, userId)
- ✅ Cascade operations
- ✅ Connection pooling

**Caching:**
- ✅ file_id bazada saqlash (qayta upload yo'q)
- ✅ Session-based temporary storage
- ✅ Minimal database queries

### 🔐 Xavfsizlik

**Video Himoyasi:**
```javascript
protect_content: true  // Forward va download disable
```

**Admin Himoyasi:**
```javascript
await isAdmin(chatId)  // Har bir admin funksiyada
```

**Input Validation:**
- ✅ User ID formatini tekshirish
- ✅ Code raqam ekanligini tekshirish
- ✅ Username formatini tekshirish
- ✅ Code unique ekanligini tekshirish

**Environment Variables:**
```bash
TELEGRAM_BOT_TOKEN=...
TELEGRAM_CHANNEL_ID=...
dbPath=./bot.db
```

### 📝 Logging

**Console Logging:**
```javascript
console.log("Bot faol! 👋")
console.log("Ma'lumotlar bazasi tayyor! ✅")
console.error("Xatolik:", error.message)
```

**Error Handling:**
- ✅ Try-catch blocks
- ✅ User-friendly xato xabarlari
- ✅ Error details console da
- ✅ Graceful degradation

---

## 🚀 Kelajak Rivojlanish Rejalari

### 📈 Version 2.0 Rejalari

#### 🆕 Yangi Funksiyalar
- [ ] **Kategoriyalar** - Janr bo'yicha guruhlash
- [ ] **Qidiruv** - Nom bo'yicha qidirish
- [ ] **Top 10** - Eng ko'p ko'rilgan kontent
- [ ] **Sevimlilar** - User favoriteslari
- [ ] **Rating** - Foydalanuvchi baholari
- [ ] **Izoh** - Kontent haqida fikrlar

#### 🎨 UI Yaxshilashlar
- [ ] **Web App** - Telegram Mini App
- [ ] **Inline Mode** - Inline queries
- [ ] **Custom Keyboard** - Reply keyboard
- [ ] **Multi-language** - Rus, Ingliz tillari

#### 📊 Analytics
- [ ] **Detailed Stats** - Har bir kontent statistikasi
- [ ] **User Activity** - Faoliyat tahlili
- [ ] **Growth Metrics** - O'sish ko'rsatkichlari
- [ ] **Export Data** - Excel/CSV eksport

#### 🔧 Texnik
- [ ] **MongoDB** - Kattaroq loyihalar uchun
- [ ] **Redis** - Caching layer
- [ ] **Docker** - Containerization
- [ ] **CI/CD** - Avtomatik deployment

### 🌟 Premium Funksiyalar (Kelajakda)
- [ ] **VIP Rejim** - Reklama yo'q
- [ ] **Erta Kirish** - Yangi kontentga birinchi
- [ ] **HD Quality** - Yuqori sifatli videolar
- [ ] **Download** - Yuklab olish (VIP uchun)

---

## 📞 Qo'llab-quvvatlash

### 🐛 Bug Report
Agar xatolik topsangiz:
1. Xatolik tavsifi
2. Qadam-baqadam ko'rsatma
3. Screenshot (agar mumkin bo'lsa)
4. Telegram: [@anonim_opisis](https://t.me/anonim_opisis)

### 💡 Taklif va Fikrlar
Yangi funksiya taklif qilish:
1. Funksiya tavsifi
2. Foydalanish holati
3. Nega kerak?
4. Telegram: [@anonim_opisis](https://t.me/anonim_opisis)

---

## 📄 Litsenziya

**MIT License** - Ochiq kodli loyiha

---

## 👨‍💻 Dasturchi

**Murodillayev Hojiakbar**
- Telegram: [@anonim_opisis](https://t.me/anonim_opisis)
- GitHub: [uzhojiakbar](https://github.com/uzhojiakbar)
- Repository: [kodli-kino](https://github.com/uzhojiakbar/kodli-kino)

---

## 🙏 Minnatdorchilik

Ushbu loyihada ishlatilgan texnologiyalar:
- **Node.js** - Runtime environment
- **node-telegram-bot-api** - Telegram Bot API
- **SQLite3** - Database
- **dotenv** - Environment management

---

**Oxirgi yangilanish:** 2024-yil 24-oktabr  
**Version:** 1.0.0  
**Status:** ✅ Production Ready

---

> **💡 Maslahat:** Ushbu hujjat loyihaning barcha funksiyalarini batafsil tavsiflaydi. Yangi funksiyalar qo'shilganda bu fayl yangilanadi.

