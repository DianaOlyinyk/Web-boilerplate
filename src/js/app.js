import randomUserMock from './test-module.js';
import additionalUsers from './test-module.js';
/** ******** Your code here! *********** */

let subjects = ["Mathematics", "Physics", "English", "Computer Science", "Dancing", "Chess", "Biology", "Chemistry", "Law", "Art", "Medicine", "Statistics"];


function formatUsers(users) {
    for (let i = 0; i < users.length; i++) {
        users[i].id = i + 1;
        users[i].course = subjects[Math.floor(Math.random() * subjects.length)];
        users[i].favourite = Math.random() < 0.5 ? true : false;
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
  
    const allowedFields = ['full_name', 'age', 'b_day', 'country'];
    if (!allowedFields.includes(sortBy)) {
        console.warn(`Поле "${sortBy}" недоступне для сортування. Використовуйте одне з: ${allowedFields.join(', ')}`);
        return users;
    }

    const modifier = order.toLowerCase() === 'desc' ? -1 : 1;

    return [...users].sort((a, b) => {
        let valA = a[sortBy];
        let valB = b[sortBy];

        if (valA === undefined || valA === null) return 1;
        if (valB === undefined || valB === null) return -1;

        if (sortBy === 'b_day') {
            valA = new Date(valA).getTime();
            valB = new Date(valB).getTime();
        }

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


