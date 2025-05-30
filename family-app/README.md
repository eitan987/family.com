# אפליקציית ניהול משפחתי

אפליקציה לניהול ענייני המשפחה, הכוללת ניהול משימות, יומן משפחתי, פרטים אישיים ומסמכים.

## תכונות עיקריות

- **דף כניסה** - עם טופס התחברות ואימות בסיסי.
- **עמוד ראשי** - עם תצוגה מתומצתת של משימות ואירועים.
- **ניהול משימות** - הוספה, עריכה ומחיקה של משימות לבני המשפחה.
- **יומן משפחתי** - תצוגת לוח שנה וניהול אירועי המשפחה.
- **פרטים אישיים** - צפייה ועריכה של פרטי בני המשפחה.
- **מסמכים אישיים** - ניהול מסמכים ותמונות של בני המשפחה.

## אנימציות וחוויית משתמש

האפליקציה משתמשת בספריית framer-motion כדי להוסיף אנימציות ואינטראקציות מודרניות לממשק המשתמש:

- **תזוזות ומעברים חלקים** - כל האלמנטים נכנסים למסך בצורה חלקה עם אפקטים של הופעה הדרגתית
- **אפקט מדורג (Staggering)** - פריטים ברשימות מופיעים בזה אחר זה, מה שיוצר תחושה דינמית
- **אינטראקציות בעת מעבר עכבר (Hover)** - כפתורים, כרטיסיות ואלמנטים אינטראקטיביים מגיבים כאשר המשתמש עובר מעליהם עם העכבר
- **אפקטים בעת לחיצה (Tap)** - משוב חזותי מיידי בעת לחיצה על אלמנטים
- **מעברים בין מצבים (AnimatePresence)** - מעבר חלק בין תצוגות שונות, למשל בין טפסים, רשימות ותפריטים
- **אנימציות מותאמות לנתונים (Data-driven)** - אנימציות המשתנות בהתאם לנתונים המוצגים

דוגמאות ספציפיות:
- רשימת המשימות מופיעה בסדר מדורג ועם אפקטים מותאמים למצב המשימה
- בעת מעבר מעל פריטים ניתן לראות אפקט הגדלה עדין שיוצר תחושת תלת-מימד
- הופעה והעלמה של טפסים ותפריטים עם אנימציות חלקות

## טכנולוגיות

- Next.js ו-React עם TypeScript
- Tailwind CSS לעיצוב
- Framer Motion לאנימציות ואינטראקציות
- נתוני דמה (Mock Data) ללא צורך בשרת

## התקנה והרצה

### דרישות מקדימות

- Node.js (גרסה 18 ומעלה)
- npm או yarn

### צעדים להתקנה

1. שכפל את המאגר:
```bash
git clone <URL_של_המאגר>
cd family-app
```

2. התקן את הספריות הנדרשות:
```bash
npm install
```

3. הרץ את האפליקציה במצב פיתוח:
```bash
npm run dev
```

4. גש לכתובת `http://localhost:3000` בדפדפן שלך.

## כיצד להשתמש באפליקציה

1. השתמש באחד מהמשתמשים הבאים להתחברות:
   - אימייל: `dan@family.com` (אבא)
   - אימייל: `dana@family.com` (אמא)
   - סיסמה: כל סיסמה באורך 4 תווים לפחות

2. לאחר ההתחברות תוכל לגשת לכל המודולים דרך תפריט הניווט:
   - משימות
   - יומן משפחתי
   - פרטים אישיים
   - מסמכים

## פיתוח עתידי

- חיבור לשרת אמיתי
- אפשרויות סינכרון בין מכשירים
- תמיכה בהתראות
- יכולות שיתוף משימות ואירועים

## מבנה הפרויקט

```
family-app/
├── src/
│   ├── app/              # דפים ראשיים
│   │   ├── auth/         # רכיבי אימות והרשאות
│   │   ├── calendar/     # רכיבי יומן
│   │   ├── documents/    # רכיבי מסמכים
│   │   ├── layout/       # רכיבי פריסה (נאבבר וכו')
│   │   ├── personal/     # רכיבי פרטים אישיים
│   │   └── tasks/        # רכיבי משימות
│   ├── data/             # נתוני דמה
│   ├── hooks/            # הוקים מותאמים אישית
│   ├── lib/              # פונקציות עזר
│   ├── styles/           # סגנונות גלובליים
│   └── types/            # הגדרות טיפוסים
├── public/               # קבצים סטטיים
└── README.md             # התיעוד הזה
``` 