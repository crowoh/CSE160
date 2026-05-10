// modules are defined as an array
// [ module function, map of requires ]
//
// map of requires is short require name -> numeric require
//
// anything defined in a previous bundle is accessed via the
// orig method which is the require for previous bundles
parcelRequire = (function (modules, cache, entry, globalName) {
  // Save the require from previous bundle to this closure if any
  var previousRequire = typeof parcelRequire === 'function' && parcelRequire;
  var nodeRequire = typeof require === 'function' && require;

  function newRequire(name, jumped) {
    if (!cache[name]) {
      if (!modules[name]) {
        // if we cannot find the module within our internal map or
        // cache jump to the current global require ie. the last bundle
        // that was added to the page.
        var currentRequire = typeof parcelRequire === 'function' && parcelRequire;
        if (!jumped && currentRequire) {
          return currentRequire(name, true);
        }

        // If there are other bundles on this page the require from the
        // previous one is saved to 'previousRequire'. Repeat this as
        // many times as there are bundles until the module is found or
        // we exhaust the require chain.
        if (previousRequire) {
          return previousRequire(name, true);
        }

        // Try the node require function if it exists.
        if (nodeRequire && typeof name === 'string') {
          return nodeRequire(name);
        }

        var err = new Error('Cannot find module \'' + name + '\'');
        err.code = 'MODULE_NOT_FOUND';
        throw err;
      }

      localRequire.resolve = resolve;
      localRequire.cache = {};

      var module = cache[name] = new newRequire.Module(name);

      modules[name][0].call(module.exports, localRequire, module, module.exports, this);
    }

    return cache[name].exports;

    function localRequire(x){
      return newRequire(localRequire.resolve(x));
    }

    function resolve(x){
      return modules[name][1][x] || x;
    }
  }

  function Module(moduleName) {
    this.id = moduleName;
    this.bundle = newRequire;
    this.exports = {};
  }

  newRequire.isParcelRequire = true;
  newRequire.Module = Module;
  newRequire.modules = modules;
  newRequire.cache = cache;
  newRequire.parent = previousRequire;
  newRequire.register = function (id, exports) {
    modules[id] = [function (require, module) {
      module.exports = exports;
    }, {}];
  };

  var error;
  for (var i = 0; i < entry.length; i++) {
    try {
      newRequire(entry[i]);
    } catch (e) {
      // Save first error but execute all entries
      if (!error) {
        error = e;
      }
    }
  }

  if (entry.length) {
    // Expose entry point to Node, AMD or browser globals
    // Based on https://github.com/ForbesLindesay/umd/blob/master/template.js
    var mainExports = newRequire(entry[entry.length - 1]);

    // CommonJS
    if (typeof exports === "object" && typeof module !== "undefined") {
      module.exports = mainExports;

    // RequireJS
    } else if (typeof define === "function" && define.amd) {
     define(function () {
       return mainExports;
     });

    // <script>
    } else if (globalName) {
      this[globalName] = mainExports;
    }
  }

  // Override the current require with this new one
  parcelRequire = newRequire;

  if (error) {
    // throw error from earlier, _after updating parcelRequire_
    throw error;
  }

  return newRequire;
})({"node_modules/parcel-bundler/src/builtins/bundle-url.js":[function(require,module,exports) {
var bundleURL = null;
function getBundleURLCached() {
  if (!bundleURL) {
    bundleURL = getBundleURL();
  }
  return bundleURL;
}
function getBundleURL() {
  // Attempt to find the URL of the current script and use that as the base URL
  try {
    throw new Error();
  } catch (err) {
    var matches = ('' + err.stack).match(/(https?|file|ftp|chrome-extension|moz-extension):\/\/[^)\n]+/g);
    if (matches) {
      return getBaseURL(matches[0]);
    }
  }
  return '/';
}
function getBaseURL(url) {
  return ('' + url).replace(/^((?:https?|file|ftp|chrome-extension|moz-extension):\/\/.+)?\/[^/]+(?:\?.*)?$/, '$1') + '/';
}
exports.getBundleURL = getBundleURLCached;
exports.getBaseURL = getBaseURL;
},{}],"node_modules/parcel-bundler/src/builtins/css-loader.js":[function(require,module,exports) {
var bundle = require('./bundle-url');
function updateLink(link) {
  var newLink = link.cloneNode();
  newLink.onload = function () {
    link.remove();
  };
  newLink.href = link.href.split('?')[0] + '?' + Date.now();
  link.parentNode.insertBefore(newLink, link.nextSibling);
}
var cssTimeout = null;
function reloadCSS() {
  if (cssTimeout) {
    return;
  }
  cssTimeout = setTimeout(function () {
    var links = document.querySelectorAll('link[rel="stylesheet"]');
    for (var i = 0; i < links.length; i++) {
      if (bundle.getBaseURL(links[i].href) === bundle.getBundleURL()) {
        updateLink(links[i]);
      }
    }
    cssTimeout = null;
  }, 50);
}
module.exports = reloadCSS;
},{"./bundle-url":"node_modules/parcel-bundler/src/builtins/bundle-url.js"}],"src/styles.css":[function(require,module,exports) {
var reloadCSS = require('_css_loader');
module.hot.dispose(reloadCSS);
module.hot.accept(reloadCSS);
},{"_css_loader":"node_modules/parcel-bundler/src/builtins/css-loader.js"}],"lib/webgl-utils.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.redefineRequestAnimationFrame = exports.redefineCancelAnimationFrame = exports.WebGLUtils = void 0;
/*
 * Copyright 2010, Google Inc.
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are
 * met:
 *
 *     * Redistributions of source code must retain the above copyright
 * notice, this list of conditions and the following disclaimer.
 *     * Redistributions in binary form must reproduce the above
 * copyright notice, this list of conditions and the following disclaimer
 * in the documentation and/or other materials provided with the
 * distribution.
 *     * Neither the name of Google Inc. nor the names of its
 * contributors may be used to endorse or promote products derived from
 * this software without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS
 * "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT
 * LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR
 * A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT
 * OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,
 * SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
 * LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
 * DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY
 * THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
 * OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */

/**
 * @fileoverview This file contains functions every webgl program will need
 * a version of one way or another.
 *
 * Instead of setting up a context manually it is recommended to
 * use. This will check for success or failure. On failure it
 * will attempt to present an approriate message to the user.
 *
 *       gl = WebGLUtils.setupWebGL(canvas);
 *
 * For animated WebGL apps use of setTimeout or setInterval are
 * discouraged. It is recommended you structure your rendering
 * loop like this.
 *
 *       function render() {
 *         window.requestAnimationFrame(render, canvas);
 *
 *         // do rendering
 *         ...
 *       }
 *       render();
 *
 * This will call your rendering function up to the refresh rate
 * of your display but will stop rendering if your app is not
 * visible.
 */

var WebGLUtils = exports.WebGLUtils = function () {
  /**
   * Creates the HTLM for a failure message
   * @param {string} canvasContainerId id of container of th
   *        canvas.
   * @return {string} The html.
   */
  var makeFailHTML = function (msg) {
    return '' + '<div style="margin: auto; width:500px;z-index:10000;margin-top:20em;text-align:center;">' + msg + '</div>';
    return '' + '<table style="background-color: #8CE; width: 100%; height: 100%;"><tr>' + '<td align="center">' + '<div style="display: table-cell; vertical-align: middle;">' + '<div style="">' + msg + '</div>' + '</div>' + '</td></tr></table>';
  };

  /**
   * Mesasge for getting a webgl browser
   * @type {string}
   */
  var GET_A_WEBGL_BROWSER = '' + 'This page requires a browser that supports WebGL.<br/>' + '<a href="http://get.webgl.org">Click here to upgrade your browser.</a>';

  /**
   * Mesasge for need better hardware
   * @type {string}
   */
  var OTHER_PROBLEM = '' + "It doesn't appear your computer can support WebGL.<br/>" + '<a href="http://get.webgl.org">Click here for more information.</a>';

  /**
   * Creates a webgl context. If creation fails it will
   * change the contents of the container of the <canvas>
   * tag to an error message with the correct links for WebGL.
   * @param {Element} canvas. The canvas element to create a
   *     context from.
   * @param {WebGLContextCreationAttirbutes} opt_attribs Any
   *     creation attributes you want to pass in.
   * @param {function:(msg)} opt_onError An function to call
   *     if there is an error during creation.
   * @return {WebGLRenderingContext} The created context.
   */
  const setupWebGL = (canvas, opt_attribs, opt_onError) => {
    function handleCreationError(msg) {
      var container = document.getElementsByTagName('body')[0];
      //var container = canvas.parentNode;
      if (container) {
        var str = window.WebGLRenderingContext ? OTHER_PROBLEM : GET_A_WEBGL_BROWSER;
        if (msg) {
          str += '<br/><br/>Status: ' + msg;
        }
        container.innerHTML = makeFailHTML(str);
      }
    }
    opt_onError = opt_onError || handleCreationError;
    if (canvas.addEventListener) {
      canvas.addEventListener('webglcontextcreationerror', function (event) {
        opt_onError(event.statusMessage);
      }, false);
    }
    var context = create3DContext(canvas, opt_attribs);
    if (!context) {
      if (!window.WebGLRenderingContext) {
        opt_onError('');
      } else {
        opt_onError('');
      }
    }
    return context;
  };

  /**
   * Creates a webgl context.
   * @param {!Canvas} canvas The canvas tag to get context
   *     from. If one is not passed in one will be created.
   * @return {!WebGLContext} The created context.
   */
  var create3DContext = function (canvas, opt_attribs) {
    var names = ['webgl', 'experimental-webgl', 'webkit-3d', 'moz-webgl'];
    var context = null;
    for (var ii = 0; ii < names.length; ++ii) {
      try {
        context = canvas.getContext(names[ii], opt_attribs);
      } catch (e) {}
      if (context) {
        break;
      }
    }
    return context;
  };
  return {
    create3DContext: create3DContext,
    setupWebGL: setupWebGL
  };
}();

/**
 * Provides requestAnimationFrame in a cross browser
 * way.
 */
const redefineRequestAnimationFrame = () => {
  if (!window.requestAnimationFrame) {
    window.requestAnimationFrame = function () {
      return window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.oRequestAnimationFrame || window.msRequestAnimationFrame || function (/* function FrameRequestCallback */callback, /* DOMElement Element */element) {
        window.setTimeout(callback, 1000 / 60);
      };
    }();
  }
};

/** * ERRATA: 'cancelRequestAnimationFrame' renamed to 'cancelAnimationFrame' to reflect an update to the W3C Animation-Timing Spec.
 *
 * Cancels an animation frame request.
 * Checks for cross-browser support, falls back to clearTimeout.
 * @param {number}  Animation frame request. */
exports.redefineRequestAnimationFrame = redefineRequestAnimationFrame;
const redefineCancelAnimationFrame = () => {
  if (!window.cancelAnimationFrame) {
    window.cancelAnimationFrame = window.cancelRequestAnimationFrame || window.webkitCancelAnimationFrame || window.webkitCancelRequestAnimationFrame || window.mozCancelAnimationFrame || window.mozCancelRequestAnimationFrame || window.msCancelAnimationFrame || window.msCancelRequestAnimationFrame || window.oCancelAnimationFrame || window.oCancelRequestAnimationFrame || window.clearTimeout;
  }
};
exports.redefineCancelAnimationFrame = redefineCancelAnimationFrame;
},{}],"lib/webgl-debug.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.WebGLDebugUtils = void 0;
//Copyright (c) 2009 The Chromium Authors. All rights reserved.
//Use of this source code is governed by a BSD-style license that can be
//found in the LICENSE file.

// Various functions for helping debug WebGL apps.

var WebGLDebugUtils = exports.WebGLDebugUtils = function () {
  /**
   * Wrapped logging function.
   * @param {string} msg Message to log.
   */
  var log = function (msg) {
    if (window.console && window.console.log) {
      window.console.log(msg);
    }
  };

  /**
   * Which arguements are enums.
   * @type {!Object.<number, string>}
   */
  var glValidEnumContexts = {
    // Generic setters and getters

    enable: {
      0: true
    },
    disable: {
      0: true
    },
    getParameter: {
      0: true
    },
    // Rendering

    drawArrays: {
      0: true
    },
    drawElements: {
      0: true,
      2: true
    },
    // Shaders

    createShader: {
      0: true
    },
    getShaderParameter: {
      1: true
    },
    getProgramParameter: {
      1: true
    },
    // Vertex attributes

    getVertexAttrib: {
      1: true
    },
    vertexAttribPointer: {
      2: true
    },
    // Textures

    bindTexture: {
      0: true
    },
    activeTexture: {
      0: true
    },
    getTexParameter: {
      0: true,
      1: true
    },
    texParameterf: {
      0: true,
      1: true
    },
    texParameteri: {
      0: true,
      1: true,
      2: true
    },
    texImage2D: {
      0: true,
      2: true,
      6: true,
      7: true
    },
    texSubImage2D: {
      0: true,
      6: true,
      7: true
    },
    copyTexImage2D: {
      0: true,
      2: true
    },
    copyTexSubImage2D: {
      0: true
    },
    generateMipmap: {
      0: true
    },
    // Buffer objects

    bindBuffer: {
      0: true
    },
    bufferData: {
      0: true,
      2: true
    },
    bufferSubData: {
      0: true
    },
    getBufferParameter: {
      0: true,
      1: true
    },
    // Renderbuffers and framebuffers

    pixelStorei: {
      0: true,
      1: true
    },
    readPixels: {
      4: true,
      5: true
    },
    bindRenderbuffer: {
      0: true
    },
    bindFramebuffer: {
      0: true
    },
    checkFramebufferStatus: {
      0: true
    },
    framebufferRenderbuffer: {
      0: true,
      1: true,
      2: true
    },
    framebufferTexture2D: {
      0: true,
      1: true,
      2: true
    },
    getFramebufferAttachmentParameter: {
      0: true,
      1: true,
      2: true
    },
    getRenderbufferParameter: {
      0: true,
      1: true
    },
    renderbufferStorage: {
      0: true,
      1: true
    },
    // Frame buffer operations (clear, blend, depth test, stencil)

    clear: {
      0: true
    },
    depthFunc: {
      0: true
    },
    blendFunc: {
      0: true,
      1: true
    },
    blendFuncSeparate: {
      0: true,
      1: true,
      2: true,
      3: true
    },
    blendEquation: {
      0: true
    },
    blendEquationSeparate: {
      0: true,
      1: true
    },
    stencilFunc: {
      0: true
    },
    stencilFuncSeparate: {
      0: true,
      1: true
    },
    stencilMaskSeparate: {
      0: true
    },
    stencilOp: {
      0: true,
      1: true,
      2: true
    },
    stencilOpSeparate: {
      0: true,
      1: true,
      2: true,
      3: true
    },
    // Culling

    cullFace: {
      0: true
    },
    frontFace: {
      0: true
    }
  };

  /**
   * Map of numbers to names.
   * @type {Object}
   */
  var glEnums = null;

  /**
   * Initializes this module. Safe to call more than once.
   * @param {!WebGLRenderingContext} ctx A WebGL context. If
   *    you have more than one context it doesn't matter which one
   *    you pass in, it is only used to pull out constants.
   */
  function init(ctx) {
    if (glEnums == null) {
      glEnums = {};
      for (var propertyName in ctx) {
        if (typeof ctx[propertyName] == 'number') {
          glEnums[ctx[propertyName]] = propertyName;
        }
      }
    }
  }

  /**
   * Checks the utils have been initialized.
   */
  function checkInit() {
    if (glEnums == null) {
      throw 'WebGLDebugUtils.init(ctx) not called';
    }
  }

  /**
   * Returns true or false if value matches any WebGL enum
   * @param {*} value Value to check if it might be an enum.
   * @return {boolean} True if value matches one of the WebGL defined enums
   */
  function mightBeEnum(value) {
    checkInit();
    return glEnums[value] !== undefined;
  }

  /**
   * Gets an string version of an WebGL enum.
   *
   * Example:
   *   var str = WebGLDebugUtil.glEnumToString(ctx.getError());
   *
   * @param {number} value Value to return an enum for
   * @return {string} The string version of the enum.
   */
  function glEnumToString(value) {
    checkInit();
    var name = glEnums[value];
    return name !== undefined ? name : '*UNKNOWN WebGL ENUM (0x' + value.toString(16) + ')';
  }

  /**
   * Returns the string version of a WebGL argument.
   * Attempts to convert enum arguments to strings.
   * @param {string} functionName the name of the WebGL function.
   * @param {number} argumentIndx the index of the argument.
   * @param {*} value The value of the argument.
   * @return {string} The value as a string.
   */
  function glFunctionArgToString(functionName, argumentIndex, value) {
    var funcInfo = glValidEnumContexts[functionName];
    if (funcInfo !== undefined) {
      if (funcInfo[argumentIndex]) {
        return glEnumToString(value);
      }
    }
    return value.toString();
  }

  /**
   * Given a WebGL context returns a wrapped context that calls
   * gl.getError after every command and calls a function if the
   * result is not gl.NO_ERROR.
   *
   * @param {!WebGLRenderingContext} ctx The webgl context to
   *        wrap.
   * @param {!function(err, funcName, args): void} opt_onErrorFunc
   *        The function to call when gl.getError returns an
   *        error. If not specified the default function calls
   *        console.log with a message.
   */
  function makeDebugContext(ctx, opt_onErrorFunc) {
    init(ctx);
    opt_onErrorFunc = opt_onErrorFunc || function (err, functionName, args) {
      // apparently we can't do args.join(",");
      var argStr = '';
      for (var ii = 0; ii < args.length; ++ii) {
        argStr += (ii == 0 ? '' : ', ') + glFunctionArgToString(functionName, ii, args[ii]);
      }
      log('WebGL error ' + glEnumToString(err) + ' in ' + functionName + '(' + argStr + ')');
    };

    // Holds booleans for each GL error so after we get the error ourselves
    // we can still return it to the client app.
    var glErrorShadow = {};

    // Makes a function that calls a WebGL function and then calls getError.
    function makeErrorWrapper(ctx, functionName) {
      return function () {
        var result = ctx[functionName].apply(ctx, arguments);
        var err = ctx.getError();
        if (err != 0) {
          glErrorShadow[err] = true;
          opt_onErrorFunc(err, functionName, arguments);
        }
        return result;
      };
    }

    // Make a an object that has a copy of every property of the WebGL context
    // but wraps all functions.
    var wrapper = {};
    for (var propertyName in ctx) {
      if (typeof ctx[propertyName] == 'function') {
        wrapper[propertyName] = makeErrorWrapper(ctx, propertyName);
      } else {
        wrapper[propertyName] = ctx[propertyName];
      }
    }

    // Override the getError function with one that returns our saved results.
    wrapper.getError = function () {
      for (var err in glErrorShadow) {
        if (glErrorShadow[err]) {
          glErrorShadow[err] = false;
          return err;
        }
      }
      return ctx.NO_ERROR;
    };
    return wrapper;
  }
  function resetToInitialState(ctx) {
    var numAttribs = ctx.getParameter(ctx.MAX_VERTEX_ATTRIBS);
    var tmp = ctx.createBuffer();
    ctx.bindBuffer(ctx.ARRAY_BUFFER, tmp);
    for (var ii = 0; ii < numAttribs; ++ii) {
      ctx.disableVertexAttribArray(ii);
      ctx.vertexAttribPointer(ii, 4, ctx.FLOAT, false, 0, 0);
      ctx.vertexAttrib1f(ii, 0);
    }
    ctx.deleteBuffer(tmp);
    var numTextureUnits = ctx.getParameter(ctx.MAX_TEXTURE_IMAGE_UNITS);
    for (var ii = 0; ii < numTextureUnits; ++ii) {
      ctx.activeTexture(ctx.TEXTURE0 + ii);
      ctx.bindTexture(ctx.TEXTURE_CUBE_MAP, null);
      ctx.bindTexture(ctx.TEXTURE_2D, null);
    }
    ctx.activeTexture(ctx.TEXTURE0);
    ctx.useProgram(null);
    ctx.bindBuffer(ctx.ARRAY_BUFFER, null);
    ctx.bindBuffer(ctx.ELEMENT_ARRAY_BUFFER, null);
    ctx.bindFramebuffer(ctx.FRAMEBUFFER, null);
    ctx.bindRenderbuffer(ctx.RENDERBUFFER, null);
    ctx.disable(ctx.BLEND);
    ctx.disable(ctx.CULL_FACE);
    ctx.disable(ctx.DEPTH_TEST);
    ctx.disable(ctx.DITHER);
    ctx.disable(ctx.SCISSOR_TEST);
    ctx.blendColor(0, 0, 0, 0);
    ctx.blendEquation(ctx.FUNC_ADD);
    ctx.blendFunc(ctx.ONE, ctx.ZERO);
    ctx.clearColor(0, 0, 0, 0);
    ctx.clearDepth(1);
    ctx.clearStencil(-1);
    ctx.colorMask(true, true, true, true);
    ctx.cullFace(ctx.BACK);
    ctx.depthFunc(ctx.LESS);
    ctx.depthMask(true);
    ctx.depthRange(0, 1);
    ctx.frontFace(ctx.CCW);
    ctx.hint(ctx.GENERATE_MIPMAP_HINT, ctx.DONT_CARE);
    ctx.lineWidth(1);
    ctx.pixelStorei(ctx.PACK_ALIGNMENT, 4);
    ctx.pixelStorei(ctx.UNPACK_ALIGNMENT, 4);
    ctx.pixelStorei(ctx.UNPACK_FLIP_Y_WEBGL, false);
    ctx.pixelStorei(ctx.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false);
    // TODO: Delete this IF.
    if (ctx.UNPACK_COLORSPACE_CONVERSION_WEBGL) {
      ctx.pixelStorei(ctx.UNPACK_COLORSPACE_CONVERSION_WEBGL, ctx.BROWSER_DEFAULT_WEBGL);
    }
    ctx.polygonOffset(0, 0);
    ctx.sampleCoverage(1, false);
    ctx.scissor(0, 0, ctx.canvas.width, ctx.canvas.height);
    ctx.stencilFunc(ctx.ALWAYS, 0, 0xffffffff);
    ctx.stencilMask(0xffffffff);
    ctx.stencilOp(ctx.KEEP, ctx.KEEP, ctx.KEEP);
    ctx.viewport(0, 0, ctx.canvas.clientWidth, ctx.canvas.clientHeight);
    ctx.clear(ctx.COLOR_BUFFER_BIT | ctx.DEPTH_BUFFER_BIT | ctx.STENCIL_BUFFER_BIT);

    // TODO: This should NOT be needed but Firefox fails with 'hint'
    while (ctx.getError());
  }
  function makeLostContextSimulatingContext(ctx) {
    var wrapper_ = {};
    var contextId_ = 1;
    var contextLost_ = false;
    var resourceId_ = 0;
    var resourceDb_ = [];
    var onLost_ = undefined;
    var onRestored_ = undefined;
    var nextOnRestored_ = undefined;

    // Holds booleans for each GL error so can simulate errors.
    var glErrorShadow_ = {};
    function isWebGLObject(obj) {
      //return false;
      return obj instanceof WebGLBuffer || obj instanceof WebGLFramebuffer || obj instanceof WebGLProgram || obj instanceof WebGLRenderbuffer || obj instanceof WebGLShader || obj instanceof WebGLTexture;
    }
    function checkResources(args) {
      for (var ii = 0; ii < args.length; ++ii) {
        var arg = args[ii];
        if (isWebGLObject(arg)) {
          return arg.__webglDebugContextLostId__ == contextId_;
        }
      }
      return true;
    }
    function clearErrors() {
      var k = Object.keys(glErrorShadow_);
      for (var ii = 0; ii < k.length; ++ii) {
        delete glErrorShdow_[k];
      }
    }

    // Makes a function that simulates WebGL when out of context.
    function makeLostContextWrapper(ctx, functionName) {
      var f = ctx[functionName];
      return function () {
        // Only call the functions if the context is not lost.
        if (!contextLost_) {
          if (!checkResources(arguments)) {
            glErrorShadow_[ctx.INVALID_OPERATION] = true;
            return;
          }
          var result = f.apply(ctx, arguments);
          return result;
        }
      };
    }
    for (var propertyName in ctx) {
      if (typeof ctx[propertyName] == 'function') {
        wrapper_[propertyName] = makeLostContextWrapper(ctx, propertyName);
      } else {
        wrapper_[propertyName] = ctx[propertyName];
      }
    }
    function makeWebGLContextEvent(statusMessage) {
      return {
        statusMessage: statusMessage
      };
    }
    function freeResources() {
      for (var ii = 0; ii < resourceDb_.length; ++ii) {
        var resource = resourceDb_[ii];
        if (resource instanceof WebGLBuffer) {
          ctx.deleteBuffer(resource);
        } else if (resource instanceof WebctxFramebuffer) {
          ctx.deleteFramebuffer(resource);
        } else if (resource instanceof WebctxProgram) {
          ctx.deleteProgram(resource);
        } else if (resource instanceof WebctxRenderbuffer) {
          ctx.deleteRenderbuffer(resource);
        } else if (resource instanceof WebctxShader) {
          ctx.deleteShader(resource);
        } else if (resource instanceof WebctxTexture) {
          ctx.deleteTexture(resource);
        }
      }
    }
    wrapper_.loseContext = function () {
      if (!contextLost_) {
        contextLost_ = true;
        ++contextId_;
        while (ctx.getError());
        clearErrors();
        glErrorShadow_[ctx.CONTEXT_LOST_WEBGL] = true;
        setTimeout(function () {
          if (onLost_) {
            onLost_(makeWebGLContextEvent('context lost'));
          }
        }, 0);
      }
    };
    wrapper_.restoreContext = function () {
      if (contextLost_) {
        if (onRestored_) {
          setTimeout(function () {
            freeResources();
            resetToInitialState(ctx);
            contextLost_ = false;
            if (onRestored_) {
              var callback = onRestored_;
              onRestored_ = nextOnRestored_;
              nextOnRestored_ = undefined;
              callback(makeWebGLContextEvent('context restored'));
            }
          }, 0);
        } else {
          throw 'You can not restore the context without a listener';
        }
      }
    };

    // Wrap a few functions specially.
    wrapper_.getError = function () {
      if (!contextLost_) {
        var err;
        while (err = ctx.getError()) {
          glErrorShadow_[err] = true;
        }
      }
      for (var err in glErrorShadow_) {
        if (glErrorShadow_[err]) {
          delete glErrorShadow_[err];
          return err;
        }
      }
      return ctx.NO_ERROR;
    };
    var creationFunctions = ['createBuffer', 'createFramebuffer', 'createProgram', 'createRenderbuffer', 'createShader', 'createTexture'];
    for (var ii = 0; ii < creationFunctions.length; ++ii) {
      var functionName = creationFunctions[ii];
      wrapper_[functionName] = function (f) {
        return function () {
          if (contextLost_) {
            return null;
          }
          var obj = f.apply(ctx, arguments);
          obj.__webglDebugContextLostId__ = contextId_;
          resourceDb_.push(obj);
          return obj;
        };
      }(ctx[functionName]);
    }
    var functionsThatShouldReturnNull = ['getActiveAttrib', 'getActiveUniform', 'getBufferParameter', 'getContextAttributes', 'getAttachedShaders', 'getFramebufferAttachmentParameter', 'getParameter', 'getProgramParameter', 'getProgramInfoLog', 'getRenderbufferParameter', 'getShaderParameter', 'getShaderInfoLog', 'getShaderSource', 'getTexParameter', 'getUniform', 'getUniformLocation', 'getVertexAttrib'];
    for (var ii = 0; ii < functionsThatShouldReturnNull.length; ++ii) {
      var functionName = functionsThatShouldReturnNull[ii];
      wrapper_[functionName] = function (f) {
        return function () {
          if (contextLost_) {
            return null;
          }
          return f.apply(ctx, arguments);
        };
      }(wrapper_[functionName]);
    }
    var isFunctions = ['isBuffer', 'isEnabled', 'isFramebuffer', 'isProgram', 'isRenderbuffer', 'isShader', 'isTexture'];
    for (var ii = 0; ii < isFunctions.length; ++ii) {
      var functionName = isFunctions[ii];
      wrapper_[functionName] = function (f) {
        return function () {
          if (contextLost_) {
            return false;
          }
          return f.apply(ctx, arguments);
        };
      }(wrapper_[functionName]);
    }
    wrapper_.checkFramebufferStatus = function (f) {
      return function () {
        if (contextLost_) {
          return ctx.FRAMEBUFFER_UNSUPPORTED;
        }
        return f.apply(ctx, arguments);
      };
    }(wrapper_.checkFramebufferStatus);
    wrapper_.getAttribLocation = function (f) {
      return function () {
        if (contextLost_) {
          return -1;
        }
        return f.apply(ctx, arguments);
      };
    }(wrapper_.getAttribLocation);
    wrapper_.getVertexAttribOffset = function (f) {
      return function () {
        if (contextLost_) {
          return 0;
        }
        return f.apply(ctx, arguments);
      };
    }(wrapper_.getVertexAttribOffset);
    wrapper_.isContextLost = function () {
      return contextLost_;
    };
    function wrapEvent(listener) {
      if (typeof listener == 'function') {
        return listener;
      } else {
        return function (info) {
          listener.handleEvent(info);
        };
      }
    }
    wrapper_.registerOnContextLostListener = function (listener) {
      onLost_ = wrapEvent(listener);
    };
    wrapper_.registerOnContextRestoredListener = function (listener) {
      if (contextLost_) {
        nextOnRestored_ = wrapEvent(listener);
      } else {
        onRestored_ = wrapEvent(listener);
      }
    };
    return wrapper_;
  }
  return {
    /**
     * Initializes this module. Safe to call more than once.
     * @param {!WebGLRenderingContext} ctx A WebGL context. If
     *    you have more than one context it doesn't matter which one
     *    you pass in, it is only used to pull out constants.
     */
    init: init,
    /**
     * Returns true or false if value matches any WebGL enum
     * @param {*} value Value to check if it might be an enum.
     * @return {boolean} True if value matches one of the WebGL defined enums
     */
    mightBeEnum: mightBeEnum,
    /**
     * Gets an string version of an WebGL enum.
     *
     * Example:
     *   WebGLDebugUtil.init(ctx);
     *   var str = WebGLDebugUtil.glEnumToString(ctx.getError());
     *
     * @param {number} value Value to return an enum for
     * @return {string} The string version of the enum.
     */
    glEnumToString: glEnumToString,
    /**
     * Converts the argument of a WebGL function to a string.
     * Attempts to convert enum arguments to strings.
     *
     * Example:
     *   WebGLDebugUtil.init(ctx);
     *   var str = WebGLDebugUtil.glFunctionArgToString('bindTexture', 0, gl.TEXTURE_2D);
     *
     * would return 'TEXTURE_2D'
     *
     * @param {string} functionName the name of the WebGL function.
     * @param {number} argumentIndx the index of the argument.
     * @param {*} value The value of the argument.
     * @return {string} The value as a string.
     */
    glFunctionArgToString: glFunctionArgToString,
    /**
     * Given a WebGL context returns a wrapped context that calls
     * gl.getError after every command and calls a function if the
     * result is not NO_ERROR.
     *
     * You can supply your own function if you want. For example, if you'd like
     * an exception thrown on any GL error you could do this
     *
     *    function throwOnGLError(err, funcName, args) {
     *      throw WebGLDebugUtils.glEnumToString(err) + " was caused by call to" +
     *            funcName;
     *    };
     *
     *    ctx = WebGLDebugUtils.makeDebugContext(
     *        canvas.getContext("webgl"), throwOnGLError);
     *
     * @param {!WebGLRenderingContext} ctx The webgl context to wrap.
     * @param {!function(err, funcName, args): void} opt_onErrorFunc The function
     *     to call when gl.getError returns an error. If not specified the default
     *     function calls console.log with a message.
     */
    makeDebugContext: makeDebugContext,
    /**
     * Given a WebGL context returns a wrapped context that adds 4
     * functions.
     *
     * ctx.loseContext:
     *   simulates a lost context event.
     *
     * ctx.restoreContext:
     *   simulates the context being restored.
     *
     * ctx.registerOnContextLostListener(listener):
     *   lets you register a listener for context lost. Use instead
     *   of addEventListener('webglcontextlostevent', listener);
     *
     * ctx.registerOnContextRestoredListener(listener):
     *   lets you register a listener for context restored. Use
     *   instead of addEventListener('webglcontextrestored',
     *   listener);
     *
     * @param {!WebGLRenderingContext} ctx The webgl context to wrap.
     */
    makeLostContextSimulatingContext: makeLostContextSimulatingContext,
    /**
     * Resets a context to the initial state.
     * @param {!WebGLRenderingContext} ctx The webgl context to
     *     reset.
     */
    resetToInitialState: resetToInitialState
  };
}();
},{}],"lib/cuon-utils.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.createProgram = createProgram;
exports.getWebGLContext = getWebGLContext;
exports.initShaders = initShaders;
exports.loadShader = loadShader;
var _webglUtils = require("./webgl-utils");
var _webglDebug = require("./webgl-debug");
// cuon-utils.js (c) 2012 kanda and matsuda
/**
 * Create a program object and make current
 * @param gl GL context
 * @param vshader a vertex shader program (string)
 * @param fshader a fragment shader program (string)
 * @return true, if the program object was created and successfully made current
 */
function initShaders(gl, vshader, fshader) {
  var program = createProgram(gl, vshader, fshader);
  if (!program) {
    console.log('Failed to create program');
    return false;
  }
  gl.useProgram(program);
  gl.program = program;
  return true;
}

/**
 * Create the linked program object
 * @param gl GL context
 * @param vshader a vertex shader program (string)
 * @param fshader a fragment shader program (string)
 * @return created program object, or null if the creation has failed
 */
function createProgram(gl, vshader, fshader) {
  // Create shader object
  var vertexShader = loadShader(gl, gl.VERTEX_SHADER, vshader);
  var fragmentShader = loadShader(gl, gl.FRAGMENT_SHADER, fshader);
  if (!vertexShader || !fragmentShader) {
    return null;
  }

  // Create a program object
  var program = gl.createProgram();
  if (!program) {
    return null;
  }

  // Attach the shader objects
  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);

  // Link the program object
  gl.linkProgram(program);

  // Check the result of linking
  var linked = gl.getProgramParameter(program, gl.LINK_STATUS);
  if (!linked) {
    var error = gl.getProgramInfoLog(program);
    console.log('Failed to link program: ' + error);
    gl.deleteProgram(program);
    gl.deleteShader(fragmentShader);
    gl.deleteShader(vertexShader);
    return null;
  }
  return program;
}

/**
 * Create a shader object
 * @param gl GL context
 * @param type the type of the shader object to be created
 * @param source shader program (string)
 * @return created shader object, or null if the creation has failed.
 */
function loadShader(gl, type, source) {
  // Create shader object
  var shader = gl.createShader(type);
  if (shader == null) {
    console.log('unable to create shader');
    return null;
  }

  // Set the shader program
  gl.shaderSource(shader, source);

  // Compile the shader
  gl.compileShader(shader);

  // Check the result of compilation
  var compiled = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
  if (!compiled) {
    var error = gl.getShaderInfoLog(shader);
    console.log('Failed to compile shader: ' + error);
    gl.deleteShader(shader);
    return null;
  }
  return shader;
}

/**
 * Initialize and get the rendering for WebGL
 * @param canvas <cavnas> element
 * @param opt_debug flag to initialize the context for debugging
 * @return the rendering context for WebGL
 */
function getWebGLContext(canvas, opt_debug) {
  // Get the rendering context for WebGL
  var gl = _webglUtils.WebGLUtils.setupWebGL(canvas);
  if (!gl) return null;

  // if opt_debug is explicitly false, create the context for debugging
  if (arguments.length < 2 || opt_debug) {
    gl = _webglDebug.WebGLDebugUtils.makeDebugContext(gl);
  }
  return gl;
}
},{"./webgl-utils":"lib/webgl-utils.js","./webgl-debug":"lib/webgl-debug.js"}],"lib/cuon-matrix-cse160.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Vector4 = exports.Vector3 = exports.Matrix4 = void 0;
/* eslint-disable no-throw-literal */

// cuon-matrix.js (c) 2012 kanda and matsuda
/**
 * This is a class treating 4x4 matrix.
 * This class contains the function that is equivalent to OpenGL matrix stack.
 * The matrix after conversion is calculated by multiplying a conversion matrix from the right.
 * The matrix is replaced by the calculated result.
 */

class Vector3 {
  constructor(opt_src) {
    var v = new Float32Array(3);
    if (opt_src && typeof opt_src === "object") {
      v[0] = opt_src[0];
      v[1] = opt_src[1];
      v[2] = opt_src[2];
    }
    this.elements = v;
  }

  /**
   * Copy vector.
   * @param src source vector
   * @return this
   */
  set(src) {
    var i, s, d;
    s = src.elements;
    d = this.elements;
    if (s === d) {
      return;
    }
    for (i = 0; i < 3; ++i) {
      d[i] = s[i];
    }
    return this;
  }

  /**
   * Add other to this vector.
   * @return this
   */
  add(other) {
    for (var i = 0; i < 3; i++) {
      this.elements[i] += other.elements[i];
    }

    // Don't delete the return statement.
    return this;
  }

  /**
   * Subtract other from this vector.
   * @return this
   */
  sub(other) {
    for (var i = 0; i < 3; i++) {
      this.elements[i] -= other.elements[i];
    }

    // Don't delete the return statement.
    return this;
  }

  /**
   * Divide this vector by a scalar.
   * @return this
   */
  div(scalar) {
    for (var i = 0; i < 3; i++) {
      this.elements[i] /= scalar;
    }

    // Don't delete the return statement.
    return this;
  }

  /**
   * Multiply this vector by a scalar.
   * @return this
   */
  mul(scalar) {
    for (var i = 0; i < 3; i++) {
      this.elements[i] *= scalar;
    }

    // Don't delete the return statement.
    return this;
  }

  /**
   * Calcualte the dop product between this vector and other.
   * @return scalar
   */
  static dot(other1, other2) {
    let d = 0;
    for (var i = 0; i < 3; i++) {
      d += other1.elements[i] * other2.elements[i];
    }

    // Don't delete the return statement.
    return d;
  }

  /**
   * Calcualte the cross product between this vector and other.
   * @return new vector
   */
  static cross(other1, other2) {
    let a = other1.elements;
    let b = other2.elements;
    let i = a[1] * b[2] - a[2] * b[1];
    let j = -1 * (a[0] * b[2] - a[2] * b[0]);
    let k = a[0] * b[1] - a[1] * b[0];
    let v3 = new Vector3([i, j, k]); // Modify this line to calculate cross product between other1 and other2.

    // Don't delete the return statement.
    return v3;
  }

  /**
   * Calculate the magnitude (or length) of this vector.
   * @return scalar
   */
  magnitude() {
    // Insert your code here.
    let m = 0; // Modify this line to calculate this vector's magnitude.

    for (var i = 0; i < 3; i++) {
      m += this.elements[i] * this.elements[i];
    }
    m = Math.sqrt(m);

    // Don't delete the return statement.
    return m;
  }

  /**
   * Normalize this vector.
   * @return this
   */
  normalize() {
    this.div(this.magnitude());

    // Don't delete the return statement.
    return this;
  }
}
exports.Vector3 = Vector3;
class Vector4 {
  /**
   * Constructor of Vector4
   * If opt_src is specified, new vector is initialized by opt_src.
   * @param opt_src source vector(option)
   */
  constructor(opt_src) {
    var v = new Float32Array(4);
    if (opt_src && typeof opt_src === "object") {
      v[0] = opt_src[0];
      v[1] = opt_src[1];
      v[2] = opt_src[2];
      v[3] = opt_src[3];
    }
    this.elements = v;
  }
}
exports.Vector4 = Vector4;
class Matrix4 {
  /**
   * Constructor of Matrix4
   * If opt_src is specified, new matrix is initialized by opt_src.
   * Otherwise, new matrix is initialized by identity matrix.
   * @param opt_src source matrix(option)
   */
  constructor(opt_src) {
    var i, s, d;
    if (opt_src && typeof opt_src === "object" && opt_src.hasOwnProperty("elements")) {
      s = opt_src.elements;
      d = new Float32Array(16);
      for (i = 0; i < 16; ++i) {
        d[i] = s[i];
      }
      this.elements = d;
    } else {
      this.elements = new Float32Array([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]);
    }
  }

  /**
   * Set the identity matrix.
   * @return this
   */
  setIdentity() {
    var e = this.elements;
    e[0] = 1;
    e[4] = 0;
    e[8] = 0;
    e[12] = 0;
    e[1] = 0;
    e[5] = 1;
    e[9] = 0;
    e[13] = 0;
    e[2] = 0;
    e[6] = 0;
    e[10] = 1;
    e[14] = 0;
    e[3] = 0;
    e[7] = 0;
    e[11] = 0;
    e[15] = 1;
    return this;
  }

  /**
   * Copy matrix.
   * @param src source matrix
   * @return this
   */
  set(src) {
    var i, s, d;
    s = src.elements;
    d = this.elements;
    if (s === d) {
      return;
    }
    for (i = 0; i < 16; ++i) {
      d[i] = s[i];
    }
    return this;
  }

  /**
   * Multiply the matrix from the right.
   * @param other The multiply matrix
   * @return this
   */
  multiply(other) {
    var i, e, a, b, ai0, ai1, ai2, ai3;

    // Calculate e = a * b
    e = this.elements;
    a = this.elements;
    b = other.elements;

    // If e equals b, copy b to temporary matrix.
    if (e === b) {
      b = new Float32Array(16);
      for (i = 0; i < 16; ++i) {
        b[i] = e[i];
      }
    }
    for (i = 0; i < 4; i++) {
      ai0 = a[i];
      ai1 = a[i + 4];
      ai2 = a[i + 8];
      ai3 = a[i + 12];
      e[i] = ai0 * b[0] + ai1 * b[1] + ai2 * b[2] + ai3 * b[3];
      e[i + 4] = ai0 * b[4] + ai1 * b[5] + ai2 * b[6] + ai3 * b[7];
      e[i + 8] = ai0 * b[8] + ai1 * b[9] + ai2 * b[10] + ai3 * b[11];
      e[i + 12] = ai0 * b[12] + ai1 * b[13] + ai2 * b[14] + ai3 * b[15];
    }
    return this;
  }
  concat(other) {
    return this.multiply(other);
  }

  /**
   * Multiply the three-dimensional vector.
   * @param pos  The multiply vector
   * @return The result of multiplication(Float32Array)
   */
  multiplyVector3(pos) {
    var e = this.elements;
    var p = pos.elements;
    var v = new Vector3();
    var result = v.elements;
    result[0] = p[0] * e[0] + p[1] * e[4] + p[2] * e[8] + e[12];
    result[1] = p[0] * e[1] + p[1] * e[5] + p[2] * e[9] + e[13];
    result[2] = p[0] * e[2] + p[1] * e[6] + p[2] * e[10] + e[14];
    return v;
  }

  /**
   * Multiply the four-dimensional vector.
   * @param pos  The multiply vector
   * @return The result of multiplication(Float32Array)
   */
  multiplyVector4(pos) {
    var e = this.elements;
    var p = pos.elements;
    var v = new Vector4();
    var result = v.elements;
    result[0] = p[0] * e[0] + p[1] * e[4] + p[2] * e[8] + p[3] * e[12];
    result[1] = p[0] * e[1] + p[1] * e[5] + p[2] * e[9] + p[3] * e[13];
    result[2] = p[0] * e[2] + p[1] * e[6] + p[2] * e[10] + p[3] * e[14];
    result[3] = p[0] * e[3] + p[1] * e[7] + p[2] * e[11] + p[3] * e[15];
    return v;
  }

  /**
   * Transpose the matrix.
   * @return this
   */
  transpose() {
    var e, t;
    e = this.elements;
    t = e[1];
    e[1] = e[4];
    e[4] = t;
    t = e[2];
    e[2] = e[8];
    e[8] = t;
    t = e[3];
    e[3] = e[12];
    e[12] = t;
    t = e[6];
    e[6] = e[9];
    e[9] = t;
    t = e[7];
    e[7] = e[13];
    e[13] = t;
    t = e[11];
    e[11] = e[14];
    e[14] = t;
    return this;
  }

  /**
   * Calculate the inverse matrix of specified matrix, and set to this.
   * @param other The source matrix
   * @return this
   */
  setInverseOf(other) {
    var i, s, d, inv, det;
    s = other.elements;
    d = this.elements;
    inv = new Float32Array(16);
    inv[0] = s[5] * s[10] * s[15] - s[5] * s[11] * s[14] - s[9] * s[6] * s[15] + s[9] * s[7] * s[14] + s[13] * s[6] * s[11] - s[13] * s[7] * s[10];
    inv[4] = -s[4] * s[10] * s[15] + s[4] * s[11] * s[14] + s[8] * s[6] * s[15] - s[8] * s[7] * s[14] - s[12] * s[6] * s[11] + s[12] * s[7] * s[10];
    inv[8] = s[4] * s[9] * s[15] - s[4] * s[11] * s[13] - s[8] * s[5] * s[15] + s[8] * s[7] * s[13] + s[12] * s[5] * s[11] - s[12] * s[7] * s[9];
    inv[12] = -s[4] * s[9] * s[14] + s[4] * s[10] * s[13] + s[8] * s[5] * s[14] - s[8] * s[6] * s[13] - s[12] * s[5] * s[10] + s[12] * s[6] * s[9];
    inv[1] = -s[1] * s[10] * s[15] + s[1] * s[11] * s[14] + s[9] * s[2] * s[15] - s[9] * s[3] * s[14] - s[13] * s[2] * s[11] + s[13] * s[3] * s[10];
    inv[5] = s[0] * s[10] * s[15] - s[0] * s[11] * s[14] - s[8] * s[2] * s[15] + s[8] * s[3] * s[14] + s[12] * s[2] * s[11] - s[12] * s[3] * s[10];
    inv[9] = -s[0] * s[9] * s[15] + s[0] * s[11] * s[13] + s[8] * s[1] * s[15] - s[8] * s[3] * s[13] - s[12] * s[1] * s[11] + s[12] * s[3] * s[9];
    inv[13] = s[0] * s[9] * s[14] - s[0] * s[10] * s[13] - s[8] * s[1] * s[14] + s[8] * s[2] * s[13] + s[12] * s[1] * s[10] - s[12] * s[2] * s[9];
    inv[2] = s[1] * s[6] * s[15] - s[1] * s[7] * s[14] - s[5] * s[2] * s[15] + s[5] * s[3] * s[14] + s[13] * s[2] * s[7] - s[13] * s[3] * s[6];
    inv[6] = -s[0] * s[6] * s[15] + s[0] * s[7] * s[14] + s[4] * s[2] * s[15] - s[4] * s[3] * s[14] - s[12] * s[2] * s[7] + s[12] * s[3] * s[6];
    inv[10] = s[0] * s[5] * s[15] - s[0] * s[7] * s[13] - s[4] * s[1] * s[15] + s[4] * s[3] * s[13] + s[12] * s[1] * s[7] - s[12] * s[3] * s[5];
    inv[14] = -s[0] * s[5] * s[14] + s[0] * s[6] * s[13] + s[4] * s[1] * s[14] - s[4] * s[2] * s[13] - s[12] * s[1] * s[6] + s[12] * s[2] * s[5];
    inv[3] = -s[1] * s[6] * s[11] + s[1] * s[7] * s[10] + s[5] * s[2] * s[11] - s[5] * s[3] * s[10] - s[9] * s[2] * s[7] + s[9] * s[3] * s[6];
    inv[7] = s[0] * s[6] * s[11] - s[0] * s[7] * s[10] - s[4] * s[2] * s[11] + s[4] * s[3] * s[10] + s[8] * s[2] * s[7] - s[8] * s[3] * s[6];
    inv[11] = -s[0] * s[5] * s[11] + s[0] * s[7] * s[9] + s[4] * s[1] * s[11] - s[4] * s[3] * s[9] - s[8] * s[1] * s[7] + s[8] * s[3] * s[5];
    inv[15] = s[0] * s[5] * s[10] - s[0] * s[6] * s[9] - s[4] * s[1] * s[10] + s[4] * s[2] * s[9] + s[8] * s[1] * s[6] - s[8] * s[2] * s[5];
    det = s[0] * inv[0] + s[1] * inv[4] + s[2] * inv[8] + s[3] * inv[12];
    if (det === 0) {
      return this;
    }
    det = 1 / det;
    for (i = 0; i < 16; i++) {
      d[i] = inv[i] * det;
    }
    return this;
  }

  /**
   * Calculate the inverse matrix of this, and set to this.
   * @return this
   */
  invert() {
    return this.setInverseOf(this);
  }

  /**
   * Set the orthographic projection matrix.
   * @param left The coordinate of the left of clipping plane.
   * @param right The coordinate of the right of clipping plane.
   * @param bottom The coordinate of the bottom of clipping plane.
   * @param top The coordinate of the top top clipping plane.
   * @param near The distances to the nearer depth clipping plane. This value is minus if the plane is to be behind the viewer.
   * @param far The distances to the farther depth clipping plane. This value is minus if the plane is to be behind the viewer.
   * @return this
   */
  setOrtho(left, right, bottom, top, near, far) {
    var e, rw, rh, rd;
    if (left === right || bottom === top || near === far) {
      throw "null frustum";
    }
    rw = 1 / (right - left);
    rh = 1 / (top - bottom);
    rd = 1 / (far - near);
    e = this.elements;
    e[0] = 2 * rw;
    e[1] = 0;
    e[2] = 0;
    e[3] = 0;
    e[4] = 0;
    e[5] = 2 * rh;
    e[6] = 0;
    e[7] = 0;
    e[8] = 0;
    e[9] = 0;
    e[10] = -2 * rd;
    e[11] = 0;
    e[12] = -(right + left) * rw;
    e[13] = -(top + bottom) * rh;
    e[14] = -(far + near) * rd;
    e[15] = 1;
    return this;
  }

  /**
   * Multiply the orthographic projection matrix from the right.
   * @param left The coordinate of the left of clipping plane.
   * @param right The coordinate of the right of clipping plane.
   * @param bottom The coordinate of the bottom of clipping plane.
   * @param top The coordinate of the top top clipping plane.
   * @param near The distances to the nearer depth clipping plane. This value is minus if the plane is to be behind the viewer.
   * @param far The distances to the farther depth clipping plane. This value is minus if the plane is to be behind the viewer.
   * @return this
   */
  ortho(left, right, bottom, top, near, far) {
    return this.concat(new Matrix4().setOrtho(left, right, bottom, top, near, far));
  }

  /**
   * Set the perspective projection matrix.
   * @param left The coordinate of the left of clipping plane.
   * @param right The coordinate of the right of clipping plane.
   * @param bottom The coordinate of the bottom of clipping plane.
   * @param top The coordinate of the top top clipping plane.
   * @param near The distances to the nearer depth clipping plane. This value must be plus value.
   * @param far The distances to the farther depth clipping plane. This value must be plus value.
   * @return this
   */
  setFrustum(left, right, bottom, top, near, far) {
    var e, rw, rh, rd;
    if (left === right || top === bottom || near === far) {
      throw "null frustum";
    }
    if (near <= 0) {
      throw "near <= 0";
    }
    if (far <= 0) {
      throw "far <= 0";
    }
    rw = 1 / (right - left);
    rh = 1 / (top - bottom);
    rd = 1 / (far - near);
    e = this.elements;
    e[0] = 2 * near * rw;
    e[1] = 0;
    e[2] = 0;
    e[3] = 0;
    e[4] = 0;
    e[5] = 2 * near * rh;
    e[6] = 0;
    e[7] = 0;
    e[8] = (right + left) * rw;
    e[9] = (top + bottom) * rh;
    e[10] = -(far + near) * rd;
    e[11] = -1;
    e[12] = 0;
    e[13] = 0;
    e[14] = -2 * near * far * rd;
    e[15] = 0;
    return this;
  }

  /**
   * Multiply the perspective projection matrix from the right.
   * @param left The coordinate of the left of clipping plane.
   * @param right The coordinate of the right of clipping plane.
   * @param bottom The coordinate of the bottom of clipping plane.
   * @param top The coordinate of the top top clipping plane.
   * @param near The distances to the nearer depth clipping plane. This value must be plus value.
   * @param far The distances to the farther depth clipping plane. This value must be plus value.
   * @return this
   */
  frustum(left, right, bottom, top, near, far) {
    return this.concat(new Matrix4().setFrustum(left, right, bottom, top, near, far));
  }

  /**
   * Set the perspective projection matrix by fovy and aspect.
   * @param fovy The angle between the upper and lower sides of the frustum.
   * @param aspect The aspect ratio of the frustum. (width/height)
   * @param near The distances to the nearer depth clipping plane. This value must be plus value.
   * @param far The distances to the farther depth clipping plane. This value must be plus value.
   * @return this
   */
  setPerspective(fovy, aspect, near, far) {
    var e, rd, s, ct;
    if (near === far || aspect === 0) {
      throw "null frustum";
    }
    if (near <= 0) {
      throw "near <= 0";
    }
    if (far <= 0) {
      throw "far <= 0";
    }
    fovy = Math.PI * fovy / 180 / 2;
    s = Math.sin(fovy);
    if (s === 0) {
      throw "null frustum";
    }
    rd = 1 / (far - near);
    ct = Math.cos(fovy) / s;
    e = this.elements;
    e[0] = ct / aspect;
    e[1] = 0;
    e[2] = 0;
    e[3] = 0;
    e[4] = 0;
    e[5] = ct;
    e[6] = 0;
    e[7] = 0;
    e[8] = 0;
    e[9] = 0;
    e[10] = -(far + near) * rd;
    e[11] = -1;
    e[12] = 0;
    e[13] = 0;
    e[14] = -2 * near * far * rd;
    e[15] = 0;
    return this;
  }

  /**
   * Multiply the perspective projection matrix from the right.
   * @param fovy The angle between the upper and lower sides of the frustum.
   * @param aspect The aspect ratio of the frustum. (width/height)
   * @param near The distances to the nearer depth clipping plane. This value must be plus value.
   * @param far The distances to the farther depth clipping plane. This value must be plus value.
   * @return this
   */
  perspective(fovy, aspect, near, far) {
    return this.concat(new Matrix4().setPerspective(fovy, aspect, near, far));
  }

  /**
   * Set the matrix for scaling.
   * @param x The scale factor along the X axis
   * @param y The scale factor along the Y axis
   * @param z The scale factor along the Z axis
   * @return this
   */
  setScale(x, y, z) {
    var e = this.elements;
    e[0] = x;
    e[4] = 0;
    e[8] = 0;
    e[12] = 0;
    e[1] = 0;
    e[5] = y;
    e[9] = 0;
    e[13] = 0;
    e[2] = 0;
    e[6] = 0;
    e[10] = z;
    e[14] = 0;
    e[3] = 0;
    e[7] = 0;
    e[11] = 0;
    e[15] = 1;
    return this;
  }

  /**
   * Multiply the matrix for scaling from the right.
   * @param x The scale factor along the X axis
   * @param y The scale factor along the Y axis
   * @param z The scale factor along the Z axis
   * @return this
   */
  scale(x, y, z) {
    var e = this.elements;
    e[0] *= x;
    e[4] *= y;
    e[8] *= z;
    e[1] *= x;
    e[5] *= y;
    e[9] *= z;
    e[2] *= x;
    e[6] *= y;
    e[10] *= z;
    e[3] *= x;
    e[7] *= y;
    e[11] *= z;
    return this;
  }

  /**
   * Set the matrix for translation.
   * @param x The X value of a translation.
   * @param y The Y value of a translation.
   * @param z The Z value of a translation.
   * @return this
   */

  setTranslate(x, y, z) {
    var e = this.elements;
    e[0] = 1;
    e[4] = 0;
    e[8] = 0;
    e[12] = x;
    e[1] = 0;
    e[5] = 1;
    e[9] = 0;
    e[13] = y;
    e[2] = 0;
    e[6] = 0;
    e[10] = 1;
    e[14] = z;
    e[3] = 0;
    e[7] = 0;
    e[11] = 0;
    e[15] = 1;
    return this;
  }

  /**
   * Multiply the matrix for translation from the right.
   * @param x The X value of a translation.
   * @param y The Y value of a translation.
   * @param z The Z value of a translation.
   * @return this
   */
  translate(x, y, z) {
    var e = this.elements;
    e[12] += e[0] * x + e[4] * y + e[8] * z;
    e[13] += e[1] * x + e[5] * y + e[9] * z;
    e[14] += e[2] * x + e[6] * y + e[10] * z;
    e[15] += e[3] * x + e[7] * y + e[11] * z;
    return this;
  }

  /**
   * Set the matrix for rotation.
   * The vector of rotation axis may not be normalized.
   * @param angle The angle of rotation (degrees)
   * @param x The X coordinate of vector of rotation axis.
   * @param y The Y coordinate of vector of rotation axis.
   * @param z The Z coordinate of vector of rotation axis.
   * @return this
   */
  setRotate(angle, x, y, z) {
    var e, s, c, len, rlen, nc, xy, yz, zx, xs, ys, zs;
    angle = Math.PI * angle / 180;
    e = this.elements;
    s = Math.sin(angle);
    c = Math.cos(angle);
    if (0 !== x && 0 === y && 0 === z) {
      // Rotation around X axis
      if (x < 0) {
        s = -s;
      }
      e[0] = 1;
      e[4] = 0;
      e[8] = 0;
      e[12] = 0;
      e[1] = 0;
      e[5] = c;
      e[9] = -s;
      e[13] = 0;
      e[2] = 0;
      e[6] = s;
      e[10] = c;
      e[14] = 0;
      e[3] = 0;
      e[7] = 0;
      e[11] = 0;
      e[15] = 1;
    } else if (0 === x && 0 !== y && 0 === z) {
      // Rotation around Y axis
      if (y < 0) {
        s = -s;
      }
      e[0] = c;
      e[4] = 0;
      e[8] = s;
      e[12] = 0;
      e[1] = 0;
      e[5] = 1;
      e[9] = 0;
      e[13] = 0;
      e[2] = -s;
      e[6] = 0;
      e[10] = c;
      e[14] = 0;
      e[3] = 0;
      e[7] = 0;
      e[11] = 0;
      e[15] = 1;
    } else if (0 === x && 0 === y && 0 !== z) {
      // Rotation around Z axis
      if (z < 0) {
        s = -s;
      }
      e[0] = c;
      e[4] = -s;
      e[8] = 0;
      e[12] = 0;
      e[1] = s;
      e[5] = c;
      e[9] = 0;
      e[13] = 0;
      e[2] = 0;
      e[6] = 0;
      e[10] = 1;
      e[14] = 0;
      e[3] = 0;
      e[7] = 0;
      e[11] = 0;
      e[15] = 1;
    } else {
      // Rotation around another axis
      len = Math.sqrt(x * x + y * y + z * z);
      if (len !== 1) {
        rlen = 1 / len;
        x *= rlen;
        y *= rlen;
        z *= rlen;
      }
      nc = 1 - c;
      xy = x * y;
      yz = y * z;
      zx = z * x;
      xs = x * s;
      ys = y * s;
      zs = z * s;
      e[0] = x * x * nc + c;
      e[1] = xy * nc + zs;
      e[2] = zx * nc - ys;
      e[3] = 0;
      e[4] = xy * nc - zs;
      e[5] = y * y * nc + c;
      e[6] = yz * nc + xs;
      e[7] = 0;
      e[8] = zx * nc + ys;
      e[9] = yz * nc - xs;
      e[10] = z * z * nc + c;
      e[11] = 0;
      e[12] = 0;
      e[13] = 0;
      e[14] = 0;
      e[15] = 1;
    }
    return this;
  }

  /**
   * Multiply the matrix for rotation from the right.
   * The vector of rotation axis may not be normalized.
   * @param angle The angle of rotation (degrees)
   * @param x The X coordinate of vector of rotation axis.
   * @param y The Y coordinate of vector of rotation axis.
   * @param z The Z coordinate of vector of rotation axis.
   * @return this
   */
  rotate(angle, x, y, z) {
    return this.concat(new Matrix4().setRotate(angle, x, y, z));
  }

  /**
   * Set the viewing matrix.
   * @param eyeX, eyeY, eyeZ The position of the eye point.
   * @param centerX, centerY, centerZ The position of the reference point.
   * @param upX, upY, upZ The direction of the up vector.
   * @return this
   */
  setLookAt(eyeX, eyeY, eyeZ, centerX, centerY, centerZ, upX, upY, upZ) {
    var e, fx, fy, fz, rlf, sx, sy, sz, rls, ux, uy, uz;
    fx = centerX - eyeX;
    fy = centerY - eyeY;
    fz = centerZ - eyeZ;

    // Normalize f.
    rlf = 1 / Math.sqrt(fx * fx + fy * fy + fz * fz);
    fx *= rlf;
    fy *= rlf;
    fz *= rlf;

    // Calculate cross product of f and up.
    sx = fy * upZ - fz * upY;
    sy = fz * upX - fx * upZ;
    sz = fx * upY - fy * upX;

    // Normalize s.
    rls = 1 / Math.sqrt(sx * sx + sy * sy + sz * sz);
    sx *= rls;
    sy *= rls;
    sz *= rls;

    // Calculate cross product of s and f.
    ux = sy * fz - sz * fy;
    uy = sz * fx - sx * fz;
    uz = sx * fy - sy * fx;

    // Set to this.
    e = this.elements;
    e[0] = sx;
    e[1] = ux;
    e[2] = -fx;
    e[3] = 0;
    e[4] = sy;
    e[5] = uy;
    e[6] = -fy;
    e[7] = 0;
    e[8] = sz;
    e[9] = uz;
    e[10] = -fz;
    e[11] = 0;
    e[12] = 0;
    e[13] = 0;
    e[14] = 0;
    e[15] = 1;

    // Translate.
    return this.translate(-eyeX, -eyeY, -eyeZ);
  }

  /**
   * Multiply the viewing matrix from the right.
   * @param eyeX, eyeY, eyeZ The position of the eye point.
   * @param centerX, centerY, centerZ The position of the reference point.
   * @param upX, upY, upZ The direction of the up vector.
   * @return this
   */
  lookAt(eyeX, eyeY, eyeZ, centerX, centerY, centerZ, upX, upY, upZ) {
    return this.concat(new Matrix4().setLookAt(eyeX, eyeY, eyeZ, centerX, centerY, centerZ, upX, upY, upZ));
  }

  /**
   * Multiply the matrix for project vertex to plane from the right.
   * @param plane The array[A, B, C, D] of the equation of plane "Ax + By + Cz + D = 0".
   * @param light The array which stored coordinates of the light. if light[3]=0, treated as parallel light.
   * @return this
   */
  dropShadow(plane, light) {
    var mat = new Matrix4();
    var e = mat.elements;
    var dot = plane[0] * light[0] + plane[1] * light[1] + plane[2] * light[2] + plane[3] * light[3];
    e[0] = dot - light[0] * plane[0];
    e[1] = -light[1] * plane[0];
    e[2] = -light[2] * plane[0];
    e[3] = -light[3] * plane[0];
    e[4] = -light[0] * plane[1];
    e[5] = dot - light[1] * plane[1];
    e[6] = -light[2] * plane[1];
    e[7] = -light[3] * plane[1];
    e[8] = -light[0] * plane[2];
    e[9] = -light[1] * plane[2];
    e[10] = dot - light[2] * plane[2];
    e[11] = -light[3] * plane[2];
    e[12] = -light[0] * plane[3];
    e[13] = -light[1] * plane[3];
    e[14] = -light[2] * plane[3];
    e[15] = dot - light[3] * plane[3];
    return this.concat(mat);
  }

  /**
   * Multiply the matrix for project vertex to plane from the right.(Projected by parallel light.)
   * @param normX, normY, normZ The normal vector of the plane.(Not necessary to be normalized.)
   * @param planeX, planeY, planeZ The coordinate of arbitrary points on a plane.
   * @param lightX, lightY, lightZ The vector of the direction of light.(Not necessary to be normalized.)
   * @return this
   */
  dropShadowDirectionally(normX, normY, normZ, planeX, planeY, planeZ, lightX, lightY, lightZ) {
    var a = planeX * normX + planeY * normY + planeZ * normZ;
    return this.dropShadow([normX, normY, normZ, -a], [lightX, lightY, lightZ, 0]);
  }
}

/**
 * note this is required to use the imports in index.js
 * this is required for the type of JS we need to write in codesandbox
 */
exports.Matrix4 = Matrix4;
},{}],"src/Context.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = getContext;
function getContext() {
  // Retrieve <canvas> element
  var canvas = document.getElementById("webgl");
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  // Get the rendering context for WebGL
  const gl = canvas.getContext("webgl");
  if (!gl) {
    console.log("Failed to get the rendering context for WebGL");
  }
  gl.viewport(0, 0, canvas.width, canvas.height);
  gl.enable(gl.DEPTH_TEST);
  window.addEventListener("resize", e => {
    gl.canvas.width = window.innerWidth;
    gl.canvas.height = window.innerHeight;
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
  });
  return gl;
}
},{}],"node_modules/stats.js/build/stats.min.js":[function(require,module,exports) {
var define;
// stats.js - http://github.com/mrdoob/stats.js
(function(f,e){"object"===typeof exports&&"undefined"!==typeof module?module.exports=e():"function"===typeof define&&define.amd?define(e):f.Stats=e()})(this,function(){var f=function(){function e(a){c.appendChild(a.dom);return a}function u(a){for(var d=0;d<c.children.length;d++)c.children[d].style.display=d===a?"block":"none";l=a}var l=0,c=document.createElement("div");c.style.cssText="position:fixed;top:0;left:0;cursor:pointer;opacity:0.9;z-index:10000";c.addEventListener("click",function(a){a.preventDefault();
u(++l%c.children.length)},!1);var k=(performance||Date).now(),g=k,a=0,r=e(new f.Panel("FPS","#0ff","#002")),h=e(new f.Panel("MS","#0f0","#020"));if(self.performance&&self.performance.memory)var t=e(new f.Panel("MB","#f08","#201"));u(0);return{REVISION:16,dom:c,addPanel:e,showPanel:u,begin:function(){k=(performance||Date).now()},end:function(){a++;var c=(performance||Date).now();h.update(c-k,200);if(c>g+1E3&&(r.update(1E3*a/(c-g),100),g=c,a=0,t)){var d=performance.memory;t.update(d.usedJSHeapSize/
1048576,d.jsHeapSizeLimit/1048576)}return c},update:function(){k=this.end()},domElement:c,setMode:u}};f.Panel=function(e,f,l){var c=Infinity,k=0,g=Math.round,a=g(window.devicePixelRatio||1),r=80*a,h=48*a,t=3*a,v=2*a,d=3*a,m=15*a,n=74*a,p=30*a,q=document.createElement("canvas");q.width=r;q.height=h;q.style.cssText="width:80px;height:48px";var b=q.getContext("2d");b.font="bold "+9*a+"px Helvetica,Arial,sans-serif";b.textBaseline="top";b.fillStyle=l;b.fillRect(0,0,r,h);b.fillStyle=f;b.fillText(e,t,v);
b.fillRect(d,m,n,p);b.fillStyle=l;b.globalAlpha=.9;b.fillRect(d,m,n,p);return{dom:q,update:function(h,w){c=Math.min(c,h);k=Math.max(k,h);b.fillStyle=l;b.globalAlpha=1;b.fillRect(0,0,r,m);b.fillStyle=f;b.fillText(g(h)+" "+e+" ("+g(c)+"-"+g(k)+")",t,v);b.drawImage(q,d+a,m,n-a,p,d,m,n-a,p);b.fillRect(d+n-a,m,a,p);b.fillStyle=l;b.globalAlpha=.9;b.fillRect(d+n-a,m,a,g((1-h/w)*p))}}};return f});

},{}],"src/Cube.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _cuonMatrixCse = require("../lib/cuon-matrix-cse160");
class Cube {
  constructor() {
    this.vertices = new Float32Array([-0.5, 0.5, 0.5, -0.5, -0.5, 0.5, 0.5, -0.5, 0.5, -0.5, 0.5, 0.5, 0.5, -0.5, 0.5, 0.5, 0.5, 0.5, -0.5, 0.5, -0.5, -0.5, -0.5, -0.5, -0.5, -0.5, 0.5, -0.5, 0.5, -0.5, -0.5, -0.5, 0.5, -0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, -0.5, 0.5, 0.5, -0.5, -0.5, 0.5, 0.5, 0.5, 0.5, -0.5, -0.5, 0.5, 0.5, -0.5, -0.5, 0.5, -0.5, -0.5, 0.5, 0.5, 0.5, 0.5, 0.5, -0.5, 0.5, -0.5, 0.5, 0.5, 0.5, 0.5, 0.5, -0.5, 0.5, 0.5, -0.5, 0.5, -0.5, -0.5, -0.5, 0.5, -0.5, -0.5, 0.5, -0.5, 0.5, -0.5, -0.5, -0.5, -0.5, -0.5, -0.5, -0.5, 0.5, -0.5, -0.5, -0.5, 0.5, -0.5, -0.5, -0.5, -0.5, 0.5, 0.5, -0.5, -0.5, 0.5, -0.5, 0.5]);
    this.uvs = new Float32Array([0, 1, 0, 0, 1, 0, 0, 1, 1, 0, 1, 1, 0, 1, 0, 0, 1, 0, 0, 1, 1, 0, 1, 1, 0, 1, 0, 0, 1, 0, 0, 1, 1, 0, 1, 1, 0, 1, 0, 0, 1, 0, 0, 1, 1, 0, 1, 1, 0, 1, 0, 0, 1, 1, 1, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 1, 0, 1, 1]);
    this.vertexBuffer = null;
    this.uvBuffer = null;
    this.locations = null;
  }
  initLocations(gl) {
    if (this.locations !== null) {
      return;
    }
    this.locations = {
      aPosition: gl.getAttribLocation(gl.program, "aPosition"),
      uv: gl.getAttribLocation(gl.program, "uv"),
      modelMatrix: gl.getUniformLocation(gl.program, "modelMatrix"),
      viewMatrix: gl.getUniformLocation(gl.program, "viewMatrix"),
      projectionMatrix: gl.getUniformLocation(gl.program, "projectionMatrix"),
      uBaseColor: gl.getUniformLocation(gl.program, "uBaseColor"),
      uTextureIndex: gl.getUniformLocation(gl.program, "uTextureIndex"),
      uTextureWeight: gl.getUniformLocation(gl.program, "uTextureWeight")
    };
  }
  initBuffers(gl) {
    this.initLocations(gl);
    if (this.vertexBuffer === null) {
      this.vertexBuffer = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
      gl.bufferData(gl.ARRAY_BUFFER, this.vertices, gl.STATIC_DRAW);
    }
    if (this.uvBuffer === null) {
      this.uvBuffer = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, this.uvBuffer);
      gl.bufferData(gl.ARRAY_BUFFER, this.uvs, gl.STATIC_DRAW);
    }
    gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
    gl.vertexAttribPointer(this.locations.aPosition, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(this.locations.aPosition);
    gl.bindBuffer(gl.ARRAY_BUFFER, this.uvBuffer);
    gl.vertexAttribPointer(this.locations.uv, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(this.locations.uv);
  }
  render(gl, camera) {
    let options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
    const _options$matrix = options.matrix,
      matrix = _options$matrix === void 0 ? new _cuonMatrixCse.Matrix4() : _options$matrix,
      _options$color = options.color,
      color = _options$color === void 0 ? [1, 1, 1, 1] : _options$color,
      _options$textureIndex = options.textureIndex,
      textureIndex = _options$textureIndex === void 0 ? 0 : _options$textureIndex,
      _options$textureWeigh = options.textureWeight,
      textureWeight = _options$textureWeigh === void 0 ? 0 : _options$textureWeigh;
    this.initBuffers(gl);
    gl.uniformMatrix4fv(this.locations.modelMatrix, false, matrix.elements);
    gl.uniformMatrix4fv(this.locations.viewMatrix, false, camera.viewMatrix.elements);
    gl.uniformMatrix4fv(this.locations.projectionMatrix, false, camera.projectionMatrix.elements);
    gl.uniform4fv(this.locations.uBaseColor, color);
    gl.uniform1i(this.locations.uTextureIndex, textureIndex);
    gl.uniform1f(this.locations.uTextureWeight, textureWeight);
    gl.drawArrays(gl.TRIANGLES, 0, this.vertices.length / 3);
  }
}
exports.default = Cube;
},{"../lib/cuon-matrix-cse160":"lib/cuon-matrix-cse160.js"}],"src/Camera.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _cuonMatrixCse = require("../lib/cuon-matrix-cse160");
class Camera {
  constructor(canvas) {
    this.fov = 60;
    this.eye = new _cuonMatrixCse.Vector3([0, 1.2, 6]);
    this.at = new _cuonMatrixCse.Vector3([0, 1.2, 5]);
    this.up = new _cuonMatrixCse.Vector3([0, 1, 0]);
    this.viewMatrix = new _cuonMatrixCse.Matrix4();
    this.projectionMatrix = new _cuonMatrixCse.Matrix4();
    this.speed = 0.22;
    this.panSpeed = 5;
    this.yaw = -90;
    this.pitch = 0;
    this.aspect = canvas.width / canvas.height;
    window.addEventListener("resize", () => {
      this.aspect = canvas.width / canvas.height;
      this.calculateViewProjection();
    });
    this.updateAtFromAngles();
    this.calculateViewProjection();
  }
  forwardVector() {
    const f = new _cuonMatrixCse.Vector3().set(this.at);
    f.sub(this.eye);
    f.normalize();
    return f;
  }
  moveBy(vector) {
    let canMove = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : () => true;
    const movement = new _cuonMatrixCse.Vector3().set(vector);
    const nextEye = new _cuonMatrixCse.Vector3().set(this.eye);
    nextEye.add(movement);

    // Treat the grass plane as a floor: pitch can look up/down, but the
    // player camera cannot sink below standing height.
    nextEye.elements[1] = Math.max(1.2, nextEye.elements[1]);
    if (!canMove(nextEye.elements[0], nextEye.elements[2])) {
      return;
    }
    movement.elements[1] = nextEye.elements[1] - this.eye.elements[1];
    this.eye.set(nextEye);
    this.at.add(movement);
    this.calculateViewProjection();
  }
  moveForward() {
    let speed = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : this.speed;
    let canMove = arguments.length > 1 ? arguments[1] : undefined;
    this.moveBy(this.forwardVector().mul(speed), canMove);
  }
  moveBackwards() {
    let speed = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : this.speed;
    let canMove = arguments.length > 1 ? arguments[1] : undefined;
    this.moveBy(this.forwardVector().mul(-speed), canMove);
  }
  moveLeft() {
    let speed = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : this.speed;
    let canMove = arguments.length > 1 ? arguments[1] : undefined;
    const side = _cuonMatrixCse.Vector3.cross(this.up, this.forwardVector()).normalize();
    this.moveBy(side.mul(speed), canMove);
  }
  moveRight() {
    let speed = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : this.speed;
    let canMove = arguments.length > 1 ? arguments[1] : undefined;
    const side = _cuonMatrixCse.Vector3.cross(this.forwardVector(), this.up).normalize();
    this.moveBy(side.mul(speed), canMove);
  }
  panLeft() {
    let alpha = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : this.panSpeed;
    this.yaw -= alpha;
    this.updateAtFromAngles();
  }
  panRight() {
    let alpha = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : this.panSpeed;
    this.yaw += alpha;
    this.updateAtFromAngles();
  }
  rotate(deltaYaw, deltaPitch) {
    this.yaw += deltaYaw;
    this.pitch = Math.max(-80, Math.min(80, this.pitch + deltaPitch));
    this.updateAtFromAngles();
  }
  updateAtFromAngles() {
    const yawRad = this.yaw * Math.PI / 180;
    const pitchRad = this.pitch * Math.PI / 180;
    const direction = new _cuonMatrixCse.Vector3([Math.cos(pitchRad) * Math.cos(yawRad), Math.sin(pitchRad), Math.cos(pitchRad) * Math.sin(yawRad)]);
    this.at.set(this.eye);
    this.at.add(direction);
    this.calculateViewProjection();
  }
  calculateViewProjection() {
    this.viewMatrix.setLookAt(...this.eye.elements, ...this.at.elements, ...this.up.elements);
    this.projectionMatrix.setPerspective(this.fov, this.aspect, 0.1, 1000);
  }
}
exports.default = Camera;
},{"../lib/cuon-matrix-cse160":"lib/cuon-matrix-cse160.js"}],"src/Controls.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
class Controls {
  constructor(gl, camera, world) {
    this.canvas = gl.canvas;
    this.camera = camera;
    this.world = world;
    this.keys = {};
    this.dragging = false;
    this.lastX = 0;
    this.lastY = 0;
    this.setHandlers();
  }
  setHandlers() {
    window.addEventListener("keydown", event => {
      this.keys[event.key.toLowerCase()] = true;
      if (event.key.toLowerCase() === "f") {
        this.world.removeBlockInFront();
      }
      if (event.key.toLowerCase() === "r") {
        this.world.addBlockInFront();
      }
      if (event.key.toLowerCase() === "h") {
        this.world.helpBird();
      }
    });
    window.addEventListener("keyup", event => {
      this.keys[event.key.toLowerCase()] = false;
    });
    this.canvas.addEventListener("mousedown", event => {
      this.dragging = true;
      this.lastX = event.clientX;
      this.lastY = event.clientY;
    });
    window.addEventListener("mouseup", () => {
      this.dragging = false;
    });
    this.canvas.addEventListener("mousemove", event => {
      if (!this.dragging) {
        return;
      }
      const dx = event.clientX - this.lastX;
      const dy = event.clientY - this.lastY;
      this.camera.rotate(dx * 0.25, -dy * 0.25);
      this.lastX = event.clientX;
      this.lastY = event.clientY;
    });
  }
  update() {
    const canMove = (x, z) => !this.world.isBlockedAt(x, z);
    if (this.keys.w) this.camera.moveForward(undefined, canMove);
    if (this.keys.s) this.camera.moveBackwards(undefined, canMove);
    if (this.keys.a) this.camera.moveLeft(undefined, canMove);
    if (this.keys.d) this.camera.moveRight(undefined, canMove);
    if (this.keys.q) this.camera.panLeft();
    if (this.keys.e) this.camera.panRight();
  }
}
exports.default = Controls;
},{}],"src/img/dirt.svg":[function(require,module,exports) {
module.exports = "/dirt.a8943dba.svg";
},{}],"src/img/grass.svg":[function(require,module,exports) {
module.exports = "/grass.80e88859.svg";
},{}],"src/img/stone.svg":[function(require,module,exports) {
module.exports = "/stone.a77ba52f.svg";
},{}],"src/img/wood.svg":[function(require,module,exports) {
module.exports = "/wood.081b406a.svg";
},{}],"src/index.js":[function(require,module,exports) {
"use strict";

require("./styles.css");
var _cuonUtils = require("../lib/cuon-utils");
var _cuonMatrixCse = require("../lib/cuon-matrix-cse160");
var _Context = _interopRequireDefault(require("./Context"));
var _stats = _interopRequireDefault(require("stats.js"));
var _Cube = _interopRequireDefault(require("./Cube"));
var _Camera = _interopRequireDefault(require("./Camera"));
var _Controls = _interopRequireDefault(require("./Controls"));
var _dirt = _interopRequireDefault(require("./img/dirt.svg"));
var _grass = _interopRequireDefault(require("./img/grass.svg"));
var _stone = _interopRequireDefault(require("./img/stone.svg"));
var _wood = _interopRequireDefault(require("./img/wood.svg"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
function _slicedToArray(r, e) { return _arrayWithHoles(r) || _iterableToArrayLimit(r, e) || _unsupportedIterableToArray(r, e) || _nonIterableRest(); }
function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _unsupportedIterableToArray(r, a) { if (r) { if ("string" == typeof r) return _arrayLikeToArray(r, a); var t = {}.toString.call(r).slice(8, -1); return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray(r, a) : void 0; } }
function _arrayLikeToArray(r, a) { (null == a || a > r.length) && (a = r.length); for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e]; return n; }
function _iterableToArrayLimit(r, l) { var t = null == r ? null : "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (null != t) { var e, n, i, u, a = [], f = !0, o = !1; try { if (i = (t = t.call(r)).next, 0 === l) { if (Object(t) !== t) return; f = !1; } else for (; !(f = (e = i.call(t)).done) && (a.push(e.value), a.length !== l); f = !0); } catch (r) { o = !0, n = r; } finally { try { if (!f && null != t.return && (u = t.return(), Object(u) !== u)) return; } finally { if (o) throw n; } } return a; } }
function _arrayWithHoles(r) { if (Array.isArray(r)) return r; }
const VSHADER_SOURCE = "\n  uniform mat4 modelMatrix;\n  uniform mat4 viewMatrix;\n  uniform mat4 projectionMatrix;\n\n  attribute vec3 aPosition;\n  attribute vec2 uv;\n\n  varying vec2 vUv;\n\n  void main() {\n    gl_Position = projectionMatrix * viewMatrix * modelMatrix * vec4(aPosition, 1.0);\n    vUv = uv;\n  }\n";
const FSHADER_SOURCE = "\n  #ifdef GL_ES\n  precision mediump float;\n  #endif\n\n  uniform vec4 uBaseColor;\n  uniform float uTextureWeight;\n  uniform int uTextureIndex;\n  uniform sampler2D uTexture0;\n  uniform sampler2D uTexture1;\n  uniform sampler2D uTexture2;\n  uniform sampler2D uTexture3;\n\n  varying vec2 vUv;\n\n  void main() {\n    vec4 texColor = texture2D(uTexture0, vUv);\n    if (uTextureIndex == 1) {\n      texColor = texture2D(uTexture1, vUv);\n    } else if (uTextureIndex == 2) {\n      texColor = texture2D(uTexture2, vUv);\n    } else if (uTextureIndex == 3) {\n      texColor = texture2D(uTexture3, vUv);\n    }\n\n    gl_FragColor = mix(uBaseColor, texColor, uTextureWeight);\n  }\n";
const WORLD_SIZE = 32;
const HALF_WORLD = WORLD_SIZE / 2;
const BIRD_X = -8;
const BIRD_Z = -10;
const FIREWORK_LAUNCHERS = [[-13, -13], [-5, -13], [5, -13], [13, -13], [-13, 13], [-5, 13], [5, 13], [13, 13]];
const WORLD_MAP = [[3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3], [3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3], [3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3], [3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3], [3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 3], [3, 0, 0, 0, 0, 0, 2, 0, 0, 0, 3, 0, 0, 0, 0, 4, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 3], [3, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 3], [3, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3], [3, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3], [3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3], [3, 0, 0, 0, 1, 1, 2, 1, 0, 0, 1, 1, 3, 1, 1, 2, 1, 1, 0, 0, 1, 4, 1, 1, 1, 2, 1, 0, 0, 0, 0, 3], [3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 3], [3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 3], [3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 3], [3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3], [3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3], [3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3], [3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3], [3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3], [3, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 1, 1, 0, 0, 0, 0, 0, 3], [3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3], [3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3], [3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3], [3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3], [3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3], [3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3], [3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3], [3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3], [3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3], [3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3], [3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3], [3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3]];
const stats = new _stats.default();
document.body.append(stats.dom);
let birdHelpStart = 0;
const gl = (0, _Context.default)();
if (!gl) {
  console.log("Failed to get WebGL context.");
}
if (!(0, _cuonUtils.initShaders)(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
  console.log("Failed to initialize shaders.");
}
gl.clearColor(0.55, 0.72, 0.95, 1.0);
gl.enable(gl.DEPTH_TEST);
const cube = new _Cube.default();
const camera = new _Camera.default(gl.canvas);
const world = createWorld();
const controls = new _Controls.default(gl, camera, world);
const status = createStatus();
loadTextures(gl, [_dirt.default, _grass.default, _stone.default, _wood.default]);
tick();
function createWorld() {
  const heights = WORLD_MAP.map(row => row.slice());
  const textures = heights.map((row, z) => row.map((height, x) => {
    const isGrove = Math.abs(x - 8) < 4 && Math.abs(z - 6) < 4;
    return isGrove ? 3 : height > 0 ? 2 : 0;
  }));
  return {
    heights,
    textures,
    isBlockedAt(worldX, worldZ) {
      const playerRadius = 0.12;
      const mapX = Math.floor(worldX + HALF_WORLD);
      const mapZ = Math.floor(worldZ + HALF_WORLD);
      if (mapX < 0 || mapX >= WORLD_SIZE || mapZ < 0 || mapZ >= WORLD_SIZE) {
        return true;
      }
      for (let z = Math.max(0, mapZ - 1); z <= Math.min(WORLD_SIZE - 1, mapZ + 1); z++) {
        for (let x = Math.max(0, mapX - 1); x <= Math.min(WORLD_SIZE - 1, mapX + 1); x++) {
          if (this.heights[z][x] > 0 && circleTouchesBlock(worldX, worldZ, playerRadius, x, z)) {
            return true;
          }
        }
      }
      return false;
    },
    addBlockInFront() {
      const cell = cellInFront();
      if (!cell) return;
      this.heights[cell.z][cell.x] = Math.min(4, this.heights[cell.z][cell.x] + 1);
      this.textures[cell.z][cell.x] = 0;
    },
    removeBlockInFront() {
      const cell = cellInFront();
      if (!cell) return;
      this.heights[cell.z][cell.x] = Math.max(0, this.heights[cell.z][cell.x] - 1);
    },
    helpBird() {
      if (birdHelpStart || distanceToBird() > 4) {
        return;
      }
      birdHelpStart = performance.now() / 1000;
    }
  };
}
function distanceToBird() {
  const dx = camera.eye.elements[0] - BIRD_X;
  const dz = camera.eye.elements[2] - BIRD_Z;
  return Math.sqrt(dx * dx + dz * dz);
}
function circleTouchesBlock(worldX, worldZ, radius, mapX, mapZ) {
  const minX = mapX - HALF_WORLD;
  const maxX = minX + 1;
  const minZ = mapZ - HALF_WORLD;
  const maxZ = minZ + 1;
  const closestX = Math.max(minX, Math.min(worldX, maxX));
  const closestZ = Math.max(minZ, Math.min(worldZ, maxZ));
  const dx = worldX - closestX;
  const dz = worldZ - closestZ;
  return dx * dx + dz * dz < radius * radius;
}
function cellInFront() {
  const f = camera.forwardVector();
  const x = camera.eye.elements[0] + f.elements[0] * 2;
  const z = camera.eye.elements[2] + f.elements[2] * 2;
  const mapX = Math.floor(x + HALF_WORLD);
  const mapZ = Math.floor(z + HALF_WORLD);
  if (mapX < 1 || mapX >= WORLD_SIZE - 1 || mapZ < 1 || mapZ >= WORLD_SIZE - 1) {
    return null;
  }
  return {
    x: mapX,
    z: mapZ
  };
}
function loadTextures(gl, images) {
  images.forEach((src, index) => {
    const texture = gl.createTexture();
    const image = new Image();
    image.onload = () => {
      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
      gl.activeTexture(gl.TEXTURE0 + index);
      gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
      gl.uniform1i(gl.getUniformLocation(gl.program, "uTexture".concat(index)), index);
    };
    image.src = src;
  });
}
function createStatus() {
  const panel = document.createElement("div");
  panel.className = "hud";
  panel.innerHTML = "\n    <h1>Hummingbird Garden</h1>\n    <p>WASD move | Q/E turn | drag mouse look | R add block | F delete block | H help bird</p>\n    <p id=\"story\">Find the hummingbird in the grove, then press H to help it fly.</p>\n  ";
  document.body.append(panel);
  const crosshair = document.createElement("div");
  crosshair.className = "crosshair";
  document.body.append(crosshair);
  return panel.querySelector("#story");
}
function tick() {
  stats.begin();
  controls.update();
  renderScene();
  updateStory();
  stats.end();
  requestAnimationFrame(tick);
}
function renderScene() {
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  drawSky();
  drawGround();
  drawTerrainPatches();
  drawMap();
  drawHummingbird(BIRD_X, birdY(), BIRD_Z);
  if (birdHelpStart) drawFireworks();
}
function birdY() {
  if (!birdHelpStart) {
    return 1.2;
  }
  const elapsed = performance.now() / 1000 - birdHelpStart;
  return 1.2 + Math.min(elapsed * 0.85, 6);
}
function drawSky() {
  drawCube([0, 0, 0], [220, 220, 220], [0.38, 0.48, 0.92, 1], 0, 0);
}
function drawGround() {
  drawCube([0, -0.05, 0], [WORLD_SIZE, 0.1, WORLD_SIZE], [0.55, 0.75, 0.32, 1], 1, 1);
}
function drawTerrainPatches() {
  drawCube([-8, 0.01, -9], [7, 0.04, 5], [0.45, 0.68, 0.27, 1], 1, 1);
  drawCube([6, 0.01, 8], [6, 0.04, 4], [0.45, 0.68, 0.27, 1], 1, 1);
  drawCube([3, 0.02, -6], [4, 0.06, 3], [0.48, 0.72, 0.33, 1], 1, 1);
}
function drawMap() {
  for (let z = 0; z < WORLD_SIZE; z++) {
    for (let x = 0; x < WORLD_SIZE; x++) {
      const height = world.heights[z][x];
      const textureIndex = world.textures[z][x];
      for (let y = 0; y < height; y++) {
        drawCube([x - HALF_WORLD + 0.5, y + 0.5, z - HALF_WORLD + 0.5], [1, 1, 1], [1, 1, 1, 1], textureIndex, 1);
      }
    }
  }
}
function drawHummingbird(x, y, z) {
  const t = performance.now() * 0.006;
  const bob = Math.sin(t) * 0.08;
  const flap = Math.sin(t * 8) * 35;
  const body = new _cuonMatrixCse.Matrix4().setTranslate(x, y + bob, z).scale(0.9, 0.9, 0.9);
  drawPart(body, [0, 0, 0], [0.75, 0.42, 0.34], [0.1, 0.62, 0.43, 1]);
  drawPart(body, [0.36, -0.07, 0.01], [0.22, 0.17, 0.24], [0.86, 0.12, 0.26, 1]);
  const head = new _cuonMatrixCse.Matrix4(body).translate(0.55, 0.2, 0);
  drawPart(head, [0, 0, 0], [0.34, 0.3, 0.3], [0.28, 0.82, 0.57, 1]);
  drawPart(head, [0.2, 0.03, 0], [0.42, 0.06, 0.06], [0.08, 0.07, 0.06, 1]);
  drawPart(head, [0.05, 0.08, 0.18], [0.05, 0.05, 0.05], [0.02, 0.02, 0.02, 1]);
  drawWing(body, 1, flap);
  drawWing(body, -1, -flap);
  drawPart(body, [-0.52, -0.02, 0], [0.42, 0.08, 0.18], [0.05, 0.3, 0.22, 1]);
}
function drawWing(parent, side, angle) {
  const wing = new _cuonMatrixCse.Matrix4(parent);
  wing.translate(-0.08, 0.1, side * 0.24);
  wing.rotate(angle, 0, 0, 1);
  drawPart(wing, [-0.38, 0, side * 0.14], [0.72, 0.07, 0.24], [0.1, 0.44, 0.52, 1]);
  drawPart(wing, [-0.86, 0, side * 0.22], [0.52, 0.05, 0.16], [0.07, 0.28, 0.36, 1]);
}
function drawFireworks() {
  const elapsed = performance.now() / 1000 - birdHelpStart;
  const colors = [[1, 0.25, 0.2, 1], [1, 0.85, 0.2, 1], [0.2, 0.75, 1, 1], [0.7, 0.3, 1, 1], [0.2, 1, 0.45, 1], [1, 0.45, 0.05, 1], [0.15, 1, 0.95, 1], [1, 0.2, 0.75, 1]];
  FIREWORK_LAUNCHERS.forEach((_ref, launcherIndex) => {
    let _ref2 = _slicedToArray(_ref, 2),
      x = _ref2[0],
      z = _ref2[1];
    const cycle = (elapsed + launcherIndex * 0.18) % 3.4;
    const color = colors[launcherIndex % colors.length];
    const peakY = 8.5 + launcherIndex % 4 * 1.15;
    const driftX = Math.sin(launcherIndex * 1.7) * 0.8;
    const driftZ = Math.cos(launcherIndex * 1.3) * 0.8;
    if (cycle < 1.55) {
      const t = cycle / 1.55;
      const rocketY = 0.35 + t * peakY;
      const rocketX = x + driftX * t;
      const rocketZ = z + driftZ * t;
      drawCube([rocketX, rocketY, rocketZ], [0.2, 0.6, 0.2], color, 0, 0);
      drawCube([rocketX, rocketY - 0.58, rocketZ], [0.1, 0.7, 0.1], [1, 0.55, 0.12, 1], 0, 0);
      return;
    }
    const burstAge = cycle - 1.55;
    const burstCenter = [x + driftX, peakY + 0.8, z + driftZ];
    drawExplosion(burstCenter, burstAge, color, colors);
  });
}
function drawExplosion(center, age, baseColor, colors) {
  const radius = Math.min(1.0 + age * 2.2, 4.8);
  const particleCount = 12;
  if (age > 1.35) {
    return;
  }
  for (let i = 0; i < particleCount; i++) {
    const angle = Math.PI * 2 * i / particleCount;
    const vertical = (i % 5 - 2) * 0.32;
    const color = i % 3 === 0 ? baseColor : colors[(i + Math.floor(age * 5)) % colors.length];
    const sparkle = 0.14 + i % 2 * 0.06;
    drawCube([center[0] + Math.cos(angle) * radius, center[1] + vertical + Math.sin(age * 6 + i) * 0.18, center[2] + Math.sin(angle) * radius], [sparkle, sparkle, sparkle], color, 0, 0);
  }
}
function drawPart(parent, translation, scale, color) {
  const matrix = new _cuonMatrixCse.Matrix4(parent);
  matrix.translate(...translation);
  matrix.scale(...scale);
  cube.render(gl, camera, {
    matrix,
    color
  });
}
function drawCube(translation, scale, color, textureIndex, textureWeight) {
  const matrix = new _cuonMatrixCse.Matrix4();
  matrix.setTranslate(...translation);
  matrix.scale(...scale);
  cube.render(gl, camera, {
    matrix,
    color,
    textureIndex,
    textureWeight
  });
}
function updateStory() {
  const nearBird = distanceToBird() < 4;
  status.textContent = nearBird ? birdHelpStart ? "The hummingbird is flying free." : "You found the hummingbird. Press H to help it fly." : "Find the hummingbird in the grove, then press H to help it fly.";
}
},{"./styles.css":"src/styles.css","../lib/cuon-utils":"lib/cuon-utils.js","../lib/cuon-matrix-cse160":"lib/cuon-matrix-cse160.js","./Context":"src/Context.js","stats.js":"node_modules/stats.js/build/stats.min.js","./Cube":"src/Cube.js","./Camera":"src/Camera.js","./Controls":"src/Controls.js","./img/dirt.svg":"src/img/dirt.svg","./img/grass.svg":"src/img/grass.svg","./img/stone.svg":"src/img/stone.svg","./img/wood.svg":"src/img/wood.svg"}],"node_modules/parcel-bundler/src/builtins/hmr-runtime.js":[function(require,module,exports) {
var global = arguments[3];
var OVERLAY_ID = '__parcel__error__overlay__';
var OldModule = module.bundle.Module;
function Module(moduleName) {
  OldModule.call(this, moduleName);
  this.hot = {
    data: module.bundle.hotData,
    _acceptCallbacks: [],
    _disposeCallbacks: [],
    accept: function (fn) {
      this._acceptCallbacks.push(fn || function () {});
    },
    dispose: function (fn) {
      this._disposeCallbacks.push(fn);
    }
  };
  module.bundle.hotData = null;
}
module.bundle.Module = Module;
var checkedAssets, assetsToAccept;
var parent = module.bundle.parent;
if ((!parent || !parent.isParcelRequire) && typeof WebSocket !== 'undefined') {
  var hostname = "0.0.0.0" || location.hostname;
  var protocol = location.protocol === 'https:' ? 'wss' : 'ws';
  var ws = new WebSocket(protocol + '://' + hostname + ':' + "56679" + '/');
  ws.onmessage = function (event) {
    checkedAssets = {};
    assetsToAccept = [];
    var data = JSON.parse(event.data);
    if (data.type === 'update') {
      var handled = false;
      data.assets.forEach(function (asset) {
        if (!asset.isNew) {
          var didAccept = hmrAcceptCheck(global.parcelRequire, asset.id);
          if (didAccept) {
            handled = true;
          }
        }
      });

      // Enable HMR for CSS by default.
      handled = handled || data.assets.every(function (asset) {
        return asset.type === 'css' && asset.generated.js;
      });
      if (handled) {
        console.clear();
        data.assets.forEach(function (asset) {
          hmrApply(global.parcelRequire, asset);
        });
        assetsToAccept.forEach(function (v) {
          hmrAcceptRun(v[0], v[1]);
        });
      } else if (location.reload) {
        // `location` global exists in a web worker context but lacks `.reload()` function.
        location.reload();
      }
    }
    if (data.type === 'reload') {
      ws.close();
      ws.onclose = function () {
        location.reload();
      };
    }
    if (data.type === 'error-resolved') {
      console.log('[parcel] ✨ Error resolved');
      removeErrorOverlay();
    }
    if (data.type === 'error') {
      console.error('[parcel] 🚨  ' + data.error.message + '\n' + data.error.stack);
      removeErrorOverlay();
      var overlay = createErrorOverlay(data);
      document.body.appendChild(overlay);
    }
  };
}
function removeErrorOverlay() {
  var overlay = document.getElementById(OVERLAY_ID);
  if (overlay) {
    overlay.remove();
  }
}
function createErrorOverlay(data) {
  var overlay = document.createElement('div');
  overlay.id = OVERLAY_ID;

  // html encode message and stack trace
  var message = document.createElement('div');
  var stackTrace = document.createElement('pre');
  message.innerText = data.error.message;
  stackTrace.innerText = data.error.stack;
  overlay.innerHTML = '<div style="background: black; font-size: 16px; color: white; position: fixed; height: 100%; width: 100%; top: 0px; left: 0px; padding: 30px; opacity: 0.85; font-family: Menlo, Consolas, monospace; z-index: 9999;">' + '<span style="background: red; padding: 2px 4px; border-radius: 2px;">ERROR</span>' + '<span style="top: 2px; margin-left: 5px; position: relative;">🚨</span>' + '<div style="font-size: 18px; font-weight: bold; margin-top: 20px;">' + message.innerHTML + '</div>' + '<pre>' + stackTrace.innerHTML + '</pre>' + '</div>';
  return overlay;
}
function getParents(bundle, id) {
  var modules = bundle.modules;
  if (!modules) {
    return [];
  }
  var parents = [];
  var k, d, dep;
  for (k in modules) {
    for (d in modules[k][1]) {
      dep = modules[k][1][d];
      if (dep === id || Array.isArray(dep) && dep[dep.length - 1] === id) {
        parents.push(k);
      }
    }
  }
  if (bundle.parent) {
    parents = parents.concat(getParents(bundle.parent, id));
  }
  return parents;
}
function hmrApply(bundle, asset) {
  var modules = bundle.modules;
  if (!modules) {
    return;
  }
  if (modules[asset.id] || !bundle.parent) {
    var fn = new Function('require', 'module', 'exports', asset.generated.js);
    asset.isNew = !modules[asset.id];
    modules[asset.id] = [fn, asset.deps];
  } else if (bundle.parent) {
    hmrApply(bundle.parent, asset);
  }
}
function hmrAcceptCheck(bundle, id) {
  var modules = bundle.modules;
  if (!modules) {
    return;
  }
  if (!modules[id] && bundle.parent) {
    return hmrAcceptCheck(bundle.parent, id);
  }
  if (checkedAssets[id]) {
    return;
  }
  checkedAssets[id] = true;
  var cached = bundle.cache[id];
  assetsToAccept.push([bundle, id]);
  if (cached && cached.hot && cached.hot._acceptCallbacks.length) {
    return true;
  }
  return getParents(global.parcelRequire, id).some(function (id) {
    return hmrAcceptCheck(global.parcelRequire, id);
  });
}
function hmrAcceptRun(bundle, id) {
  var cached = bundle.cache[id];
  bundle.hotData = {};
  if (cached) {
    cached.hot.data = bundle.hotData;
  }
  if (cached && cached.hot && cached.hot._disposeCallbacks.length) {
    cached.hot._disposeCallbacks.forEach(function (cb) {
      cb(bundle.hotData);
    });
  }
  delete bundle.cache[id];
  bundle(id);
  cached = bundle.cache[id];
  if (cached && cached.hot && cached.hot._acceptCallbacks.length) {
    cached.hot._acceptCallbacks.forEach(function (cb) {
      cb();
    });
    return true;
  }
}
},{}]},{},["node_modules/parcel-bundler/src/builtins/hmr-runtime.js","src/index.js"], null)
//# sourceMappingURL=/src.a2b27638.js.map