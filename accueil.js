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
const database = firebase.database();
const auth = firebase.auth(); // Pour la déconnexion

function renderExpenses() {
    const expenseContainer = document.getElementById("expensesList");

    // Obtenir la date du jour sous le format YYYY-M-D
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth() + 1; // Les mois sont de 0 à 11
    const day = today.getDate();
    const formattedDate = `${year}-${month}-${day}`;

    console.log('Date du jour :', formattedDate);

    // Référence à la base de données pour les dépenses de la date du jour
    const ref = database.ref(`expenses/${formattedDate}`);
    console.log('Référence Firebase :', ref.toString());

    ref.once('value')
        .then((snapshot) => {
            const data = snapshot.val();
            console.log('Données récupérées :', data);

            expenseContainer.innerHTML = ""; // Réinitialiser le conteneur

            if (data) {
                for (const id in data) {
                    const expense = data[id];
                    const borderClass = expense.purchased ? 'green-border' : 'red-border';
                    
                    // Création d'un élément pour chaque dépense
                    const item = document.createElement('div');
                    item.className = `card ${borderClass}`;
                    item.innerHTML = `
                        <p class="name"><span>Nom :</span> ${expense.name}</p>
                        <p class="price"><span>Prix :</span> ${expense.price}</p>
                        <p class="quantity"><span>Quantité :</span> ${expense.quantity}</p>
                        <div class="actions">
                            <button class="buy-btn" ${expense.purchased ? 'style="display: none;"' : ''} onclick="purchaseExpense('${id}', ${expense.price})">Acheter</button>
                            <i class="fas fa-trash btn-red" onclick="deleteExpense('${id}')"></i>
                        </div>
                    `;
                    expenseContainer.appendChild(item);
                }
            } else {
                expenseContainer.innerHTML = "<p>Aucune dépense pour aujourd'hui.</p>";
            }

            // Calculer la somme des frais du mois
            calculateMonthlyExpenses(year, month);
        })
        .catch((error) => {
            console.error(`Erreur lors de la récupération des dépenses : ${error.message}`);
        });
}

// Fonction pour marquer une dépense comme achetée
window.purchaseExpense = function(id, price) {
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth() + 1; // Les mois sont de 0 à 11
    const day = today.getDate();
    const formattedDate = `${year}-${month}-${day}`;
    database.ref(`expenses/${formattedDate}/${id}`).update({ purchased: true })
        .then(() => {
            // Ajouter le prix à la somme des frais du mois
            addToMonthlyExpenses(price, year, month);
            renderExpenses(); // Recharger les dépenses après mise à jour
        })
        .catch((error) => {
            console.error(`Erreur lors du marquage de la dépense : ${error.message}`);
        });
}

// Fonction pour supprimer une dépense
window.deleteExpense = function(id) {
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth() + 1; // Les mois sont de 0 à 11
    const day = today.getDate();
    const formattedDate = `${year}-${month}-${day}`;
    database.ref(`expenses/${formattedDate}/${id}`).remove()
        .then(() => {
            renderExpenses(); // Recharger les dépenses après suppression
        })
        .catch((error) => {
            console.error(`Erreur lors de la suppression de la dépense : ${error.message}`);
        });
}

// Fonction pour calculer la somme des frais du mois
function calculateMonthlyExpenses(year, month) {
    const ref = database.ref(`expenses/${year}-${month}`);
    ref.once('value')
        .then((snapshot) => {
            let total = 0;
            snapshot.forEach((daySnapshot) => {
                daySnapshot.forEach((expenseSnapshot) => {
                    const expense = expenseSnapshot.val();
                    if (expense.purchased) {
                        total += expense.price;
                    }
                });
            });
            document.getElementById('totalMonthlyExpenses').innerText = total;
        })
        .catch((error) => {
            console.error(`Erreur lors du calcul des frais du mois : ${error.message}`);
        });
}

// Fonction pour ajouter à la somme des frais du mois
function addToMonthlyExpenses(price, year, month) {
    const ref = database.ref(`monthlyExpenses/${year}-${month}`);
    ref.transaction((currentTotal) => {
        return (currentTotal || 0) + price;
    }).then(() => {
        calculateMonthlyExpenses(year, month);
    }).catch((error) => {
        console.error(`Erreur lors de l'ajout aux frais du mois : ${error.message}`);
    });
}

// Afficher les dépenses du jour lorsque le document est chargé
document.addEventListener("DOMContentLoaded", () => {
    renderExpenses();
    displayUserName(); // Afficher le nom de l'utilisateur connecté
});

// Fonction pour afficher le nom de l'utilisateur connecté
function displayUserName() {
    auth.onAuthStateChanged(user => {
        if (user) {
            const userNameElement = document.getElementById('userName');
            userNameElement.innerText = user.displayName || user.email;
        }
    });
}

// Fonction de déconnexion
function logout() {
    auth.signOut().then(() => {
        console.log('Utilisateur déconnecté');
        window.location.href = "login.html";
    }).catch((error) => {
        console.error('Erreur lors de la déconnexion :', error);
        alert('Erreur lors de la déconnexion : ' + error.message);
    });
}
