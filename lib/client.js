// Generated by CoffeeScript 1.10.0
(function() {
  'use strict';
  var Client, Connection, ssh2,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  ssh2 = require('ssh2');

  Connection = require('./connection');

  Client = (function(superClass) {
    extend(Client, superClass);

    function Client(options, logger, proxy) {
      if (options == null) {
        options = {};
      }
      this.logger = logger != null ? logger : console;
      this.proxy = proxy;
      Client.__super__.constructor.call(this, options.connectOptions);
      this.name = options.name || ~~(Math.random() * 65535);
      this.useProxy = (options.useProxy && (this.proxy != null)) || false;
      this.releasePath = options.releasePath || '.';
      this.stage = options.stage || 'development';
      this._setState('initialized');
    }

    Client.prototype.connect = function() {
      if (this.useProxy && (this.proxy != null)) {
        return this.proxy.once('ready', (function(_this) {
          return function() {
            return _this.proxy.forward(_this.options.host, _this.options.port, function(err, stream) {
              if (err != null) {
                _this._socket._state = 'failed';
                return _this._setState('error', err);
              } else {
                _this.options.sock = stream;
                return Client.__super__.connect.call(_this);
              }
            });
          };
        })(this));
      } else {
        return Client.__super__.connect.call(this);
      }
    };

    Client.prototype.getStage = function(value) {
      return this.stage;
    };

    Client.prototype.getCommand = function(task) {
      if (task.workDir != null) {
        return "cd " + task.workDir + " && " + task.command;
      } else {
        return "cd " + this.releasePath + " && " + task.command;
      }
    };

    Client.prototype.exec = function(task, next) {
      if (!(this._state === 'ready' && (this._socket != null))) {
        return next();
      }
      if (task.command == null) {
        return next();
      }
      return this._socket.exec(this.getCommand(task), {
        env: task.options,
        pty: task.pty,
        x11: task.x11
      }, (function(_this) {
        return function(err, stream) {
          var writtenTitle;
          if (err) {
            return console.log(err && next());
          }
          stream.stdout.setEncoding('utf8');
          stream.stderr.setEncoding('utf8');
          writtenTitle = false;
          stream.stdout.on('data', function(data) {
            if (!writtenTitle) {
              _this.logger.log("\u001b[32m• " + _this.name + "\u001b[39m");
              writtenTitle = true;
            }
            return _this.logger.log("\u001b[90m" + (data.trim()) + "\u001b[39m");
          });
          stream.stderr.on('data', function(data) {
            if (!writtenTitle) {
              _this.logger.log("\u001b[31m• " + _this.name + "\u001b[39m");
              writtenTitle = true;
            }
            return _this.logger.log("\u001b[90m" + (data.trim()) + "\u001b[39m");
          });
          return stream.on('close', next);
        };
      })(this));
    };

    return Client;

  })(Connection);

  module.exports = Client;

}).call(this);