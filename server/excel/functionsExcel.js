const ExcelJS = require('exceljs');
const workbook = new ExcelJS.Workbook();


function readFileExcel(numeroFactura,fechaFactura) {
  workbook.xlsx.readFile('Plantilla202xxxxx.xlsx')
  .then(function() {
    const worksheet = workbook.getWorksheet('Factura');

    changeCellValue(worksheet, 'H3', numeroFactura);
    changeCellValue(worksheet, 'B9:C9', 'Fecha: '+fechaFactura);

    return workbook.xlsx.writeFile('./facturas-cliente/'+numeroFactura+'.xlsx');
  })
  .then(function() {
    console.log('Archivo de Excel modificado correctamente.');
  })
  .catch(function(error) {
    console.log('Ocurrió un error:', error);
  });
}

function changeCellValue(worksheet, cellIndex, value){
  
  worksheet.getCell(cellIndex).value = value;

}

module.exports = readFileExcel;