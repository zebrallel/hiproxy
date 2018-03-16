/**
 * @file HTTP server REQUEST handler
 * @author zdying
 */
'use strict';

var proxyFlow = require('../../proxy');
var utils = require('../../../helpers/utils');

module.exports = function (req, res) {
  var hiproxy = this;
  var ctx = {
    req: req,
    res: res,
    // hiproxy: hiproxy,
    logger: this.logger
  };

  req.requestId = utils.randomId();
  req._startTime = Date.now();

  /* Emitted each time there is a request.
   * @event ProxyServer#request
   * @property {http.IncomingMessage} request request object
   * @property {http.ServerResponse} response response object
   */
  this.emit('request', req, res);

  var oldWrite = res.write;
  var oldEnd = res.end;
  var isString = false;
  var body = [];
  var collectChunk = function (chunk) {
    if (!chunk) {
      return;
    }

    if (typeof chunk === 'string') {
      isString = true;
    }

    body.push(chunk);
  };

  res.write = function (chunk, encoding) {
    collectChunk(chunk);
    /**
     * Emitted whenever the response stream received some chunk of data.
     * @event ProxyServer#data
     * @property {Buffer} data response data
     * @property {http.IncomingMessage} request request object
     * @property {http.ServerResponse} response response object
     */
    hiproxy.emit('data', chunk, req, res, ctx.proxy, encoding);
  };

  res.end = function (chunk, encoding) {
    collectChunk(chunk);
    body = isString ? body.join('') : Buffer.concat(body);

    /**
     * Emitted when a response is end. This event is emitted only once.
     * @event ProxyServer#response
     * @property {http.IncomingMessage} request request object
     * @property {http.ServerResponse} response response object
     */
    hiproxy.emit('response', req, res, ctx.proxy, encoding);

    // oldEnd会再次调用write，所以这里要还原write方法
    res.write = oldWrite;
    oldEnd.call(res, body);
  };

  proxyFlow.run(ctx, null, this);
};
