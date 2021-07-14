process.env.NTBA_FIX_319 = 1;
import chalk from 'chalk'
import { parse } from 'node-html-parser';
import { getPageContent } from './helpers/puppeteer'
import url from 'url'
require('dotenv').config();
const request = require('request');
const fs = require('fs');
const bytes = require('bytes');
const TelegramBot = require('node-telegram-bot-api');
const token = process.env.TG_BOT_TOKEN;

const bot = new TelegramBot(token, { polling: true });

bot.on('message', (msg) => {

    const userURL = new URL(msg.text);
    const chatId = msg.chat.id;
    global.file_id = userURL.pathname.substr(1, 10)
    

    // Получаем информацию о файле (статус и размер)
    request(`https://api.anonfiles.com/v2/file/${file_id}/info`, { json: true }, (err, res, body) => {
        if (err) {
            return console.log(err);
        }
        global.file_status = body.status;
        global.raw_file_size = body.data.file.metadata.size.bytes;
        global.file_size = bytes(raw_file_size);
    });


    console.log(file_status)
    bot.sendMessage(chatId, `${file_status}\n${file_id}\n${userURL.host}\n${file_size}`);

    // Если пользователь отправил правильную ссылку
    if (userURL.host === 'anonfiles.com' && raw_file_size <= 157286400) { // TODO принимать также ссылки типа https://cdn-120.anonfiles.com/RbO4rdT2me/261757a3-1626300234/

        (async function main() {
            try {
                const pageContent = await getPageContent(msg.text);
                const parsedPageContent = parse(pageContent);
                var downloaderURL = encodeURI(parsedPageContent.querySelector('#download-url')._attrs.href)
                console.log(downloaderURL)
                // bot.sendDocument(chatId, downloaderURL);
                bot.sendMessage(chatId, downloaderURL);
                




                /* Create an empty file where we can save data */
                let file = fs.createWriteStream(`${file_id}`);
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

                bot.sendDocument(chatId, `${file_id}`);







            } catch (err) {
                console.log(chalk.red('Error \n'));
                console.log(err);
            }
        }

        )()
    } else { bot.sendMessage(chatId, 'Wrong Link'); }

    // send a message to the chat acknowledging receipt of their message




})


    ;