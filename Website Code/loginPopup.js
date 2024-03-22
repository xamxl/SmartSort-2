let running = false;

document.getElementById('loginForm').addEventListener('submit', function(event) {
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
    } else {
        document.getElementById("message").textContent = "";
    }

    document.getElementById("message").style.color = "black";
    document.getElementById("message").textContent = "Logging you in...";

    running = true;

    fetch('http://localhost:8080/login', { 
        method: 'POST', 
        body: formData
    })
    .then(function(response) {
        running = false;
        if (!response.ok) {
            document.getElementById("message").style.color = "red";
            document.getElementById("message").innerHTML = "Login failed. Please check your username and password";
            throw new Error('HTTP error, status = ' + response.status);
        }
        response.json().then((result) => {
            if (result.text == "INVALID") {
                document.getElementById("message").style.color = "red";
                document.getElementById("message").innerHTML = "Login failed. Please check your username and password";
            } else {
                var expires = new Date();
                expires.setTime(expires.getTime() + (24 * 60 * 60 * 1000));
                document.cookie = "loginKey=" + result.text + "; expires=" + expires.toUTCString() + "; path=/;";
                document.cookie = "email=" + data.email + "; expires=" + expires.toUTCString() + "; path=/;";
                document.getElementById("modalBackdrop").style.display = "none";
            }
        });
    })
    .catch(function(error) {
        document.getElementById("message").style.color = "red";
        document.getElementById("message").innerHTML = "Login failed";
        running = false;
        console.error('Request failed:', error.message);
    });

});