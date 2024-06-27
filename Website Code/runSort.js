// Get the current URL
const currentUrl = new URL(window.location.href);

// Check if the 'forwarded' parameter is set to 'true'
if (currentUrl.searchParams.get('forwarded') != 'true') {
    // get element with class looseText
    const looseText = document.getElementsByClassName('looseText')[0];
    looseText.innerHTML = 'Please go to the <a href="/startSort.html">start sort</a> page first.';
} else {
    // Remove the 'forwarded' parameter from the URL
    currentUrl.searchParams.delete('forwarded');
    // Update the URL without the 'forwarded' parameter
    window.history.replaceState({}, '', currentUrl.href);

    // get all the labels and remove the hidden class (label elements)
    const labels = document.getElementsByTagName('label');
    for (let i = 0; i < labels.length; i++) {
        labels[i].classList.remove('hidden');
    }

    const looseText = document.getElementsByClassName('looseText')[0];
    looseText.innerHTML = 'Select a sort method.';
    looseText.classList.add('top');
}