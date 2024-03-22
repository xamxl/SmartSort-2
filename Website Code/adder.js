fetch('header.html')
  .then(response => response.text())
  .then(data => {
    document.getElementById('header').innerHTML = data;

    if (/Android.+Mobile|webOS|iPhone|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) && window.location.href.endsWith("index.html")) {
      document.getElementById("otherOptions").style.display = "none";
      document.getElementById("navImage").width = "70";
      document.getElementById("navImage").height = "70";
    }
});

fetch('footer.html')
  .then(response => response.text())
  .then(data => {
    const footerDiv = document.getElementById('footer');
    footerDiv.insertAdjacentHTML('afterend', data);
});

async function openLoginPopup() {
  if (!window.location.href.match(/index\.html$|localhost:8888\/?$/i) && !(await isLoggedIn())) {
    fetch('loginPopup.html')
      .then(response => response.text())
      .then(data => {
        // Assume 'data' contains your HTML which includes a script tag
        const parser = new DOMParser();
        const doc = parser.parseFromString(data, 'text/html');

        // Extract and run scripts from the parsed HTML
        Array.from(doc.querySelectorAll('script')).forEach(oldScript => {
          const newScript = document.createElement('script');
          Array.from(oldScript.attributes).forEach(attr => newScript.setAttribute(attr.name, attr.value));
          newScript.textContent = oldScript.textContent;
          document.body.appendChild(newScript);
          oldScript.parentNode.removeChild(oldScript);
        });

        // Insert the rest of the HTML
        document.body.appendChild(doc.body);
    });
  }
}
openLoginPopup();
