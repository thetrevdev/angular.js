angularService('$devConsole', function($document) {
    var devConsole = jqLite('<pre id="angularDevConsole"></pre>');
    devConsole.text('Initializing!!');
    $document[0].body.insertBefore(devConsole[0]);
    //$document[0].body.insertBefore(devConsole[0], $document[0].body.firstChild);
    return devConsole;
}, {inject: ['$document']});


angularService('$devEvalLog', function($devConsole) {
  return {
    log: function(stats){
      $devConsole.text(toJson(stats,true));
    }
  }
}, {inject: ['$devConsole']});

//angularService('$devLog', function($log) {
//  return $log;
//}, {inject: ['$log']});

//angularService('$devLog', function($devConsole) {
//
//  return {
//    log: function(message) {
//      $devConsole.append(message);
//    }
//  }
//}, {inject: ['$devConsole']});


angularService('$devEvalTimer', function($devEvalLog) {
  var lastStart, lastEnd,
    stats = {
      totalDur: 0,
      totalCount: 0,
      secDur: 0,
      secCount: 0,
      secMaxDur: 0
    };

  function evalStart() {
    lastStart = new Date().getTime();
  }

  function evalEnd() {
    lastEnd = new Date().getTime();
    var dur = lastEnd - lastStart;
    stats.totalDur += dur;
    stats.secDur += dur;
    stats.totalCount++;
    stats.secCount++;

    if (stats.secMaxDur < dur) stats.secMaxDur = dur;
  }

  function poll() {
    var logStats = {
      totalDur: stats.totalDur,
      totalCount: stats.totalCount,
      secDur: stats.secDur,
      secCount: stats.secCount,
      secMaxDur: stats.secMaxDur
    }
    $devEvalLog.log(logStats);
    stats.secDur = 0;
    stats.secCount = 0;
    stats.secMaxDur = 0;
    setTimeout(poll, 1000);
  }

  this.$onEval(PRIORITY_FIRST-1, evalStart);
  this.$onEval(PRIORITY_LAST+1, evalEnd);

  setTimeout(poll, 1000);

}, {inject: ['$devEvalLog']});