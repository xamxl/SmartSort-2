let running = false;
let createAccountAdded = false;

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
                document.getElementById("loginModalBackdrop").style.display = "none";
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

document.querySelector('a[id="createAccount"]').addEventListener('click', function(event) {
    event.preventDefault();
    document.getElementById("loginModalBackdrop").style.display = "none";

    if (!createAccountAdded) {
        fetch('createAccountPopup.html')
            .then(response => response.text())
            .then(data => {
                const parser = new DOMParser();
                const doc = parser.parseFromString(data, 'text/html');

                Array.from(doc.querySelectorAll('script')).forEach(oldScript => {
                    const newScript = document.createElement('script');
                    Array.from(oldScript.attributes).forEach(attr => newScript.setAttribute(attr.name, attr.value));
                    newScript.textContent = oldScript.textContent;
                    document.body.appendChild(newScript);
                    oldScript.parentNode.removeChild(oldScript);
                });

                document.body.appendChild(doc.body);
        });

        createAccountAdded = true;
    } else {
        document.getElementById("createAccountModalBackdrop").style.display = "flex";
    }
});