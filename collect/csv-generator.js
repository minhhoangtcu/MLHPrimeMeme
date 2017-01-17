const stringify = require('csv-stringify');
const fs = require('fs');

/**
 * Generate a CSV file provided the data formatted as an array of dictionary.
 */
function generateCSV(fileName, data) {
  // Get headers
  let columns = [];
  Object.keys(data[0]).forEach((key) => {
    columns.push(key);
  });

  // Convert the data into a string
  stringify(data, {header: true, columns: columns}, (err, output) => {

    // Write out the string into csv file
    fs.writeFile(fileName + '.csv', output, (err) => {
      if (err) throw err;
      console.log('file saved');
    });
  });
}

exports.generateCSV = generateCSV;