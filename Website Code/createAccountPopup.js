document.querySelector('a[id="login"]').addEventListener('click', function(event) {
    event.preventDefault();
    document.getElementById("createAccountModalBackdrop").style.display = "none";
    document.getElementById("loginModalBackdrop").style.display = "flex";
});