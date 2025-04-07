// אתחול Firebase - בדיקה שה-SDK הנדרשים נטענו
const db = firebase.firestore();
let auth;
try {
    auth = firebase.auth();
} catch (e) {
    console.error("Firebase Auth לא נטען כראוי", e);
}

// החלפת טאבים בין התחברות להרשמה
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

// מונה לשמירת מספר בני המשפחה שנוספו
let memberCount = 0;

// הוספת מאזיני אירועים לכפתורי הוספת בני משפחה
const addParentBtn = document.getElementById('add-parent-btn');
const addChildBtn = document.getElementById('add-child-btn');

if (addParentBtn) {
    addParentBtn.addEventListener('click', () => addMember('הורה'));
} else {
    console.error("כפתור 'הוסף הורה' לא נמצא");
}

if (addChildBtn) {
    addChildBtn.addEventListener('click', () => addMember('ילד'));
} else {
    console.error("כפתור 'הוסף ילד' לא נמצא");
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
        </select>
        <button type="button" class="remove-member-btn">הסר</button>
    `;
    
    memberInputs.appendChild(memberDiv);

    const removeBtn = memberDiv.querySelector('.remove-member-btn');
    if (removeBtn) {
        removeBtn.addEventListener('click', () => {
            memberInputs.removeChild(memberDiv);
        });
    }
}

// הרשמה
const registerBtn = document.getElementById('register-btn');
if (registerBtn) {
    registerBtn.addEventListener('click', async () => {
        console.log("Register button clicked");
        const familyNameInput = document.getElementById('register-family-name');
        const passwordInput = document.getElementById('register-password');
        const errorDiv = document.getElementById('register-error');
        
        if (!familyNameInput || !passwordInput || !errorDiv) {
            console.error("שדות הטופס חסרים");
            return;
        }
        
        const familyName = familyNameInput.value.trim();
        const password = passwordInput.value.trim();

        console.log("Family Name:", familyName, "Password:", password);

        if (!familyName || !password) {
            errorDiv.textContent = 'שם משפחה וסיסמה הם שדות חובה';
            return;
        }

        try {
            console.log("Checking if family name exists...");
            const familySnapshot = await db.collection('families').where('familyName', '==', familyName).get();
            if (!familySnapshot.empty) {
                errorDiv.textContent = 'שם המשפחה כבר קיים במערכת';
                return;
            }

            const members = [];
            const memberInputs = document.querySelectorAll('.member-input');
            
            memberInputs.forEach(memberDiv => {
                const memberId = memberDiv.dataset.memberId;
                const nameInput = document.getElementById(`member-name-${memberId}`);
                const roleInput = document.getElementById(`member-role-${memberId}`);
                
                if (nameInput && roleInput && nameInput.value.trim()) {
                    members.push({
                        username: nameInput.value.trim(),
                        role: roleInput.value
                    });
                }
            });

            console.log("Members collected:", members);

            if (members.length === 0) {
                errorDiv.textContent = 'חובה להוסיף לפחות בן משפחה אחד';
                return;
            }

            console.log("Creating family document...");
            const familyRef = await db.collection('families').add({
                familyName: familyName,
                password: password, // הערה: יש להצפין את הסיסמה ביישום אמיתי
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            }).catch(error => {
                throw new Error(`Failed to create family document: ${error.message}`);
            });

            console.log("Family created with ID:", familyRef.id);

            const batch = db.batch();
            for (const member of members) {
                const userRef = db.collection('families').doc(familyRef.id).collection('users').doc();
                batch.set(userRef, {
                    username: member.username,
                    role: member.role,
                    createdAt: firebase.firestore.FieldValue.serverTimestamp()
                });
            }
            console.log("Committing batch write for users...");
            await batch.commit().catch(error => {
                throw new Error(`Failed to commit batch write: ${error.message}`);
            });

            console.log("Batch write completed");

            console.log("Setting localStorage...");
            localStorage.setItem('familyId', familyRef.id);
            localStorage.setItem('username', members[0].username);
            
            console.log("localStorage set - familyId:", localStorage.getItem('familyId'), "username:", localStorage.getItem('username'));

            console.log("Redirecting to dashboard.html...");
            try {
                window.location.replace('dashboard.html');
                // Fallback in case the redirection doesn't happen immediately
                setTimeout(() => {
                    if (window.location.pathname !== '/dashboard.html') {
                        console.error("Redirection to dashboard.html failed");
                        alert("ההרשמה הצליחה, אך לא ניתן לעבור לדף הניהול. אנא נסה לנווט ידנית ל-dashboard.html");
                    }
                }, 1000);
            } catch (redirectError) {
                console.error("Redirection error:", redirectError);
                errorDiv.textContent = "שגיאה בהפניה לדף הניהול. אנא נסה שוב.";
            }
        } catch (error) {
            console.error("שגיאה בהרשמה:", error);
            errorDiv.textContent = `שגיאה: ${error.message}`;
        }
    });
} else {
    console.error("כפתור ההרשמה לא נמצא");
}

// התחברות
const loginBtn = document.getElementById('login-btn');
if (loginBtn) {
    loginBtn.addEventListener('click', async () => {
        console.log("Login button clicked");
        const familyNameInput = document.getElementById('login-family-name');
        const usernameSelect = document.getElementById('login-username');
        const passwordInput = document.getElementById('login-password');
        const errorDiv = document.getElementById('login-error');
        
        if (!familyNameInput || !usernameSelect || !passwordInput || !errorDiv) {
            console.error("שדות טופס ההתחברות חסרים");
            return;
        }
        
        const familyName = familyNameInput.value.trim();
        const username = usernameSelect.value;
        const password = passwordInput.value.trim();

        console.log("Login - Family Name:", familyName, "Username:", username, "Password:", password);

        if (!familyName || !username || !password) {
            errorDiv.textContent = 'כל השדות הם חובה';
            return;
        }

        try {
            console.log("Checking family credentials...");
            const familySnapshot = await db.collection('families')
                .where('familyName', '==', familyName)
                .where('password', '==', password)
                .get();
                
            if (familySnapshot.empty) {
                errorDiv.textContent = 'שם משפחה או סיסמה שגויים';
                return;
            }

            const familyDoc = familySnapshot.docs[0];
            const familyId = familyDoc.id;

            console.log("Family found with ID:", familyId);

            console.log("Checking username...");
            const userSnapshot = await db.collection('families')
                .doc(familyId)
                .collection('users')
                .where('username', '==', username)
                .get();
                
            if (userSnapshot.empty) {
                errorDiv.textContent = 'שם משתמש לא נמצא';
                return;
            }

            console.log("User found, setting localStorage...");
            localStorage.setItem('familyId', familyId);
            localStorage.setItem('username', username);

            console.log("localStorage set - familyId:", localStorage.getItem('familyId'), "username:", localStorage.getItem('username'));

            console.log("Redirecting to dashboard.html...");
            try {
                window.location.replace('dashboard.html');
                setTimeout(() => {
                    if (window.location.pathname !== '/dashboard.html') {
                        console.error("Redirection to dashboard.html failed");
                        alert("ההתחברות הצליחה, אך לא ניתן לעבור לדף הניהול. אנא נסה לנווט ידנית ל-dashboard.html");
                    }
                }, 1000);
            } catch (redirectError) {
                console.error("Redirection error:", redirectError);
                errorDiv.textContent = "שגיאה בהפניה לדף הניהול. אנא נסה שוב.";
            }
        } catch (error) {
            console.error("שגיאה בהתחברות:", error);
            errorDiv.textContent = `שגיאה: ${error.message}`;
        }
    });
} else {
    console.error("כפתור ההתחברות לא נמצא");
}

// טעינת שמות משתמשים בעת שינוי שם המשפחה
const loginFamilyNameInput = document.getElementById('login-family-name');
if (loginFamilyNameInput) {
    loginFamilyNameInput.addEventListener('change', async () => {
        const familyName = loginFamilyNameInput.value.trim();
        const usernameSelect = document.getElementById('login-username');
        
        if (!usernameSelect) {
            console.error("תפריט בחירת המשתמש לא נמצא");
            return;
        }
        
        usernameSelect.innerHTML = '<option value="">-- בחר משתמש --</option>';

        if (!familyName) return;

        try {
            console.log("Loading users for family:", familyName);
            const familySnapshot = await db.collection('families')
                .where('familyName', '==', familyName)
                .get();
                
            if (familySnapshot.empty) {
                console.log("No family found with name:", familyName);
                return;
            }

            const familyId = familySnapshot.docs[0].id;
            console.log("Family ID:", familyId);

            const usersSnapshot = await db.collection('families')
                .doc(familyId)
                .collection('users')
                .get();
                
            usersSnapshot.forEach(userDoc => {
                const user = userDoc.data();
                const option = document.createElement('option');
                option.value = user.username;
                option.textContent = user.username;
                usernameSelect.appendChild(option);
            });
            console.log("Users loaded for family:", familyName);
        } catch (error) {
            console.error('שגיאה בטעינת משתמשים:', error);
        }
    });
} else {
    console.error("שדה שם המשפחה בטופס ההתחברות לא נמצא");
}

// הוספת קוד לבדיקה שהדף נטען כראוי
document.addEventListener('DOMContentLoaded', () => {
    console.log('הדף נטען בהצלחה. Firebase:', !!firebase);
    
    if (db) {
        console.log('Firestore מוכן לשימוש');
    } else {
        console.error('Firestore לא נטען כראוי');
    }
});