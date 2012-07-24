# Chrome Remote Procedure Call between Extension and Tab(Content Script). #

Since communication between extensions and their content scripts works by using
[message passing](http://code.google.com/chrome/extensions/messaging.html)
which is low level and complicated to control.

`chrome-rpc` enable you use rpc-mechanism to communicate between extension and tab in `promise way`.


## Example ##

    // RPC from tab to extension
    // binding entension's global function
    chrome.rpc('foo').then(function(foo){
      // foo as remote procedure or module
      // calling foo would return a promise as a result
      foo('bar').then(function(baz){});
    });

    // binding entension's global module
    chrome.rpc('foo').then(function(foo){
      // foo as remote procedure or module
      // calling foo would return a promise as a result
      foo.bar().then(function(baz){});
    });

    // RPC from extension to tab
    // binding tab's global function
    chrome.rpc(tab, 'foo').then(function(foo){
      // foo as remote procedure or module
      // calling foo would return a promise as a result
      foo('bar').then(function(baz){});
    });

    // binding tab's global module
    chrome.rpc(tab, 'foo').then(function(foo){
      // foo as remote procedure or module
      // calling foo would return a promise as a result
      foo.bar().then(function(baz){});
    });


## Dependencies ##

Requires [q](https://github.com/kriskowal/q/),
[underscore](https://github.com/documentcloud/underscore/)
(or [Lo-Dash](https://github.com/bestiejs/lodash/)'s
[mobile build](https://github.com/bestiejs/lodash/issues/54)).


## Test ##
    npm install
    npm test
