# הוראות פריסה ל-Vercel

הפרויקט מורכב משני חלקים נפרדים:
1. **Server** - Express.js API
2. **Client** - React + Vite

## שלב 1: פריסת השרת (Server)

### 1.1 הכנה מקומית
```bash
cd server
npm install
```

### 1.2 יצירת פרויקט ב-Vercel
1. היכנס ל-[Vercel Dashboard](https://vercel.com/dashboard)
2. לחץ על "Add New Project"
3. בחר את ה-repository שלך
4. **Root Directory**: בחר `server` (חשוב!)
5. **Framework Preset**: בחר "Other"
6. **Build Command**: השאר ריק
7. **Output Directory**: השאר ריק
8. **Install Command**: `npm install`
9. **Development Command**: השאר ריק

**הערה:** Vercel ישתמש ב-`vercel.json` שנמצא בתיקיית `server` כדי לדעת איך לפרוס את השרת.

### 1.3 משתני סביבה (Environment Variables)
**חשוב מאוד:** הוסף את המשתנים הבאים ב-Vercel Dashboard לפני הפריסה:

1. היכנס ל-Vercel Dashboard → בחר את הפרויקט → **Settings** → **Environment Variables**
2. לחץ על **Add New** והוסף כל משתנה בנפרד:

| Key | Value | Environment |
|-----|-------|-------------|
| `MONGO_URI` | `mongodb+srv://your-connection-string` | Production, Preview, Development |
| `JWT_SECRET` | `your_super_secret_key_here` | Production, Preview, Development |
| `CORS_ORIGIN` | `https://your-client-app.vercel.app` | Production, Preview, Development |

**הערות חשובות:**
- `MONGO_URI` - **חובה!** חיבור ל-MongoDB Atlas (מומלץ) או שירות אחר. ודא שהחיבור כולל את שם ה-Database בסוף: `mongodb+srv://.../database-name`
- `JWT_SECRET` - **חובה!** מפתח סודי חזק ל-JWT tokens (לפחות 32 תווים)
- `CORS_ORIGIN` - כתובת ה-URL של האפליקציה שלך (תוכל לעדכן אחרי פריסת הקליינט)
- **ודא שסימנת את כל ה-Environments** (Production, Preview, Development) לכל משתנה
- **לאחר הוספת משתנים, בצע Redeploy** - Vercel לא משתמש במשתנים חדשים בדפלוי קיים

**דוגמה ל-MONGO_URI:**
```
mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/glass-dynamics?retryWrites=true&w=majority
```

### 1.4 פריסה
לחץ על "Deploy" והמתן לסיום הפריסה.

**שמור את ה-URL של השרת** - תצטרך אותו לשלב הבא.
לדוגמה: `https://your-server-app.vercel.app`

---

## שלב 2: פריסת הקליינט (Client)

### 2.1 עדכון קובץ vercel.json
**לפני הפריסה**, עדכן את `client/vercel.json` והחלף את `your-server-app.vercel.app` ב-URL האמיתי של השרת (תקבל אותו לאחר פריסת השרת):

```json
{
  "rewrites": [
    {
      "source": "/api/(.*)",
      "destination": "https://YOUR-ACTUAL-SERVER-URL.vercel.app/api/$1"
    },
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ],
  "headers": [
    {
      "source": "/api/(.*)",
      "headers": [
        { "key": "Access-Control-Allow-Credentials", "value": "true" },
        { "key": "Access-Control-Allow-Origin", "value": "*" },
        { "key": "Access-Control-Allow-Methods", "value": "GET,OPTIONS,PATCH,DELETE,POST,PUT" },
        { "key": "Access-Control-Allow-Headers", "value": "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization" }
      ]
    }
  ]
}
```

**או** השתמש במשתנה סביבה `VITE_API_URL` במקום (מומלץ יותר):
- הוסף `VITE_API_URL=https://your-server-app.vercel.app/api` ב-Environment Variables של הקליינט
- הקליינט ישתמש בזה אוטומטית (ראה `client/src/config/api.js`)

### 2.2 יצירת פרויקט ב-Vercel
1. היכנס ל-[Vercel Dashboard](https://vercel.com/dashboard)
2. לחץ על "Add New Project"
3. בחר את אותו repository
4. **Root Directory**: בחר `client` (חשוב!)
5. **Framework Preset**: בחר "Vite" (Vercel יזהה אוטומטית)
6. **Build Command**: `npm run build` (אוטומטי)
7. **Output Directory**: `dist` (אוטומטי)
8. **Install Command**: `npm install` (אוטומטי)

### 2.3 משתני סביבה (Environment Variables)
הוסף את המשתנה הבא:

```
VITE_API_URL=https://your-server-app.vercel.app/api
```

**הערה:** 
- החלף `your-server-app.vercel.app` ב-URL האמיתי של השרת מהשלב הקודם
- אם אתה משתמש ב-`vercel.json` עם rewrites, אתה יכול לדלג על זה (אבל עדיין מומלץ)

### 2.4 פריסה
לחץ על "Deploy" והמתן לסיום הפריסה.

---

## שלב 3: עדכון הגדרות CORS

לאחר ששני הפרויקטים פרוסים:

1. חזור לשרת ב-Vercel Dashboard
2. עדכן את משתנה הסביבה `CORS_ORIGIN` לכתובת ה-URL של הקליינט:
   ```
   CORS_ORIGIN=https://your-client-app.vercel.app
   ```
3. בצע Redeploy לשרת (Settings → Deployments → [הדפלוי האחרון] → Redeploy)

---

## בדיקות לאחר הפריסה

### בדיקת השרת:
```bash
curl https://your-server-app.vercel.app/
# אמור להחזיר: "Glass Dynamic API is LIVE and READY! 🚀"

curl https://your-server-app.vercel.app/api
# אמור להחזיר: {"ok":true,"message":"API is up"}
```

### בדיקת הקליינט:
פתח את ה-URL של הקליינט בדפדפן ובדוק שהכל עובד.

---

## פתרון בעיות

### שגיאת CORS
- ודא ש-`CORS_ORIGIN` בשרת מכיל את ה-URL המדויק של הקליינט (כולל `https://`)
- ודא שה-`vercel.json` של הקליינט מכיל את ה-URL הנכון של השרת
- בדוק את ה-Logs של השרת ב-Vercel כדי לראות איזה origin נחסם

### שגיאת חיבור ל-MongoDB
- **ודא ש-`MONGO_URI` הוגדר נכון ב-Vercel Environment Variables**
- בדוק שהמשתנה קיים: Vercel Dashboard → Settings → Environment Variables → חפש `MONGO_URI`
- ודא שהמשתנה מסומן לכל ה-Environments (Production, Preview, Development)
- **חשוב:** לאחר הוספת משתנה חדש, בצע Redeploy - Vercel לא משתמש במשתנים חדשים בדפלוי קיים
- ודא ש-`MONGO_URI` נכון ומכיל את כתובת ה-IP שלך ב-whitelist (אם משתמש ב-MongoDB Atlas)
- ב-MongoDB Atlas: Network Access → Add IP Address → Allow Access from Anywhere (0.0.0.0/0) לפריסה
- ודא שהחיבור ל-MongoDB זמין מהאינטרנט
- ודא שה-URI כולל את שם ה-Database: `mongodb+srv://.../database-name`
- בדוק את ה-Logs ב-Vercel כדי לראות את השגיאה המדויקת

### שגיאת Build
- בדוק את ה-Logs ב-Vercel Dashboard → Deployments → [הדפלוי שלך] → Build Logs
- ודא שכל ה-dependencies מותקנים נכון
- ודא שה-`Root Directory` נכון (server או client)

### שגיאת 404 ב-API Routes
- ודא שה-`vercel.json` של השרת מכיל את הנתיב הנכון (`api/index.js`)
- בדוק שה-`api/index.js` קיים בתיקיית `server`

### שגיאת Timeout
- Vercel Serverless Functions מוגבלות ל-10 שניות (Hobby plan) או 60 שניות (Pro)
- אם יש לך operations ארוכות, שקול להשתמש ב-Vercel Cron Jobs או שירות אחר

### שגיאת "Module not found"
- ודא שכל ה-dependencies ב-`package.json` נכונים
- נסה למחוק `node_modules` ולהריץ `npm install` מחדש
- בדוק שה-`Root Directory` נכון ב-Vercel

---

## עדכונים עתידיים

לאחר כל שינוי בקוד:
1. Commit ו-Push ל-Git
2. Vercel יבצע Deploy אוטומטי (אם ה-Auto Deploy מופעל)
3. או בצע Manual Deploy מ-Dashboard

---

## מבנה הקבצים לפריסה

```
glass-dynamics-demo/
├── server/
│   ├── vercel.json          # קונפיגורציה לפריסה
│   ├── api/
│   │   └── index.js         # Serverless function handler
│   ├── .env.example         # דוגמה למשתני סביבה
│   └── package.json
├── client/
│   ├── vercel.json          # קונפיגורציה לפריסה
│   ├── .env.example         # דוגמה למשתני סביבה
│   └── package.json
└── DEPLOYMENT.md            # קובץ זה
```

---

## קישורים שימושיים

- [Vercel Documentation](https://vercel.com/docs)
- [Vercel Environment Variables](https://vercel.com/docs/concepts/projects/environment-variables)
- [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
- [Vercel Serverless Functions](https://vercel.com/docs/functions)

---

## טיפים נוספים

1. **שם הפרויקט**: Vercel יוצר URL אוטומטי לפי שם הפרויקט. אתה יכול לשנות אותו ב-Settings → General → Project Name

2. **Custom Domain**: אתה יכול להוסיף domain מותאם אישית ב-Settings → Domains

3. **Preview Deployments**: כל push ל-branch יוצר Preview Deployment אוטומטי - שימושי לבדיקות לפני Production

4. **Environment Variables per Environment**: אתה יכול להגדיר משתני סביבה שונים ל-Production, Preview, ו-Development

5. **Analytics**: Vercel מספק Analytics מובנה - אפשר להפעיל ב-Settings → Analytics
