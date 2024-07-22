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
const auth = firebase.auth();

document.addEventListener("DOMContentLoaded", () => {
    const expenseForm = document.getElementById("expenseForm");
    const expenseContainer = document.getElementById("expensesList");
    const messageDiv = document.getElementById("message");

    // Obtenir la date sélectionnée
    const selectedDate = localStorage.getItem('selectedDate');

    if (!selectedDate) {
        showMessage("Aucune date sélectionnée !", "danger");
        window.location.href = "jour.html";
        return;
    }

    // Fonction pour afficher un message
    function showMessage(message, type) {
        messageDiv.textContent = message;
        messageDiv.className = `alert alert-${type}`;
        setTimeout(() => {
            messageDiv.textContent = "";
            messageDiv.className = "";
        }, 2000);
    }

    // Fonction pour ajouter une dépense à Firebase
    function addExpense(expense, userId) {
        database.ref(`expenses/${userId}/${selectedDate}`).push(expense)
            .then(() => {
                showMessage("Dépense ajoutée avec succès", "success");
                renderExpenses(userId);
            })
            .catch((error) => {
                console.log(`Erreur lors de l'ajout de la dépense : ${error.message}`);
                showMessage(`Erreur : ${error.message}`, "danger");
            });
    }

    // Fonction pour supprimer une dépense de Firebase
    window.deleteExpense = function(id) {
        auth.onAuthStateChanged(user => {
            if (user) {
                database.ref(`expenses/${user.uid}/${selectedDate}/${id}`).remove()
                    .then(() => {
                        showMessage("Dépense supprimée avec succès", "success");
                        renderExpenses(user.uid);
                    })
                    .catch((error) => {
                        console.log(`Erreur lors de la suppression de la dépense : ${error.message}`);
                        showMessage(`Erreur : ${error.message}`, "danger");
                    });
            }
        });
    }

    // Afficher les dépenses de la date sélectionnée
    function renderExpenses(userId) {
        database.ref(`expenses/${userId}/${selectedDate}`).once('value')
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

        auth.onAuthStateChanged(user => {
            if (user) {
                addExpense(newExpense, user.uid);
                expenseForm.reset();
            } else {
                showMessage("Vous devez être connecté pour ajouter une dépense.", "danger");
            }
        });
    });

    // Vérifier l'état de connexion de l'utilisateur
    auth.onAuthStateChanged(user => {
        if (user) {
            renderExpenses(user.uid);
        } else {
            showMessage("Vous devez être connecté pour voir vos dépenses.", "danger");
            window.location.href = "login.html";
        }
    });
});
