describe('chrome.rpc', function() {

  chrome = sinon.stub(
    {
      tabs: {
        sendMessage: sinon.stub()
      },
      extension: {
        sendMessage: sinon.stub(),
        onMessage: {
          addListener: sinon.stub()
        }
      }
    });

  require("..");

  var rpc = chrome.rpc;

  describe('from tab to extension', function() {
    
    it('should return promise of rpc(fn) binding and resolve on success.', function() {

      var square = rpc({id: 0}, 'square');

      chrome.tabs.sendMessage.getCall(0).callArgWith(2, {objType: 'function', fnNames: []});

      return square.should.be.fulfilled.then(function(square) {

        var squareCall = square(3);

        chrome.tabs.sendMessage.getCall(1).callArgWith(1, 9);

        return squareCall.should.become(9);
      });
    });

    it('should return promise of rpc(mod) binding and resolve on success.', function() {

      var foo = rpc({id: 0}, 'foo');

      chrome.tabs.sendMessage.getCall(2).callArgWith(2, {objType: 'object', fnNames: ['bar']});

      return foo.should.be.fulfilled.then(function(foo) {

        var barCall = foo.bar();

        chrome.tabs.sendMessage.getCall(3).callArgWith(1, 'baz');

        return barCall.should.become('baz');
      });
    });
  });

  describe('from extension to tab', function() {

    it('should return promise of rpc(fn) binding and resolve on success.', function() {

      var square = rpc('square');

      chrome.extension.sendMessage.getCall(0).callArgWith(1, {objType: 'function', fnNames: []});

      return square.should.be.fulfilled.then(function(square) {

        var squareCall = square(3);

        chrome.extension.sendMessage.getCall(1).callArgWith(1, 9);

        return squareCall.should.become(9);
      });
    });

    it('should return promise of rpc(mod) binding and resolve on success.', function() {

      var foo = rpc('foo');

      chrome.extension.sendMessage.getCall(2).callArgWith(1, {objType: 'object', fnNames: ['bar']});

      return foo.should.be.fulfilled.then(function(foo) {

        var barCall = foo.bar();

        chrome.extension.sendMessage.getCall(3).callArgWith(1, 'baz');

        return barCall.should.become('baz');
      });
    });
  });

  window.square = function(x) {return x * x;};
  window.foo = {bar: function() {return 'baz';}};

  describe('onMessage', function() {

    var onMessage = chrome.extension.onMessage.addListener.getCall(0);
    var spy = sinon.spy();

    it('should response rpc(fn) interface.', function() {
      onMessage.args[0]({type: 'get', fnName: 'square'}, {}, spy);
      _.isEqual(spy.getCall(0).args[0], {objType: 'function', fnNames: []}).should.equal(true);
    });

    it('should response rpc(fn) result.', function() {
      onMessage.args[0]({type: 'call', fnName: 'square', 'args': [-5]}, {}, spy);
      spy.getCall(1).args[0].should.equal(25);
    });

    it('should response rpc(mod) interface.', function() {
      onMessage.args[0]({type: 'get', objName: 'foo'}, {}, spy);
      _.isEqual(spy.getCall(2).args[0], {objType: 'object', fnNames: ['bar']}).should.equal(true);
    });

    it('should response rpc(mod) result.', function() {
      onMessage.args[0]({type: 'call', objName: 'foo', fnName: 'bar'}, {}, spy);
      spy.getCall(3).args[0].should.equal('baz');
    });
  });
});
