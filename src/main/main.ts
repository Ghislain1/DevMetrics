import {
    app,
    BrowserWindow
} from "electron";

import path from "node:path";

const DEV_SERVER_URL = process.env.ELECTRON_RENDERER_URL;

let mainWindow: BrowserWindow | null = null;

function createWindow() {

    mainWindow = new BrowserWindow({

        width: 1400,
        height: 900,

        webPreferences: {

            preload: path.join(
                __dirname,
                "../preload/preload.cjs"
            ),

            contextIsolation: true,
            nodeIntegration: false

        }

    });

    if (DEV_SERVER_URL) {

        void mainWindow.loadURL(DEV_SERVER_URL);

    } else {

        void mainWindow.loadFile(
            path.join(__dirname, "../../dist/renderer/index.html")
        );

    }

    mainWindow.on("closed", () => {

        mainWindow = null;

    });

}

app.whenReady().then(() => {

    createWindow();

    app.on("activate", () => {

        if (BrowserWindow.getAllWindows().length === 0) {

            createWindow();

        }

    });

});

app.on("window-all-closed", () => {

    if (process.platform !== "darwin") {

        app.quit();

    }

});
