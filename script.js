// Configuration de Firebase
const firebaseConfig = {
  apiKey: "AIzaSyA6d7IqtUf_LVhtRb3F2aZHKE_j50ETBSk",
  authDomain: "appbudgetaire-d6b9f.firebaseapp.com",
  databaseURL: "https://appbudgetaire-d6b9f-default-rtdb.firebaseio.com",
  projectId: "appbudgetaire-d6b9f",
  storageBucket: "appbudgetaire-d6b9f.appspot.com",
  messagingSenderId: "914820617503",
  appId: "1:914820617503:web:7fe6931eaa71b0ea5f0c2a"
};

// Initialiser Firebase
firebase.initializeApp(firebaseConfig);

// Initialiser les services Firebase
const auth = firebase.auth();
const database = firebase.database();

// Fonction pour enregistrer un utilisateur
function register(event) {
  event.preventDefault();
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  const phone = document.getElementById('phone').value;

  if (!validate_email(email)) {
    alert('Email invalide');
    return;
  }

  if (!validate_password(password)) {
    alert('Le mot de passe doit contenir au moins 6 caractères');
    return;
  }

  if (!document.getElementById('terms').checked) {
    alert('Vous devez accepter les conditions d\'utilisation et la politique de confidentialité');
    return;
  }

  auth.createUserWithEmailAndPassword(email, password)
    .then((userCredential) => {
      const user = userCredential.user;
      const user_data = {
        email: email,
        phone: phone,
        last_login: Date.now()
      };

      database.ref('users/' + user.uid).set(user_data)
        .then(() => {
          console.log('Données utilisateur enregistrées avec succès.');
          window.location.href = "login.html";
        })
        .catch((error) => {
          console.error('Erreur lors de l\'enregistrement des données utilisateur :', error);
          alert('Erreur lors de l\'enregistrement des données utilisateur.');
        });
    })
    .catch((error) => {
      const error_code = error.code;
      const error_message = error.message;
      console.error('Erreur lors de la création de l\'utilisateur :', error);
      alert(error_message);
    });
}

// Fonction pour connecter un utilisateur
function login(event) {
  event.preventDefault();
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;

  if (!validate_email(email) || !validate_password(password)) {
    alert('Email ou mot de passe invalide');
    return;
  }

  auth.signInWithEmailAndPassword(email, password)
    .then((userCredential) => {
      console.log('Utilisateur connecté :', userCredential.user);
      alert('Connexion réussie');
      window.location.href = "accueil.html";
    })
    .catch((error) => {
      console.error('Erreur lors de la connexion :', error);
      alert('Erreur de connexion : ' + error.message);
    });
}

// Fonction pour déconnecter un utilisateur
function logout() {
  auth.signOut().then(() => {
    console.log('Utilisateur déconnecté');
    window.location.href = "login.html";
  }).catch((error) => {
    console.error('Erreur lors de la déconnexion :', error);
    alert('Erreur lors de la déconnexion : ' + error.message);
  });
}

// Fonction pour valider l'email
function validate_email(email) {
  const expression = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
  return expression.test(email);
}

// Fonction pour valider le mot de passe
function validate_password(password) {
  return password.length >= 6;
}

// Générer les jours du mois pour l'affichage
document.addEventListener('DOMContentLoaded', (event) => {
  generateMonthDays();
  setupExpenseForm();
});

function generateMonthDays() {
  const dateContainer = document.getElementById('date-container');
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();
  const monthNames = ["janvier", "février", "mars", "avril", "mai", "juin", "juillet", "août", "septembre", "octobre", "novembre", "décembre"];
  const dayNames = ["Dimanche", "Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi"];

  const daysInMonth = new Date(year, month + 1, 0).getDate();

  for (let day = 1; day <= daysInMonth; day++) {
    const currentDate = new Date(year, month, day);
    const dayName = dayNames[currentDate.getDay()];
    const monthName = monthNames[month];

    const dateItem = document.createElement('div');
    dateItem.classList.add('date-item');

    const dateNumber = document.createElement('div');
    dateNumber.classList.add('date-number');
    dateNumber.textContent = day;

    const dateText = document.createElement('div');
    dateText.classList.add('date-text');

    const dayText = document.createElement('div');
    dayText.classList.add('day');
    dayText.textContent = dayName;

    const monthText = document.createElement('div');
    monthText.classList.add('month');
    monthText.textContent = monthName;

    dateText.appendChild(dayText);
    dateText.appendChild(monthText);

    dateItem.appendChild(dateNumber);
    dateItem.appendChild(dateText);

    // Ajouter un gestionnaire de clic pour rediriger vers add.html
    dateItem.addEventListener('click', () => {
      window.location.href = "add.html";
    });

    dateContainer.appendChild(dateItem);
  }
}
