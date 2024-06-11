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

    for (let i = 0; i < numColsNew; i++) {
        let inputElement = table.rows[0].cells[i].getElementsByTagName('input')[0];
        if (inputElement != null && (inputElement.value == "" || inputElement.value < 0 || !Number.isInteger(Number(inputElement.value)))) {
            var instructions = document.getElementById("instructions");
            instructions.innerHTML = "Please weight all features with natural number: 1, 2, 3, etc";
            instructions.innerHTML += '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<a href="#" onclick="event.preventDefault(); submitWeights();">Continue ></a>';
            instructions.classList.add('text-danger');
            return;
        }
    }
    
    document.getElementById("sheetContentInner").classList.add('hidden');
    var instructions = document.getElementById("instructions");
    instructions.innerHTML = "Create one or more groups to continue.";
    instructions.innerHTML += '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<a href="#" onclick="event.preventDefault(); submitGroups();">Continue ></a>';
    instructions.classList.remove('text-danger');

    // create a new table with three columns. The first is name (string), then max size (int), then min preferred size (int)
}

