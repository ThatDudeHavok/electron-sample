const request = require('request');
const { autoUpdater, dialog } = require('electron');

const pkg = require('../package');

const host = 'https://geiger.alabastertechnologies.com';
const app_id = '90672382-9534-4c43-91da-057b0fc49362';
//const host = 'http://localhost:3000';

function check_for_updates() {
  if(process.platform !== 'linux') {
    var updateUrl = host + '/updates/' + app_id + '/' + process.platform + '/' + pkg.version;
    request.get(updateUrl, function(err, res, body) {
      console.log(err, body);
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

module.exports = check_for_updates;
