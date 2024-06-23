stage1 = true;

document.getElementById('actual-btn').addEventListener('change', function() {
    const file = this.files[0];
    const reader = new FileReader();
    reader.onload = function(e) {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, {type: 'array'});
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        let html = XLSX.utils.sheet_to_html(worksheet);

        // Parse the HTML string to a DOM element
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        const table = doc.querySelector('table');

        // Serialize the DOM element back to an HTML string
        const serializer = new XMLSerializer();
        html = serializer.serializeToString(table);

        const sheetTable = document.getElementById('sheetTable');
        sheetTable.innerHTML = html;

        const rows = sheetTable.querySelectorAll('tr');
        if (rows.length > 0) {
            // Add a class to the first row to override Bootstrap highlighting
            const cells = rows[0].querySelectorAll('td');
            cells.forEach(cell => {
                cell.classList.add('top-row'); // Top row (second row)
            });
            const lastRowCells = rows[rows.length - 1].querySelectorAll('td');
            lastRowCells.forEach(cell => {
                cell.classList.add('bottom-row'); // Bottom row
            });
        }
        rows.forEach((row, rowIndex) => {
            const rowCells = row.querySelectorAll('td');
            rowCells.forEach((cell, colIndex) => {
                cell.addEventListener('mouseenter', () => {
                    highlightColumn(colIndex, true);
                });
                cell.addEventListener('mouseleave', () => {
                    highlightColumn(colIndex, false);
                });
                cell.addEventListener('click', () => {
                    handleColumnClick(colIndex);
                });
                if (rowCells.length > 0) {
                    rowCells[0].classList.add('left-col'); // Leftmost column
                    rowCells[rowCells.length - 1].classList.add('right-col'); // Rightmost column
                }
            });
        });

        document.getElementById('sheetContent').style.display = 'block';
    };
    reader.readAsArrayBuffer(file);
    document.getElementById('fileUpload').style.display = 'none';
});

function highlightColumn(colIndex, highlight) {
    if (!stage1) {
        return;
    }

    const rows = document.querySelectorAll('#sheetTable tr');
    rows.forEach(row => {
        const cells = row.querySelectorAll('td, th');
        if (cells[colIndex]) {
            if (highlight) {
                cells[colIndex].classList.add('highlight');
            } else {
                cells[colIndex].classList.remove('highlight');
            }
        }
    });
}

function handleColumnClick(colIndex) {
    if (!stage1) {
        return;
    }
    stage1 = false;

    // Get the table element
    var table = document.getElementById("sheetTable");
    // Get the tbody element
    var tbody = table.getElementsByTagName("tbody")[0];
    // Insert a new row at the top of the tbody
    var newRow = tbody.insertRow(0);

    // Get the number of columns in the table
    var numCols = table.rows[1].cells.length; // Assuming the second row defines the columns

    for (var i = 0; i < numCols; i++) {
        // Create a new cell
        var newCell = newRow.insertCell(i);
        newCell.classList.add('tableSelectorCell');

        if (i === colIndex) {
            // If the column index matches, insert the emoji
            newCell.innerHTML = "🙋🏾‍♀️🙋🏻‍♂️";
        } else {
            // Otherwise, create a dropdown menu
            var select = document.createElement("select");
            select.classList.add('tableSelector');
            // add an event listener so add class when changes
            select.addEventListener('change', function() {
                if (this.value != "Not used") {
                    this.classList.add('selected');
                } else {
                    this.classList.remove('selected');
                }
            });
            var options = [
                "Not used",
                "Ranked choices for desired locations",
                "Ranked choices for not desired locations",
                "Unranked choices for desired locations",
                "Unranked choices for not desired locations",
                "Ranked choices for individuals to be with",
                "Ranked choices for individuals not to be with",
                "Unranked choices for individuals to be with",
                "Unranked choices for individuals not to be with",
                "Attributes to balance",
                "Attributes to split by",
                "Attributes to not isolate",
                "Attributes to isolate",
                "Attributes to group by"];

            // Add options to the dropdown
            options.forEach(function(option) {
                var opt = document.createElement("option");
                opt.value = option;
                opt.text = option;
                select.appendChild(opt);
            });

            newCell.appendChild(select);
        }

        // Add class names for left-col, right-col, and top-row
        if (i === 0) {
            newCell.classList.add('left-col');
        } else if (i === numCols - 1) {
            newCell.classList.add('right-col');
        }
        newCell.classList.add('top-row');
    }

    const rows = document.querySelectorAll('#sheetTable tr');
    rows.forEach(row => {
        const cells = row.querySelectorAll('td, th');
        cells.forEach(cell => {
            cell.classList.remove('highlight');
            cell.classList.add('noClicker');
        });
    });

    var instructions = document.getElementById("instructions");
    instructions.innerHTML = "Select the type of data in each column. Columns that you do not select will be ignored.";
    instructions.innerHTML += '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<a href="#" onclick="event.preventDefault(); confirmSelect();">Continue ></a>';
}

function confirmSelect() {
    const table = document.getElementById('sheetTable');
    const rows = table.querySelectorAll('tr');
    const numCols = table.rows[0].cells.length; // Assuming the second row defines the columns
    const colsToRemove = [];

    // Check which columns have "Not used" selected in the dropdown
    for (let i = 0; i < numCols; i++) {
        const select = rows[0].cells[i].querySelector('select');
        // prevent selects from changing
        if (select) {
            select.disabled = true;
            select.classList.add('noClicker');
        }
        const emojiCell = rows[0].cells[i].innerHTML.includes("🙋🏾‍♀️🙋🏻‍♂️");
        if (select && select.value === "Not used" && !emojiCell) {
            colsToRemove.push(i);
        }
    }

    // Remove columns from bottom to top to avoid index shifting issues
    colsToRemove.reverse().forEach(colIndex => {
        rows.forEach(row => {
            if (row.cells[colIndex]) {
                row.deleteCell(colIndex);
            }
        });
    });

    var instructions = document.getElementById("instructions");
    instructions.innerHTML = "Rank all ranked choices.";
    instructions.innerHTML += '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<a href="#" onclick="event.preventDefault(); confirmRank();">Continue ></a>';

    // Get the tbody element
    tbody = table.getElementsByTagName("tbody")[0];
    // Insert a new row at the top of the tbody
    newRow = tbody.insertRow(0);

    // Get the number of columns in the table
    numColsNew = table.rows[1].cells.length; // Assuming the second row defines the columns

    for (var i = 0; i < numColsNew; i++) {
        // Create a new cell
        var newCell = newRow.insertCell(i);
        newCell.classList.add('tableSelectorCell');
        newCell.classList.add('noClicker');

        var rankedOptions = [
            "Ranked choices for desired locations",
            "Ranked choices for not desired locations",
            "Ranked choices for individuals to be with",
            "Ranked choices for individuals not to be with"];
        // if selector.value is in rankedOptions
        let selectElement = table.rows[1].cells[i].getElementsByTagName('select')[0];
    if (selectElement != null && rankedOptions.includes(selectElement.value)) {
        var input = document.createElement("input");
        input.type = "number";
        input.placeholder = "Rank";
        input.classList.add('field');

        newCell.appendChild(input);
        }

        // Add class names for left-col, right-col, and top-row
        if (i === 0) {
            newCell.classList.add('left-col');
        } else if (i === numColsNew - 1) {
            newCell.classList.add('right-col');
        } else {
            newCell.classList.add('mid-col');
        }
        newCell.classList.add('top-row');
        newCell.classList.add('noBorderSide');
    }

    // update right and left and top and bottom for all columns
    rows.forEach(row => {
        const cells = row.querySelectorAll('td, th');
        cells.forEach(cell => {
            if (cells.length > 0) {
                cells[0].classList.add('left-col');
                cells[cells.length - 1].classList.add('right-col');
            }
        });
    });
    // update bottom top too
    const rowCells = rows[0].querySelectorAll('td');
    rowCells.forEach(cell => {
        cell.classList.add('top-row');
    });
    const lastRowCells = rows[rows.length - 1].querySelectorAll('td');
    lastRowCells.forEach(cell => {
        cell.classList.add('bottom-row');
    });

}

function confirmRank() {
    let table = document.querySelector('table');
    let numColsNew = table.rows[1].cells.length;

    var rankedOptions = [
        "Ranked choices for desired locations",
        "Ranked choices for not desired locations",
        "Ranked choices for individuals to be with",
        "Ranked choices for individuals not to be with"];

    for (let i = 0; i < numColsNew; i++) {
        let selectElement = table.rows[1].cells[i].getElementsByTagName('select')[0];
        let inputElement = table.rows[0].cells[i].getElementsByTagName('input')[0];
        if (selectElement != null && rankedOptions.includes(selectElement.value)) {
            if (inputElement.value == "" || inputElement.value < 1 || !Number.isInteger(Number(inputElement.value))) {
                var instructions = document.getElementById("instructions");
                instructions.innerHTML = "Please rank all ranked choices with a natural number: 1, 2, 3, etc";
                instructions.innerHTML += '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<a href="#" onclick="event.preventDefault(); confirmRank();">Continue ></a>';
                instructions.classList.add('text-danger');
                return;
            }
        }
    }

    // create a dictionary with all rankings for each type in rankedOptions
    let rankings = {};
    for (let i = 0; i < numColsNew; i++) {
        let selectElement = table.rows[1].cells[i].getElementsByTagName('select')[0];
        let inputElement = table.rows[0].cells[i].getElementsByTagName('input')[0];
        if (selectElement != null && rankedOptions.includes(selectElement.value)) {
            if (!rankings[selectElement.value]) {
                rankings[selectElement.value] = [];
            }
            rankings[selectElement.value].push(inputElement.value);
        }
    }
    
    // check if each list for each term is consecutive
    for (let key in rankings) {
        let list = rankings[key];
        let sortedList = list.slice().sort();
        for (let i = 0; i < sortedList.length; i++) {
            if (sortedList[i] != i + 1) {
                var instructions = document.getElementById("instructions");
                instructions.innerHTML = "Each category must have a first choice (1), second choice (2), etc.";
                instructions.innerHTML += '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<a href="#" onclick="event.preventDefault(); confirmRank();">Continue ></a>';
                instructions.classList.add('text-danger');
                return;
            }
        }
    }

    for (let i = 0; i < numColsNew; i++) {
        let selectElement = table.rows[1].cells[i].getElementsByTagName('select')[0];
        let inputElement = table.rows[0].cells[i].getElementsByTagName('input')[0];
        if (inputElement != null) {
            inputElement.disabled = true;
        }
    }

    var instructions = document.getElementById("instructions");
    instructions.innerHTML = "Updated the weights as needed.";
    instructions.innerHTML += '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<a href="#" onclick="event.preventDefault(); submitWeights();">Continue ></a>';
    instructions.classList.remove('text-danger');

    newRow = tbody.insertRow(0);

    // Get the number of columns in the table
    numColsNew = table.rows[1].cells.length; // Assuming the second row defines the columns

    for (var i = 0; i < numColsNew; i++) {
        // Create a new cell
        var newCell = newRow.insertCell(i);
        newCell.classList.add('tableSelectorCell');
        newCell.classList.add('noClicker');

        let selectElement = table.rows[2].cells[i].getElementsByTagName('select')[0];
    if (selectElement != null) {
        var input = document.createElement("input");
        input.type = "number";
        input.value = "1";
        input.classList.add('field');

        newCell.appendChild(input);
        }

        // Add class names for left-col, right-col, and top-row
        if (i === 0) {
            newCell.classList.add('left-col');
        } else if (i === numColsNew - 1) {
            newCell.classList.add('right-col');
        } else {
            newCell.classList.add('mid-col');
        }
        newCell.classList.add('top-row');
        newCell.classList.add('noBorderSide');
    }

    // update right and left and top and bottom for all columns
    const rows = document.querySelectorAll('#sheetTable tr');
    rows.forEach(row => {
        const cells = row.querySelectorAll('td, th');
        cells.forEach(cell => {
            if (cells.length > 0) {
                cells[0].classList.add('left-col');
                cells[cells.length - 1].classList.add('right-col');
            }
        });
    });
    // update bottom top too
    const rowCells = rows[0].querySelectorAll('td');
    rowCells.forEach(cell => {
        cell.classList.add('top-row');
    });
    const lastRowCells = rows[rows.length - 1].querySelectorAll('td');
    lastRowCells.forEach(cell => {
        cell.classList.add('bottom-row');
    });
}

function submitWeights() {
    let table = document.querySelector('table');
    let numColsNew = table.rows[1].cells.length;
    let instructions = document.getElementById("instructions");

    // Validate weights input
    for (let i = 0; i < numColsNew; i++) {
        let inputElement = table.rows[0].cells[i].getElementsByTagName('input')[0];
        if (inputElement != null && (inputElement.value === "" || inputElement.value < 0 || !Number.isInteger(Number(inputElement.value)))) {
            instructions.innerHTML = "Please weight all features with natural number: 1, 2, 3, etc";
            instructions.innerHTML += '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<a href="#" onclick="event.preventDefault(); submitWeights();">Continue ></a>';
            instructions.classList.add('text-danger');
            return;
        }
    }

    // Proceed to the next step
    document.getElementById("sheetContentInner").classList.add('hidden');
    instructions.innerHTML = "Create one or more groups to continue.";
    instructions.innerHTML += '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<a href="#" onclick="event.preventDefault(); submitGroups();">Continue ></a>';
    instructions.classList.remove('text-danger');

    // Create a new div and table for group creation
    var groupDiv = document.createElement("div");
    groupDiv.classList.add("myTableOuter", "floater");

    var groupTable = document.createElement("table");
    groupTable.id = "groupTable";
    groupTable.classList.add("table", "table-bordered", "table-sm", "myTable");

    // Create header row
    var headerRow = groupTable.insertRow(0);
    var headers = ["Name", "Max Size", "Min Preferred Size", ""];
    headers.forEach(headerText => {
        var headerCell = document.createElement("td");
        headerCell.innerText = headerText;
        headerCell.classList.add('noClicker', 'tableSelectorCell');
        headerRow.appendChild(headerCell);
    });

    // Function to add new rows
    function addGroupRow(copyValues = null) {
        var newRow = groupTable.insertRow();
        
        headers.forEach((headerText, index) => {
            var newCell = newRow.insertCell(index);
            newCell.classList.add('tableSelectorCell', 'noClicker', 'noBorderSide');
            if (index < 3) {
                var input = document.createElement("input");
                input.type = index == 0 ? "text" : "number"; // text for Name, number for Max Size and Min Preferred Size
                input.classList.add("field");
                if (index == 1) {
                    input.placeholder = "Max";
                } else if (index == 2) {
                    input.placeholder = "Min";
                } else {
                    input.placeholder = "Name";
                }
                if (copyValues && copyValues[index] !== undefined) {
                    input.value = copyValues[index];
                }
                newCell.appendChild(input);
            } else {
                var deleteIcon = document.createElement("span");
                deleteIcon.innerHTML = "🗑️";
                deleteIcon.style.cursor = "pointer";
                deleteIcon.addEventListener("click", () => {
                    if (groupTable.rows.length > 2) {
                        groupTable.deleteRow(newRow.rowIndex);
                    }
                });
                newCell.appendChild(deleteIcon);
            }
        });

        updateTableClasses();
    }

    // Append table to the div
    groupDiv.appendChild(groupTable);

    // Append the div to the document
    document.getElementById("sheetContent").appendChild(groupDiv);

    // Create a new div for the links
    var linksP = document.createElement("p");
    linksP.classList.add("looseText", "top");

    // Links to add and copy rows
    var addLink = document.createElement("a");
    addLink.href = "#";
    addLink.innerText = "Add Group";
    addLink.addEventListener("click", function(event) {
        event.preventDefault();
        addGroupRow();
    });

    var addGroupText = document.createTextNode("");

    var copyLink = document.createElement("a");
    copyLink.href = "#";
    copyLink.innerText = "Copy last group ";
    copyLink.addEventListener("click", function(event) {
        event.preventDefault();
        let copyCount = document.getElementById("copyCount").value;
        if (copyCount < 1) {
            return;
        }
        let lastRow = groupTable.rows[groupTable.rows.length - 1];
        let copyValues = [];
        for (let i = 0; i < 3; i++) {
            copyValues.push(lastRow.cells[i].querySelector("input").value);
        }
        for (let i = 0; i < copyCount; i++) {
            addGroupRow(copyValues);
        }
    });

    var copyCountInput = document.createElement("input");
    copyCountInput.type = "number";
    copyCountInput.id = "copyCount";
    copyCountInput.value = "1";
    copyCountInput.classList.add("field");
    copyCountInput.style.width = "50px";

    var timesLink = document.createElement("a");
    timesLink.href = "#";
    timesLink.innerText = " times";
    timesLink.addEventListener("click", function(event) {
        event.preventDefault();
        let copyCount = document.getElementById("copyCount").value;
        if (copyCount < 1) {
            return;
        }
        let lastRow = groupTable.rows[groupTable.rows.length - 1];
        let copyValues = [];
        for (let i = 0; i < 3; i++) {
            copyValues.push(lastRow.cells[i].querySelector("input").value);
        }
        for (let i = 0; i < copyCount; i++) {
            addGroupRow(copyValues);
        }
    });

    // Append the links to the linksP
    linksP.appendChild(addLink);
    linksP.appendChild(addGroupText);
    linksP.appendChild(document.createTextNode(" | "));
    linksP.appendChild(copyLink);
    linksP.appendChild(copyCountInput);
    linksP.appendChild(timesLink);

    // Append the linksP to the document
    document.getElementById("sheetContent").appendChild(linksP);

    // Add initial rows
    addGroupRow();
    addGroupRow();
}


function updateTableClasses() {
    let groupTable = document.getElementById("groupTable");
    let rows = groupTable.rows;

    for (let i = 0; i < rows.length; i++) {
        let cells = rows[i].cells;
        for (let j = 0; j < cells.length; j++) {
            cells[j].classList.remove('left-col', 'right-col', 'top-row', 'bottom-row', "mid-col");
            if (i == 0) cells[j].classList.add('top-row');
            if (i == rows.length - 1) cells[j].classList.add('bottom-row');
            if (j == 0) cells[j].classList.add('left-col');
            if (j == cells.length - 1) cells[j].classList.add('right-col');
            if (j > 0 && j < cells.length - 1 && i != 0) cells[j].classList.add('mid-col');
        }
    }
}

function submitGroups() {
    let table = document.getElementById("groupTable");
    let rows = table.rows;
    let instructions = document.getElementById("instructions");

    // Validate groups input
    for (let i = 1; i < rows.length; i++) {
        let nameInput = rows[i].cells[0].querySelector("input");
        let maxSizeInput = rows[i].cells[1].querySelector("input");
        let minPreferredSizeInput = rows[i].cells[2].querySelector("input");
        if (nameInput.value === "" || maxSizeInput.value === "" || minPreferredSizeInput.value === "" || maxSizeInput.value < 1 || minPreferredSizeInput.value < 0 || !Number.isInteger(Number(maxSizeInput.value)) || !Number.isInteger(Number(minPreferredSizeInput.value))) {
            instructions.innerHTML = "Please ensure all groups have a non-empty name, max size greater than 0, and min preferred size 0 or larger. All sizes must be whole numbers.";
            instructions.innerHTML += '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<a href="#" onclick="event.preventDefault(); submitGroups();">Continue ></a>';
            instructions.classList.add('text-danger');
            return;
        }
    }

    if (rows.length < 3) {
        instructions.innerHTML = "Please create at least two groups.";
        instructions.innerHTML += '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<a href="#" onclick="event.preventDefault(); submitGroups();">Continue ></a>';
        instructions.classList.add('text-danger');
        return;
    }

    // Proceed to the next step
    instructions.innerHTML = "Configure final parameters.";
    instructions.classList.remove('text-danger');

    // Hide previous table and remove add and copy links
    document.querySelectorAll('.myTableOuter')[1].classList.add('hidden');
    document.querySelectorAll('.looseText')[2].classList.add('hidden');

    // Create a new div and table for final parameters
    var finalParamsDiv = document.createElement("div");
    finalParamsDiv.classList.add("myTableOuter", "floater");

    var finalParamsTable = document.createElement("table");
    finalParamsTable.id = "finalParamsTable";
    finalParamsTable.classList.add("table", "table-bordered", "table-sm", "myTable");

    var params = [
        {label: "Location Minimum Size Weight", type: "number", placeholder: "Weight"},
        {label: "Iterations", type: "number", placeholder: "#"},
        {label: "Number of Sorts", type: "number", placeholder: "#"},
        {label: "Sort Name", type: "text", placeholder: "Name"}
    ];

    // Create rows for each parameter
    params.forEach((param, index) => {
        var row = finalParamsTable.insertRow();
        
        // Column 1: Label
        var labelCell = row.insertCell(0);
        labelCell.innerText = param.label;
        labelCell.classList.add('noClicker', 'tableSelectorCell', 'left-col', 'verticalCenter');
        if (index == 0) labelCell.classList.add('top-row');
        if (index == params.length - 1) labelCell.classList.add('bottom-row');
        
        // Column 2: Input
        var inputCell = row.insertCell(1);
        inputCell.classList.add('tableSelectorCell', 'noClicker', 'right-col');
        var input = document.createElement("input");
        input.type = param.type;
        input.placeholder = param.placeholder;
        input.classList.add("field");
        inputCell.appendChild(input);
        if (index == 0) inputCell.classList.add('top-row');
        if (index == params.length - 1) inputCell.classList.add('bottom-row');
    });

    // Append table to the div
    finalParamsDiv.appendChild(finalParamsTable);

    // Append the div to the document
    document.getElementById("sheetContent").appendChild(finalParamsDiv);

    // Update instructions
    instructions.innerHTML += '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<a href="#" onclick="event.preventDefault(); finalizeSubmission();">Submit ></a>';
}

function finalizeSubmission() {
    let finalParamsTable = document.getElementById("finalParamsTable");
    let rows = finalParamsTable.rows;
    let instructions = document.getElementById("instructions");

    // Validate final parameters input
    for (let i = 0; i < rows.length; i++) {
        let inputElement = rows[i].cells[1].querySelector("input");
        if (inputElement.value === "" || (inputElement.type === "number" && (inputElement.value < 0 || !Number.isInteger(Number(inputElement.value))))) {
            instructions.innerHTML = "Please ensure all final parameters have valid values.";
            instructions.innerHTML += '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<a href="#" onclick="event.preventDefault(); finalizeSubmission();">Submit ></a>';
            instructions.classList.add('text-danger');
            return;
        }
    }

    // Proceed with final submission logic here
    instructions.innerHTML = "Submission successful.";
    instructions.classList.remove('text-danger');

    // Hide final parameters table div
    document.querySelectorAll('.myTableOuter')[2].classList.add('hidden');
}
