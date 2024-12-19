"use strict";
const { app, BrowserWindow, ipcMain } = require("electron");
const { OnlineUpdater, Version } = require("@hydraulic/conveyor-control");
const fs = require("fs");
const path = require("path");
const packageJsonPath = path.join(app.getAppPath(), "package.json");
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf8"));
const updater = new OnlineUpdater(packageJson.updateSite);
async function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      // Set up IPC.
      preload: path.join(__dirname, "preload/preload.js")
    }
  });
  await mainWindow.loadFile("renderer/index.html");
  const version = updater.getCurrentVersion().toString();
  let serverVersion;
  try {
    serverVersion = (await updater.getCurrentVersionFromRepository()).toString();
  } catch (e) {
    console.error(e);
    serverVersion = "(error)";
  }
  await mainWindow.webContents.executeJavaScript(`
        const elem = document.querySelector('#app-version');
        elem.textContent = 'Local version: ${version} / Latest version: ${serverVersion}';
    `);
}
app.whenReady().then(async () => {
  await createWindow();
  ipcMain.handle("trigger-update-check", async () => {
    try {
      updater.triggerUpdateCheckUI();
      return "Update check triggered successfully";
    } catch (error) {
      console.error("Error triggering update check:", error);
      return `Error: ${error.message}`;
    }
  });
  app.on("activate", function() {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});
app.on("window-all-closed", function() {
  if (process.platform !== "darwin") app.quit();
});
