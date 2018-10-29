import saveAs  from "./fileSaver.js";
var exportXLSX = function (table, options) {
	options = options || {};
	var tableRows = table.rows;
	var childrenLen = tableRows.length;
	var data = [];
	var wscols = [];
	var ws_name = options.workSheetName || "Sample WorkSheet";
	var fileName = options.fileName || "Sample File";

	var theadPresent = false;

	var rowParser = 0;
	if (tableRows[0].parentNode.nodeName == "THEAD" || options.firstRowAsHeader) {
		theadPresent = true;
		var cells = tableRows[0].cells;
		var cellLen = cells.length;
		var cellData = [];

		for (var cellParser = 0; cellParser < cellLen; cellParser++) {
			cellData.push(cells[cellParser].innerText);
			var colWidth = cells[cellParser].offsetWidth / 5;
			if (colWidth > 50) colWidth = 50;
			if (options.fileType != 'csv') {
				wscols.push({wch: colWidth});
			}
		}
		data.push(cellData);
		rowParser++;
	}

	for (; rowParser < childrenLen; rowParser++) {
		var cells = tableRows[rowParser].cells;
		var cellLen = cells.length;
		var cellData = [];

		for (var cellParser = 0; cellParser < cellLen; cellParser++) {
			cellData.push(cells[cellParser].innerText);
		}
		data.push(cellData);
	}

	var Workbook = function () {
		if(!(this instanceof Workbook)) return new Workbook();
		this.SheetNames = [];
		this.Sheets = {};
	}
	var wb = new Workbook();

	var sheet_from_array_of_arrays = function (data, opts) {
		var ws = {};
		var range = {s: {c:10000000, r: 10000000}, e: {c: 0, r: 0}};
		for(var R = 0; R != data.length; ++R) {
			for(var C = 0; C != data[R].length; ++C) {
				if (range.s.r > R) range.s.r = R;
				if (range.s.c > C) range.s.c = C;
				if (range.e.r < R) range.e.r = R;
				if (range.e.c < C) range.e.c = C;
				var cell = {v: data[R][C]};
				if(cell.v == null) continue;
				var cell_ref = XLSX.utils.encode_cell({c: C,r: R});

				/* TEST: proper cell types and value handling */
				if(typeof cell.v === 'number') cell.t = 'n';
				else if(typeof cell.v === 'boolean') cell.t = 'b';
				/*else if(cell.v instanceof Date) {
					cell.t = 'n'; cell.z = XLSX.SSF._table[14];
					cell.v = datenum(cell.v);
				}*/
				else cell.t = 's';

				if (!R && theadPresent) cell.s = {font: {bold: true}};
				ws[cell_ref] = cell;
			}
		}

		/* TEST: proper range */
		if(range.s.c < 10000000) ws['!ref'] = XLSX.utils.encode_range(range);
		return ws;
	}

	var ws = sheet_from_array_of_arrays(data);

	wb.SheetNames.push(ws_name);
	wb.Sheets[ws_name] = ws;

	ws['!cols'] = wscols;

	var wopts = {bookType: options.fileType || 'xlsx', bookSST: false, type: 'binary'};

	var s2ab = function (s) {
	  	var buf = new ArrayBuffer(s.length);
	  	var view = new Uint8Array(buf);
	  	for (var i=0; i!=s.length; ++i) view[i] = s.charCodeAt(i) & 0xFF;
	  	return buf;
	}

	if (options.fileType == 'csv') {
		saveAs(new Blob([s2ab(XLSX.utils.sheet_to_csv(ws))], {type: ""}), fileName + ".csv");
	} else {
		var wbout = XLSX.write(wb, wopts);
		saveAs(new Blob([s2ab(wbout)], {type: ""}), fileName + ".xlsx");
	}
}

export default exportXLSX;