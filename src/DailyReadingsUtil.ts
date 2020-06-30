const fetch = require('node-fetch');

enum DayOfWeek {
    Sunday = 0,
    Monday = 1,
    Tuesday = 2,
    Wednesday = 3,
    Thursday = 4,
    Friday = 5,
    Saturday = 6
}

interface Reading {
    title: string;
    content: string;
    reading: string;
}

interface Alleluia {
    alleluia: string;
    title: string
}

interface ReadingsForToday {
    date: Date;
    firstReading: Reading;
    secondReading: Reading;
    responsorialPsalm: Reading;
    alleluia: Alleluia;
    gospel: Reading;
}

class DailyReadingsUtil {
        
    async getReadings(id: string) {
        const month = parseInt(id.substring(0, 2)) - 1;
        const day = parseInt(id.substring(2, 4));
        const year = parseInt(id.substring(4, 6)) + 2000;

        let date = new Date(year, month, day, 0, 0, 0, 0);

        const readings: ReadingsForToday = {
            date: date,
            firstReading: { title: "", content: "", reading: "" },
            secondReading: { title: "", content: "", reading: "" },
            responsorialPsalm: { title: "", content: "", reading: "" },
            alleluia: { alleluia: "", title: "" },
            gospel: { title: "", content: "", reading: "" },
        };

        let response = await this.getResponseFromServer(id);

        let first = this.getReading(response);
        let second = this.getReading(first.content);
        let third = this.getReading(second.content);
        let fourth = this.getReading(third.content);
        let fifth = this.getReading(fourth.content);

        readings.date = date;

        readings.firstReading = first;
        readings.responsorialPsalm = second;
        
        if(date.getDay() === DayOfWeek.Sunday.valueOf())
        {
            readings.secondReading = third;
            //readings.alleluia = this.parseAlleluia(third.content);
        }

        readings.alleluia = this.parseAlleluia(third.content);
        readings.gospel = fourth;

        return readings;
    }

    private parseAlleluia (content: string): Alleluia {
        let result: Alleluia = {
            alleluia: "",
            title: ""
        };
        
        const alleluia = ">";
        const closingATag = "</a>";
        const poetry = "poetry";
        const closingDivTag = "</div>";

        let indexOfAlleluia = content.indexOf(alleluia) + 1;
        let indexOfClosingATag = content.indexOf(closingATag, indexOfAlleluia + 1);

        result.title = "Alleluia - " + content.substring(indexOfAlleluia, indexOfClosingATag);

        let indexOfPoetry = content.indexOf(poetry, indexOfClosingATag) + 8;
        let indexOfClosingDivTag = content.indexOf(closingDivTag, indexOfPoetry + 1);

        result.alleluia = content.substring(indexOfPoetry, indexOfClosingDivTag);

        return result;
    }

    private async getResponseFromServer (id: string): Promise<string> {
        let url = "http://www.usccb.org/bible/readings/" + id + ".cfm";
        return await this.getResponse(url);
    }

    private async getResponse (url: string): Promise<string> {

        const response = await fetch(url);
        return response.text();
    }

    private getReading(content: string): Reading
    {
        let result: Reading = {
            title: "",
            content: "",
            reading: ""
        };

        let bibleReadingsWrapperIndex = content.indexOf("bibleReadingsWrapper") + 27;

        if (bibleReadingsWrapperIndex === -1)
        {
            return result;
        }

        content = content.substring(bibleReadingsWrapperIndex);

        let anchorIndex = content.indexOf("<a");
        let anchorClosingIndex = content.indexOf(">", anchorIndex + 1);
        let closingAnchorTaxIndex = content.indexOf("</a>");

        result.title = `${content.substring(0, anchorIndex)} - ${content.substring(anchorClosingIndex + 1, closingAnchorTaxIndex)}`;
        
        let poetryIndex = content.indexOf("poetry") + 8;
        let firstDiv = content.indexOf("</div>");
        
        result.reading = content.substring(poetryIndex, firstDiv);
        result.content = content.substring(poetryIndex + firstDiv + 1);

        return result;
    }
}

export default new DailyReadingsUtil();