import {
    app,
    BrowserWindow
} from "electron";

import path from "node:path";
// Electron Main Process - Jetzt kommt Electron.
function createWindow() {

    const window =
        new BrowserWindow({

            width: 1400,
            height: 900,

            webPreferences: {

                preload: path.join(
                    __dirname,
                    "../preload/preload.js"
                ),

                contextIsolation: true,
                nodeIntegration: false

            }

        });

    window.loadURL(
        "http://localhost:5173"
    );
}

app.whenReady().then(() => {

    createWindow();

});