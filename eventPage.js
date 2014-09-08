/*
    If an id is also specified and a window with a matching id has been shown before, the remembered bounds of the window will be used instead.

    Size calculation for innerBounds seems to be faulty, app was designed for 740x420

    Bug was confirmed on Windows 7
    OSX seems to be unaffected
    Linux and cros is unknown

    I am using arbitrary dimensions which fixes the Windows 7 problem, hopefully it will get resolved in future release so other OSs won't have to
    use bigger dimensions by default.
*/
'use strict';

function start_app() {
    chrome.app.window.create('main.html', {
        id: 'main-window',
        frame: 'chrome',
        innerBounds: {
            minWidth: 714,
            minHeight: 427
        }
    }, function(main_window) {
        main_window.onClosed.addListener(function() {
            // connectionId is passed from the script side through the chrome.runtime.getBackgroundPage refference
            // allowing us to automatically close the port when application shut down

            // save connectionId in separate variable before app_window is destroyed
            var connectionId = app_window.serial.connectionId;

            if (connectionId > 0) {
                setTimeout(function() {
                    chrome.serial.disconnect(connectionId, function(result) {
                        console.log('SERIAL: Connection closed - ' + result);
                    });
                }, 50);
            }
        });
    });
}

chrome.app.runtime.onLaunched.addListener(function() {
    start_app();
});

chrome.runtime.onInstalled.addListener(function(details) {
    if (details.reason == 'update') {
        var previousVersionArr = details.previousVersion.split('.'),
            currentVersionArr = chrome.runtime.getManifest().version.split('.');

        // only fire up notification sequence when one of the major version numbers changed
        if (currentVersionArr[0] > previousVersionArr[0] || currentVersionArr[1] > previousVersionArr[1]) {
            chrome.storage.local.get('update_notify', function(result) {
                if (typeof result.update_notify === 'undefined' || result.update_notify) {
                    var manifest = chrome.runtime.getManifest();
                    var options = {
                        priority: 0,
                        type: 'basic',
                        title: manifest.name,
                        message: chrome.i18n.getMessage('notifications_app_just_updated_to_version', [manifest.version]),
                        iconUrl: './images/icon_128.png',
                        buttons: [{'title': chrome.i18n.getMessage('notifications_click_here_to_start_app')}]
                    };

                    chrome.notifications.create('rapidflash_update', options, function(notificationId) {
                        // empty
                    });
                }
            });
        }
    }
});

chrome.notifications.onButtonClicked.addListener(function(notificationId, buttonIndex) {
    if (notificationId == 'rapidflash_update') {
        start_app();
    }
});