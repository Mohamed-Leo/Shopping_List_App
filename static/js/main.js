// firebase congigration and functions---------------------------------------------------------------------------------------------

// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.10.0/firebase-app.js";
import { getDatabase , ref , push , onValue , remove } from "https://www.gstatic.com/firebasejs/10.10.0/firebase-database.js";
// Firebase authentication--------
import { getAuth, createUserWithEmailAndPassword ,signInWithEmailAndPassword , signOut , sendPasswordResetEmail} from "https://www.gstatic.com/firebasejs/10.10.0/firebase-auth.js";
// Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries


// Your web app's Firebase configuration----
const firebaseConfig = {
    apiKey: "AIzaSyDARjOeuPuN0wFvaLNQL4rNQU5dDYkUKPk",
    authDomain: "shoppig-list-app.firebaseapp.com",
    databaseURL: "https://shoppig-list-app-default-rtdb.firebaseio.com",
    projectId: "shoppig-list-app",
    storageBucket: "shoppig-list-app.appspot.com",
    messagingSenderId: "991060552009",
    appId: "1:991060552009:web:6e3791080021f8577b9298"
};

// Initialize Firebase---
const app = initializeApp(firebaseConfig);
// database connection----
const db = getDatabase(app);
// auth users-----
const auth = getAuth();


// catch all needed elements*--------------------------------------------------------------
const register_btn = document.getElementById('register_btn'),
sign_up_btn = document.getElementById('sign_up_btn'),
signupForm = document.querySelector('.signup'),
loginForm = document.querySelector('.login'),
sign_in_btn = document.getElementById('sign_in_btn'),
loginBtn = document.getElementById('login'),
emailInput_login = document.getElementById('email_login'),
passwordInput_login = document.getElementById('password_login'),
email_register = document.getElementById('email_register'),
password_register = document.getElementById('password_register'),
pass_eye_icon = document.querySelectorAll('.pass_eye_icon'),
orderInput = document.getElementById('orderInput'),
addBtn = document.getElementById('addBtn'),
ordersListEl = document.getElementById('orders'),
errorMessage_login = document.querySelector('.error_login'),
errorMessage_register = document.querySelector('.error_register'),
errorMessage_reset = document.querySelector('.error-reset'),
sucessMessage_reset = document.querySelector('.sucess-reset'),
alertSpan = document.querySelector('.alert'),
login_signup_container = document.querySelector('.login-signup-container'),
user_icon = document.querySelector('.user-icon'),
logout_btn = document.getElementById('logout_btn'),
reset_pass = document.getElementById('reset_pass'),
back_sin_in = document.getElementById('back_sin_in'),
resetBtn = document.getElementById('reset'),
close_nav_menu = document.getElementById('close_nav_menu'),
nav_splitted_menu = document.querySelector('.nav-splitted-menu');





// get email , password and validate-------------------------------------------------------------
register_btn.addEventListener('click' , _ => {
    // get inputs values---------
    let emailValue = email_register.value.trim();
    let passwordValue = password_register.value.trim();

    //  check on values-----
    if(emailValue && passwordValue) {
        // clear error------
        errorMessage_register.innerHTML = '';
        // clear inputs-------
        clearInputsValue();

        // validate email-------------
        if(!isValidEmail(emailValue)) {
            errorMessage_register.innerHTML = 'Invalid email format';
            return; // Exit function if email format is invalid
        }

        // validate password-------------
        let passValidationResult = isValidPass(passwordValue);
        if(passValidationResult !== true) {
            errorMessage_register.innerHTML = passValidationResult;
            return; // Exit function if password format is invalid
        }

        // resgister and auth user-------------------
        registerUser(emailValue , passwordValue);

        // show loader then hide with timeout-----------
        showHideLoader();
    }
    else {
        // add error------
        errorMessage_register.innerHTML = 'enter email and password';
    }
});


// Register and authenticate new user-------------------------------
function registerUser(email , password) {
    // clear error login if user tried to login first----
    errorMessage_login.innerHTML = ''; 

    // Register new user---
    createUserWithEmailAndPassword(auth , email , password)
    .then(userCredential => {
        const user = userCredential.user;

        // Once registerd, get the user token and save it in localstorage---
        getUserTokenAndSave(user.uid);

        // send user to the database------------
        let userObjData = {
            email : email
        };
        push(ref(db, `users/${user.uid}`) , userObjData);

        // go to login with registerd user---------------
        loginRegisterdUserMailAndPass(email , password);
    })
    .catch(error => {
        // Handle registration errors---
        if (error.code === "auth/email-already-in-use") {
            // Display appropriate error message for email already in use
            errorMessage_register.innerHTML = 'Email already registered';
        } else {
            // For other errors, log them to console
            console.error("Registration error:", error);
        }
    });
};


// go to login with registerd user-----------------------
function loginRegisterdUserMailAndPass(email , password) {
    // click to go to login form-
    sign_in_btn.click();

    // fill inputs with user mail and pass-
    emailInput_login.value = email;
    passwordInput_login.value = password;
};






// get email , password and validate for login------------------------------------------------------------------------------
loginBtn.addEventListener('click' , _ => {
    // get inputs values---------
    let emailValue = emailInput_login.value.trim();
    let passwordValue = passwordInput_login.value.trim();

    //  check on values-----
    if(emailValue && passwordValue) {
        // clear error------
        errorMessage_login.innerHTML = '';
        // clear inputs-------
        clearInputsValue();

        // validate email-------------
        if(!isValidEmail(emailValue)) {
            errorMessage_login.innerHTML = 'Invalid email format';
            return; // Exit function if email format is invalid
        }

        // auth user-------------------------------
        authenticateUser(emailValue , passwordValue);
    }
    else {
        // add error------
        errorMessage_login.innerHTML = 'enter email and password';
    }
});




// Authenticate user----------------------------------------------------------
function authenticateUser(email , password) {
    signInWithEmailAndPassword(auth , email , password)
    .then(userCredential => {
        // user token-----
        getUserTokenAndSave(userCredential.user.uid);

        // get user data and orders from database----
        if(localStorage.userToken) {
            getUserData(localStorage.userToken);
            getOrdersData(userCredential.user.uid);
        }
        else getUserData(userCredential.user.uid);

        // hide forms---
        hideFormsShowMainPage();
    })
    .catch(error => {
        errorMessage_login.innerHTML = 'Invalid email or password';
    });
};







// get userdata------
function getUserData(userToken) {
    // check on userToken----
    onValue(ref(db, `users/${userToken ? userToken : localStorage.userToken}`) , snapshot => {
        // check if there is data or not----------
        if(snapshot.exists()) {
            // get first email letter---
            let firstLetter = Object.values(snapshot.val())[0].email[0];
            // change usericon text---
            user_icon.innerText = firstLetter;
        }
    });
};





// user orders part------------------------------------------------------------------------------------------------------------------
addBtn.addEventListener('click' , _ => {
    // get input value-----
    let orderValue = orderInput.value.trim();

    // check if there is a value or not-----
    if(orderValue) {
        // clear the alert span error ----
        alertSpan.innerText = '';

        // send orders to database-----
        sendOrdersToDb(orderValue);

        // clear the inputs value----
        clearInputsValue();
    }

    else {
        alertSpan.innerText = 'you have to add a value';
    }
});



// send orders-------------
function sendOrdersToDb(orderValue) {
    // get user token----
    let userToken = localStorage.userToken;

    // check if there is a userToken-----
    if(userToken) {
        // create a new order object--
        const newOrder = {
            order: orderValue,
            timestamp: new Date().toISOString()
        };

        // push the new order to the user's orders in the database
        push(ref(db, `users/${userToken}/orders`), newOrder)
        .then(() => {
            // clear the inputs value----
            clearInputsValue();

            // getOrdersData form database----
            getOrdersData(userToken);
        })
        .catch(error => {
            alertSpan.innerText = 'Error adding order';
        });
    }
    else {
        loaderFade();
        // show singup-login container-------
        login_signup_container.style.display = "flex";
    }
}; 


// geting data from database-------
function getOrdersData(userToken) {
    return new Promise(resolve => {
        onValue(ref(db, `users/${userToken ? userToken : localStorage.userToken}/orders`) , snapshot => {
            // check if there is data or not----------
            if(snapshot.exists()) {
                // get orders values---------------
                let ordersValues = Object.values(snapshot.val());
                // get orders ids-----------------
                let ordersIds = Object.keys(snapshot.val());
    
                // pass ordersValues and ordersIds to appendItemsToOrdersDivEl------------------
                appendItemsToOrdersDivEl(ordersValues , ordersIds);
            }
            else {
                // empty the ordersListEl innerHTML to avoid problems with last element-----
                ordersListEl.innerHTML = "There Is No Items Yet.....";
            }

            resolve();
        });
    })
};


// appending Orders to ordersDivEl---------------
function appendItemsToOrdersDivEl(ordersData , ordersKeys) {
    // clear ordersListEl innerHtml--------------
    ordersListEl.innerHTML = '';

    // adding items to ordersDivEl-----------------
    for(let i = 0; i < ordersData.length; i++) {
        // create li element-----
        let liElement = document.createElement('li');
        // add li attributes and click event------
        liElement.dataset.id = ordersKeys[i];
        liElement.addEventListener('dblclick' , e => deleteOrder(e.target.dataset.id));
        // adding li value----------------
        liElement.innerText = ordersData[i].order;

        // append li to ordersListEl------------
        ordersListEl.append(liElement);
    }
};



// delete item-------------------------
function deleteOrder(orderId) {
    // get the exact location from database-------------
    let exactLocationInDB = ref(db, `users/${localStorage.userToken}/orders/${orderId}`);
    // remove the order----------------
    remove(exactLocationInDB);

    // show orders after every delete-----
    getOrdersData();
}




// if user has logged in and has token------------------------------------------------------------------------------
(async function() {
    if(localStorage.userToken) {
        // get getUserData-----
        getUserData();
    
        // get orders----
        await getOrdersData();
    
        // hide forms---
        hideFormsShowMainPage();
    } 
    else {
        loaderFade();
        // show singup-login container-------
        login_signup_container.style.display = "flex";
    }
})();








// reset password----------------------------------------------------------------------------------------------------------------
reset_pass.addEventListener('click' , _ => {
    // show reset-password-con with transtion effect of loading--
    showHideLoader();
    $('.reset-password-con').css("display", "flex");
});


resetBtn.addEventListener('click' , async _ => {
    // delete user token from localstorage to sign in again--
    localStorage.removeItem('userToken');

    // Get the currently signed-in user--
    const user = auth.currentUser;

    try {
        // Send password reset email to the user--
        await sendPasswordResetEmail(auth , user.email);

        // Show success message and hide reset password container--
        sucessMessage_reset.innerText = "Reset Password Email Has Been Sent, PLS Check Your Email";
        setTimeout(() => {
            showHideLoader();
            $('.reset-password-con').css("display", "none");
        }, 5000);
    }

    catch (error) {
        // Show error message
        errorMessage_reset.innerText = "Error sending password reset email , PLS Try Again";
    }
});



// back to sign in page----------------------------------------------------------------------------------------------------
back_sin_in.addEventListener('click' , _ => {
    // hide reset pass con with transtion effect of loading-----
    showHideLoader();
    $('.reset-password-con').css("display", "none");
});


// log out user--------------------------------------------------------------------------------------------------------------
logout_btn.addEventListener('click' , _ => {
    // close the nav menu---
    showNavSplittedmenu();

    // Log out the authenticated user
    signOut(auth)
    .then(() => {
        // delete user token------
        localStorage.removeItem('userToken');

        // show hide loader effect---
        showHideLoader();

        // show singup-login container-------
        login_signup_container.style.display = "flex";
    })
    .catch(error => {
        // An error happened---
        console.error("Error signing out:", error);
    });
});

// log in btn----------------------------------------------------------------------------------------------------------------
$('#login_menu_btn').click(_ => {
    // show login_signup_container with transtion effect of loading-----
    showHideLoader();
    login_signup_container.style.display = "flex";

    // close the nav menu---
    showNavSplittedmenu();

    // close the log---
    $('.logout').slideToggle();
});

// TODO: 
// click to show nav menu-----------------------------------------------------------------------------------------------------
user_icon.addEventListener('click' , _ => nav_splitted_menu.classList.add('show-nav-splitted-menu'));

close_nav_menu.addEventListener('click' , _ => showNavSplittedmenu());


function showNavSplittedmenu() {
    nav_splitted_menu.classList.remove('show-nav-splitted-menu');
    console.log("closed");
}



// clear inputs------------------------------------------------------------------------------------------------------------------
function clearInputsValue() {
    document.querySelectorAll('input').forEach(input => input.value = '');
};

// once user is authenticated hide the login form and show Hide loader-----------------------------------------------------------
function hideFormsShowMainPage() {
    // clear login_signup_container----
    login_signup_container.style.display = "none";
    // Show showHideLoader------
    showHideLoader();
};

//  get the user token and save it in localstorage-------------------------------------------------------------------------------
function getUserTokenAndSave(userToken) {
    localStorage.setItem("userToken" , userToken);
};



// validate email and pas-------------------------------------------------------------------------------------------------
function isValidEmail(email) {
    // Regular expression for email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

function isValidPass(password) {
    // Regular expression for password validation
    const passRegex = /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passRegex.test(password)) {
        return "Password must contain at least 8 characters, including one uppercase letter, one lowercase letter, one digit, and one special character (@$!%*?&)";
    }
    return true;
};


// change user forms-------------------------------------------------------------------------------------------------
sign_up_btn.addEventListener('click' , _ => {
    signupForm.classList.add('align-sign-up');
    loginForm.classList.add('align-sign-in');
});


sign_in_btn.addEventListener('click' , _ => {
    signupForm.classList.remove('align-sign-up');
    loginForm.classList.remove('align-sign-in');
});


// change pass type with eye icon-------------------------------------------------------------------------------
pass_eye_icon.forEach(el => {
    el.addEventListener('click' , e => {
        if(el.classList.contains('fa-eye')) {
            // show pass-----
            el.className = 'fa-solid fa-eye-slash';
            el.parentElement.children[0].type = "text";
        }
        else {
            // hide pass-----
            el.className = 'fa-solid fa-eye';
            el.parentElement.children[0].type = "password";
        }
    });
});


// loader----------------------------------------------------------------
function loaderFade() {
    $(document).ready( _ => $(".loader").fadeOut(1000));
};



function showHideLoader() {
    $('.loader').css('display', 'block');
    setTimeout(_ => loaderFade() , 1000);
};

