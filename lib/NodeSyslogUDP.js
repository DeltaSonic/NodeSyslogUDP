var dgram=require('dgram');
var os = require('os');

// Message severity levels
this.LOG_EMERG = 0;
this.LOG_ALERT = 1;
this.LOG_CRIT = 2;
this.LOG_ERROR = 3;
this.LOG_WARNING = 4;
this.LOG_NOTICE = 5;
this.LOG_INFO = 6;
this.LOG_DEBUG = 7;

this.FACILITY_USER = 1;

this.DEFAULT_OPTIONS = {
    facility: exports.FACILITY_USER,
    name: null,
    debug: false
};

var hostname = os.hostname();

this.Client = function (port, host, options) {
    this.port = port || 514;
    this.host = host || 'localhost';
    this.options = options || {};

    for (var k in exports.DEFAULT_OPTIONS) {
        if (this.options[k] === undefined) { this.options[k] = exports.DEFAULT_OPTIONS[k] }
    }

    // We need to set this option here, incase the module is loaded before `process.title` is set.
    if (! this.options.name) { this.options.name = process.title || process.argv.join(' ') }

    this.socket = null;
};

this.Client.prototype = new(function () {
    var that = this;

    // Generate logging methods, such as `info`, `debug`, ...
    for (var k in exports) {
        if (/^LOG/.test(k)) {
            (function (level, name) {
                that[name] = function (msg) {
                    this.log(msg, exports[level]);
                };
            })(k, k.match(/^LOG_([A-Z]+)/)[1].toLowerCase());
        }
    }

    this.log = function (msg, severity, callback) {
    	callback = callback || function () {};

    	if(!this.socket) {
    		this.socket=dgram.createSocket('udp4', function(err) {
    			if(err) {
    				console.log('Error creating socket.');
    				console.log(err);
    				this.socket=null;
    			}
    			else {
    				this.socket.on('close',function(err){
    					console.log('Socket closing');
    					console.log(err);
    				});

    				this.socket.on('error',function(err){
    					console.log('Socket error');
    					console.log(err);
    				});
    			}
    		});
    	}

    	if(this.socket) {
        	msg = msg.trim();
        	severity = severity !== undefined ? severity : exports.LOG_INFO;

        	if (severity === exports.LOG_DEBUG && !this.options.debug) { return }


            var pri = '<' + ((this.options.faculty * 8) + severity) + '>'; // Message priority
            var entry = [
                new(Date)().toJSON(),
                hostname,
                this.options.name + '[' + process.pid + ']:',
                msg
            ].join(' ') + '\n';

            var buf=new Buffer(entry,"utf-8");

            this.socket.send(buf, 0, buf.length, this.port, this.host, function(err, bytes){
            	var emsg='';
            	if(err) {
            		emsg='error sending message';
            	}
            	else {
            		emsg=bytes+' bytes sent';
            	}
            	callback(err, emsg);
            });
        }
    };

    this.close = function(callback) {
    	if(this.socket) {
    		this.socket.close()
    	}
    }
});

this.createClient = function (port, host, options) {
    return new(this.Client)(port, host, options);
};

