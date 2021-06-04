import axios from 'axios';
import cheerio from 'cheerio';
import getUrls from 'get-urls';
import fs from 'fs';
import path from 'path';
import Promise from 'bluebird';
import lineReader from 'line-reader'

import Locations from './models/locations';

// const check


const crawl = async () => {
    try {
        //get all the urls
        const urls = ['https://www.srilanka.travel/'];
        //get all locations from database
        const [locations, _] = await Locations.selectAll();

        // initialize keyword file reading - promisify to use async await
        const keywords = Promise.promisify(lineReader.eachLine);

        // loop through each url content
        urls.forEach(async (url) => {
            // define the output format
            const output = {
                url,
                keywords: [],
                locations: [],
            }

            // request content from the url
            let response = await axios(url);

            if (response.status !== 200) {
                return console.log(`Error loading resource URL: ${url}`);
            }

            const $ = cheerio.load(response.data);
            let text = '';

            console.log('Wait.. content loading');

            //extract all content in headers, paragraphs and body tags
            await $('h1, h2, h3, h4, h5, h6, p, body').map((_, element) => {
                text += $(element).text();
            });

            // make upper case to avoid case sensitivity
            text = text.toUpperCase();

            // check for the locations in the content
            await locations.forEach(location => {
                if (text.indexOf(location.name.toUpperCase()) > -1) {
                    output.locations.push(location.name);
                    return;
                }
            });

            // check for the keywords
            await keywords(path.join(__dirname, 'resources', 'Keywords.txt'), (line) => {
                if (text.indexOf(line.toUpperCase()) > -1) {
                    output.keywords.push(line);
                    return;
                }
            });

            if (output.locations.length && output.keywords.length) {
                await fs.promises.appendFile(path.join(__dirname, 'outputs', 'Results.txt'), `URL: ${output.url}\n`);
                await fs.promises.appendFile(path.join(__dirname, 'outputs', 'Results.txt'), `Keywords found: ${output.keywords}\n`);
                await fs.promises.appendFile(path.join(__dirname, 'outputs', 'Results.txt'), `Locations mentioned: ${output.keywords}\n`);
                await fs.promises.appendFile(path.join(__dirname, 'outputs', 'Results.txt'), `============================================\n\n`);
            }

            console.log(output);
        });
    } catch (error) {
        console.log(error);
    }
};

crawl();


