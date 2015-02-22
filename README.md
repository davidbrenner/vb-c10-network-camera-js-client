The Canon WebView Livescope Viewer Java Applet is a bit clunky and out of date. Additionally, for security reasons, modern browsers require java applets be signed ([see here](https://weblogs.java.net/blog/cayhorstmann/archive/2014/01/16/still-using-applets-sign-them-or-else)). This is a bit cumbersome to accomplish, and many browser disable java applets by default, so I created this javascript-based client.

Setup
-----

Upload all the files to your webserver (via git clone or download a .zip of the files in this repository).

You will need to modify cameraURL in camera.js to point to the location of camera.php on your webserver. You will also need to modify HOSTNAME in camera.php to point to the correct URL of your networked camera. There are comments in both of these files that should help you with these modificaitons.

camera.html - contains the html for the client. Feel free to modify or copy this into your own page.

camera.js - the javascript implementation of the client

camera.php - Because the networked camera has its own webserver, to work around the [same-origin policy](https://en.wikipedia.org/wiki/Same-origin_policy), I am using a reverse proxy (slightly modifying [code from Yahoo](https://developer.yahoo.com/javascript/howto-proxy.html)) written in php.

debug.html - This file was used during development of the client. You likely won't need it.

jquery - the jquery javascript and css versions used in this client.

Author
------

This was made by [David Brenner](http://www.david-brenner.net). Please contact me or report issues if you discover any issues.
