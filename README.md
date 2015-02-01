NOTE: This is still under development.

The Canon WebView Livescope Viewer Java Applet is a bit clunky and out of date. Additionally, for security reasons, modern browsers require java applets be signed (see: https://weblogs.java.net/blog/cayhorstmann/archive/2014/01/16/still-using-applets-sign-them-or-else). This is a bit cumbersome to accomplish, and many browser disable java applets by default, so I created this javascript-based client.

Because the networked camera has its own webserver, to work around the [same-origin policy](https://en.wikipedia.org/wiki/Same-origin_policy), I am using a reverse proxy (modifying [code from Yahoo](https://developer.yahoo.com/javascript/howto-proxy.html)) written in php.
