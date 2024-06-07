document.querySelector('a[id="login"]').addEventListener('click', function(event) {
    event.preventDefault();
    document.getElementById("createAccountModalBackdrop").style.display = "none";
    document.getElementById("loginModalBackdrop").style.display = "flex";
});

document.getElementById('createAccountForm').addEventListener('submit', function(event) {
    event.preventDefault();

    if (running) {
        return;
    }

    var formData = new FormData(event.target);
    var data = {};

    for (var pair of formData.entries()) {
        data[pair[0]] = pair[1];
    }

    if (data.email == "") {
        document.getElementById("message").style.color = "red";
        document.getElementById("message").textContent = "Email required";
        return;
    } else if (!data.email.includes("@") || !data.email.includes(".")) {
        document.getElementById("message").style.color = "red";
        document.getElementById("message").textContent = "Invalid email";
        return;
    } else if (data.password == "") {
        document.getElementById("message").style.color = "red";
        document.getElementById("message").textContent = "Password required";
        return;
    } else if (data.passwordRepeat == "") {
        document.getElementById("message").style.color = "red";
        document.getElementById("message").textContent = "You must repeat your password";
        return;
    } else if (data.password != data.passwordRepeat) {
        document.getElementById("message").style.color = "red";
        document.getElementById("message").textContent = "Passwords must match";
        return;
    } else {
        document.getElementById("message").textContent = "";
    }

    document.getElementById("message").style.color = "black";
    document.getElementById("message").textContent = "Creating your account...";

    running = true;

    fetch('http://localhost:8080/createAccount', { 
        method: 'POST', 
        body: formData
    })
    .then(function(response) {
        running = false;
        if (!response.ok) {
            document.getElementById("message").style.color = "red";
            document.getElementById("message").innerHTML = "Creating your account failed. Please check your username and password";
            throw new Error('HTTP error, status = ' + response.status);
        }
        response.json().then((result) => {
            if (result.text == "INVALID") {
                document.getElementById("message").style.color = "red";
                document.getElementById("message").innerHTML = "Creating your account failed. Please check your username and password";
            } else {
                var expires = new Date();
                expires.setTime(expires.getTime() + (24 * 60 * 60 * 1000));
                document.cookie = "loginKey=" + result.text + "; expires=" + expires.toUTCString() + "; path=/;";
                document.cookie = "email=" + data.email + "; expires=" + expires.toUTCString() + "; path=/;";
                document.getElementById("loginModalBackdrop").style.display = "none";
            }
        });
    })
    .catch(function(error) {
        document.getElementById("message").style.color = "red";
        document.getElementById("message").innerHTML = "Creating your account failed";
        running = false;
        console.error('Request failed:', error.message);
    });

});