// ==========================================
// Copyright 2013 Scott Will
// Licensed under The MIT License
// http://opensource.org/licenses/MIT
// ==========================================

;var Remoting = {
  /**
  * Return a jQuery Deferred Promise to call an Apex controller method on the server
  * Method parameters:
  *   options (required): object holding the method arguments
  *     remoteAction (Function, required):     the apex method to call on the server - <ControllerClass.methodName>
  *     args (Array, optional, []):                      array of arguments to pass to the @RemoteAction method
  *     escape (Boolean, optional, true):                  HTML escape results?
  *     suppressLoginRedirect (Boolean, optional, false):  if a 'Logged in?' error occurs, suppress redirect to login page
  *     done (Function, optional, null):                    callback for when the promise is resolved
  *     fail (Function, optional, null):                    callback for when the promise is rejected
  *     scope (scope, optional, undefined):                   scope to use for the done/fail callbacks
  *
  **/
  promise: function(options) {

    if (typeof jQuery === 'undefined' || !jQuery.Deferred) {  
      throw new Error('jQuery 1.5+ is required to use this function.');
    }

    if (typeof options !== 'object') {
      throw new Error('Invalid Options.');
    }
    else if (typeof options.remoteAction !== 'function') {
      throw new Error('Invalid @RemoteAction.');
    }
    else if (options.args && Object.prototype.toString.call( options.args ) !== '[object Array]') {
      throw new Error('Invalid Arguments Array.'); 
    }

    var $deferred = new jQuery.Deferred();
    if (typeof options.done === 'function') {
      $deferred.done(options.done);
    }
    if (typeof options.fail === 'function') {
      $deferred.fail(options.fail);
    }

    var callback = function(result, event) {
      if (event.status) {
        $deferred.resolve(result);
      }
      else {
        if (!options.suppressLoginRedirect && event.message.indexOf('Logged in?', event.message.length - 'Logged in?'.length) !== -1) {
          window.location.href = '/?startURL=' + encodeURIComponent(window.location.href.substring(window.location.origin.length));
          return;
        }
        $deferred.reject(event.message);
      }
    };

    options.args.push(callback);
    options.args.push({ escape: options.escape !== false });
    options.remoteAction.apply(options.scope, options.args || []);

    return $deferred;
  }
};
