const Tail = require('tail').Tail;

module.exports = function(logpath, options) {
  this.path = logpath;
  this.logs = [];
  this.maxLine = 1000;
  this.checkLog = options.checkLog || null
  this.error = options.error || null
  this.output = options.output || null
  this.startRE = options.startRE || /^\S/

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
    if (this.checkLog && !this.checkLog(currentLog)) {
      return;
    }
    this.output && this.output(currentLog);
  }.bind(this);
}
