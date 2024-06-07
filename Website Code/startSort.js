document.getElementById('actual-btn').addEventListener('change', function() {
    const file = this.files[0];
    const reader = new FileReader();
    reader.onload = function(e) {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, {type: 'array'});
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const html = XLSX.utils.sheet_to_html(worksheet);
        
        const sheetTable = document.getElementById('sheetTable');
        sheetTable.innerHTML = html;

        // Add padding to the top row and leftmost column
        const rows = sheetTable.querySelectorAll('tr');
        if (rows.length > 0) {
            rows[0].classList.add('top-row'); // Top row
        }
        rows.forEach(row => {
            if (row.cells.length > 0) {
                row.cells[0].classList.add('left-col'); // Leftmost column
            }
        });

        document.getElementById('sheetContent').style.display = 'block';
    };
    reader.readAsArrayBuffer(file);
    document.getElementById('fileUpload').style.display = 'none';
});