// Binary loader

function loadBinary(path, callback, handleProgress) {
    // Create new XMLHttpRequest object to request ROM info w/o reloading page
    var req = new XMLHttpRequest();
    // Open the GET request using provided path
    req.open('GET', path);
    // Force response to plaintext format
    req.overrideMimeType('text/plain; charset=x-user-defined');
    // When we get response, run the following function:
    req.onload = function () {
        // If successful
        if (this.status === 200) {
            // If response doesn't literally match HTML doctype...
            if (req.responseText.match(/^<!doctype html>/i)) {
                // ...return 404
                return callback(new Error('Page not found'));
            }
            // Otherwise, return response
            callback(null, this.responseText);
        } else if (this.status === 0) {
            // Do nothing, aborted request
        } else {
            // Return error status if other error
            callback(new Error(req.statusText));
        }
    };
    // Return error status if other error
    req.onerror = function () {
        callback(new Error(req.statusText));
    };
    // In progress, run handleProgress function passed in as argument
    req.onprogress = handleProgress;
    // Fire off the request
    req.send();
    return req;
}

export default loadBinary;