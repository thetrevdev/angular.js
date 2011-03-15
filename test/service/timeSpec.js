describe('$time', function() {
  var $time;


  describe('real', function() {

    beforeEach(function() {
      $time = $timeFactory();
    });


    it('should return the current time', function() {
      var before = new Date().getTime(),
          now = $time(),
          after = new Date().getTime();

      expect(before <= now).toBe(true);
      expect(now <= after).toBe(true);
    });


    it('should return monotonically increasing values', function() {
      expect($time() <= $time()).toBe(true);
      expect($time() <= $time()).toBe(true);
      expect($time() <= $time()).toBe(true);
    });
  });


  describe('mock', function() {

    beforeEach(function() {
      $time = mockTimeFactory();
    });


    it('should get initialized to the current time', function() {
      var before = new Date().getTime(),
          now = $time(),
          after = new Date().getTime();

      expect(before <= now).toBe(true);
      expect(now <= after).toBe(true);
    });


    it('should allow time to be set via set', function() {
      expect($time()).not.toBe(23);
      $time.set(23);
      expect($time()).toBe(23);
    });


    it('should allow time to be incremented via add', function() {
      $time.set(1);
      expect($time()).toBe(1);

      $time.add(12345);
      expect($time()).toBe(12346)
    });
  });
});