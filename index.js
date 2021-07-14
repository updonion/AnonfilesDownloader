process.env.NTBA_FIX_319 = 1;
import chalk from 'chalk'
import { parse } from 'node-html-parser';
import { getPageContent } from './helpers/puppeteer'
const request = require('request');
const fs = require('fs');
const TelegramBot = require('node-telegram-bot-api');
const token = '';
const bot = new TelegramBot(token, { polling: true });

bot.on('message', (msg) => {
    const chatId = msg.chat.id;

    (async function main() {
        try {
            const pageContent = await getPageContent(msg.text);
            const parsedPageContent = parse(pageContent);
            var downloaderURL = encodeURI(parsedPageContent.querySelector('#download-url')._attrs.href)
            console.log(downloaderURL)
            // bot.sendDocument(chatId, downloaderURL);
            bot.sendMessage(chatId, downloaderURL);





            /* Create an empty file where we can save data */
            let file = fs.createWriteStream(`delete.txt`);
            /* Using Promises so that we can use the ASYNC AWAIT syntax */
            await new Promise((resolve, reject) => {
                let stream = request({
                    /* Here you should specify the exact link to the file you are trying to download */
                    uri: downloaderURL,
                    headers: {
                        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
                        'Accept-Encoding': 'gzip, deflate, br',
                        'Accept-Language': 'en-US,en;q=0.9,fr;q=0.8,ro;q=0.7,ru;q=0.6,la;q=0.5,pt;q=0.4,de;q=0.3',
                        'Cache-Control': 'max-age=0',
                        'Connection': 'keep-alive',
                        'Upgrade-Insecure-Requests': '1',
                        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/68.0.3440.106 Safari/537.36'
                    },
                    /* GZIP true for most of the websites now, disable it if you don't need it */
                    gzip: true
                })
                    .pipe(file)
                    .on('finish', () => {
                        console.log(`The file is finished downloading.`);
                        resolve();
                    })
                    .on('error', (error) => {
                        reject(error);
                    })
            })
                .catch(error => {
                    console.log(`Something happened: ${error}`);
                });

                bot.sendDocument(chatId, 'delete.txt');







        } catch (err) {
            console.log(chalk.red('Error \n'));
            console.log(err);
        }
    }

    )()


    // send a message to the chat acknowledging receipt of their message


    

})


    ;