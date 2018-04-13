const Tail = require('tail').Tail;
const isStartWithSpaceRE = /^\s/;

module.exports = function(logpath, options) {
  this.path = logpath;
  this.logs = [];
  this.maxLine = 1000;
  this.checkLog = options.checkLog || null
  this.error = options.error || null
  this.output = options.output || null

  let tail = new Tail(logpath);
  let prevLog = '';
  let currentLog = '';

  tail.on("line", (data) => {
    if(isStartWithSpaceRE.test(data)) {
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
