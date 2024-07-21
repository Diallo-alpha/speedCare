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

// Générer les jours du mois pour l'affichage
document.addEventListener('DOMContentLoaded', (event) => {
    generateMonthDays();
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

        // Ajouter un gestionnaire de clic pour rediriger vers add.html avec la date sélectionnée
        dateItem.addEventListener('click', () => {
            localStorage.setItem('selectedDate', `${year}-${month + 1}-${day}`);
            window.location.href = "add.html";
        });

        dateContainer.appendChild(dateItem);
    }
}
