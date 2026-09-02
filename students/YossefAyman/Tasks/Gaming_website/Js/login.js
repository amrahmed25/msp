let nameInp = document.getElementById("name");
let passInp = document.getElementById("pass");

const removeError = (e) => e.target.classList.remove("inp-error");
nameInp.addEventListener("input", removeError);
passInp.addEventListener("input", removeError);

function isValidName(value) {
    let names = String(value).trim().split(/\s+/);
    return names.length >= 2;
}

function isValidPass(value) {
    let hasUpperCase   = /[A-Z]/.test(value);
    let hasLowerCase   = /[a-z]/.test(value);
    let hasSpecialChar = /[~!@#$%^&*()_+{}\[\]]/.test(value);
    
    return hasLowerCase && hasUpperCase && hasSpecialChar;
}

function handlSubmit() {
    let isNameOk = isValidName(nameInp.value);
    let isPassOk = isValidPass(passInp.value);

    nameInp.classList.toggle("inp-error", !isNameOk);
    passInp.classList.toggle("inp-error", !isPassOk);

    if (isNameOk && isPassOk) {   
        window.location.href = "../index.html"
    } else {
        let mss = '';
        if (!isNameOk) mss += "• Should contain at least 2 names.\n";
        if (!isPassOk) mss += "• Password must include: Upper case, Lower case, and Special characters.";
        alert(mss)
    }
}