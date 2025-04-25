// Helper function to get formatted dates
const getFormattedDate = (daysFromNow = 0) => {
  const date = new Date();
  date.setDate(date.getDate() + daysFromNow);
  return date.toISOString().split('T')[0]; // Returns YYYY-MM-DD format
};

const getTodayDateTime = (daysFromNow = 0, hours = 0, minutes = 0) => {
  const date = new Date();
  date.setDate(date.getDate() + daysFromNow);
  date.setHours(hours, minutes, 0, 0);
  return date.toISOString();
};

// מידע על המשפחה
export const familyData = {
  lastName: 'ישראלי',
  members: [
    {
      id: 1,
      firstName: 'דן',
      lastName: 'ישראלי',
      role: 'הורה',
      birthDate: '1980-05-15',
      email: 'dan@family.com',
      phone: '054-1234567',
      hobbies: ['ספורט', 'קריאה', 'מחשבים']
    },
    {
      id: 2,
      firstName: 'דנה',
      lastName: 'ישראלי',
      role: 'הורה',
      birthDate: '1982-08-22',
      email: 'dana@family.com',
      phone: '054-7654321',
      hobbies: ['אפייה', 'גינון', 'מוזיקה']
    },
    {
      id: 3,
      firstName: 'דני',
      lastName: 'ישראלי',
      role: 'ילד',
      birthDate: '2010-02-10',
      hobbies: ['משחקי וידאו', 'כדורגל', 'לגו']
    },
    {
      id: 4,
      firstName: 'שירה',
      lastName: 'ישראלי',
      role: 'ילדה',
      birthDate: '2012-11-05',
      hobbies: ['ציור', 'ריקוד', 'קריאה']
    }
  ]
};

// נתוני משימות
export const tasksData = [
  {
    id: 1,
    title: 'לקנות מצרכים',
    description: 'חלב, לחם, ביצים, ירקות ופירות',
    assignedTo: 1, // דן
    createdBy: 2, // דנה
    dueDate: getFormattedDate(0), // היום
    priority: 'high',
    status: 'pending'
  },
  {
    id: 2,
    title: 'הכנת שיעורי בית',
    description: 'לעזור לדני בהכנת שיעורי הבית במתמטיקה',
    assignedTo: 2, // דנה
    createdBy: 2, // דנה
    dueDate: getFormattedDate(0), // היום
    priority: 'medium',
    status: 'completed'
  },
  {
    id: 3,
    title: 'הרשמה לחוג',
    description: 'להרשים את שירה לחוג ציור במתנ"ס',
    assignedTo: 1, // דן
    createdBy: 2, // דנה
    dueDate: getFormattedDate(2), // בעוד יומיים
    priority: 'low',
    status: 'pending'
  },
  {
    id: 4,
    title: 'תיקון ברז',
    description: 'להזמין שרברב לתיקון הברז במטבח',
    assignedTo: 1, // דן
    createdBy: 1, // דן
    dueDate: getFormattedDate(1), // מחר
    priority: 'high',
    status: 'pending'
  },
  {
    id: 5,
    title: 'לסדר את החדר',
    description: 'לסדר ולנקות את החדר',
    assignedTo: 3, // דני
    createdBy: 1, // דן
    dueDate: getFormattedDate(0), // היום
    priority: 'medium',
    status: 'pending'
  }
];

// נתוני יומן
export const calendarData = [
  {
    id: 1,
    title: 'יום הולדת לסבא',
    description: 'חגיגת יום הולדת לסבא בביתו',
    startDate: getTodayDateTime(2, 18), // בעוד יומיים בשעה 18:00
    endDate: getTodayDateTime(2, 21),
    location: 'בית סבא, רחוב הפרחים 10',
    participants: [1, 2, 3, 4],
    repeat: 'yearly',
    category: 'family'
  },
  {
    id: 2,
    title: 'אסיפת הורים',
    description: 'אסיפת הורים בבית הספר של דני',
    startDate: getTodayDateTime(4, 19), // בעוד 4 ימים בשעה 19:00
    endDate: getTodayDateTime(4, 20, 30), // מסתיים בשעה 20:30
    location: 'בית ספר "אורנים", כיתה ג\'2',
    participants: [1, 2],
    repeat: 'none',
    category: 'school'
  },
  {
    id: 3,
    title: 'חוג ציור',
    description: 'חוג ציור של שירה',
    startDate: getTodayDateTime(1, 16), // מחר בשעה 16:00
    endDate: getTodayDateTime(1, 17, 30), // מסתיים בשעה 17:30
    location: 'מתנ"ס שכונתי',
    participants: [2, 4],
    repeat: 'weekly',
    category: 'other'
  },
  {
    id: 4,
    title: 'משחק כדורגל',
    description: 'משחק כדורגל של דני',
    startDate: getTodayDateTime(3, 9), // בעוד 3 ימים בשעה 9:00
    endDate: getTodayDateTime(3, 11), // מסתיים בשעה 11:00
    location: 'מגרש העירוני',
    participants: [1, 3],
    repeat: 'weekly',
    category: 'other'
  }
];

// נתוני מסמכים
export const documentsData = [
  {
    id: 1,
    title: 'תעודת זהות',
    memberId: 1, // דן
    type: 'image',
    url: '/documents/id.jpg',
    uploadDate: '2025-01-15',
    uploadedBy: 1, // דן
    tags: ['מסמכים רשמיים', 'תעודות']
  },
  {
    id: 2,
    title: 'תעודת לידה',
    memberId: 3, // דני
    type: 'pdf',
    url: '/documents/birth_certificate.pdf',
    uploadDate: '2025-02-10',
    uploadedBy: 2, // דנה
    tags: ['מסמכים רשמיים', 'תעודות']
  },
  {
    id: 3,
    title: 'תעודת בית ספר',
    memberId: 3, // דני
    type: 'pdf',
    url: '/documents/school_certificate.pdf',
    uploadDate: '2025-03-20',
    uploadedBy: 1, // דן
    tags: ['בית ספר', 'תעודות']
  },
  {
    id: 4,
    title: 'ציור משפחה',
    memberId: 4, // שירה
    type: 'image',
    url: '/documents/family_drawing.jpg',
    uploadDate: '2025-04-01',
    uploadedBy: 2, // דנה
    tags: ['ציורים', 'אמנות']
  }
];

// נתוני רשימות מובנות
export const listsData = {
  // רשימת קניות למשפחה
  shopping: [
    {
      id: 'shop1',
      text: 'חלב',
      completed: false,
      category: 'מוצרי חלב'
    },
    {
      id: 'shop2',
      text: 'לחם',
      completed: true,
      category: 'מאפים'
    },
    {
      id: 'shop3',
      text: 'ביצים',
      completed: false,
      category: 'מוצרי חלב'
    },
    {
      id: 'shop4',
      text: 'עגבניות',
      completed: false,
      category: 'ירקות ופירות'
    },
    {
      id: 'shop5',
      text: 'תפוחים',
      completed: false,
      category: 'ירקות ופירות'
    },
    {
      id: 'shop6',
      text: 'גבינה צהובה',
      completed: false,
      category: 'מוצרי חלב'
    },
    {
      id: 'shop7',
      text: 'נייר טואלט',
      completed: true,
      category: 'ניקיון'
    }
  ],
  
  // רשימת ניקיון לבית
  cleaning: [
    {
      id: 'clean1',
      text: 'שטיפת רצפות',
      completed: false,
      category: 'כללי'
    },
    {
      id: 'clean2',
      text: 'ניקוי אסלה',
      completed: false,
      category: 'שירותים ואמבטיה'
    },
    {
      id: 'clean3',
      text: 'ניקוי כיור',
      completed: true,
      category: 'מטבח'
    },
    {
      id: 'clean4',
      text: 'סידור ארון בגדים',
      completed: false,
      category: 'חדר שינה'
    },
    {
      id: 'clean5',
      text: 'ניקוי אבק',
      completed: false,
      category: 'סלון'
    }
  ],
  
  // רשימה כללית
  general: [
    {
      id: 'gen1',
      text: 'להחליף נורה בסלון',
      completed: false
    },
    {
      id: 'gen2',
      text: 'לשלם חשבון חשמל',
      completed: true
    },
    {
      id: 'gen3',
      text: 'להזמין תור לרופא שיניים',
      completed: false
    },
    {
      id: 'gen4',
      text: 'לרשום את דני לחוג כדורגל',
      completed: false
    }
  ],
  
  // רשימות מותאמות אישית
  custom: [
    {
      id: 'custom1',
      title: 'מתנות יום הולדת לשירה',
      type: 'general',
      items: [
        {
          id: 'gift1',
          text: 'ספר ציור',
          completed: true
        },
        {
          id: 'gift2',
          text: 'ערכת אומנות',
          completed: false
        },
        {
          id: 'gift3',
          text: 'בובה',
          completed: false
        }
      ]
    },
    {
      id: 'custom2',
      title: 'ארוחת ערב משפחתית',
      type: 'shopping',
      items: [
        {
          id: 'dinner1',
          text: 'בשר טחון',
          completed: false,
          category: 'בשר ודגים'
        },
        {
          id: 'dinner2',
          text: 'תפוחי אדמה',
          completed: false,
          category: 'ירקות ופירות'
        },
        {
          id: 'dinner3',
          text: 'ירקות לסלט',
          completed: true,
          category: 'ירקות ופירות'
        },
        {
          id: 'dinner4',
          text: 'לחם',
          completed: false,
          category: 'מאפים'
        }
      ]
    }
  ]
}; 