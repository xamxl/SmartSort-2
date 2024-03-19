function adjustVideoSize() {
    // Get the 'whatsnew' element by its ID
    var whatsNewElement = document.getElementById("whatsnew");

    // Get the 'video' iframe by its ID
    var videoIframe = document.getElementById("video");

    // Get the computed width of the 'whatsnew' element
    var width = whatsNewElement.offsetWidth;

    // Set the width of the 'video' iframe
    videoIframe.style.width = width + "px";

    // Calculate and set the height based on a 16:9 aspect ratio
    var height = width * (9 / 16);
    videoIframe.style.height = height + "px";
}

// Adjust video size on DOM content loaded
document.addEventListener("DOMContentLoaded", adjustVideoSize);

// Adjust video size whenever the window is resized
window.addEventListener("resize", adjustVideoSize);

function toggleVisibility(id) {
    var element = document.getElementById(id);
    element.style.display = "block";
    document.getElementById("newFeaturesLink").style.display = "none";
}

function openNewPage(link) {
    window.open(link, '_blank');
}