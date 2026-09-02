// function whenSubmit(e){
//     e.preventDefault(); 
//     let nameInput = document.getElementById("name").value.trim();
//     let tempName = nameInput.toLowerCase();
//     let nameFlag = true;
//     let validName = true;

//     let emailInput = document.getElementById("email").value.trim();
//     let Gmailregex = /^[A-Za-z]\w[A-Za-z.]{0,29}@gmail\.com$/;
//     let validEmail = true;

//     let passwordInput = document.getElementById("password").value;
//     let validPassword = true;

//     let greetingMessage = document.getElementById("greeting");
//     let messageDiv = document.getElementById("messageDiv");
//     let messagePlace = document.getElementById("message");
//     const messageDivCSS = `
//         @keyframes fadeIn {
//             from{
//                 opacity: 0;
//             }
//             to{
//                 opacity: 0.8;
//             }
//         }
//         #messageDiv{
//             display: flex;
//             justify-content: center;
//             align-items: center;
//             opacity: 0.8;
//             background-color: coral; 
//             background-color: var(--button-color);
//             border-radius: 0.75rem;
//             height: 8rem;
//             width: 33rem;
//             box-shadow: 0 15px 50px -12px #172c5fc5;
//             animation : fadeIn 1s ease;
//         }
//         `
//     const stylemessageDiv = document.createElement('style');
//     stylemessageDiv.textContent = messageDivCSS ;
//     document.head.appendChild(stylemessageDiv);
//     for(let i = 0 ; i < nameInput.length ; i++){
//         if(tempName[i] == " "){
//             continue;
//         }
//         if(tempName[i] < 'a' || tempName[i] > 'z'){
//             nameFlag = false;
//             break;
//         }
//     }
//     if(nameInput.length < 2 || nameInput.length > 50 || !nameFlag){
//         messageDiv.style.display = "flex"; 
//         messagePlace.textContent = "Please enter a valid Name (e.g. Khaled Ashraf)";
//         validName = false;
//         return; 
//     } else{
//         messageDiv.style.display = "none"; 
//         validName = true;
//     }
//     if(!emailInput.match(Gmailregex)){
//         messageDiv.style.display = "flex"; 
//         messagePlace.textContent = "Please enter a valid Gmail address (e.g. username@gmail.com)";
//         validEmail = false;
//         return;
//     } else{
//         messageDiv.style.display = "none";
//         validEmail = true;
//     }
//     if(passwordInput.length < 4){
//         messageDiv.style.display = "flex"; 
//         messagePlace.textContent = "Please enter a valid Password (e.g. khaled12)";
//         validPassword = true;
//         return;

//     } else{
//         messageDiv.style.display = "none";
//         validEmail = true;
//     }
//     if(validName && validEmail && validPassword){
//         messageDiv.style.display = "flex"; 
//         if(greetingMessage.innerText == "Welcome to Games Station"){
//             messagePlace.textContent = "Login successful. Redirecting you now to Home page";
//             setTimeout(() => {
//                 window.location.href = "home.html";
//             }, 2000);
//         }
//         else{
//             messagePlace.textContent = "Register successful. Redirecting you now to Login page";
//             setTimeout(() => {
//                 window.location.href = "index.html";
//             }, 3000);
//         }
//     }
// }
