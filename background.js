/*
    resizable: false - Keep in mind this only disables the side/corner resizing via mouse, nothing more
    maxWidth / maxHeight - is defined to prevent application reaching maximized state through window manager

    We are setting Bounds through setBounds method after window was created because on linux setting Bounds as
    window.create property seemed to fail, probably because "previous" bounds was used instead according to docs.

    bounds - Size and position of the content in the window (excluding the titlebar).
    If an id is also specified and a window with a matching id has been shown before, the remembered bounds of the window will be used instead.
*/
function start_app() {
    chrome.app.window.create('main.html', {
        id: 'main-window',
        frame: 'chrome',
        resizable: false
    }, function(main_window) {
        // set window size
        main_window.setBounds({'width': 600, 'height': 357});

        // bind events
        createdWindow.onMaximized.addListener(function() {
            createdWindow.restore();
        });

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
    }
});

chrome.notifications.onButtonClicked.addListener(function(notificationId, buttonIndex) {
});