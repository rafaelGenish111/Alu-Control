# התאמת האפליקציה למפעל חדש (טננט)

## איפה מוסיפים את נתוני המפעל (הלקוח של האפליקציה)?

### 1. קובץ קונפיגורציה (מראה ומותג) – Frontend

יוצרים קובץ JSON **בתיקייה הזו** (`client/public/config/tenants/`) עם **שם קובץ זהה** ל-`tenantId` שב-Backend.

**שם הקובץ:** `{tenant-id}.json` (מומלץ עם קו תחתון, בלי רווחים)  
**דוגמה:** למפעל עם `tenantId = "m_factory"` יוצרים: `m_factory.json`

**תוכן מינימלי:**

```json
{
  "id": "m_factory",
  "name": "מפעל המיתוג",
  "branding": {
    "primaryColor": "#2563eb",
    "logoUrl": "/logo.png"
  },
  "labels": {
    "order": "הזמנה",
    "installer": "מתקין"
  }
}
```

- **name** – השם שמופיע בממשק (כותרת, לוגו).
- **branding.primaryColor** – צבע ראשי (כפתורים, סרגל צד פעיל). פורמט: `#RRGGBB`.
- **branding.logoUrl** – נתיב ללוגו (למשל `/logo.png`).
- **labels** – תוויות לשימוש בממשק.

**טננט ברירת מחדל:** הקובץ `default.json` משמש גם ל-`tenantId = "default_glass_dynamics"`.

### 2. נתונים ב-Backend (משתמשים, הזמנות)

כל המשתמשים וההזמנות שייכים ל-**tenant** לפי השדה `tenantId`.

- **משתמשים חדשים** – נוצרים עם אותו `tenantId` (דרך "ניהול משתמשים" באפליקציה).
- **Seed לדמו** – בתיקיית `server` מגדירים משתנה סביבה `TENANT_ID` ומריצים:
  ```bash
  TENANT_ID=m_factory npm run seed:demo
  ```
  כל המשתמשים, הספקים וההזמנות ייווצרו עם `tenantId = "m_factory"`.

### 3. סיכום – הוספת מפעל חדש (לקוח חדש של האפליקציה)

1. **Frontend:** ליצור קובץ `public/config/tenants/{tenant-id}.json` (בתוך `client/public/config/tenants/`) עם שם המפעל, צבע ראשי, לוגו ו-labels.
2. **Backend:** ליצור משתמשים עם אותו `tenantId` – או להריץ `TENANT_ID={tenant-id} npm run seed:demo` בתיקיית `server`.
3. **התחברות:** להתחבר עם משתמש שמשויך ל-`tenantId` – האפליקציה תטען אוטומטית את הקונפיג (שם, צבע, לוגו) של המפעל שלו.
