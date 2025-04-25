/**
 * קובץ תצורה נוסף לייצוא סטטי עבור GitHub Pages
 */
module.exports = {
  // נתיב בסיס לפריסה ב-GitHub Pages
  basePath: '/family.com',
  
  // קידומת נכסים
  assetPrefix: '/family.com/',
  
  // מידע לדף 404 מותאם
  notFoundConfig: {
    title: 'דף לא נמצא',
    description: 'העמוד שחיפשת לא קיים'
  },
  
  // הגדרות עבור דפים סטטיים
  staticOptions: {
    includeFiles: ['.nojekyll', 'favicon.ico', 'robots.txt']
  }
}; 