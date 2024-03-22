function openNewPage(link) {
    window.open(link, '_blank');
}

function switchPage(link) {
    window.location.href = link;
}

function getCookie(name) {
    const value = document.cookie.split('; ').find(row => row.startsWith(name + '='));
    return value ? value.split('=')[1] : false;
}

async function isLoggedIn() {
    if (!getCookie("loginKey")) {
        return false;
    }

    const formData = new FormData();
    formData.append("email", getCookie("email"));
    formData.append("key", getCookie("loginKey"));

    try {
        const response = await fetch('http://localhost:8080/verifyLogin', {
            method: 'POST',
            body: formData
        });

        if (!response.ok) {
            return false;
        }

        const result = await response.json();
        return result.text == "VALID";
        
    } catch (error) {
        return false;
    }
}