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
            var options = ["Option 1", "Option 2", "Option 3"];

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
        });
    });
}