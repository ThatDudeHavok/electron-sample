const electron = require('electron')
const path = require('path');
const spawn = require('child_process').spawn;
// Module to control application life.
const app = electron.app
// Module to create native browser window.
const BrowserWindow = electron.BrowserWindow

function handleStartupEvent() {
  if (process.platform !== 'win32') {
    return false;
  }

  var squirrelCommand = process.argv[1];
  var updateDotExe = path.resolve(path.dirname(process.execPath), '..', 'Update.exe');
  var target = path.basename(process.execPath);
  switch (squirrelCommand) {
    case '--squirrel-install':
    case '--squirrel-updated':

      spawn(updateDotExe, ['--createShortcut', target]).on('exit', function() { app.quit(); });
      // Optionally do things such as:
      //
      // - Install desktop and start menu shortcuts
      // - Add your .exe to the PATH
      // - Write to the registry for things like file associations and
      //   explorer context menus

      // Always quit when done

      return true;
    case '--squirrel-uninstall':
      // Undo anything you did in the --squirrel-install and
      // --squirrel-updated handlers

      // Always quit when done

      spawn(updateDotExe, ['--removeShortcut', target]).on('exit', function() { app.quit(); });
      return true;
    case '--squirrel-obsolete':
      // This is called on the outgoing version of your app before
      // we update to the new version - it's the opposite of
      // --squirrel-updated
      app.quit();
      return true;
  }
}


// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow

var URL_LOCATION = 'http://geiger.alabastertech.com/';
var checkForUpdates = false;
function check_for_updates() {
  if(checkForUpdates && process.platform !== 'linux') {
    var updateUrl = URL_LOCATION + 'update/' + process.platform + '?version=' + require('./package').version;
    request.get(updateUrl, function(err, res, body) {
      if(err) throw err;
      if(typeof body === 'string') body = JSON.parse(body);
      if(res.statusCode == 200) {
        console.log(body);
        dialog.showMessageBox({
          title: 'An update is available',
          message: 'A new version is available (' + body.version + '). Would you like to download this update?',
          buttons: ['Download', 'Skip for now'],
        }, function(result) {
          if(result == 0) {
            autoUpdater.setFeedUrl(updateUrl);
            autoUpdater.on('error', function(err) {
              dialog.showErrorBox('Update error', err);
            }).on('update-downloaded', function() {
              dialog.showMessageBox({
                title: 'Update ready to install',
                message: 'Successfully downloaded update. Click to update and restart.',
                buttons: ['Update and restart'],
              }, function(result) {
                autoUpdater.quitAndInstall();
              });
            });
          }
        });

      }
    });
  }
}

function createWindow () {
  if(handleStartupEvent()) {
    return;
  }
  check_for_updates();
  // Create the browser window.
  mainWindow = new BrowserWindow({width: 800, height: 600})

  // and load the index.html of the app.
  mainWindow.loadURL(`file://${__dirname}/index.html`)

  // Open the DevTools.
  //mainWindow.webContents.openDevTools()

  // Emitted when the window is closed.
  mainWindow.on('closed', function () {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null
  })
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow)

// Quit when all windows are closed.
app.on('window-all-closed', function () {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', function () {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) {
    createWindow()
  }
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
