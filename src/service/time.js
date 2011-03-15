var $timeFactory;

angularServiceInject('$time', $timeFactory = function() {

  if ('now' in Date)
    return function() {
      return Date.now();
    }
  else
    return function() {
      return new Date().getTime();
    }
});
