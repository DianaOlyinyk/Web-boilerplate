//import { response } from 'express';
import randomUserMock from './test-module.js';
import additionalUsers from './test-module.js';
//import { Chart } from 'chart.js/auto';


/** ******** Your code here! *********** */

let subjects = ["Mathematics", "Physics", "English", "Computer Science", "Dancing", "Chess", "Biology", "Chemistry", "Law", "Art", "Medicine", "Statistics"];
let users = formatUsers(randomUserMock);
let currentTeacherId = -1;
let favoriteTeachers = [];
let randomUserSeed = "teachinder-lab4";

function formatUsers(users) {
   /* for (let i = 0; i < users.length; i++) {
        users[i].id = i + 1;
        users[i].course = subjects[Math.floor(Math.random() * subjects.length)];
        users[i].favourite = false;
        users[i].bg_color = "#" + Math.floor(Math.random() * 16777215).toString(16);
        users[i].note = users[i].note || "No notes available";
    }*/

    
      return _.map(users, (user, index) => ({
        ...user,
        id: index + 1,
        course: subjects[_.random(0, subjects.length - 1)],
        favourite: false,
        bg_color: "#" + _.random(0, 16777215).toString(16).padStart(6, '0'),
        note: user.note || "No notes available"
    })); 
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



function updateBirthdayCountdown(teacher) {
    const countdown = document.querySelector(".teacher-birthday-countdown");
    if (!countdown) return;

    const dateValue = teacher && teacher.dob && teacher.dob.date;
    if (!dateValue || !window.dayjs) {
        countdown.textContent = "Birthday date is unavailable.";
        return;
    }

    const birthDate = window.dayjs(String(dateValue).slice(0, 10));
    if (!birthDate.isValid()) {
        countdown.textContent = "Birthday date is unavailable.";
        return;
    }

    const today = window.dayjs().startOf("day");
    const month = birthDate.month();
    const day = birthDate.date();
    const isLeapYear = year => (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
    const birthdayInYear = year => {
        if (month === 1 && day === 29 && !isLeapYear(year)) {
            return window.dayjs(new Date(year, 1, 28)).startOf("day");
        }
        return window.dayjs(new Date(year, month, day)).startOf("day");
    };

    let nextBirthday = birthdayInYear(today.year());
    if (nextBirthday.isBefore(today, "day")) {
        nextBirthday = birthdayInYear(today.year() + 1);
    }

    const daysRemaining = nextBirthday.diff(today, "day");
    countdown.textContent = daysRemaining === 0
        ? "Birthday is today!"
        : `Next birthday in ${daysRemaining} ${daysRemaining === 1 ? "day" : "days"}.`;
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
        updateBirthdayCountdown(teacher);

        popup.querySelector(".teacher-phone").textContent = teacher.phone;
        popup.querySelector(".teacher-email").textContent = teacher.email;
        popup.querySelector(".favorite-star").textContent =
            teacher.favourite ? "★" : "☆";
            MoveToMarker(teacher);  
    });
}
let map;
const teacherMarkers = new WeakMap();

function getTeacherCoordinates(user) {
    const coordinates = user && user.location && user.location.coordinates;
    if (!coordinates) return null;

    const latitude = Number.parseFloat(coordinates.latitude);
    const longitude = Number.parseFloat(coordinates.longitude);
    if (!Number.isFinite(latitude) || !Number.isFinite(longitude)
        || latitude < -90 || latitude > 90
        || longitude < -180 || longitude > 180) {
        return null;
    }

    return [latitude, longitude];
}

function addTeacherMarker(user) {
    const coordinates = getTeacherCoordinates(user);
    if (!map || !coordinates || !user || typeof user !== "object") return null;

    let marker = teacherMarkers.get(user);
    if (marker) return marker;

    const popup = document.createElement("div");
    const name = document.createElement("strong");
    const location = document.createElement("div");
    const fullName = user.name
        ? `${user.name.first || ""} ${user.name.last || ""}`.trim()
        : (user.full_name || "Teacher");
    const city = user.location && user.location.city ? user.location.city : user.city;
    const countryName = user.location && user.location.country ? user.location.country : user.country;

    name.textContent = fullName || "Teacher";
    location.textContent = [city, countryName].filter(Boolean).join(", ");
    popup.append(name, location);

    marker = L.marker(coordinates).addTo(map).bindPopup(popup);
    teacherMarkers.set(user, marker);
    return marker;
}

function MoveToMarker(user) {
    if (!user || !getTeacherCoordinates(user)) return;
    if (!map) initMap([user]);
    if (!map) return;

    const marker = addTeacherMarker(user);
    if (!marker) return;

    const coordinates = getTeacherCoordinates(user);
    requestAnimationFrame(() => {
        if (!map) return;
        map.invalidateSize({ pan: false });
        map.setView(coordinates, 13);
        marker.openPopup();
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
            MoveToMarker(teacher);

            popup.querySelector(".photo img").src = teacher.picture.large;
            popup.querySelector(".teacher-name").textContent = 
                teacher.name ? teacher.name.first + " " + teacher.name.last : teacher.full_name;

            popup.querySelector(".teacher-subject").textContent = teacher.course;
            popup.querySelector(".teacher-location").textContent = 
                teacher.location ? teacher.location.city + ", " + teacher.location.country : teacher.city + ", " + teacher.country;

            popup.querySelector(".teacher-age").textContent = 
                (teacher.dob ? teacher.dob.age : teacher.age) + ", " + teacher.gender;
            updateBirthdayCountdown(teacher);

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
    showPopup(filteredUsers);
    return filteredUsers;
}



function searchTeacher(){
    let searchButton = document.querySelector("#search-button");
    let input = document.querySelector("#search-input");
  
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

    form.addEventListener("click", async function (event) {
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
            countryReport(users);
            form.reset();
            popup.style.display = "none";
        } catch (error) {
            alert("Не вдалося зберегти викладача. Перевір, чи запущений JSON Server.");
            console.error(error);
        }
        
    });
}
let report;
let countryReportMode = "country";
let countryReportData = [];

function normalizeReportUsers(teachers = []) {
    return teachers.map((teacher, index) => ({
        "Teacher ID": String(teacher.email || teacher.id || index + 1),
        "Teacher name": teacher.name
            ? `${teacher.name.first || ""} ${teacher.name.last || ""}`.trim()
            : (teacher.full_name || "Unknown"),
        Country: (teacher.location && teacher.location.country) || teacher.country || "Unknown",
        City: (teacher.location && teacher.location.city) || teacher.city || "Unknown",
        Age: String((teacher.dob && teacher.dob.age) || teacher.age || ""),
        Gender: teacher.gender || "Unknown",
        Subject: teacher.course || teacher.subject || "Not specified",
        Email: teacher.email || "",
        Phone: teacher.phone || "",
        Birthday: teacher.dob && teacher.dob.date
            ? String(teacher.dob.date).slice(0, 10)
            : "",
        "Teacher count": 1
    }));
}

function buildCountryReport(data, mode) {
    const reportConfig = {
        dataSource: { data },
        options: {
            grid: mode === "flat"
                ? { type: "flat", showTotals: "off", showGrandTotals: "off" }
                : { type: "compact" }
        }
    };

    if (mode === "flat") {
        const flatColumns = [
            "Teacher ID", "Teacher name", "Country", "City", "Age",
            "Gender", "Subject", "Email", "Phone", "Birthday"
        ];
        reportConfig.slice = {
            rows: flatColumns.map(column => ({ uniqueName: column, caption: column }))
        };
    } else {
        reportConfig.slice = {
            rows: [{ uniqueName: "Country", caption: "Country" }],
            columns: [{ uniqueName: "Measures" }],
            measures: [{
                uniqueName: "Teacher count",
                aggregation: "sum",
                caption: "Number of teachers"
            }]
        };
    }

    return reportConfig;
}

function setCountryReportMode(mode) {
    countryReportMode = mode;
    if (report && countryReportData.length) {
        report.setReport(buildCountryReport(countryReportData, countryReportMode));
    }

    document.querySelectorAll("[data-report-mode]").forEach(button => {
        button.setAttribute("aria-pressed", String(button.dataset.reportMode === mode));
    });
}

function initCountryReportControls() {
    document.querySelectorAll("[data-report-mode]").forEach(button => {
        button.addEventListener("click", () => setCountryReportMode(button.dataset.reportMode));
    });
}

function countryReport(teachers = users) {
    countryReportData = normalizeReportUsers(teachers);

    const container = document.querySelector("#reportContainer");
    if (!container) return;
    if (!countryReportData.length) {
        container.textContent = "No teacher data is available.";
        return;
    }
    if (!window.WebDataRocks) {
        container.textContent = "WebDataRocks could not be loaded.";
        return;
    }

    const config = buildCountryReport(countryReportData, countryReportMode);
    if (report) {
        report.setReport(config);
        return;
    }

    report = new window.WebDataRocks({
        container: "#reportContainer",
        toolbar: true,
        height: 500,
        report: config
    });
}

function renderChart(users) {
    let ctx = document.getElementById('ageChart').getContext('2d');
    let chartData = {};
    for(let user of users) {
       let couuntry = user.location.country;
         if(chartData[couuntry]) {
            chartData[couuntry]++;
        }
        else {
            chartData[couuntry] = 1;
        }
    }
    let labels = Object.keys(chartData);
    let data = Object.values(chartData);
    let chart = new Chart(ctx, {
        type: 'pie',
        data: {
            labels: labels,
            datasets: [{
                label: 'Number of Teachers',
                data: data,
                backgroundColor: ['rgba(255, 99, 132, 0.2)',
                                  'rgba(54, 162, 235, 0.2)',
                                  'rgba(255, 206, 86, 0.2)',
                                  'rgba(75, 192, 192, 0.2)',
                                  'rgba(153, 102, 255, 0.2)',
                                  'rgba(255, 159, 64, 0.2)',
                                    'rgba(255, 99, 132, 0.2)',
                                  'rgba(54, 162, 235, 0.2)'],
                borderColor: 'rgba(54, 162, 235, 1)',
                borderWidth: 1
            }]
        },
        options: {
           responseive: true
        }
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
            Array.from({ length: 5 }, (_) => fetch(
                `https://randomuser.me/api/?results=50`
            ))
        );
        if (initialPages.some(response => !response.ok)) {
            throw new Error("Не вдалося завантажити початкові сторінки викладачів.");
        }
        const initialData = await Promise.all(initialPages.map(response => response.json()));
        users = initialData.flatMap(data => data.results);
    
        renderTeacher(users);
        renderChart(users);
        showPopup(users);
        initCountryReportControls();
        countryReport(users);
        addTeacher();
        filterByAge();
        filterByPhoto();
        countryFilter();
        filterBySex();
        filterFavourites();
        searchTeacher();
        addToFavorites();
        initFavoritesCarousel();
        initMap(users);
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

/**
 * JS libraries
*/

function initMap(users = []) {
    const mapContainer = document.getElementById("map");
    if (!mapContainer || typeof L === "undefined") return;

    if (!map) {
        map = L.map(mapContainer).setView([20, 0], 2);
        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(map);
    }

    users.forEach(addTeacherMarker);
}

