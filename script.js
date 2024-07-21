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
const auth = firebase.auth(); // Initialiser l'authentification Firebase
const database = firebase.database(); // Initialiser la base de données en temps réel Firebase

// Fonction pour enregistrer un utilisateur
function register(event) {
  event.preventDefault(); // Empêcher la soumission par défaut du formulaire

  // Récupérer les entrées utilisateur
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  const phone = document.getElementById('phone').value;

  // Valider les entrées utilisateur
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

  // Créer un utilisateur avec email et mot de passe
  auth.createUserWithEmailAndPassword(email, password)
      .then((userCredential) => {
          const user = userCredential.user;
          console.log('Utilisateur créé :', user);

          // Ajouter cet utilisateur à la base de données Firebase
          const user_data = {
              email: email,
              phone: phone,
              last_login: Date.now()
          };

          // Enregistrer les données de l'utilisateur dans la base de données
          database.ref('users/' + user.uid).set(user_data)
              .then(() => {
                  console.log('Données utilisateur enregistrées avec succès.');
                  window.location.href = "login.html"; // Rediriger vers la page de connexion
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
  event.preventDefault(); // Empêcher la soumission par défaut du formulaire

  // Récupérer les entrées utilisateur
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;

  // Valider les entrées utilisateur
  if (!validate_email(email) || !validate_password(password)) {
      alert('Email ou mot de passe invalide');
      return;
  }

  // Connecter l'utilisateur avec email et mot de passe
  auth.signInWithEmailAndPassword(email, password)
      .then((userCredential) => {
          console.log('Utilisateur connecté :', userCredential.user);
          alert('Connexion réussie');
          window.location.href = "accueil.html"; // Rediriger vers la page d'accueil
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
      window.location.href = "login.html"; // Rediriger vers la page de connexion
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
