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

// Fonction pour afficher les messages
function showMessage(message, type) {
  const messageDiv = document.getElementById('message');
  messageDiv.textContent = message;
  messageDiv.className = `alert alert-${type}`;
  setTimeout(() => {
    messageDiv.textContent = "";
    messageDiv.className = "";
  }, 3000);
}

// Fonction pour enregistrer un utilisateur
function register(event) {
  event.preventDefault();
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  const phone = document.getElementById('phone').value;

  if (!validate_email(email)) {
    showMessage('Email invalide', 'danger');
    return;
  }

  if (!validate_password(password)) {
    showMessage('Le mot de passe doit contenir au moins 6 caractères', 'danger');
    return;
  }

  if (!document.getElementById('terms').checked) {
    showMessage('Vous devez accepter les conditions d\'utilisation et la politique de confidentialité', 'danger');
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

      // Enregistrement des données utilisateur dans la base de données
      database.ref('users/' + user.uid).set(user_data)
        .then(() => {
          showMessage('Données utilisateur enregistrées avec succès.', 'success');
          window.location.href = "login.html";
        })
        .catch((error) => {
          console.error('Erreur lors de l\'enregistrement des données utilisateur :', error);
          showMessage('Erreur lors de l\'enregistrement des données utilisateur.', 'danger');
        });
    })
    .catch((error) => {
      console.error('Erreur lors de la création de l\'utilisateur :', error);
      showMessage(error.message, 'danger');
    });
}

// Fonction pour connecter un utilisateur
function login(event) {
  event.preventDefault();
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;

  if (!validate_email(email) || !validate_password(password)) {
    showMessage('Email ou mot de passe invalide', 'danger');
    return;
  }

  auth.signInWithEmailAndPassword(email, password)
    .then((userCredential) => {
      console.log('Utilisateur connecté :', userCredential.user);
      showMessage('Connexion réussie', 'success');
      window.location.href = "accueil.html";
    })
    .catch((error) => {
      console.error('Erreur lors de la connexion :', error);
      showMessage('Erreur de connexion : ' + error.message, 'danger');
    });
}

// Fonction pour déconnecter un utilisateur
function logout() {
  auth.signOut().then(() => {
    console.log('Utilisateur déconnecté');
    window.location.href = "login.html";
  }).catch((error) => {
    console.error('Erreur lors de la déconnexion :', error);
    showMessage('Erreur lors de la déconnexion : ' + error.message, 'danger');
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

document.addEventListener("DOMContentLoaded", () => {
  const expenseForm = document.getElementById("expenseForm");
  const expenseContainer = document.getElementById("expensesList");

  // Obtenir la date du jour
  const today = new Date();
  const todayDateString = today.toISOString().split('T')[0]; // Format YYYY-MM-DD

  // Fonction pour ajouter une dépense à Firebase
  function addExpense(expense) {
    database.ref(`expenses/${todayDateString}`).push(expense)
      .then(() => {
        showMessage("Dépense ajoutée avec succès", "success");
        renderExpenses();
      })
      .catch((error) => {
        console.log(`Erreur lors de l'ajout de la dépense : ${error.message}`);
        showMessage(`Erreur : ${error.message}`, "danger");
      });
  }

  // Fonction pour supprimer une dépense de Firebase
  window.deleteExpense = function(id) {
    database.ref(`expenses/${todayDateString}/${id}`).remove()
      .then(() => {
        showMessage("Dépense supprimée avec succès", "success");
        renderExpenses();
      })
      .catch((error) => {
        console.log(`Erreur lors de la suppression de la dépense : ${error.message}`);
        showMessage(`Erreur : ${error.message}`, "danger");
      });
  }

  // Fonction pour marquer une dépense comme achetée
  window.purchaseExpense = function(id) {
    database.ref(`expenses/${todayDateString}/${id}`).update({ purchased: true })
      .then(() => {
        showMessage("Dépense achetée", "success");
        renderExpenses();
      })
      .catch((error) => {
        console.log(`Erreur lors du marquage de la dépense : ${error.message}`);
        showMessage(`Erreur : ${error.message}`, "danger");
      });
  }

  // Fonction pour afficher les dépenses du jour
  function renderExpenses() {
    database.ref(`expenses/${todayDateString}`).once('value')
      .then((snapshot) => {
        expenseContainer.innerHTML = "";
        snapshot.forEach((childSnapshot) => {
          const expense = childSnapshot.val();
          const id = childSnapshot.key;

          const item = document.createElement('div');
          item.className = `item ${expense.purchased ? 'purchased' : 'not-purchased'}`;
          item.innerHTML = `
            <p><strong>Nom :</strong> ${expense.name}</p>
            <p><strong>Prix :</strong> ${expense.price}</p>
            <p><strong>Quantité :</strong> ${expense.quantity}</p>
            <button class="btn-green" onclick="purchaseExpense('${id}')">Acheter</button>
            <i class="fas fa-trash btn-red" onclick="deleteExpense('${id}')"></i>
          `;
          expenseContainer.appendChild(item);
        });
      })
      .catch((error) => {
        console.log(`Erreur lors du rendu des dépenses : ${error.message}`);
        showMessage(`Erreur : ${error.message}`, "danger");
      });
  }

  // Validation et soumission du formulaire
  expenseForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const name = document.getElementById("name").value.trim();
    const quantity = document.getElementById("quantity").value;
    const price = document.getElementById("price").value;

    if (name === "" || quantity === "" || price === "") {
      showMessage("Tous les champs sont requis", "danger");
      return;
    }

    const newExpense = {
      name,
      quantity,
      price,
      purchased: false
    };

    addExpense(newExpense);
    expenseForm.reset();
  });

  // Affichage initial des dépenses du jour
  renderExpenses();
});
