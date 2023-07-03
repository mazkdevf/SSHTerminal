const express = require('express');
const http = require('http');
const { Server } = require('ws');
const { Client } = require('ssh2');
require('colors');

const app = express();
const server = http.createServer(app);
const wss = new Server({ server });

wss.on('connection', async (ws, req) => {
    console.log(await BoxString(`New WS connection established :D`, "cyan"));

    var query = req.url.split('?')[1];
    var hostname = query.split('&')[0].split('=')[1];
    var username = query.split('&')[1].split('=')[1];
    var password = query.split('&')[2].split('=')[1];

    const sshConfig = {
        host: hostname,
        port: 22,
        username: username,
        password: password,
    };

    const sshClient = new Client();
    sshClient
        .on('ready', async () => {
            ws.send("startup")
            ws.on('message', (command) => {
                sshClient.exec(command, async (err, stream) => {
                    if (err) {
                        ws.send("XluJPYMRfHh97e96NPNirnccNiCHDSCBSeakKNGT2p30dtzojU: Error while executing command!");
                        return;
                    }

                    let output = '';
                    stream
                        .on('close', (code) => {
                            ws.send(output);
                        })
                        .on('data', (data) => {
                            output += data.toString();
                        })
                        .stderr.on('data', (data) => {
                            output += data.toString();
                        });
                });
            });
        })
        .connect(sshConfig).on('error', async (err) => {
            ws.send("XluJPYMRfHh97e96NPNirnccNiCHDSCBSeakKNGT2p30dtzojU: " + err.message)
        });
});

server.listen(3000, () => {
    console.clear();
    console.log(`
                                     _______  _______  ______    __   __  ___   __    _  _______  ___     
       .dBBBBP.dBBBBP   dBP dBP     |       ||       ||    _ |  |  |_|  ||   | |  |  | ||   _   ||   |    
       BP     BP       dBP dBP      |_     _||    ___||   | ||  |       ||   | |   |_| ||  |_|  ||   |    
       \`BBBBb \`BBBBb  dBBBBBP         |   |  |   |___ |   |_||_ |       ||   | |       ||       ||   |    
          dBP    dBP  dBP dBP         |   |  |    ___||    __  ||       ||   | |  _    ||       ||   |___ 
      dBBBBP'dBBBBP' dBP dBP          |   |  |   |___ |   |  | || ||_|| ||   | | | |   ||   _   ||       |
                                      |___|  |_______||___|  |_||_|   |_||___| |_|  |__||__| |__||_______|\n\n
                                SSH Terminal Server listening on port 3000!
                                      `)

});


function BoxString(string, color = "cyan") {
    const date = new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '');

    var string = "[" + date + "] " + string;

    string = string.replace(/\[(.*?)\]/g, function (x) {
        return x[color];
    });

    return string;
}