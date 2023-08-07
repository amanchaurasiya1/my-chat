function showSignUp(event){
    const main = document.getElementById('sectionMain');
    const signUp = document.getElementById('sectionSignUp');
    const login = document.getElementById('sectionLogin');
    const signupbtn = document.getElementById('signUpBtn');
    const loginbtn = document.getElementById('loginBtn');
    
    main.style.display = 'none';
    login.style.display = 'none';
    signUp.style.display = 'block';

    signupbtn.style.backgroundColor = 'green';
    loginbtn.style.backgroundColor = 'red';
    signupbtn.style.color = 'white';
    loginbtn.style.color = 'white';
}
function showLogin(event){
    const main = document.getElementById('sectionMain');
    const signUp = document.getElementById('sectionSignUp');
    const login = document.getElementById('sectionLogin');
    const signupbtn = document.getElementById('signUpBtn');
    const loginbtn = document.getElementById('loginBtn');

    main.style.display = 'none';
    signUp.style.display = 'none';
    login.style.display = 'block';

    signupbtn.style.backgroundColor = 'red';
    loginbtn.style.backgroundColor = 'green';
    signupbtn.style.color = 'white';
    loginbtn.style.color = 'white';
}