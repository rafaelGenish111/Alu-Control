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
הוסף את המשתנים הבאים ב-Vercel Dashboard → Settings → Environment Variables:

```
MONGO_URI=mongodb+srv://your-connection-string
JWT_SECRET=your_super_secret_key_here
PORT=5001
CORS_ORIGIN=https://your-client-app.vercel.app
```

**הערות:**
- `MONGO_URI` - חיבור ל-MongoDB Atlas (מומלץ) או שירות אחר
- `JWT_SECRET` - מפתח סודי חזק ל-JWT tokens
- `CORS_ORIGIN` - כתובת ה-URL של האפליקציה שלך (לאחר פריסת הקליינט)

### 1.4 פריסה
לחץ על "Deploy" והמתן לסיום הפריסה.

**שמור את ה-URL של השרת** - תצטרך אותו לשלב הבא.

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
3. בצע Redeploy לשרת

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
- ודא ש-`MONGO_URI` נכון ומכיל את כתובת ה-IP שלך ב-whitelist (אם משתמש ב-MongoDB Atlas)
- ב-MongoDB Atlas: Network Access → Add IP Address → Allow Access from Anywhere (0.0.0.0/0) לפריסה
- ודא שהחיבור ל-MongoDB זמין מהאינטרנט

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

---

## עדכונים עתידיים

לאחר כל שינוי בקוד:
1. Commit ו-Push ל-Git
2. Vercel יבצע Deploy אוטומטי (אם ה-Auto Deploy מופעל)
3. או בצע Manual Deploy מ-Dashboard

---

## קישורים שימושיים

- [Vercel Documentation](https://vercel.com/docs)
- [Vercel Environment Variables](https://vercel.com/docs/concepts/projects/environment-variables)
- [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
