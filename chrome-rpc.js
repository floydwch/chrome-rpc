(function setupRPC(window, chrome, console, Q, _) {
  'use strict';

  var partial = function(fn) {
    return _.bind.apply(_, _.flatten([fn, undefined, _.toArray(arguments).slice(1)]));
  };

  /**
   * @namespace chrome
   */

  /**
   * Provide remote procedure call helper to chrome.
   *
   * @param {Tab|string} arguments[0] Tab, or extension's object name.
   * @param {string} [arguments[1]] Tab's object name.
   * @return {Promise} Returns a promise that will be resolved with RPC binding.
   * @example
   *
   * // RPC from tab to extension
   * // binding entension's global function
   * chrome.rpc('foo').then(function(foo){
   *   // foo as remote procedure or module
   *   // calling foo would return a promise as a result
   *   foo('bar').then(function(baz){});
   * });
   *
   * // binding entension's global module
   * chrome.rpc('foo').then(function(foo){
   *   // foo as remote procedure or module
   *   // calling foo would return a promise as a result
   *   foo.bar().then(function(baz){});
   * });
   *
   * // RPC from extension to tab
   * // binding tab's global function
   * chrome.rpc(tab, 'foo').then(function(foo){
   *   // foo as remote procedure or module
   *   // calling foo would return a promise as a result
   *   foo('bar').then(function(baz){});
   * });
   *
   * // binding tab's global module
   * chrome.rpc(tab, 'foo').then(function(foo){
   *   // foo as remote procedure or module
   *   // calling foo would return a promise as a result
   *   foo.bar().then(function(baz){});
   * });
   *
   * @todo Add sync version e.g. var foo = chrome.rpc.sync('foo');.
   * @todo Add reject handling when exception is raised.
   */
  chrome.rpc = function rpc() {

    var objName;
    var future = Q.defer();
    var resolve = function(objName, future, sendMessage, response) {

      var objType = response.objType;
      var fnNames = response.fnNames;
      var obj = {};
      var fnCall = function(fnName, objName) {

        return function() {

          var future = Q.defer();

          sendMessage({type: 'call', objName: objName, fnName: fnName, args: _.toArray(arguments)},
            _.bind(future.resolve, future));

          return future.promise;
        };
      };

      if(objType === 'function') {
        obj = fnCall(objName);
      }
      
      _.each(fnNames, function(fnName) {
        obj[fnName] = fnCall(fnName, objName);
      });

      future.resolve(obj);
    };

    switch(arguments.length) {
      // tab side
      case 1:

        objName = arguments[0];

        chrome.extension.sendMessage({type: 'get', objName: objName},
          partial(resolve, objName, future, chrome.extension.sendMessage.bind(chrome.extension)));

        return future.promise;
      // extension side
      case 2:

        objName = arguments[1];

        // TODO: serve for tabs
        // if(_.isArray(arguments[0])) {

        //   var tabs = arguments[0];
        //   var promises = [];

        //   _.each(tabs, function(tab) {

        //     var future = Q.defer();

        //     chrome.tabs.sendMessage(tab.id, {type: 'get', objName: objName},
        //       partial(resolve, future, chrome.tabs.sendMessage.bind(chrome.tabs)));

        //     promises.push(future.promise);
        //   });

        //   return promises;
        // }
        // else {

        var tab = arguments[0];

        chrome.tabs.sendMessage(tab.id, {type: 'get', objName: objName},
          partial(resolve, objName, future, chrome.tabs.sendMessage.bind(chrome.tabs)));

        return future.promise;
        // }
    }
  };

  /**
   * Sync version.
   * @memberof chrome.rpc
   * @return {[type]} [description]
   */
  // chrome.rpc.sync = function() {};

  chrome.extension.onMessage.addListener(function(msg, sender, sendResponse) {

    var obj = window[msg.objName];
    var fn = (obj ? obj : window)[msg.fnName];

    switch(msg.type) {
      case 'get':
        sendResponse({objType: typeof (obj || fn), fnNames: _.functions(obj)});
      break;
      case 'call':
        sendResponse(fn.apply(msg.objName, msg.args));
      break;
    }

    return true;
  });
}(window, chrome, console, Q, _));
