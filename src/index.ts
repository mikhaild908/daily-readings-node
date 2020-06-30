import util from './DailyReadingsUtil';

console.log();

(async () => {
    //let readings = await util.getReadings("062820");
    let readings = await util.getReadings("062920");

    console.log(readings.date);

    console.log(readings.firstReading.title);
    console.log(readings.firstReading.reading);

    console.log(readings.responsorialPsalm.title);
    console.log(readings.responsorialPsalm.reading);
    
    console.log(readings.secondReading.title);
    console.log(readings.secondReading.reading);

    console.log(readings.alleluia.title);
    console.log(readings.alleluia.alleluia);

    console.log(readings.gospel.title);
    console.log(readings.gospel.reading);
})();