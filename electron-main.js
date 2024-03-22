'use-strict';

// Modules to control application life and create native browser window
const { app, BrowserWindow } = require("electron");
const path = require("path");
const net = require("net")
const express = require("express");
const cors = require("cors");
const localServerApp = express();
const PORT = 8088;
const startLocalServer = (done) => {
  localServerApp.use(express.json({ limit: "100mb" }));
  localServerApp.use(cors());
  localServerApp.use(express.static('./build/'));
  localServerApp.listen(PORT, async () => {
    console.log("Server Started on PORT ", PORT);
    done();
  });
};

var socketClient

function createWindow() {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    nodeIntegration: process.env.ELECTRON_NODE_INTEGRATION,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js')
    }
  });

  // and load the index.html of the app.
  //   mainWindow.loadFile('index.html')
  mainWindow.loadURL("http://localhost:" + PORT);

  // Open the DevTools.
  // mainWindow.webContents.openDevTools()

  // Load Socket
  console.log("Attempting Socket Connection...")
  socketClient = net.connect({host: 'localhost', port:9055}, () => {
    console.log('Connected to Socket!')
  })

  socketClient.on('data', (data)=>{
    console.log("RECEIVED")
    console.log(data.toString())
    console.log()

    // Some parsing
    const items = data.toString().split(/\s+/).filter((e, i) => i % 5 === 0);
    mainWindow.webContents.send('update-rfid',items)
  })

  socketClient.on('end', () => {
    console.log("Socket Disconnected")
  })
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  startLocalServer(createWindow);

  app.on("activate", function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on("window-all-closed", function () {
  if (process.platform !== "darwin") app.quit();
});

app.on('before-quit', function () {
  socketClient.end()
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.