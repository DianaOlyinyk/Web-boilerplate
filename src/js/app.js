
import randomUserMock from './test-module.js';
import additionalUsers from './test-module.js';



/** ******** Your code here! *********** */

let subjects = ["Mathematics", "Physics", "English", "Computer Science", "Dancing", "Chess", "Biology", "Chemistry", "Law", "Art", "Medicine", "Statistics"];
let users = formatUsers(randomUserMock);
let currentTeacherId = -1;
let favoriteTeachers = [];
let randomUserSeed = "teachinder-lab4";

function formatUsers(users) {
    return _.map(users, (user, index) => _.assign({}, user, {
        id: index + 1,
        course: subjects[_.random(0, subjects.length - 1)],
        favourite: false,
        bg_color: "#" + _.random(0, 16777215).toString(16).padStart(6, '0'),
        note: _.defaultTo(_.get(user, "note"), "No notes available")
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

function getTeacherValue(teacher, field) {
    const directFields = {
        name: "full_name",
        country: "country",
        city: "city",
        state: "state",
        age: "age",
        favorite: "favourite"
    };
    const nestedFields = {
        country: "location.country",
        city: "location.city",
        state: "location.state",
        age: "dob.age",
        firstName: "name.first",
        lastName: "name.last"
    };

    if (field === "full_name" || field === "name") {
        const explicitName = _.get(teacher, "full_name");
        return explicitName || _.compact([_.get(teacher, "name.first"), _.get(teacher, "name.last")]).join(" ");
    }
    if (_.has(nestedFields, field)) {
        return _.defaultTo(_.get(teacher, nestedFields[field]), _.get(teacher, directFields[field]));
    }
    return _.get(teacher, directFields[field] || field);
}

function isValidPhone(phone, country) {
    if (!_.isString(phone) || _.isEmpty(_.trim(phone))) return false;

    const countryKey = _.toLower(_.trim(_.defaultTo(country, "")));
    const digits = _.replace(phone, /\D/g, "");

    if (_.includes(["usa", "united states"], countryKey)) {
        const nationalNumber = digits.length === 11 && _.startsWith(digits, "1")
            ? _.drop(digits).join("")
            : digits;
        return nationalNumber.length === 10 && /^[2-9]\d{2}[2-9]\d{6}$/.test(nationalNumber);
    }
    if (countryKey === "ukraine") {
        const nationalNumber = _.startsWith(digits, "380")
            ? digits.slice(3)
            : (_.startsWith(digits, "0") ? digits.slice(1) : digits);
        return nationalNumber.length === 9;
    }
    if (countryKey === "germany") {
        const nationalNumber = _.startsWith(digits, "49")
            ? digits.slice(2)
            : (_.startsWith(digits, "0") ? digits.slice(1) : digits);
        return nationalNumber.length >= 6 && nationalNumber.length <= 15;
    }

    return /^\+?[0-9\s\-()]{6,20}$/.test(_.trim(phone)) && digits.length >= 6;
}

function isValidEmail(email) {
    if (!_.isString(email)) return false;
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(_.trim(email));
}

function isCapitalizedString(value) {
    if (!_.isString(value) || _.isEmpty(_.trim(value))) return false;
    const cleanedValue = _.trim(value);
    const lowercaseValue = _.toLower(cleanedValue);
    return (_.upperFirst(cleanedValue) === cleanedValue
        && cleanedValue[0] !== _.toLower(cleanedValue[0]))
        || _.includes(["male", "female"], lowercaseValue);
}

function validateUsers(users) {
    return _.filter(_.isArray(users) ? users : [], teacher => {
        const name = getTeacherValue(teacher, "name");
        const fieldsToValidate = [
            name,
            getTeacherValue(teacher, "gender"),
            getTeacherValue(teacher, "state"),
            getTeacherValue(teacher, "city"),
            getTeacherValue(teacher, "country")
        ];
        const age = getTeacherValue(teacher, "age");

        return _.every(fieldsToValidate, isCapitalizedString)
            && !_.isNil(age)
            && !_.isEmpty(_.trim(String(age)))
            && _.isFinite(_.toNumber(age))
            && isValidPhone(getTeacherValue(teacher, "phone"), getTeacherValue(teacher, "country"))
            && isValidEmail(getTeacherValue(teacher, "email"));
    });
}

function validateTeacher(teacher) {
    if (_.isEmpty(_.trim(_.get(teacher, "full_name", "")))) return "Вкажіть ім’я та прізвище.";
    if (_.isEmpty(_.trim(_.get(teacher, "course", "")))) return "Оберіть предмет.";
    if (_.isEmpty(_.trim(_.get(teacher, "country", "")))) return "Оберіть країну.";
    if (_.isEmpty(_.trim(_.get(teacher, "city", "")))) return "Вкажіть місто.";
    if (!isValidEmail(_.get(teacher, "email"))) return "Вкажіть коректний email.";
    if (!isValidPhone(_.get(teacher, "phone"), _.get(teacher, "country"))) return "Вкажіть коректний номер телефону.";
    if (_.isEmpty(_.get(teacher, "gender"))) return "Оберіть стать.";

    const birthday = _.get(teacher, "dob.date");
    if (!birthday || Number.isNaN(Date.parse(birthday))) return "Вкажіть коректну дату народження.";
    if (birthday > new Date().toISOString().slice(0, 10)) return "Дата народження не може бути в майбутньому.";
    if (_.isEmpty(_.trim(_.get(teacher, "note", "")))) return "Додайте короткий опис.";

    return null;
}

function filterUsers(users, filters = {}) {
    return _.filter(_.isArray(users) ? users : [], teacher => {
        const selectedCountry = _.toLower(_.trim(_.defaultTo(filters.country, "any")));
        const selectedGender = _.toLower(_.trim(_.defaultTo(filters.gender, "any")));
        const teacherCountry = _.toLower(_.trim(_.defaultTo(getTeacherValue(teacher, "country"), "")));
        const teacherGender = _.toLower(_.trim(_.defaultTo(getTeacherValue(teacher, "gender"), "")));
        const teacherAge = _.toNumber(getTeacherValue(teacher, "age"));
        const teacherFavorite = _.defaultTo(_.get(teacher, "favourite"), _.get(teacher, "favorite", false));

        if (selectedCountry !== "any" && selectedCountry !== teacherCountry) return false;
        if (selectedGender !== "any" && selectedGender !== teacherGender) return false;

        if (!_.isNil(filters.age) && filters.age !== "" && filters.age !== "Any") {
            if (_.isNumber(filters.age) || /^\d+$/.test(String(filters.age))) {
                if (teacherAge !== _.toNumber(filters.age)) return false;
            } else if (_.includes(String(filters.age), "-")) {
                const [minimum, maximum] = _.map(_.split(String(filters.age), "-"), _.toNumber);
                if (teacherAge < minimum || teacherAge > maximum) return false;
            } else if (filters.age === "51+" && teacherAge < 51) {
                return false;
            }
        }

        if (!_.isNil(filters.favorite) && Boolean(teacherFavorite) !== Boolean(filters.favorite)) return false;

        if (filters.photo) {
            const imageUrl = _.get(teacher, "picture.medium", "");
            if (_.isEmpty(imageUrl) || _.includes(String(imageUrl), "placeholder")) return false;
        }

        return true;
    });
}

function sortUsers(users, sortBy = "full_name", order = "asc") {
    const allowedFields = ["full_name", "course", "age", "gender", "country"];
    const sortField = _.includes(allowedFields, sortBy) ? sortBy : "full_name";
    const sortValue = teacher => getTeacherValue(teacher, sortField);
    return _.orderBy(_.isArray(users) ? users : [], [sortValue], [_.toLower(order) === "desc" ? "desc" : "asc"]);
}

function findUser(users, key, value) {
    if (!_.isArray(users) || _.isNil(value)) return null;

    const searchField = key === "name" ? "full_name" : key;
    const normalizedSearch = _.toLower(_.trim(String(value)));
    return _.find(users, teacher => {
        const fieldValue = getTeacherValue(teacher, searchField);
        if (_.isNil(fieldValue)) return false;
        if (searchField === "age" || _.isNumber(value)) {
            return _.toNumber(fieldValue) === _.toNumber(value);
        }
        return _.includes(_.toLower(String(fieldValue)), normalizedSearch);
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
    const closeButton = popup.querySelector(".close-popup");
    const mapContainer = popup.querySelector("#map");
    const mapToggle = popup.querySelector(".toggle-map");

    closeButton.onclick = function () {
        popup.style.display = "none";
    };

    mapToggle.onclick = function () {
        mapContainer.hidden = !mapContainer.hidden;
        mapToggle.setAttribute("aria-expanded", String(!mapContainer.hidden));

        if (!mapContainer.hidden && map && activeMapTeacher) {
            requestAnimationFrame(() => {
                map.invalidateSize({ pan: false });
                MoveToMarker(activeMapTeacher);
            });
        }
    };

    teachers.onclick = function (event) {
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
        mapToggle.setAttribute("aria-expanded", String(!mapContainer.hidden));
        MoveToMarker(teacher);
    };
}
let map;
let activeMapTeacher = null;
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
    if (!user) return;
    activeMapTeacher = user;
    const coordinates = getTeacherCoordinates(user);
    if (!coordinates) return;
    if (!map) initMap([user]);
    if (!map) return;

    const marker = addTeacherMarker(user);
    if (!marker) return;

    requestAnimationFrame(() => {
        if (!map) return;
        map.setView(coordinates, 13);
        if (document.querySelector("#map").hidden) return;
        map.invalidateSize({ pan: false });
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
    const filteredUsers = filterUsers(users, {
        country,
        age,
        gender: sex,
        photo,
        favorite: favourite ? true : undefined
    });

    renderTeacher(filteredUsers);
    showPopup(filteredUsers);
    return filteredUsers;
}



function searchTeacher(){
    let searchButton = document.querySelector("#search-button");
    let input = document.querySelector("#search-input");
  
    searchButton.addEventListener("click", function(){
        const query = _.toLower(_.trim(input.value));
        const ageQuery = /^\d+$/.test(query) ? _.toNumber(query) : null;
        const filteredUsers = _.filter(users, teacher => {
            const searchableValues = [
                getTeacherValue(teacher, "name"),
                _.get(teacher, "note"),
                getTeacherValue(teacher, "country"),
                _.get(teacher, "course")
            ];
            const matchesText = _.some(searchableValues, value =>
                !_.isNil(value) && _.includes(_.toLower(String(value)), query)
            );
            const matchesAge = ageQuery !== null && _.toNumber(getTeacherValue(teacher, "age")) === ageQuery;
            return _.isEmpty(query) || matchesText || matchesAge;
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

