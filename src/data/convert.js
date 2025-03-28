// write a script that mergers the cities.json and regions.json files into a single file called data.json
const fs = require('fs');
const path = require('path');
const cities = require('./cities.json');
const regions = require('./regions.json');
const data = { cities, regions };

const outputPath = path.join(__dirname, 'data.json');
const output = [];
for(var i = 0; i < regions.rows.length; i++){
    var region = regions.rows[i];
    for(var j = 0; j < cities.rows.length; j++){
        var city = cities.rows[j];
        if(region.id == city.region_id) {
            region.cities = region.cities || [];
            region.cities.push(city.name);
        }
    }
    delete region.cities_id;
    delete region.label;
    delete region.code;
    delete region.id;
    output.push(region);
}

const outputData = JSON.stringify(output, null, 2);


fs.writeFileSync(outputPath, outputData, 'utf8', (err) => {
  if (err) {
    console.error('Error writing to file', err);
  } else {
    console.log('Data successfully written to data.json');
  }
});

