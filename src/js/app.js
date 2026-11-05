import randomUserMock from './test-module.js';
import additionalUsers from './test-module.js';
/** ******** Your code here! *********** */

let subjects = ["Mathematics", "Physics", "English", "Computer Science", "Dancing", "Chess", "Biology", "Chemistry", "Law", "Art", "Medicine", "Statistics"];
let users = formatUsers(randomUserMock);
let currentTeacherId = -1;
let favoriteTeachers = [];

function formatUsers(users) {
    for (let i = 0; i < users.length; i++) {
        users[i].id = i + 1;
        users[i].course = subjects[Math.floor(Math.random() * subjects.length)];
        users[i].favourite = false;
        users[i].bg_color = "#" + Math.floor(Math.random() * 16777215).toString(16);
        users[i].note = users[i].note || "No notes available";
    }
      return users; 
}

function deleteDuplicates(randomUsers, additionalUsers) {
    let allUsers = randomUsers.concat(additionalUsers);
    let uniqueUsers = [];
    let userEmails = new Set();
    
    for (let user of allUsers) {
        let identifier = user.email || user.full_name;     
        if (identifier && !userEmails.has(identifier)) {
            userEmails.add(identifier);
            uniqueUsers.push(user);
        }
    }
    return uniqueUsers;
}

function isValidPhone(phone, country) {
    if (typeof phone !== 'string') return false;
 
    const phoneFormats = {
        'Germany': /^(\+49|0)[0-9\s\-]{6,15}$/,
        'USA': /^(\+1|1)?[2-9]\d{2}[2-9]\d{6}$/,
        'Ukraine': /^(\+380|0)\d{9}$/
    };
    const regex = phoneFormats[country] || /^\+?[0-9\s\-\(\)]{6,20}$/;
    return regex.test(phone);
}

function isValidEmail(email) {
    if (typeof email !== 'string') return false;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function isCapitalizedString(value) {
    if (typeof value !== 'string' || value.length === 0) return false;
    return value[0] === value[0].toUpperCase() && value[0] !== value[0].toLowerCase();
}

function validateUsers(users) {
    return users.filter(user => {

        const stringFields = ['full_name', 'gender', 'note', 'state', 'city', 'country'];
        for (let field of stringFields) {
            if (user[field] !== undefined && user[field] !== null) {
                if (!isCapitalizedString(user[field])) {
                    return false;
                }
            } else {
                return false;
            }
        }
        if (typeof user.age !== 'number' || Number.isNaN(user.age)) {
            return false;
        }
        if (!isValidPhone(user.phone, user.country)) {
            return false;
        }
        if (!isValidEmail(user.email)) {
            return false;
        }
        return true;
    });
}

function validateTeacher(teacher) {
    if (!teacher.full_name.trim()) return "Вкажіть ім’я та прізвище.";
    if (!teacher.course || teacher.course === "Select a subject") return "Оберіть предмет.";
    if (!teacher.country || teacher.country === "Select a region") return "Оберіть країну.";
    if (!teacher.city.trim()) return "Вкажіть місто.";
    if (!isValidEmail(teacher.email)) return "Вкажіть коректний email.";
    if (!isValidPhone(teacher.phone, teacher.country)) return "Вкажіть коректний номер телефону.";
    if (!teacher.gender) return "Оберіть стать.";
    if (!teacher.dob.date || Number.isNaN(Date.parse(teacher.dob.date))) {
        return "Вкажіть коректну дату народження.";
    }
    if (teacher.dob.date > new Date().toISOString().slice(0, 10)) {
        return "Дата народження не може бути в майбутньому.";
    }
    if (!teacher.note.trim()) return "Додайте короткий опис.";

    return null;
}

function filterUsers(users, filters = {}) {
    return users.filter(user => {

        if (filters.country !== undefined && user.country !== filters.country) {
            return false;
        }

        if (filters.age !== undefined && user.age !== filters.age) {
            return false;
        }

        if (filters.gender !== undefined && user.gender !== filters.gender) {
            return false;
        }

        if (filters.favorite !== undefined && user.favorite !== filters.favorite) {
            return false;
        }

        return true;
    });
}

function sortUsers(users, sortBy = 'full_name', order = 'asc') {
    const allowedFields = ['full_name', 'course', 'age', 'gender', 'country'];
    
    const modifier = order.toLowerCase() === 'desc' ? -1 : 1;

    return [...users].sort((a, b) => {
        let valA, valB;
        if (sortBy === 'full_name') {
            valA = `${a.name.first} ${a.name.last}`;
            valB = `${b.name.first} ${b.name.last}`;
        } else if (sortBy === 'age') {
            valA = a.dob ? a.dob.age : a.age;
            valB = b.dob ? b.dob.age : b.age;
        } else if (sortBy === 'country') {
            valA = a.location ? a.location.country : a.country;
            valB = b.location ? b.location.country : b.country;
        } else {
            valA = a[sortBy];
            valB = b[sortBy];
        }

        if (valA === undefined || valA === null) return 1;
        if (valB === undefined || valB === null) return -1;

        if (typeof valA === 'number' && typeof valB === 'number') {
            return (valA - valB) * modifier;
        }
        
        return String(valA).localeCompare(String(valB), undefined, { numeric: true, sensitivity: 'base' }) * modifier;
    });
}


function findUser(users, key, value) {
    if (!users || !Array.isArray(users) || value === undefined || value === null) {
        return null;
    }

    const searchField = (key === 'name') ? 'full_name' : key;

    return users.find(user => {
        const fieldValue = user[searchField];

        if (fieldValue === undefined || fieldValue === null) {
            return false;
        }

        if (typeof value === 'number' || searchField === 'age') {
            return Number(fieldValue) === Number(value);
        }

        const strValue = String(value).toLowerCase().trim();
        const strFieldValue = String(fieldValue).toLowerCase();

        return strFieldValue.includes(strValue);
    }) || null;
}


function getMatchingPercentage(users, predicate) {
    if (!users || !Array.isArray(users) || users.length === 0) {
        return 0;
    }

    let matchCount = 0;

    if (typeof predicate === 'function') {
        matchCount = users.filter(predicate).length;
    } 
    else if (typeof predicate === 'object' && predicate !== null) {
        const { field, operator, value } = predicate;

        matchCount = users.filter(user => {
            const fieldValue = user[field];

            switch (operator) {
                case '>':  return fieldValue > value;
                case '>=': return fieldValue >= value;
                case '<':  return fieldValue < value;
                case '<=': return fieldValue <= value;
                case '===':
                case '==':  return fieldValue === value;
                case '!=':
                case '!==': return fieldValue !== value;
                case 'includes':
                    return String(fieldValue).toLowerCase().includes(String(value).toLowerCase());
                default:
                    return fieldValue === value;
            }
        }).length;
    }

    const percentage = (matchCount / users.length) * 100;

    return Number(percentage.toFixed(2));
}

/*
    DOM Interaction Functions
*/

function renderTeacher(users = []) {
    let teachers = document.querySelector("#teachers");
    if (!teachers) return;
    teachers.innerHTML = "";

    for (let i = 0; i < users.length; i++) {
        let user = users[i];

        let article = document.createElement("article");
        article.classList.add("teacher");

        let starSpan = document.createElement("span");
        starSpan.classList.add("teacher-star");
        starSpan.textContent = user.favourite ? "★" : "";

        let div = document.createElement("div");
        div.id = "photo";
        let img = document.createElement("img");
        img.src = user.picture.medium;
        div.appendChild(img);

        let h3 = document.createElement("h3");
        h3.innerHTML = user.name.first + "<br>" + user.name.last;

        let p = document.createElement("p");
        p.textContent = user.course;

        let small = document.createElement("small");
        small.textContent = user.location.country;

        article.appendChild(starSpan); 
        article.appendChild(div);
        article.appendChild(h3);
        article.appendChild(p);
        article.appendChild(small);

        teachers.appendChild(article);
    }
}



function showPopup(users=[]) {
    let popup = document.querySelector("#teacher-info");
    let teachers = document.querySelector("#teachers");

    popup.querySelector(".close-popup").addEventListener("click", function () {
        popup.style.display = "none";
    });

    teachers.addEventListener("click", function (event) {
        let article = event.target.closest(".teacher");

        if (!article || !teachers.contains(article)) return;

        let index = Array.from(teachers.children).indexOf(article);
        let teacher = users[index];

        currentTeacherId = teacher.id;
        popup.style.display = "flex";

        popup.querySelector(".photo img").src = teacher.picture.large;
        popup.querySelector(".teacher-name").textContent =
            teacher.name
                ? teacher.name.first + " " + teacher.name.last
                : teacher.full_name;

        popup.querySelector(".teacher-subject").textContent = teacher.course;

        popup.querySelector(".teacher-location").textContent =
            teacher.location
                ? teacher.location.city + ", " + teacher.location.country
                : teacher.city + ", " + teacher.country;

        popup.querySelector(".teacher-age").textContent =
            (teacher.dob ? teacher.dob.age : teacher.age) + ", " + teacher.gender;

        popup.querySelector(".teacher-phone").textContent = teacher.phone;
        popup.querySelector(".teacher-email").textContent = teacher.email;
        popup.querySelector(".favorite-star").textContent =
            teacher.favourite ? "★" : "☆";
    });
}

function addToFavorites() {
    let star = document.querySelector("#teacher-info .favorite-star");
    star.addEventListener("click", function() {
        star.textContent = star.textContent === "☆" ? "★" : "☆";
       
            if (!favoriteTeachers.includes(currentTeacherId)) {
                favoriteTeachers.push(currentTeacherId);
                users.find(user => user.id === currentTeacherId).favourite = true;
            }
            else {
                favoriteTeachers.splice(favoriteTeachers.indexOf(currentTeacherId), 1);
                users.find(user => user.id === currentTeacherId).favourite = false;
            }
            renderFavorites();
            AllFilter()
    });
    renderFavorites();
}

function renderFavorites() {
    let teachers = document.querySelector("#teachers-list");
    if (!teachers) return;
    teachers.innerHTML = "";
    
    for (let i = 0; i < favoriteTeachers.length; i++) {
        let teacher = users.find(user => user.id === favoriteTeachers[i]);
        if (!teacher) continue;

        let teacherCard = document.createElement("div");
        teacherCard.id = "teacher_card";
        
        let photo = document.createElement("div");
        photo.id = "photo";
        let img = document.createElement("img");
        img.src = teacher.picture.medium;
        photo.appendChild(img);
        teacherCard.appendChild(photo);

        let name = document.createElement("h3");
        name.textContent = teacher.name.first + " " + teacher.name.last;
        teacherCard.appendChild(name);

        let country = document.createElement("small");
        country.textContent = teacher.location.country;
        teacherCard.appendChild(country);

        teacherCard.addEventListener("click", function() {
            let popup = document.querySelector("#teacher-info");
            if (!popup) return;

            currentTeacherId = teacher.id;
            popup.style.display = "flex";

            popup.querySelector(".photo img").src = teacher.picture.large;
            popup.querySelector(".teacher-name").textContent = 
                teacher.name ? teacher.name.first + " " + teacher.name.last : teacher.full_name;

            popup.querySelector(".teacher-subject").textContent = teacher.course;
            popup.querySelector(".teacher-location").textContent = 
                teacher.location ? teacher.location.city + ", " + teacher.location.country : teacher.city + ", " + teacher.country;

            popup.querySelector(".teacher-age").textContent = 
                (teacher.dob ? teacher.dob.age : teacher.age) + ", " + teacher.gender;

            popup.querySelector(".teacher-phone").textContent = teacher.phone;
            popup.querySelector(".teacher-email").textContent = teacher.email;
           
            let star = popup.querySelector(".favorite-star");
            if (star) {
                star.textContent = teacher.favourite ? "★" : "☆";
            }
        });

        teachers.appendChild(teacherCard);
    }
}

let age = "Any";
function filterByAge(){
    let selectAge = document.querySelector("#age")
    
    selectAge.addEventListener("change", function(){

        age = selectAge.value;
        AllFilter();
       
    });
}

let country = "Any"
function countryFilter() {
    let selectCountry = document.querySelector("#regionFilter");
    let uniqueCountries = [ "Any", ...new Set(users.map(user => user.location.country))];

    uniqueCountries.forEach(country => {
        let option = document.createElement("option");
        option.value = country;
        option.textContent = country;
        selectCountry.appendChild(option);
    });
    

    selectCountry.addEventListener("change", function() {
        country = selectCountry.value.toLowerCase()
        AllFilter();
      
    });
}

let sex = "any";
function filterBySex() {
    let selectSex = document.querySelector("#sex");
    
    selectSex.addEventListener("change", function() {
        sex = selectSex.value.toLowerCase();
        AllFilter();
     
    });
}

let photo = false
function filterByPhoto() {
    let photoCheckboxOption = document.querySelector("#with_photo");
    if (!photoCheckboxOption) return;

    photoCheckboxOption.addEventListener("change", function() {
        photo = photoCheckboxOption.checked;
        AllFilter();
      
       
    });
}

let favourite = false;
function filterFavourites(){
    let favouritesOnlyOption = document.querySelector("#favorites_only");
    if(!favouritesOnlyOption) return;
    favouritesOnlyOption.addEventListener("change", function(){
        favourite = favouritesOnlyOption.checked;
        AllFilter();
    });

}

function AllFilter()
{
        let filteredUsers = users.filter(user => {
        
        if (photo) {
            const medium = user.picture ? user.picture.medium : "";
            const large = user.picture ? user.picture.large : "";
            let hasRealPhoto = medium !== "https://via.placeholder.com/150" && large !== "https://via.placeholder.com/300";
            if (!hasRealPhoto) return false;
        }

        if (sex.toLowerCase() !== "any") {
            if (!user.gender || user.gender.toLowerCase() !== sex.toLowerCase()) {
                return false;
            }
        }

        if (age !== "" && age !== "Any") {
            let userAge = user.dob ? user.dob.age : user.age;
            if (age.includes("-")) {
                let ageRange = age.split("-").map(Number);
                if (userAge < ageRange[0] || userAge > ageRange[1]) return false;
            } else if (age === "51+") {
                if (userAge < 51) return false;
            }
        }

        if (country.toLowerCase() !== "any") {
            let userCountry = user.location ? user.location.country : user.country;
            if (!userCountry || userCountry.toLowerCase() !== country) {
                return false;
            }
        }

        if (favourite && !user.favourite) {
            return false;
        }

        return true;
    });
   
    renderTeacher(filteredUsers);
    renderTable(filteredUsers);
    showPopup(filteredUsers);
    return filteredUsers;
}



function searchTeacher(){
    let searchButton = document.querySelector("#search-button");
    let input = document.querySelector("#search-input");
    console.log(users);
    searchButton.addEventListener("click", function(){
        let filteredUsers = users.filter(user => {
            return user.name.first.toLowerCase().includes(input.value.toLowerCase()) || 
            user.note?.toLowerCase().includes(input.value.toLowerCase()) ||
            user.dob.age === parseInt(input.value);
        });
        renderTeacher(filteredUsers);
        showPopup(filteredUsers);
    });
}

async function addTeacher() {
    let addButtons = document.querySelectorAll(".add-button");
    let popup = document.querySelector("#add-teacher-popup");
    let form = popup.querySelector("form");
    let closeButton = document.querySelector("#close");

    addButtons.forEach(button =>{
        button.addEventListener("click", function () {
            popup.style.display = "flex";
        });
    });

    closeButton.addEventListener("click", function () {
        popup.style.display = "none";
    });

    form.addEventListener("submit", async function (event) {
        event.preventDefault(); 

        const fullName = form.querySelector("#name").value.trim();
        const nameParts = fullName.split(" ");
        const firstName = nameParts[0] || fullName;
        const lastName = nameParts.slice(1).join(" ") || "";

        const dobValue = form.querySelector("#date_of_birth").value;
        const birthDate = new Date(dobValue);
        const ageDiffMs = Date.now() - birthDate.getTime();
        const ageDate = new Date(ageDiffMs);
        const calculatedAge = Math.abs(ageDate.getUTCFullYear() - 1970);

        const genderInput = form.querySelector("input[name='gender']:checked");
        const genderValue = genderInput ? genderInput.value : "";

        const subjectSelect = form.querySelector("#subject");
        const selectedSubject = subjectSelect.options[subjectSelect.selectedIndex].text;

        const newTeacher = {
            id: users.length ? Math.max(...users.map(u => u.id)) + 1 : 1,
            full_name: fullName,
            name: {
                first: firstName,
                last: lastName
            },
            gender: genderValue,
            course: selectedSubject,
            age: calculatedAge,
            dob: {
                age: calculatedAge,
                date: dobValue
            },
            email: form.querySelector("#email").value,
            phone: form.querySelector("#phone").value,
            city: form.querySelector("#city").value,
            country: form.querySelector("#region").value,
            location: {
                city: form.querySelector("#city").value,
                country: form.querySelector("#region").value
            },
            picture: {
                medium: "https://via.placeholder.com/150", 
                large: "https://via.placeholder.com/300"
            },
            note: form.querySelector("#bio").value || "No notes available",
            favourite: false
        };
        const validationError = validateTeacher(newTeacher);
        if (validationError) {
            alert(validationError);
            return;
        }

        try {
            const savedTeacher = await submitForm(newTeacher);
            users.unshift(savedTeacher);
            renderTeacher(users);
            renderTable(users);
            form.reset();
            popup.style.display = "none";
        } catch (error) {
            alert("Не вдалося зберегти викладача. Перевір, чи запущений JSON Server.");
            console.error(error);
        }
        
    });
}


const TABLE_PAGE_SIZE = 10;
const randomUserSeed = "teachinder-lab4";
let tablePage = 0;
let nextApiPage = 1;
let tableRows = [];

function renderTable(users = [], page = 0) {
   
    const tbody = document.querySelector("#statistics-table tbody");
    if (!tbody) return;
    tableRows = users;
    tablePage = Math.max(0, Math.min(page, Math.ceil(tableRows.length / TABLE_PAGE_SIZE) - 1));
    tbody.innerHTML = "";

    const start = tablePage * TABLE_PAGE_SIZE;
    const visibleUsers = tableRows.slice(start, start + TABLE_PAGE_SIZE);

    for (let i = 0; i < visibleUsers.length; i++) {
        let user = visibleUsers[i];

        let fullName = user.name ? `${user.name.first} ${user.name.last}` : user.full_name;
        let speciality = user.course || "N/A";
        let age = user.dob ? user.dob.age : user.age;
        let gender = user.gender || "N/A";
        let country = user.location ? user.location.country : user.country;

        let tr = document.createElement("tr");

        tr.innerHTML = `
            <td>${fullName}</td>
            <td>${speciality}</td>
            <td>${age}</td>
            <td>${gender}</td>
            <td>${country}</td>
        `;
        tbody.appendChild(tr);
    }

    renderTablePagination();
}

function renderTablePagination() {
    const paginationContainer = document.querySelector(".pagination");
    if (!paginationContainer) return;

    paginationContainer.innerHTML = "";
    const totalPages = Math.max(1, Math.ceil(tableRows.length / TABLE_PAGE_SIZE));

    const previousButton = document.createElement("button");
    previousButton.type = "button";
    previousButton.textContent = "Previous";
    previousButton.disabled = tablePage === 0;
    previousButton.addEventListener("click", () => renderTable(tableRows, tablePage - 1));

    const pageLabel = document.createElement("span");
    pageLabel.classList.add("page-number");
    pageLabel.textContent = `${tablePage + 1} / ${totalPages}`;

    const nextButton = document.createElement("button");
    nextButton.type = "button";
    nextButton.textContent = "Next";
    nextButton.disabled = false;
    nextButton.addEventListener("click", async () => {
        const nextPage = tablePage + 1;
        if (nextPage * TABLE_PAGE_SIZE >= tableRows.length) {
            nextButton.disabled = true;
            try {
                const response = await fetch(`https://randomuser.me/api/?results=${TABLE_PAGE_SIZE}&seed=${randomUserSeed}&page=${nextApiPage}`);
                if (!response.ok) throw new Error(`Random User API: ${response.status}`);
                const data = await response.json();
                nextApiPage += 1;
                users = users.concat(data.results);
                const filteredUsers = AllFilter();
                renderTable(filteredUsers, nextPage);
            } catch (error) {
                nextButton.disabled = false;
                console.error("Не вдалося завантажити наступну сторінку:", error);
            }
        } else {
            renderTable(tableRows, nextPage);
        }
    });

    paginationContainer.append(previousButton, pageLabel, nextButton);
}

let currentSortField = null;
let sortOrder = 'asc'; 

function initTableSorting() {
    const headers = document.querySelectorAll("#statistics-table th[data-sort]");
    
    headers.forEach(th => {
        th.style.cursor = "pointer"; 
        
        th.addEventListener("click", function() {
            const field = this.getAttribute("data-sort");
            if (currentSortField === field) {
                sortOrder = sortOrder === 'asc' ? 'desc' : 'asc';
            } else {
                currentSortField = field;
                sortOrder = 'asc';
            }
           
            let sortKey = field;
            if (field === 'full_name') sortKey = 'full_name'; 
            if (field === 'course') sortKey = 'course';
            if (field === 'age') sortKey = 'age';
            if (field === 'country') sortKey = 'country';

            
            let sortedUsers = sortUsers(users, sortKey, sortOrder);
            
            renderTable(sortedUsers);
        });
    });
}

function initFavoritesCarousel() {
    const leftArrow = document.querySelector("#arrow-left");
    const rightArrow = document.querySelector("#arrow-right");
    const teachersList = document.querySelector("#teachers-list");

    if (!leftArrow || !rightArrow || !teachersList) return;

    const scrollAmount = 220; 

    leftArrow.addEventListener("click", () => {
        teachersList.scrollBy({
            left: -scrollAmount,
            behavior: "smooth"
        });
    });

    rightArrow.addEventListener("click", () => {
        teachersList.scrollBy({
            left: scrollAmount,
            behavior: "smooth"
        });
    });
}

fetchUsers();



/*
    Web Requests
 */

async function fetchUsers() {
    try {
        const initialPages = await Promise.all(
            Array.from({ length: 5 }, (_, index) => fetch(
                `https://randomuser.me/api/?results=${TABLE_PAGE_SIZE}&seed=${randomUserSeed}&page=${index + 1}`
            ))
        );
        if (initialPages.some(response => !response.ok)) {
            throw new Error("Не вдалося завантажити початкові сторінки викладачів.");
        }
        const initialData = await Promise.all(initialPages.map(response => response.json()));
        users = initialData.flatMap(data => data.results);
        nextApiPage = 6;
        renderTeacher(users);
        renderTable(users);
        showPopup(users);
        initTableSorting();
        addTeacher();
        filterByAge();
        filterByPhoto();
        countryFilter();
        filterBySex();
        filterFavourites();
        searchTeacher();
        addToFavorites();
        initFavoritesCarousel();
        return users;
    } catch (error) {
        console.error("Помилка при завантаженні даних:", error);
    }
}

async function submitForm(newTeacher) {
    const response = await fetch("http://localhost:3000/teachers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newTeacher)
    });

    if (!response.ok) {
        throw new Error(`POST failed: ${response.status}`);
    }

    return response.json();
}

 
