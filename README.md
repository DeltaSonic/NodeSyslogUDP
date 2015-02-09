NodeSyslogUDP
=============

>Syslog client for Node using UDP
>Heavily based on the [node-syslog](https://github.com/cloudhead/node-syslog) repo by [cloudhead](https://github.com/cloudhead).

installation
------------

    npm install syslogudp

synopsis
--------
    
    var syslog = require('syslogudp');
    var logger = syslog.createClient(514, 'localhost');

    logger.info("ping!");
    logger.log("Danger Wil Robinson!",logger.LOG_WARNING, callback)

    logger.close(); // explicitly close the socket

A call to callback sends two parameters - an error object and a string message.

log levels
----------

In increasing order of severity:

- debug
- info
- notice
- warning
- error
- crit
- alert
- emerg

These are available as methods on Client, ex: `logger.crit()`.

You may also call the `log` method, and pass the level as the 2nd argument:

    logger.log('fnord!', syslog.LOG_CRIT);

The default level is `info`.

references
----------

Aside from the repo noted above, [this node documentation](http://nodejs.org/api/dgram.html) was very helpful in getting this up and running.

