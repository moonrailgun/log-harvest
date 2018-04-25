const Tail = require('tail').Tail;
const fs = require('fs');

module.exports = function(logpath, options) {
  this.path = logpath;
  this.logs = [];
  this.maxLine = 1000;
  this.checkLog = options.checkLog || null;
  this.error = options.error || null;
  this.output = options.output || null;
  this.startRE = options.startRE || /^\S/;
  this.filter = options.filter || [];

  console.log('[log-harvest]', 'starting watch file:', logpath);
  let tail = new Tail(logpath);
  let prevLog = '';
  let currentLog = '';

  tail.on("line", (data) => {
    if(!this.startRE.test(data)) {
      // 多行日志
      currentLog += '\n' + data;
      return;
    }
    addLog(currentLog);
    currentLog = data;
  });

  tail.on("error", (error) => {
    this.error && this.error(error);
  });

  let checkFilter = function(str) {
    for (var i = 0; i < this.filter.length; i++) {
      let pattern = new RegExp(this.filter[i]);
      if(pattern.test(str)) {
        console.log('[log-harvest]', str, 'match filter `' + this.filter[i] + '`, ignore log.');
        return true;
      }
    }
    return false;
  }.bind(this);

  let addLog = function(str) {
    if(!str.trim()) {
      return;
    }

    // 增加日志
    this.logs.push(currentLog);

    // 减少日志
    if(this.logs.length >= this.maxLine) {
      this.logs.shift();
    }

    // 捕获日志
    if (this.checkLog && !this.checkLog(currentLog) || checkFilter(currentLog)) {
      return;
    }
    this.output && this.output(currentLog);
  }.bind(this);
}
