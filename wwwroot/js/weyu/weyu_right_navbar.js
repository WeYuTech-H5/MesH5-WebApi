// Add a click event listener to the image inside the "Settings" div to show/hide the dropdown
document.getElementById("settings-image").addEventListener("click", function(event) {
    event.stopPropagation(); // Prevent the event from propagating to the document
  
    var dropdownMenu = document.getElementById("dropdown-menu");
  
    // Toggle the visibility of the dropdown menu
    if (dropdownMenu.style.display === "none" || dropdownMenu.style.display === "") {
      dropdownMenu.style.display = "block";
    } else {
      dropdownMenu.style.display = "none";
    }
  });
  
  // Close the dropdown when clicking outside of it
  document.addEventListener("click", function(event) {
    var dropdownMenu = document.getElementById("dropdown-menu");
    
    if (event.target !== document.getElementById("settings") && event.target !== dropdownMenu) {
      dropdownMenu.style.display = "none";
    }
  });
  
  // Prevent the dropdown from closing when clicking inside it
  document.getElementById("dropdown-menu").addEventListener("click", function(event) {
    event.stopPropagation();
  });
  


//menu click
document.getElementById("menu-image").addEventListener("click", function(event) {
  event.stopPropagation(); // Prevent the event from propagating to the document

  var dropdownMenu = document.getElementById("dropdownMenu");

  // Toggle the visibility of the dropdown menu
  if (dropdownMenu.style.display === "none" || dropdownMenu.style.display === "") {
    dropdownMenu.style.display = "block";
  } else {
    dropdownMenu.style.display = "none";
  }
});

// Close the dropdown when clicking outside of it
document.addEventListener("click", function(event) {
  var dropdownMenu = document.getElementById("dropdownMenu");
  
  if (event.target !== document.getElementById("menu") && event.target !== dropdownMenu) {
    dropdownMenu.style.display = "none";
  }
});

// Prevent the dropdown from closing when clicking inside it
document.getElementById("dropdownMenu").addEventListener("click", function(event) {
  event.stopPropagation();
});





// Close the dropdown menu when clicking the close button
document.getElementById("closeButton").addEventListener("click", function(event) {
  event.stopPropagation(); // Prevent the event from propagating to the document
  var dropdownMenu = document.getElementById("dropdownMenu");
  dropdownMenu.style.display = "none"; // Hide the dropdown menu
});

// Close the dropdown when clicking outside of it
document.addEventListener("click", function(event) {
  var dropdownMenu = document.getElementById("dropdownMenu");
  
  if (event.target !== document.getElementById("menu-image") && !dropdownMenu.contains(event.target)) {
      dropdownMenu.style.display = "none"; // Hide the dropdown menu
  }
});

// Prevent the dropdown from closing when clicking inside it
document.getElementById("dropdownMenu").addEventListener("click", function(event) {
  event.stopPropagation(); // Prevent closing the menu when clicking inside it
});


