// המתנה לטעינת כל הסקריפטים לפני הרצת הקוד
window.onload = function() {
    // בדיקה ש-Firebase זמין
    if (typeof firebase === 'undefined' || !firebase.firestore) {
        console.error("Firebase לא נטען כראוי.");
        alert("שגיאה: Firebase לא זמין. אנא בדוק את חיבור האינטרנט או את הגדרות ה-Firebase.");
        return;
    }

    // משתמש במשתנה db שכבר מוגדר ב-HTML
    if (!window.db) {
        console.error("משתנה db לא מוגדר ב-HTML.");
        alert("שגיאה: לא ניתן להתחבר למסד הנתונים. אנא בדוק את הקוד ב-HTML.");
        return;
    }

    // משתנה גלובלי לסימון אם ביצענו הפניה
    let hasRedirected = false;

    // פונקציה לניווט לדף הדשבורד
    function navigateToDashboard() {
        try {
            if (window.location.pathname.includes('dashboard.html')) {
                console.log("כבר בדף הדשבורד, לא מבצע ניווט נוסף");
                return;
            }
            if (hasRedirected) {
                console.log("הפניה כבר בוצעה, לא מבצע שוב");
                return;
            }
            
            hasRedirected = true;
            const currentUrl = window.location.href;
            const dashboardUrl = currentUrl.substring(0, currentUrl.lastIndexOf('/') + 1) + 'dashboard.html';
            console.log("מנווט אל:", dashboardUrl);
            window.location.replace(dashboardUrl);
        } catch (error) {
            console.error("שגיאה בניווט לדשבורד:", error);
            alert("שגיאה בניווט לדף הדשבורד. נסה להזין את הכתובת בעצמך: dashboard.html");
            hasRedirected = false;
        }
    }

    // פונקציה להוספת בן משפחה חדש
    function addMember(role) {
        memberCount++;
        const memberInputs = document.getElementById('member-inputs');
        
        if (!memberInputs) {
            console.error("מיכל השדות של בני המשפחה לא נמצא");
            return;
        }
        
        const memberDiv = document.createElement('div');
        memberDiv.classList.add('member-input');
        memberDiv.dataset.memberId = memberCount;
        
        memberDiv.innerHTML = `
            <input type="text" id="member-name-${memberCount}" placeholder="שם (${role})" required>
            <select id="member-role-${memberCount}" required>
                <option value="${role}">${role}</option>
                <option value="${role === 'הורה' ? 'ילד' : 'הורה'}">${role === 'הורה' ? 'ילד' : 'הורה'}</option>
            </select>
            <button type="button" class="remove-member-btn icon-btn"><i class="fas fa-trash-alt"></i></button>
        `;
        
        memberInputs.appendChild(memberDiv);
        
        // הוספת מאזין להסרת בן משפחה
        memberDiv.querySelector('.remove-member-btn').addEventListener('click', () => {
            memberDiv.remove();
        });
    }

    // מונה לשמירת מספר בני המשפחה שנוספו
    let memberCount = 0;

    // אתחול אירועים עם טעינת הדף
    document.addEventListener('DOMContentLoaded', () => {
        // מאזיני אירועים לכפתורי הוספת בני משפחה
        const addParentBtn = document.getElementById('add-parent-btn');
        const addChildBtn = document.getElementById('add-child-btn');

        if (addParentBtn) {
            addParentBtn.addEventListener('click', () => addMember('הורה'));
        } else {
            console.log("כפתור 'הוסף הורה' לא נמצא");
        }

        if (addChildBtn) {
            addChildBtn.addEventListener('click', () => addMember('ילד'));
        } else {
            console.log("כפתור 'הוסף ילד' לא נמצא");
        }

        // החלפת טאבים
        document.querySelectorAll('.tab-btn').forEach(button => {
            button.addEventListener('click', () => {
                document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
                document.querySelectorAll('.auth-form').forEach(form => form.classList.remove('active'));
                
                button.classList.add('active');
                const formId = `${button.dataset.tab}-form`;
                const form = document.getElementById(formId);
                if (form) {
                    form.classList.add('active');
                } else {
                    console.error(`הטופס ${formId} לא נמצא`);
                }
            });
        });

        // הרשמה
        const registerBtn = document.getElementById('register-btn');
        if (registerBtn) {
            registerBtn.addEventListener('click', async () => {
                const familyNameInput = document.getElementById('register-family-name');
                const passwordInput = document.getElementById('register-password');
                const errorDiv = document.getElementById('register-error');
                
                if (!familyNameInput || !passwordInput || !errorDiv) {
                    console.error("שדות הטופס חסרים");
                    errorDiv.textContent = 'שגיאה: שדות הטופס חסרים';
                    return;
                }
                
                const familyName = familyNameInput.value.trim();
                const password = passwordInput.value.trim();

                if (!familyName || !password) {
                    errorDiv.textContent = 'שם משפחה וסיסמה הם שדות חובה';
                    errorDiv.classList.add('error-message');
                    return;
                }

                try {
                    // בדיקת קיום שם משפחה
                    const familySnapshot = await window.db.collection('families').where('familyName', '==', familyName).get();
                    if (!familySnapshot.empty) {
                        errorDiv.textContent = 'שם המשפחה כבר קיים במערכת';
                        errorDiv.classList.add('error-message');
                        return;
                    }

                    // איסוף בני משפחה
                    const members = {};
                    const memberInputs = document.querySelectorAll('.member-input');
                    
                    memberInputs.forEach(memberDiv => {
                        const memberId = memberDiv.dataset.memberId;
                        const nameInput = document.getElementById(`member-name-${memberId}`);
                        const roleInput = document.getElementById(`member-role-${memberId}`);
                        
                        if (nameInput && roleInput && nameInput.value.trim()) {
                            members[nameInput.value.trim()] = roleInput.value;
                        }
                    });

                    if (Object.keys(members).length === 0) {
                        errorDiv.textContent = 'חובה להוסיף לפחות בן משפחה אחד';
                        errorDiv.classList.add('error-message');
                        return;
                    }

                    // שמירה ב-Firestore
                    const familyRef = await window.db.collection('families').add({
                        familyName: familyName,
                        password: password, // הערה: יש להצפין את הסיסמה ביישום אמיתי
                        users: members,
                        createdAt: firebase.firestore.FieldValue.serverTimestamp()
                    });

                    // שמירת נתונים ב-localStorage
                    const firstUser = Object.keys(members)[0];
                    localStorage.setItem('familyId', familyRef.id);
                    localStorage.setItem('username', firstUser);
                    localStorage.setItem('userRole', members[firstUser]);
                    localStorage.setItem('familyName', familyName);
                    
                    navigateToDashboard();
                } catch (error) {
                    console.error("שגיאה בהרשמה:", error);
                    errorDiv.textContent = `שגיאה: ${error.message}`;
                    errorDiv.classList.add('error-message');
                }
            });
        } else {
            console.log("כפתור ההרשמה לא נמצא");
        }

        // התחברות
        const loginBtn = document.getElementById('login-btn');
        if (loginBtn) {
            loginBtn.addEventListener('click', async () => {
                const familyNameInput = document.getElementById('login-family-name');
                const usernameSelect = document.getElementById('login-username');
                const passwordInput = document.getElementById('login-password');
                const errorDiv = document.getElementById('login-error');
                
                if (!familyNameInput || !usernameSelect || !passwordInput || !errorDiv) {
                    console.error("שדות טופס ההתחברות חסרים");
                    errorDiv.textContent = 'שגיאה: שדות הטופס חסרים';
                    return;
                }
                
                const familyName = familyNameInput.value.trim();
                const username = usernameSelect.value;
                const password = passwordInput.value.trim();

                if (!familyName || !username || !password) {
                    errorDiv.textContent = 'כל השדות הם חובה';
                    errorDiv.classList.add('error-message');
                    return;
                }

                try {
                    const familySnapshot = await window.db.collection('families')
                        .where('familyName', '==', familyName)
                        .where('password', '==', password)
                        .get();
                        
                    if (familySnapshot.empty) {
                        errorDiv.textContent = 'שם משפחה או סיסמה שגויים';
                        errorDiv.classList.add('error-message');
                        return;
                    }

                    const familyDoc = familySnapshot.docs[0];
                    const familyId = familyDoc.id;
                    const familyData = familyDoc.data();

                    if (!familyData.users || !familyData.users[username]) {
                        errorDiv.textContent = 'שם משתמש לא נמצא במשפחה זו';
                        errorDiv.classList.add('error-message');
                        return;
                    }

                    localStorage.setItem('familyId', familyId);
                    localStorage.setItem('username', username);
                    localStorage.setItem('userRole', familyData.users[username]);
                    localStorage.setItem('familyName', familyName);

                    navigateToDashboard();
                } catch (error) {
                    console.error("שגיאה בהתחברות:", error);
                    errorDiv.textContent = `שגיאה: ${error.message}`;
                    errorDiv.classList.add('error-message');
                }
            });
        } else {
            console.log("כפתור ההתחברות לא נמצא");
        }

        // טעינת שמות משתמשים בעת שינוי שם המשפחה
        const loginFamilyNameInput = document.getElementById('login-family-name');
        if (loginFamilyNameInput) {
            loginFamilyNameInput.addEventListener('input', async () => {
                const familyName = loginFamilyNameInput.value.trim();
                const usernameSelect = document.getElementById('login-username');
                if (!usernameSelect) return;

                usernameSelect.innerHTML = '<option value="">-- בחר משתמש --</option>';

                if (!familyName) return;

                try {
                    const familySnapshot = await window.db.collection('families')
                        .where('familyName', '==', familyName)
                        .get();

                    if (familySnapshot.empty) {
                        console.log("משפחה לא נמצאה:", familyName);
                        return;
                    }

                    const familyData = familySnapshot.docs[0].data();
                    if (familyData.users) {
                        Object.keys(familyData.users).forEach(username => {
                            const option = document.createElement('option');
                            option.value = username;
                            option.textContent = username;
                            usernameSelect.appendChild(option);
                        });
                    }
                } catch (error) {
                    console.error('שגיאה בטעינת משתמשים:', error);
                }
            });
        }

        // בדיקה אם המשתמש כבר מחובר
        const familyId = localStorage.getItem('familyId');
        const username = localStorage.getItem('username');
        
        if (familyId && username && !window.location.pathname.includes('dashboard.html')) {
            console.log("משתמש מחובר:", username);
            navigateToDashboard();
        }
    });
};

// הפעלת הקוד לאחר טעינת הדף
document.addEventListener('DOMContentLoaded', initializeApp);
