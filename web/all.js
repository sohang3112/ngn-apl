
(function(/*! Stitch !*/) {
  if (!this.require) {
    var modules = {}, cache = {}, require = function(name, root) {
      var path = expand(root, name), module = cache[path], fn;
      if (module) {
        return module.exports;
      } else if (fn = modules[path] || modules[path = expand(path, './index')]) {
        module = {id: path, exports: {}};
        try {
          cache[path] = module;
          fn.apply(module.exports, [module.exports, function(name) {
            return require(name, dirname(path));
          }, module]);
          return module.exports;
        } catch (err) {
          delete cache[path];
          throw err;
        }
      } else {
        throw 'module \'' + name + '\' not found';
      }
    }, expand = function(root, name) {
      var results = [], parts, part;
      if (/^\.\.?(\/|$)/.test(name)) {
        parts = [root, name].join('/').split('/');
      } else {
        parts = name.split('/');
      }
      for (var i = 0, length = parts.length; i < length; i++) {
        part = parts[i];
        if (part == '..') {
          results.pop();
        } else if (part != '.' && part != '') {
          results.push(part);
        }
      }
      return results.join('/');
    }, dirname = function(path) {
      return path.split('/').slice(0, -1).join('/');
    };
    this.require = function(name) {
      return require(name, '');
    }
    this.require.define = function(bundle) {
      for (var key in bundle)
        modules[key] = bundle[key];
    };
  }
  return this.require.define;
}).call(this)({"apl": function(exports, require, module) {(function() {
  var compile, exports;

  exports = module.exports = function(aplSource) {
    return require('./compiler').exec(aplSource);
  };

  exports.createGlobalContext = function() {
    return require('./helpers').inherit(require('./vocabulary'));
  };

  compile = require("./compiler").compile;

  exports.compile = function(code) {
    return "(function(){" + (compile(code, {
      embedded: true
    })) + "})()";
  };

  exports.fn = {
    compile: function(code) {
      return "function(){" + (compile(code, {
        embedded: true
      })) + "}";
    }
  };

}).call(this);
}, "array": function(exports, require, module) {(function() {
  var APLArray, DomainError, LengthError, assert, extend, isInt, prod, strideForShape, _ref, _ref1;

  _ref = require('./helpers'), assert = _ref.assert, extend = _ref.extend, prod = _ref.prod, isInt = _ref.isInt;

  _ref1 = require('./errors'), LengthError = _ref1.LengthError, DomainError = _ref1.DomainError;

  this.APLArray = APLArray = (function() {
    function APLArray(data, shape, stride, offset) {
      var i, x, _i, _j, _len, _len1, _ref2, _ref3;
      this.data = data;
      this.shape = shape;
      this.stride = stride;
      this.offset = offset != null ? offset : 0;
      if (this.shape == null) {
        this.shape = [this.data.length];
      }
      if (this.stride == null) {
        this.stride = strideForShape(this.shape);
      }
      assert(this.data instanceof Array || typeof this.data === 'string');
      assert(this.shape instanceof Array);
      assert(this.stride instanceof Array);
      assert(this.data.length === 0 || isInt(this.offset, 0, this.data.length));
      assert(this.shape.length === this.stride.length);
      _ref2 = this.shape;
      for (_i = 0, _len = _ref2.length; _i < _len; _i++) {
        x = _ref2[_i];
        assert(isInt(x, 0));
      }
      if (this.data.length) {
        _ref3 = this.stride;
        for (i = _j = 0, _len1 = _ref3.length; _j < _len1; i = ++_j) {
          x = _ref3[i];
          assert(isInt(x, -this.data.length, this.data.length + 1));
        }
      } else {
        assert(prod(this.shape) === 0);
      }
    }

    APLArray.prototype.get = function(indices) {
      var axis, index, p, _i, _len;
      p = this.offset;
      for (axis = _i = 0, _len = indices.length; _i < _len; axis = ++_i) {
        index = indices[axis];
        p += index * this.stride[axis];
      }
      return this.data[p];
    };

    APLArray.prototype.empty = function() {
      var d, _i, _len, _ref2;
      _ref2 = this.shape;
      for (_i = 0, _len = _ref2.length; _i < _len; _i++) {
        d = _ref2[_i];
        if (!d) {
          return true;
        }
      }
      return false;
    };

    APLArray.prototype.each = function(f) {
      var axis, indices, p;
      assert(typeof f === 'function');
      if (this.empty()) {
        return;
      }
      p = this.offset;
      indices = (function() {
        var _i, _len, _ref2, _results;
        _ref2 = this.shape;
        _results = [];
        for (_i = 0, _len = _ref2.length; _i < _len; _i++) {
          axis = _ref2[_i];
          _results.push(0);
        }
        return _results;
      }).call(this);
      while (true) {
        f(this.data[p], indices);
        axis = this.shape.length - 1;
        while (axis >= 0 && indices[axis] + 1 === this.shape[axis]) {
          p -= indices[axis] * this.stride[axis];
          indices[axis--] = 0;
        }
        if (axis < 0) {
          break;
        }
        indices[axis]++;
        p += this.stride[axis];
      }
    };

    APLArray.prototype.each2 = function(a, f) {
      var axis, indices, p, q, _i, _ref2;
      assert(a instanceof APLArray);
      assert(typeof f === 'function');
      assert(this.shape.length === a.shape.length);
      for (axis = _i = 0, _ref2 = this.shape.length; 0 <= _ref2 ? _i < _ref2 : _i > _ref2; axis = 0 <= _ref2 ? ++_i : --_i) {
        assert(this.shape[axis] === a.shape[axis]);
      }
      if (this.empty()) {
        return;
      }
      p = this.offset;
      q = a.offset;
      indices = (function() {
        var _j, _len, _ref3, _results;
        _ref3 = this.shape;
        _results = [];
        for (_j = 0, _len = _ref3.length; _j < _len; _j++) {
          axis = _ref3[_j];
          _results.push(0);
        }
        return _results;
      }).call(this);
      while (true) {
        f(this.data[p], a.data[q], indices);
        axis = this.shape.length - 1;
        while (axis >= 0 && indices[axis] + 1 === this.shape[axis]) {
          p -= indices[axis] * this.stride[axis];
          q -= indices[axis] * a.stride[axis];
          indices[axis--] = 0;
        }
        if (axis < 0) {
          break;
        }
        indices[axis]++;
        p += this.stride[axis];
        q += a.stride[axis];
      }
    };

    APLArray.prototype.map = function(f) {
      var data;
      assert(typeof f === 'function');
      data = [];
      this.each(function(x, indices) {
        return data.push(f(x, indices));
      });
      return new APLArray(data, this.shape);
    };

    APLArray.prototype.map2 = function(a, f) {
      var data;
      assert(a instanceof APLArray);
      assert(typeof f === 'function');
      data = [];
      this.each2(a, function(x, y, indices) {
        return data.push(f(x, y, indices));
      });
      return new APLArray(data, this.shape);
    };

    APLArray.prototype.toArray = function(limit) {
      var e, r;
      if (limit == null) {
        limit = Infinity;
      }
      r = [];
      try {
        this.each(function(x) {
          if (r.length >= limit) {
            throw 'break';
          }
          r.push(x);
        });
      } catch (_error) {
        e = _error;
        if (e !== 'break') {
          throw e;
        }
      }
      return r;
    };

    APLArray.prototype.toInt = function(start, end) {
      var r;
      if (start == null) {
        start = -Infinity;
      }
      if (end == null) {
        end = Infinity;
      }
      r = this.unwrap();
      if (typeof r !== 'number' || r !== ~~r || !((start <= r && r < end))) {
        throw DomainError();
      }
      return r;
    };

    APLArray.prototype.toBool = function() {
      return this.toInt(0, 2);
    };

    APLArray.prototype.isSingleton = function() {
      var n, _i, _len, _ref2;
      _ref2 = this.shape;
      for (_i = 0, _len = _ref2.length; _i < _len; _i++) {
        n = _ref2[_i];
        if (n !== 1) {
          return false;
        }
      }
      return true;
    };

    APLArray.prototype.unwrap = function() {
      if (prod(this.shape) !== 1) {
        throw LengthError();
      }
      return this.data[this.offset];
    };

    APLArray.prototype.getPrototype = function() {
      if (this.empty() || typeof this.data[this.offset] !== 'string') {
        return 0;
      } else {
        return ' ';
      }
    };

    return APLArray;

  })();

  this.strideForShape = strideForShape = function(shape) {
    var i, r, _i, _ref2;
    assert(shape instanceof Array);
    if (shape.length === 0) {
      return [];
    }
    r = Array(shape.length);
    r[r.length - 1] = 1;
    for (i = _i = _ref2 = r.length - 2; _i >= 0; i = _i += -1) {
      assert(isInt(shape[i], 0));
      r[i] = r[i + 1] * shape[i + 1];
    }
    return r;
  };

  extend(APLArray, {
    zero: new APLArray([0], []),
    one: new APLArray([1], []),
    zilde: new APLArray([], [0]),
    scalar: function(x) {
      return new APLArray([x], []);
    }
  });

  APLArray.bool = [APLArray.zero, APLArray.one];

}).call(this);
}, "command": function(exports, require, module) {(function() {
  var compile, exec, fs, isArray, nodes, optimist, printAST, repl, _ref,
    __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  optimist = require('optimist');

  fs = require('fs');

  _ref = require('./compiler'), nodes = _ref.nodes, compile = _ref.compile, exec = _ref.exec;

  this.main = function() {
    var a, aplCode, argv, b, ctx, filename, inherit, jsCode, k, knownOptions, opts, vocabulary;
    argv = optimist.usage('Usage: apl [options] path/to/script.apl [args]\n\nIf called without options, `apl` will run your script.').describe({
      c: 'compile to JavaScript and save as .js files',
      h: 'display this help message',
      i: 'run an interactive APL REPL',
      n: 'print out the parse tree that the parser produces',
      p: 'print out the compiled JavaScript',
      s: 'listen for and compile scripts over stdio'
    }).alias({
      c: 'compile',
      h: 'help',
      i: 'interactive',
      n: 'nodes',
      p: 'print',
      s: 'stdio'
    }).boolean('chinps'.split('')).argv;
    if (argv.help) {
      return optimist.showHelp();
    }
    knownOptions = 'c compile h help i interactive n nodes p print s stdio _'.split(' ');
    for (k in argv) {
      if (!((__indexOf.call(knownOptions, k) < 0) && !k.match(/^\$\d+/))) {
        continue;
      }
      process.stderr.write("Unknown option, \"" + k + "\"\n\n");
      optimist.showHelp();
      return;
    }
    if (argv.interactive && (argv.compile || argv.nodes || argv.print || argv.stdio)) {
      process.stderr.write('Option -i (--interactive) is incompatible with the following options:\n  -c, --compile\n  -n, --nodes\n  -p, --print\n  -s, --stdio\n\n');
      optimist.showHelp();
      return;
    }
    if (argv.interactive && argv._.length) {
      process.stderr.write('Option -i (--interactive) cannot be used with positional arguments.\n\n');
      optimist.showHelp();
      return;
    }
    inherit = require('./helpers').inherit;
    vocabulary = require('./vocabulary');
    ctx = inherit(vocabulary, {
      '⍵': (function() {
        var _i, _len, _ref1, _results;
        _ref1 = argv._;
        _results = [];
        for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
          a = _ref1[_i];
          _results.push(a.split(''));
        }
        return _results;
      })()
    });
    if (argv.interactive || !(argv._.length || argv.stdio)) {
      return repl(ctx);
    }
    opts = {};
    if (argv.stdio) {
      opts.file = '<stdin>';
      aplCode = Buffer.concat((function() {
        var _results;
        _results = [];
        while (true) {
          b = new Buffer(1024);
          k = fs.readSync(0, b, 0, b.length, null);
          if (!k) {
            break;
          }
          _results.push(b.slice(0, k));
        }
        return _results;
      })()).toString('utf8');
    } else {
      opts.file = argv._[0];
      aplCode = fs.readFileSync(opts.file, 'utf8');
    }
    if (argv.nodes) {
      printAST(nodes(aplCode, opts));
      return;
    }
    jsCode = compile(aplCode, opts);
    if (argv.compile) {
      jsCode = "\#!/usr/bin/env node\nvar _ = require('apl').createGlobalContext();\n" + jsCode;
      if (argv.stdio || argv.print) {
        return process.stdout.write(jsCode);
      } else {
        filename = argv._[0].replace(/\.(apl|coffee)$/, '.js');
        return fs.writeFileSync(filename, jsCode, 'utf8');
      }
    } else {
      return (new Function("var _ = arguments[0];\n" + jsCode))(require('./apl').createGlobalContext());
    }
  };

  repl = function(ctx) {
    var format, readline, rl;
    readline = require('readline');
    rl = readline.createInterface(process.stdin, process.stdout);
    rl.setPrompt('APL> ');
    format = require('./vocabulary/format').format;
    rl.on('line', function(line) {
      var e, result;
      try {
        if (!line.match(/^[\ \t\f\r\n]*$/)) {
          result = exec(line, {
            ctx: ctx,
            exposeTopLevelScope: true
          });
          process.stdout.write(format(result).join('\n') + '\n');
        }
      } catch (_error) {
        e = _error;
        console.error(e);
      }
      rl.prompt();
    });
    rl.on('close', function() {
      process.stdout.write('\n');
      process.exit(0);
    });
    rl.prompt();
  };

  printAST = function(x, indent) {
    var y, _i, _len, _ref1;
    if (indent == null) {
      indent = '';
    }
    if (isArray(x)) {
      if (x.length === 2 && !isArray(x[1])) {
        console.info(indent + x[0] + ' ' + JSON.stringify(x[1]));
      } else {
        console.info(indent + x[0]);
        _ref1 = x.slice(1);
        for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
          y = _ref1[_i];
          printAST(y, indent + '  ');
        }
      }
    } else {
      console.info(indent + JSON.stringify(x));
    }
  };

  isArray = function(x) {
    return ((x != null ? x.length : void 0) != null) && typeof x !== 'string';
  };

}).call(this);
}, "compiler": function(exports, require, module) {(function() {
  var SyntaxError, all, assert, compile, compilerError, inherit, nodes, parser, resolveExprs, toJavaScript, vocabulary, _ref;

  parser = require('./parser');

  vocabulary = require('./vocabulary');

  _ref = require('./helpers'), inherit = _ref.inherit, assert = _ref.assert, all = _ref.all;

  SyntaxError = require('./errors').SyntaxError;

  resolveExprs = function(ast, opts) {
    var k, m, node, queue, scopeNode, v, varInfo, vars, visit, _i, _j, _len, _len1, _ref1, _ref2, _ref3;
    if (opts == null) {
      opts = {};
    }
    ast.vars = {
      '⍺': {
        type: 'X',
        jsCode: '_a'
      },
      '⍵': {
        type: 'X',
        jsCode: '_w'
      },
      '∇': {
        type: 'F',
        jsCode: 'arguments.callee'
      }
    };
    _ref1 = opts.ctx;
    for (k in _ref1) {
      v = _ref1[k];
      ast.vars[k] = varInfo = {
        type: 'X',
        jsCode: "_[" + (JSON.stringify(k)) + "]"
      };
      if (typeof v === 'function') {
        varInfo.type = 'F';
        if ((m = v.aplMetaInfo) != null) {
          if (m.isPrefixAdverb) {
            varInfo.isPrefixAdverb = true;
          }
          if (m.isPostfixAdverb) {
            varInfo.isPostfixAdverb = true;
          }
          if (m.isConjunction) {
            varInfo.isConjunction = true;
          }
        }
        if (/^[gs]et_.*/.test(k)) {
          ast.vars[k.slice(4)] = {
            type: 'X'
          };
        }
      }
    }
    if (opts.vars) {
      _ref2 = opts.vars;
      for (_i = 0, _len = _ref2.length; _i < _len; _i++) {
        v = _ref2[_i];
        ast.vars[v.name] = {
          type: 'X',
          jsCode: v.name
        };
      }
    }
    ast.scopeDepth = 0;
    if (opts.exposeTopLevelScope) {
      ast.scopeObjectJS = '_';
      ast.scopeInitJS = '';
    } else {
      ast.scopeObjectJS = '_0';
      ast.scopeInitJS = "var _0 = {}";
    }
    queue = [ast];
    while (queue.length) {
      vars = (scopeNode = queue.shift()).vars;
      visit = function(node) {
        var a, c, h, i, j, name, t, x, _j, _k, _len1, _ref10, _ref11, _ref12, _ref13, _ref14, _ref15, _ref16, _ref17, _ref18, _ref19, _ref20, _ref21, _ref22, _ref23, _ref24, _ref3, _ref4, _ref5, _ref6, _ref7, _ref8, _ref9;
        node.scopeNode = scopeNode;
        switch (node[0]) {
          case 'body':
            node.vars = inherit(vars);
            node.scopeDepth = scopeNode.scopeDepth + 1;
            node.scopeObjectJS = '_' + node.scopeDepth;
            node.scopeInitJS = "var " + node.scopeObjectJS + " = {}";
            queue.push(node);
            return null;
          case 'guard':
            visit(node[1]);
            return visit(node[2]);
          case 'assign':
            if (!(node[1] instanceof Array && node[1][0] === 'symbol')) {
              compilerError(node, opts, 'Compound assignment is not supported.');
            }
            name = node[1][1];
            assert(typeof name === 'string');
            h = visit(node[2]);
            if (vars[name]) {
              if (vars[name].type !== h.type) {
                compilerError(node, opts, ("Inconsistent usage of symbol '" + name + "', it is ") + "assigned both data and functions.");
              }
            } else {
              vars[name] = {
                type: h.type,
                jsCode: "" + scopeNode.scopeObjectJS + "[" + (JSON.stringify(name)) + "]"
              };
            }
            return h;
          case 'symbol':
            name = node[1];
            if (((_ref3 = (v = vars["get_" + name])) != null ? _ref3.type : void 0) === 'F') {
              v.used = true;
              return {
                type: 'X'
              };
            } else {
              v = vars[name];
              if (!v) {
                compilerError(node, opts, "Symbol '" + name + "' is referenced before assignment.");
              }
              v.used = true;
              return v;
            }
            break;
          case 'lambda':
            visit(node[1]);
            return {
              type: 'F'
            };
          case 'string':
          case 'number':
          case 'embedded':
            return {
              type: 'X'
            };
          case 'index':
            _ref4 = node.slice(2);
            for (_j = 0, _len1 = _ref4.length; _j < _len1; _j++) {
              c = _ref4[_j];
              if (!(c !== null)) {
                continue;
              }
              t = visit(c);
              if (t.type !== 'X') {
                compilerError(node, opts, 'Only expressions of type data can be used as an index.');
              }
            }
            return visit(node[1]);
          case 'expr':
            a = node.slice(1);
            h = Array(a.length);
            for (i = _k = _ref5 = a.length - 1; _ref5 <= 0 ? _k <= 0 : _k >= 0; i = _ref5 <= 0 ? ++_k : --_k) {
              h[i] = visit(a[i]);
            }
            i = 0;
            while (i < a.length - 1) {
              if ((h[i].type === (_ref6 = h[i + 1].type) && _ref6 === 'X')) {
                j = i + 2;
                while (j < a.length && h[j].type === 'X') {
                  j++;
                }
                [].splice.apply(a, [i, j - i].concat(_ref7 = [['vector'].concat(a.slice(i, j))])), _ref7;
                [].splice.apply(h, [i, j - i].concat(_ref8 = [
                  {
                    type: 'X'
                  }
                ])), _ref8;
              } else {
                i++;
              }
            }
            i = a.length - 2;
            while (--i >= 0) {
              if (h[i + 1].isConjunction && (h[i].type === 'F' || h[i + 2].type === 'F')) {
                [].splice.apply(a, [i, (i + 3) - i].concat(_ref9 = [['conjunction'].concat(a.slice(i, i + 3))])), _ref9;
                [].splice.apply(h, [i, (i + 3) - i].concat(_ref10 = [
                  {
                    type: 'F'
                  }
                ])), _ref10;
                i--;
              }
            }
            i = 0;
            while (i < a.length - 1) {
              if (h[i].type === 'F' && h[i + 1].isPostfixAdverb) {
                [].splice.apply(a, [i, (i + 2) - i].concat(_ref11 = [['postfixAdverb'].concat(a.slice(i, i + 2))])), _ref11;
                [].splice.apply(h, [i, (i + 2) - i].concat(_ref12 = [
                  {
                    type: 'F'
                  }
                ])), _ref12;
              } else {
                i++;
              }
            }
            i = a.length - 1;
            while (--i >= 0) {
              if (h[i].isPrefixAdverb && h[i + 1].type === 'F') {
                [].splice.apply(a, [i, (i + 2) - i].concat(_ref13 = [['prefixAdverb'].concat(a.slice(i, i + 2))])), _ref13;
                [].splice.apply(h, [i, (i + 2) - i].concat(_ref14 = [
                  {
                    type: 'F'
                  }
                ])), _ref14;
              }
            }
            if (h.length === 2 && (h[0].type === (_ref15 = h[1].type) && _ref15 === 'F')) {
              a = [['hook'].concat(a)];
              h = [
                {
                  type: 'F'
                }
              ];
            }
            if (h.length >= 3 && h.length % 2 === 1 && all((function() {
              var _l, _len2, _results;
              _results = [];
              for (_l = 0, _len2 = h.length; _l < _len2; _l++) {
                x = h[_l];
                _results.push(x.type === 'F');
              }
              return _results;
            })())) {
              a = [['fork'].concat(a)];
              h = [
                {
                  type: 'F'
                }
              ];
            }
            if (h[h.length - 1].type === 'F') {
              if (h.length > 1) {
                compilerError(a[h.length - 1], opts, 'Trailing function in expression');
              }
            } else {
              while (h.length > 1) {
                if (h.length === 2 || h[h.length - 3].type === 'F') {
                  [].splice.apply(a, [(_ref16 = h.length - 2), 9e9].concat(_ref17 = [['monadic'].concat(a.slice(h.length - 2))])), _ref17;
                  [].splice.apply(h, [(_ref18 = h.length - 2), 9e9].concat(_ref19 = [
                    {
                      type: 'X'
                    }
                  ])), _ref19;
                } else {
                  [].splice.apply(a, [(_ref20 = h.length - 3), 9e9].concat(_ref21 = [['dyadic'].concat(a.slice(h.length - 3))])), _ref21;
                  [].splice.apply(h, [(_ref22 = h.length - 3), 9e9].concat(_ref23 = [
                    {
                      type: 'X'
                    }
                  ])), _ref23;
                }
              }
            }
            [].splice.apply(node, [0, 9e9].concat(_ref24 = a[0])), _ref24;
            return h[0];
          default:
            return assert(false, "Unrecognised node type, '" + node[0] + "'");
        }
      };
      _ref3 = scopeNode.slice(1);
      for (_j = 0, _len1 = _ref3.length; _j < _len1; _j++) {
        node = _ref3[_j];
        visit(node);
      }
    }
  };

  toJavaScript = function(node) {
    var a, c, child, d, i, n, name, s, v, vars, x, _i, _len, _ref1, _ref2, _ref3;
    switch (node[0]) {
      case 'body':
        if (node.length === 1) {
          return 'return [];\n';
        } else {
          a = [node.scopeInitJS];
          _ref1 = node.slice(1);
          for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
            child = _ref1[_i];
            a.push(toJavaScript(child));
          }
          a[a.length - 1] = "return " + a[a.length - 1] + ";";
          return a.join(';\n');
        }
        break;
      case 'guard':
        return "if (_._bool(" + (toJavaScript(node[1])) + ")) {\n  return " + (toJavaScript(node[2])) + ";\n}";
      case 'assign':
        if (!(node[1] instanceof Array && node[1].length === 2 && node[1][0] === 'symbol')) {
          compilerError(node, opts, 'Compound assignment is not supported.');
        }
        name = node[1][1];
        assert(typeof name === 'string');
        if (name === '∇') {
          compilerError(node, opts, 'Assignment to ∇ is not allowed.');
        }
        vars = node.scopeNode.vars;
        if (((_ref2 = (v = vars["set_" + name])) != null ? _ref2.type : void 0) === 'F') {
          v.used = true;
          return "" + v.jsCode + "(" + (toJavaScript(node[2])) + ")";
        } else {
          return "" + vars[name].jsCode + " = " + (toJavaScript(node[2]));
        }
        break;
      case 'symbol':
        name = node[1];
        vars = node.scopeNode.vars;
        if (((_ref3 = (v = vars["get_" + name])) != null ? _ref3.type : void 0) === 'F') {
          v.used = true;
          return "" + v.jsCode + "()";
        } else {
          v = vars[name];
          v.used = true;
          return v.jsCode;
        }
        break;
      case 'lambda':
        return "function (_w, _a) {\n  " + (toJavaScript(node[1])) + "\n}";
      case 'string':
        s = node[1];
        d = s[0];
        return "_._aplify(" + (d + s.slice(1, -1).replace(RegExp("" + (d + d), "g"), '\\' + d) + d) + ")";
      case 'number':
        s = node[1].replace(/¯/g, '-');
        a = (function() {
          var _j, _len1, _ref4, _results;
          _ref4 = s.split(/j/i);
          _results = [];
          for (_j = 0, _len1 = _ref4.length; _j < _len1; _j++) {
            x = _ref4[_j];
            if (x === '-') {
              _results.push('Infinity');
            } else if (x === '--') {
              _results.push('-Infinity');
            } else if (x.match(/^-?0x/i)) {
              _results.push(parseInt(x, 16));
            } else {
              _results.push(parseFloat(x));
            }
          }
          return _results;
        })();
        if (a.length === 1 || a[1] === 0) {
          return "_._aplify(" + a[0] + ")";
        } else {
          return "new _._complex(" + a[0] + ", " + a[1] + ")";
        }
        break;
      case 'index':
        return "_._index(        _._aplify([" + (((function() {
          var _j, _len1, _ref4, _results;
          _ref4 = node.slice(2);
          _results = [];
          for (_j = 0, _len1 = _ref4.length; _j < _len1; _j++) {
            c = _ref4[_j];
            if (c) {
              _results.push(toJavaScript(c));
            }
          }
          return _results;
        })()).join(', ')) + "]),        " + (toJavaScript(node[1])) + ",        _._aplify([" + ((function() {
          var _j, _len1, _ref4, _results;
          _ref4 = node.slice(2);
          _results = [];
          for (i = _j = 0, _len1 = _ref4.length; _j < _len1; i = ++_j) {
            c = _ref4[i];
            if (c !== null) {
              _results.push(i);
            }
          }
          return _results;
        })()) + "])      )";
      case 'expr':
        return assert(false, 'No "expr" nodes are expected at this stage.');
      case 'vector':
        n = node.length - 1;
        return "_._aplify([" + (((function() {
          var _j, _len1, _ref4, _results;
          _ref4 = node.slice(1);
          _results = [];
          for (_j = 0, _len1 = _ref4.length; _j < _len1; _j++) {
            child = _ref4[_j];
            _results.push(toJavaScript(child));
          }
          return _results;
        })()).join(', ')) + "])";
      case 'monadic':
        return "" + (toJavaScript(node[1])) + "(" + (toJavaScript(node[2])) + ")";
      case 'dyadic':
        return "" + (toJavaScript(node[2])) + "(" + (toJavaScript(node[3])) + ", " + (toJavaScript(node[1])) + ")";
      case 'prefixAdverb':
        return "" + (toJavaScript(node[1])) + "(" + (toJavaScript(node[2])) + ")";
      case 'conjunction':
        return "" + (toJavaScript(node[2])) + "(" + (toJavaScript(node[3])) + ", " + (toJavaScript(node[1])) + ")";
      case 'postfixAdverb':
        return "" + (toJavaScript(node[2])) + "(" + (toJavaScript(node[1])) + ")";
      case 'hook':
        return "_._hook(" + (toJavaScript(node[2])) + ", " + (toJavaScript(node[1])) + ")";
      case 'fork':
        return "_._fork([" + ((function() {
          var _j, _len1, _ref4, _results;
          _ref4 = node.slice(1);
          _results = [];
          for (_j = 0, _len1 = _ref4.length; _j < _len1; _j++) {
            c = _ref4[_j];
            _results.push(toJavaScript(c));
          }
          return _results;
        })()) + "])";
      case 'embedded':
        return "_._aplify(" + (node[1].replace(/(^«|»$)/g, '')) + ")";
      default:
        return assert(false, "Unrecognised node type, '" + node[0] + "'");
    }
  };

  compilerError = function(node, opts, message) {
    throw SyntaxError(message, {
      file: opts.file,
      line: node.startLine,
      col: node.startCol,
      aplCode: opts.aplCode
    });
  };

  this.nodes = nodes = function(aplCode, opts) {
    var ast;
    if (opts == null) {
      opts = {};
    }
    opts.aplCode = aplCode;
    if (opts.ctx == null) {
      opts.ctx = inherit(vocabulary);
    }
    ast = parser.parse(aplCode, opts);
    resolveExprs(ast, opts);
    return ast;
  };

  this.compile = compile = function(aplCode, opts) {
    var ast, jsCode;
    if (opts == null) {
      opts = {};
    }
    opts.aplCode = aplCode;
    ast = nodes(aplCode, opts);
    if (opts.exposeTopLevelScope) {
      ast.scopeObjectJS = '_';
    }
    jsCode = toJavaScript(ast);
    if (opts.embedded) {
      jsCode = "var _ = require('apl').createGlobalContext(),\n    _a = arguments[0],\n    _w = arguments[1];\n" + jsCode;
    }
    return jsCode;
  };

  this.exec = function(aplCode, opts) {
    var jsCode;
    if (opts == null) {
      opts = {};
    }
    opts.aplCode = aplCode;
    jsCode = compile(aplCode, opts);
    return (new Function("var _ = arguments[0];\n" + jsCode))(opts.ctx);
  };

}).call(this);
}, "complex": function(exports, require, module) {(function() {
  var Complex, DomainError, assert;

  assert = require('./helpers').assert;

  DomainError = require('./errors').DomainError;

  this.complexify = function(x) {
    if (typeof x === 'number') {
      return new Complex(x, 0);
    } else if (x instanceof Complex) {
      return x;
    } else {
      throw DomainError();
    }
  };

  this.simplify = function(re, im) {
    if (im) {
      return new Complex(re, im);
    } else {
      return re;
    }
  };

  this.Complex = Complex = (function() {
    function Complex(re, im) {
      this.re = re;
      this.im = im != null ? im : 0;
      assert(typeof this.re === 'number');
      assert(typeof this.im === 'number');
    }

    Complex.prototype.toString = function() {
      return ("" + this.re + "J" + this.im).replace(/-/g, '¯');
    };

    return Complex;

  })();

}).call(this);
}, "errors": function(exports, require, module) {(function() {
  var APLError, assert, repeat, _ref;

  _ref = require('./helpers'), assert = _ref.assert, repeat = _ref.repeat;

  APLError = function(name, message, opts) {
    var e, k, v, _ref1;
    if (message == null) {
      message = '';
    }
    assert(typeof name === 'string');
    assert(typeof message === 'string');
    if (opts != null) {
      assert(typeof opts === 'object');
      if ((opts.aplCode != null) && (opts.line != null) && (opts.col != null)) {
        assert(typeof opts.aplCode === 'string');
        assert(typeof opts.line === 'number');
        assert(typeof opts.col === 'number');
        assert((_ref1 = typeof opts.file) === 'string' || _ref1 === 'undefined');
        message += "\n" + (opts.file || '-') + ":#" + opts.line + ":" + opts.col + "\n" + (opts.aplCode.split('\n')[opts.line - 1]) + "\n" + (repeat('_', opts.col - 1)) + "^";
      }
    }
    e = Error(message);
    e.name = name;
    for (k in opts) {
      v = opts[k];
      e[k] = v;
    }
    return e;
  };

  this.SyntaxError = function(message, opts) {
    return APLError('SYNTAX ERROR', message, opts);
  };

  this.DomainError = function(message, opts) {
    return APLError('DOMAIN ERROR', message, opts);
  };

  this.LengthError = function(message, opts) {
    return APLError('LENGTH ERROR', message, opts);
  };

  this.RankError = function(message, opts) {
    return APLError('RANK ERROR', message, opts);
  };

  this.IndexError = function(message, opts) {
    return APLError('INDEX ERROR', message, opts);
  };

}).call(this);
}, "helpers": function(exports, require, module) {(function() {
  var assert, extend, isInt, repeat;

  this.inherit = function(x, extraProperties) {
    var f, k, r, v;
    if (extraProperties == null) {
      extraProperties = {};
    }
    f = (function() {});
    f.prototype = x;
    r = new f;
    for (k in extraProperties) {
      v = extraProperties[k];
      r[k] = v;
    }
    return r;
  };

  this.extend = extend = function(x, extraProperties) {
    var k, v;
    for (k in extraProperties) {
      v = extraProperties[k];
      x[k] = v;
    }
    return x;
  };

  this.prod = function(xs) {
    var r, x, _i, _len;
    r = 1;
    for (_i = 0, _len = xs.length; _i < _len; _i++) {
      x = xs[_i];
      r *= x;
    }
    return r;
  };

  this.all = function(xs) {
    var x, _i, _len;
    for (_i = 0, _len = xs.length; _i < _len; _i++) {
      x = xs[_i];
      if (!x) {
        return false;
      }
    }
    return true;
  };

  this.repeat = repeat = function(a, n) {
    var m;
    assert(typeof a === 'string' || a instanceof Array);
    assert(isInt(n, 0));
    if (!n) {
      return a.slice(0, 0);
    }
    m = n * a.length;
    while (a.length * 2 < m) {
      a = a.concat(a);
    }
    return a.concat(a.slice(0, m - a.length));
  };

  this.assert = assert = function(flag, s) {
    if (s == null) {
      s = '';
    }
    if (!flag) {
      throw extend(Error(s), {
        name: 'AssertionError'
      });
    }
  };

  this.isInt = isInt = function(x, start, end) {
    if (start == null) {
      start = -Infinity;
    }
    if (end == null) {
      end = Infinity;
    }
    return x === ~~x && (start <= x && x < end);
  };

}).call(this);
}, "lexer": function(exports, require, module) {(function() {
  var SyntaxError, tokenDefs;

  SyntaxError = require('./errors').SyntaxError;

  tokenDefs = [['-', /^(?:[ \t]+|[⍝\#].*)+/], ['newline', /^[\n\r]+/], ['separator', /^[◇⋄]/], ['number', /^¯?(?:0x[\da-f]+|\d*\.?\d+(?:e[+¯]?\d+)?|¯)(?:j¯?(?:0x[\da-f]+|\d*\.?\d+(?:e[+¯]?\d+)?|¯))?/i], ['string', /^(?:'(?:[^\\']|\\.)*'|"(?:[^\\"]|\\.)*")+/], ['', /^[\(\)\[\]\{\}:;←]/], ['embedded', /^«[^»]*»/], ['symbol', /^(?:∘\.|⎕?[a-z_][0-9a-z_]*|[^¯'":«»])/i]];

  this.tokenize = function(aplCode, opts) {
    var col, line, stack;
    if (opts == null) {
      opts = {};
    }
    line = col = 1;
    stack = ['{'];
    return {
      next: function() {
        var a, m, re, startCol, startLine, t, type, _i, _len, _ref;
        while (true) {
          if (!aplCode) {
            return {
              type: 'eof',
              value: '',
              startLine: line,
              startCol: col,
              endLine: line,
              endCol: col
            };
          }
          startLine = line;
          startCol = col;
          type = null;
          for (_i = 0, _len = tokenDefs.length; _i < _len; _i++) {
            _ref = tokenDefs[_i], t = _ref[0], re = _ref[1];
            if (!(m = aplCode.match(re))) {
              continue;
            }
            type = t || m[0];
            break;
          }
          if (!type) {
            throw SyntaxError('Unrecognised token', {
              file: opts.file,
              line: line,
              col: col,
              aplCode: opts.aplCode
            });
          }
          a = m[0].split('\n');
          line += a.length - 1;
          col = (a.length === 1 ? col : 1) + a[a.length - 1].length;
          aplCode = aplCode.substring(m[0].length);
          if (type !== '-') {
            if (type === '(' || type === '[' || type === '{') {
              stack.push(type);
            } else if (type === ')' || type === ']' || type === '}') {
              stack.pop();
            }
            if (type !== 'newline' || stack[stack.length - 1] === '{') {
              return {
                type: type,
                startLine: startLine,
                startCol: startCol,
                value: m[0],
                endLine: line,
                endCol: col
              };
            }
          }
        }
      }
    };
  };

}).call(this);
}, "parser": function(exports, require, module) {(function() {
  var SyntaxError, lexer,
    __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  lexer = require('./lexer');

  SyntaxError = require('./errors').SyntaxError;

  this.parse = function(aplCode, opts) {
    var consume, demand, parseBody, parseExpr, parseIndexable, parseIndices, parseItem, parserError, result, token, tokenStream;
    if (opts == null) {
      opts = {};
    }
    tokenStream = lexer.tokenize(aplCode);
    token = tokenStream.next();
    consume = function(tt) {
      var _ref;
      if (_ref = token.type, __indexOf.call(tt.split(' '), _ref) >= 0) {
        return token = tokenStream.next();
      }
    };
    demand = function(tt) {
      if (token.type !== tt) {
        parserError("Expected token of type '" + tt + "' but got '" + token.type + "'");
      }
      token = tokenStream.next();
    };
    parserError = function(message) {
      throw SyntaxError(message, {
        file: opts.file,
        line: token.startLine,
        col: token.startCol,
        aplCode: aplCode
      });
    };
    parseBody = function() {
      var body, expr, _ref, _ref1;
      body = ['body'];
      while (true) {
        if ((_ref = token.type) === 'eof' || _ref === '}') {
          return body;
        }
        while (consume('separator newline')) {}
        if ((_ref1 = token.type) === 'eof' || _ref1 === '}') {
          return body;
        }
        expr = parseExpr();
        if (consume(':')) {
          expr = ['guard', expr, parseExpr()];
        }
        body.push(expr);
      }
    };
    parseExpr = function() {
      var expr, item, _ref;
      expr = ['expr'];
      while (true) {
        item = parseItem();
        if (consume('←')) {
          return expr.concat([['assign', item, parseExpr()]]);
        }
        expr.push(item);
        if (_ref = token.type, __indexOf.call(') ] } : ; separator newline eof'.split(' '), _ref) >= 0) {
          return expr;
        }
      }
    };
    parseItem = function() {
      var item;
      item = parseIndexable();
      if (consume('[')) {
        item = ['index', item].concat(parseIndices());
        demand(']');
      }
      return item;
    };
    parseIndices = function() {
      var indices;
      indices = [];
      while (true) {
        if (consume(';')) {
          indices.push(null);
        } else if (token.type === ']') {
          indices.push(null);
          return indices;
        } else {
          indices.push(parseExpr());
          if (token.type === ']') {
            return indices;
          }
          demand(';');
        }
      }
    };
    parseIndexable = function() {
      var b, expr, t;
      t = token;
      if (consume('number string symbol embedded')) {
        return [t.type, t.value];
      } else if (consume('(')) {
        expr = parseExpr();
        demand(')');
        return expr;
      } else if (consume('{')) {
        b = parseBody();
        demand('}');
        return ['lambda', b];
      } else {
        return parserError("Encountered unexpected token of type '" + token.type + "'");
      }
    };
    result = parseBody();
    demand('eof');
    return result;
  };

}).call(this);
}, "vocabulary": function(exports, require, module) {(function() {
  var createLazyRequire, fromModule, k, lazyRequires, name, names, v, _base, _base1, _base2, _i, _j, _k, _l, _len, _len1, _len2, _len3, _ref, _ref1, _ref2,
    __slice = [].slice;

  lazyRequires = {
    arithmetic: '+-×÷*⍟∣|',
    floorceil: '⌊⌈',
    question: '?',
    exclamation: '!',
    circle: '○',
    comparisons: '=≠<>≤≥≡≢',
    logic: '~∨∧⍱⍲',
    rho: '⍴',
    iota: '⍳',
    rotate: '⌽⊖',
    transpose: '⍉',
    epsilon: '∊',
    zilde: ['get_⍬', 'set_⍬'],
    comma: ',⍪',
    grade: '⍋⍒',
    take: '↑',
    drop: '↓',
    squish: ['⌷', '_index'],
    quad: ['get_⎕', 'set_⎕', 'get_⍞', 'set_⍞'],
    format: '⍕',
    forkhook: ['_fork', '_hook'],
    each: '¨',
    commute: '⍨',
    cupcap: '∪∩',
    find: '⍷',
    enclose: '⊂',
    disclose: '⊃',
    execute: '⍎',
    poweroperator: '⍣',
    innerproduct: '.',
    outerproduct: ['∘.'],
    slash: '/⌿',
    backslash: '\\⍀',
    tack: '⊣⊢',
    encode: '⊤',
    decode: '⊥',
    special: ['_aplify', '_complex', '_bool', 'get_⎕IO', 'set_⎕IO']
  };

  createLazyRequire = function(obj, name, fromModule) {
    return obj[name] = function() {
      var args, f;
      args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
      obj[name] = f = require(fromModule)[name];
      f.aplName = name;
      f.aplMetaInfo = arguments.callee.aplMetaInfo;
      return f.apply(null, args);
    };
  };

  for (fromModule in lazyRequires) {
    names = lazyRequires[fromModule];
    for (_i = 0, _len = names.length; _i < _len; _i++) {
      name = names[_i];
      createLazyRequire(this, name, './vocabulary/' + fromModule);
    }
  }

  _ref = ['∘.'];
  for (_j = 0, _len1 = _ref.length; _j < _len1; _j++) {
    name = _ref[_j];
    ((_base = this[name]).aplMetaInfo != null ? (_base = this[name]).aplMetaInfo : _base.aplMetaInfo = {}).isPrefixAdverb = true;
  }

  _ref1 = '⍨¨/⌿\\⍀';
  for (_k = 0, _len2 = _ref1.length; _k < _len2; _k++) {
    name = _ref1[_k];
    ((_base1 = this[name]).aplMetaInfo != null ? (_base1 = this[name]).aplMetaInfo : _base1.aplMetaInfo = {}).isPostfixAdverb = true;
  }

  _ref2 = '.⍣';
  for (_l = 0, _len3 = _ref2.length; _l < _len3; _l++) {
    name = _ref2[_l];
    ((_base2 = this[name]).aplMetaInfo != null ? (_base2 = this[name]).aplMetaInfo : _base2.aplMetaInfo = {}).isConjunction = true;
  }

  for (k in this) {
    v = this[k];
    if (typeof v === 'function') {
      v.aplName = k;
    }
  }

}).call(this);
}, "vocabulary/arithmetic": function(exports, require, module) {(function() {
  var Complex, DomainError, complexify, div, exp, ln, mult, pervasive, simplify, _ref;

  pervasive = require('./vhelpers').pervasive;

  _ref = require('../complex'), Complex = _ref.Complex, complexify = _ref.complexify, simplify = _ref.simplify;

  DomainError = require('../errors').DomainError;

  this['+'] = pervasive({
    monad: function(x) {
      if (typeof x === 'number') {
        return x;
      } else if (x instanceof Complex) {
        return new Complex(x.re, -x.im);
      } else {
        throw DomainError();
      }
    },
    dyad: function(y, x) {
      if (typeof x === 'number' && typeof y === 'number') {
        return x + y;
      } else {
        x = complexify(x);
        y = complexify(y);
        return simplify(x.re + y.re, x.im + y.im);
      }
    }
  });

  this['-'] = pervasive({
    monad: function(x) {
      if (typeof x === 'number') {
        return -x;
      } else if (x instanceof Complex) {
        return new Complex(-x.re, -x.im);
      } else {
        throw DomainError();
      }
    },
    dyad: function(y, x) {
      if (typeof x === 'number' && typeof y === 'number') {
        return x - y;
      } else {
        x = complexify(x);
        y = complexify(y);
        return simplify(x.re - y.re, x.im - y.im);
      }
    }
  });

  this['×'] = pervasive({
    monad: function(x) {
      var d;
      if (typeof x === 'number') {
        return (x > 0) - (x < 0);
      } else if (x instanceof Complex) {
        d = Math.sqrt(x.re * x.re + x.im * x.im);
        return simplify(x.re / d, x.im / d);
      } else {
        throw DomainError();
      }
    },
    dyad: mult = function(y, x) {
      var _ref1;
      if ((typeof x === (_ref1 = typeof y) && _ref1 === 'number')) {
        return x * y;
      } else {
        x = complexify(x);
        y = complexify(y);
        return simplify(x.re * y.re - x.im * y.im, x.re * y.im + x.im * y.re);
      }
    }
  });

  this['÷'] = pervasive({
    monad: function(x) {
      var d;
      if (typeof x === 'number') {
        return 1 / x;
      } else if (x instanceof Complex) {
        d = x.re * x.re + x.im * x.im;
        return simplify(x.re / d, -x.im / d);
      } else {
        throw DomainError();
      }
    },
    dyad: div = function(y, x) {
      var d, _ref1;
      if ((typeof x === (_ref1 = typeof y) && _ref1 === 'number')) {
        return x / y;
      } else {
        x = complexify(x);
        y = complexify(y);
        d = y.re * y.re + y.im * y.im;
        return simplify((x.re * y.re + x.im * y.im) / d, (y.re * x.im - y.im * x.re) / d);
      }
    }
  });

  this['*'] = pervasive({
    monad: exp = function(x) {
      var r;
      if (typeof x === 'number') {
        return Math.exp(x);
      } else if (x instanceof Complex) {
        r = Math.exp(x.re);
        return simplify(r * Math.cos(x.im), r * Math.sin(x.im));
      } else {
        throw DomainError();
      }
    },
    dyad: function(y, x) {
      var _ref1;
      if ((typeof x === (_ref1 = typeof y) && _ref1 === 'number') && x >= 0) {
        return Math.pow(x, y);
      } else {
        x = complexify(x);
        y = complexify(y);
        return exp(mult(ln(x), y));
      }
    }
  });

  this['⍟'] = pervasive({
    monad: ln = function(x) {
      if (typeof x === 'number' && x > 0) {
        return Math.log(x);
      } else {
        x = complexify(x);
        return simplify(Math.log(Math.sqrt(x.re * x.re + x.im * x.im)), Math.atan2(x.im, x.re));
      }
    },
    dyad: function(y, x) {
      var _ref1;
      if ((typeof x === (_ref1 = typeof y) && _ref1 === 'number') && x > 0 && y > 0) {
        return Math.log(y) / Math.log(x);
      } else {
        x = complexify(x);
        y = complexify(y);
        return div(ln(x), ln(y));
      }
    }
  });

  this['∣'] = this['|'] = pervasive({
    monad: function(x) {
      if (typeof x === 'number') {
        return Math.abs(x);
      } else if (x instanceof Complex) {
        return Math.sqrt(x.re * x.re + x.im * x.im);
      } else {
        throw DomainError();
      }
    },
    dyad: function(y, x) {
      var _ref1;
      if ((typeof x === (_ref1 = typeof y) && _ref1 === 'number')) {
        return y % x;
      } else {
        throw DomainError();
      }
    }
  });

}).call(this);
}, "vocabulary/backslash": function(exports, require, module) {(function() {
  var APLArray, assert, expand, scan;

  APLArray = require('../array').APLArray;

  assert = require('../helpers').assert;

  this['\\'] = function(omega, alpha, axis) {
    if (typeof omega === 'function') {
      return scan(omega, void 0, axis);
    } else {
      return expand(omega, alpha, axis);
    }
  };

  this['⍀'] = function(omega, alpha, axis) {
    if (axis == null) {
      axis = APLArray.zero;
    }
    if (typeof omega === 'function') {
      return scan(omega, void 0, axis);
    } else {
      return expand(omega, alpha, axis);
    }
  };

  scan = function(f, g, axis) {
    assert(typeof g === 'undefined');
    return function(omega, alpha) {
      assert(alpha == null);
      if (omega.shape.length === 0) {
        return omega;
      }
      axis = axis ? axis.toInt(0, omega.shape.length) : omega.shape.length - 1;
      return omega.map(function(x, indices) {
        var a, index, j, p, y, _i, _j, _len, _ref;
        p = omega.offset;
        for (a = _i = 0, _len = indices.length; _i < _len; a = ++_i) {
          index = indices[a];
          p += index * omega.stride[a];
        }
        if (!(x instanceof APLArray)) {
          x = APLArray.scalar(x);
        }
        for (j = _j = 0, _ref = indices[axis]; _j < _ref; j = _j += 1) {
          p -= omega.stride[axis];
          y = omega.data[p];
          if (!(y instanceof APLArray)) {
            y = APLArray.scalar(y);
          }
          x = f(x, y);
        }
        if (x.shape.length === 0) {
          x = x.unwrap();
        }
        return x;
      });
    };
  };

  expand = function() {};

}).call(this);
}, "vocabulary/circle": function(exports, require, module) {(function() {
  var APLArray, numeric, pervasive, _ref;

  APLArray = require('../array').APLArray;

  _ref = require('./vhelpers'), numeric = _ref.numeric, pervasive = _ref.pervasive;

  this['○'] = pervasive({
    monad: numeric(function(x) {
      return Math.PI * x;
    }),
    dyad: numeric(function(x, i) {
      var ex;
      switch (i) {
        case 0:
          return Math.sqrt(1 - x * x);
        case 1:
          return Math.sin(x);
        case 2:
          return Math.cos(x);
        case 3:
          return Math.tan(x);
        case 4:
          return Math.sqrt(1 + x * x);
        case 5:
          return (Math.exp(2 * x) - 1) / 2;
        case 6:
          return (Math.exp(2 * x) + 1) / 2;
        case 7:
          ex = Math.exp(2 * x);
          return (ex - 1) / (ex + 1);
        case -1:
          return Math.asin(x);
        case -2:
          return Math.acos(x);
        case -3:
          return Math.atan(x);
        case -4:
          return Math.sqrt(x * x - 1);
        case -5:
          return Math.log(x + Math.sqrt(x * x + 1));
        case -6:
          return Math.log(x + Math.sqrt(x * x - 1));
        case -7:
          return Math.log((1 + x) / (1 - x)) / 2;
        default:
          throw Error('Unknown circular or hyperbolic function ' + i);
      }
    })
  });

}).call(this);
}, "vocabulary/comma": function(exports, require, module) {(function() {
  var APLArray, DomainError, LengthError, RankError, assert, catenate, isInt, prod, repeat, _ref, _ref1;

  APLArray = require('../array').APLArray;

  _ref = require('../errors'), DomainError = _ref.DomainError, RankError = _ref.RankError, LengthError = _ref.LengthError;

  _ref1 = require('../helpers'), assert = _ref1.assert, prod = _ref1.prod, repeat = _ref1.repeat, isInt = _ref1.isInt;

  this[','] = function(omega, alpha, axis) {
    var data;
    if (alpha) {
      return catenate(omega, alpha, axis);
    } else {
      data = [];
      omega.each(function(x) {
        return data.push(x);
      });
      return new APLArray(data);
    }
  };

  this['⍪'] = function(omega, alpha, axis) {
    if (axis == null) {
      axis = APLArray.zero;
    }
    if (alpha) {
      return catenate(omega, alpha, axis);
    } else {
      throw Error('Not implemented');
    }
  };

  catenate = function(omega, alpha, axis) {
    var a, data, i, nAxes, p, pIndices, q, r, rStride, s, shape, stride, _i, _j, _ref2, _ref3;
    assert(alpha);
    assert(typeof axis === 'undefined' || axis instanceof APLArray);
    nAxes = Math.max(alpha.shape.length, omega.shape.length);
    if (axis) {
      axis = axis.unwrap();
      if (typeof axis !== 'number') {
        throw DomainError();
      }
      if (!((-1 < axis && axis < nAxes))) {
        throw RankError();
      }
    } else {
      axis = nAxes - 1;
    }
    if (alpha.shape.length === 0 && omega.shape.length === 0) {
      return new APLArray([alpha.unwrap(), omega.unwrap()]);
    } else if (alpha.shape.length === 0) {
      s = omega.shape.slice(0);
      if (isInt(axis)) {
        s[axis] = 1;
      }
      alpha = new APLArray([alpha.unwrap()], s, repeat([0], omega.shape.length));
    } else if (omega.shape.length === 0) {
      s = alpha.shape.slice(0);
      if (isInt(axis)) {
        s[axis] = 1;
      }
      omega = new APLArray([omega.unwrap()], s, repeat([0], alpha.shape.length));
    } else if (alpha.shape.length + 1 === omega.shape.length) {
      if (!isInt(axis)) {
        throw RankError();
      }
      shape = alpha.shape.slice(0);
      shape.splice(axis, 0, 1);
      stride = alpha.stride.slice(0);
      stride.splice(axis, 0, 0);
      alpha = new APLArray(alpha.data, shape, stride, alpha.offset);
    } else if (alpha.shape.length === omega.shape.length + 1) {
      if (!isInt(axis)) {
        throw RankError();
      }
      shape = omega.shape.slice(0);
      shape.splice(axis, 0, 1);
      stride = omega.stride.slice(0);
      stride.splice(axis, 0, 0);
      omega = new APLArray(omega.data, shape, stride, omega.offset);
    } else if (alpha.shape.length !== omega.shape.length) {
      throw RankError();
    }
    assert(alpha.shape.length === omega.shape.length);
    for (i = _i = 0, _ref2 = alpha.shape.length; 0 <= _ref2 ? _i < _ref2 : _i > _ref2; i = 0 <= _ref2 ? ++_i : --_i) {
      if (i !== axis && alpha.shape[i] !== omega.shape[i]) {
        throw LengthError();
      }
    }
    shape = alpha.shape.slice(0);
    if (isInt(axis)) {
      shape[axis] += omega.shape[axis];
    } else {
      shape.splice(Math.ceil(axis), 0, 2);
    }
    data = Array(prod(shape));
    stride = Array(shape.length);
    stride[shape.length - 1] = 1;
    for (i = _j = _ref3 = shape.length - 2; _j >= 0; i = _j += -1) {
      stride[i] = stride[i + 1] * shape[i + 1];
    }
    if (isInt(axis)) {
      rStride = stride;
    } else {
      rStride = stride.slice(0);
      rStride.splice(Math.ceil(axis), 1);
    }
    if (!alpha.empty()) {
      r = 0;
      p = alpha.offset;
      pIndices = repeat([0], alpha.shape.length);
      while (true) {
        data[r] = alpha.data[p];
        a = pIndices.length - 1;
        while (a >= 0 && pIndices[a] + 1 === alpha.shape[a]) {
          p -= pIndices[a] * alpha.stride[a];
          r -= pIndices[a] * rStride[a];
          pIndices[a--] = 0;
        }
        if (a < 0) {
          break;
        }
        p += alpha.stride[a];
        r += rStride[a];
        pIndices[a]++;
      }
    }
    if (!omega.empty()) {
      r = isInt(axis) ? stride[axis] * alpha.shape[axis] : stride[Math.ceil(axis)];
      q = omega.offset;
      pIndices = repeat([0], omega.shape.length);
      while (true) {
        data[r] = omega.data[q];
        a = pIndices.length - 1;
        while (a >= 0 && pIndices[a] + 1 === omega.shape[a]) {
          q -= pIndices[a] * omega.stride[a];
          r -= pIndices[a] * rStride[a];
          pIndices[a--] = 0;
        }
        if (a < 0) {
          break;
        }
        q += omega.stride[a];
        r += rStride[a];
        pIndices[a]++;
      }
    }
    return new APLArray(data, shape, stride);
  };

}).call(this);
}, "vocabulary/commute": function(exports, require, module) {(function() {
  var assert;

  assert = require('../helpers').assert;

  this['⍨'] = function(f) {
    assert(typeof f === 'function');
    return function(omega, alpha, axis) {
      if (alpha) {
        return f(alpha, omega, axis);
      } else {
        return f(omega, void 0, axis);
      }
    };
  };

}).call(this);
}, "vocabulary/comparisons": function(exports, require, module) {(function() {
  var APLArray, Complex, depthOf, eq, match, numeric, pervasive, _ref;

  APLArray = require('../array').APLArray;

  _ref = require('./vhelpers'), pervasive = _ref.pervasive, numeric = _ref.numeric, match = _ref.match;

  Complex = require('../complex').Complex;

  this['='] = pervasive({
    dyad: eq = function(y, x) {
      if (x instanceof Complex && y instanceof Complex) {
        return +(x.re === y.re && x.im === y.im);
      } else {
        return +(x === y);
      }
    }
  });

  this['≠'] = pervasive({
    dyad: function(y, x) {
      return 1 - eq(y, x);
    }
  });

  this['<'] = pervasive({
    dyad: numeric(function(y, x) {
      return +(x < y);
    })
  });

  this['>'] = pervasive({
    dyad: numeric(function(y, x) {
      return +(x > y);
    })
  });

  this['≤'] = pervasive({
    dyad: numeric(function(y, x) {
      return +(x <= y);
    })
  });

  this['≥'] = pervasive({
    dyad: numeric(function(y, x) {
      return +(x >= y);
    })
  });

  this['≡'] = function(omega, alpha) {
    if (alpha) {
      return APLArray.bool[+match(omega, alpha)];
    } else {
      return new APLArray([depthOf(omega)], []);
    }
  };

  depthOf = function(x) {
    var r;
    if (x instanceof APLArray) {
      if (x.shape.length === 0 && !(x.data[0] instanceof APLArray)) {
        return 0;
      }
      r = 0;
      x.each(function(y) {
        return r = Math.max(r, depthOf(y));
      });
      return r + 1;
    } else {
      return 0;
    }
  };

  this['≢'] = function(omega, alpha) {
    if (alpha) {
      return APLArray.bool[+(!match(omega, alpha))];
    } else {
      throw Error('Not implemented');
    }
  };

}).call(this);
}, "vocabulary/cupcap": function(exports, require, module) {(function() {
  var APLArray, RankError, assert, contains, match;

  APLArray = require('../array').APLArray;

  match = require('./vhelpers').match;

  assert = require('../helpers').assert;

  RankError = require('../errors').RankError;

  this['∪'] = function(omega, alpha) {
    var a, data, _i, _len, _ref;
    if (alpha) {
      data = [];
      _ref = [alpha, omega];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        a = _ref[_i];
        if (a.shape.length > 1) {
          throw RankError();
        }
        a.each(function(x) {
          if (!contains(data, x)) {
            return data.push(x);
          }
        });
      }
      return new APLArray(data);
    } else {
      data = [];
      omega.each(function(x) {
        if (!contains(data, x)) {
          return data.push(x);
        }
      });
      return new APLArray(data);
    }
  };

  this['∩'] = function(omega, alpha) {
    var b, data, x, _i, _len, _ref;
    if (alpha) {
      data = [];
      b = omega.toArray();
      _ref = alpha.toArray();
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        x = _ref[_i];
        if (contains(b, x)) {
          data.push(x);
        }
      }
      return new APLArray(data);
    } else {
      throw Error('Not implemented');
    }
  };

  contains = function(a, x) {
    var y, _i, _len;
    assert(a instanceof Array);
    for (_i = 0, _len = a.length; _i < _len; _i++) {
      y = a[_i];
      if (match(x, y)) {
        return true;
      }
    }
    return false;
  };

}).call(this);
}, "vocabulary/decode": function(exports, require, module) {(function() {
  var APLArray, assert;

  APLArray = require('../array').APLArray;

  assert = require('../helpers').assert;

  this['⊥'] = function(omega, alpha) {
    var a, b, data, firstDimB, i, j, k, lastDimA, x, y, z, _i, _j, _k, _ref, _ref1, _ref2;
    assert(alpha);
    if (alpha.shape.length === 0) {
      alpha = new APLArray([alpha.unwrap()]);
    }
    if (omega.shape.length === 0) {
      omega = new APLArray([omega.unwrap()]);
    }
    lastDimA = alpha.shape[alpha.shape.length - 1];
    firstDimB = omega.shape[0];
    if (lastDimA !== 1 && firstDimB !== 1 && lastDimA !== firstDimB) {
      throw LengthError();
    }
    a = alpha.toArray();
    b = omega.toArray();
    data = [];
    for (i = _i = 0, _ref = a.length / lastDimA; 0 <= _ref ? _i < _ref : _i > _ref; i = 0 <= _ref ? ++_i : --_i) {
      for (j = _j = 0, _ref1 = b.length / firstDimB; 0 <= _ref1 ? _j < _ref1 : _j > _ref1; j = 0 <= _ref1 ? ++_j : --_j) {
        x = a.slice(i * lastDimA, (i + 1) * lastDimA);
        y = (function() {
          var _k, _results;
          _results = [];
          for (k = _k = 0; 0 <= firstDimB ? _k < firstDimB : _k > firstDimB; k = 0 <= firstDimB ? ++_k : --_k) {
            _results.push(b[j + k * (b.length / firstDimB)]);
          }
          return _results;
        })();
        if (x.length === 1) {
          x = (function() {
            var _k, _ref2, _results;
            _results = [];
            for (_k = 0, _ref2 = y.length; 0 <= _ref2 ? _k < _ref2 : _k > _ref2; 0 <= _ref2 ? _k++ : _k--) {
              _results.push(x[0]);
            }
            return _results;
          })();
        }
        if (y.length === 1) {
          y = (function() {
            var _k, _ref2, _results;
            _results = [];
            for (_k = 0, _ref2 = x.length; 0 <= _ref2 ? _k < _ref2 : _k > _ref2; 0 <= _ref2 ? _k++ : _k--) {
              _results.push(y[0]);
            }
            return _results;
          })();
        }
        z = y[0];
        for (k = _k = 1, _ref2 = y.length; 1 <= _ref2 ? _k < _ref2 : _k > _ref2; k = 1 <= _ref2 ? ++_k : --_k) {
          z = z * x[k] + y[k];
        }
        data.push(z);
      }
    }
    return new APLArray(data, alpha.shape.slice(0, -1).concat(omega.shape.slice(1)));
  };

}).call(this);
}, "vocabulary/disclose": function(exports, require, module) {(function() {
  var APLArray;

  APLArray = require('../array').APLArray;

  this['⊃'] = function(omega, alpha) {
    var x;
    if (alpha) {
      throw Error('Not implemented');
    } else {
      if (omega.empty()) {
        return APLArray.zero;
      } else {
        x = omega.data[omega.offset];
        if (x instanceof APLArray) {
          return x;
        } else {
          return APLArray.scalar(x);
        }
      }
    }
  };

}).call(this);
}, "vocabulary/drop": function(exports, require, module) {(function() {
  var APLArray, DomainError, RankError, isInt, prod, repeat, _ref, _ref1;

  APLArray = require('../array').APLArray;

  _ref = require('../helpers'), isInt = _ref.isInt, repeat = _ref.repeat, prod = _ref.prod;

  _ref1 = require('../errors'), DomainError = _ref1.DomainError, RankError = _ref1.RankError;

  this['↓'] = function(omega, alpha, axis) {
    var a, i, offset, shape, x, _i, _j, _len, _len1;
    if (alpha) {
      if (alpha.shape.length > 1) {
        throw RankError();
      }
      a = alpha.toArray();
      for (_i = 0, _len = a.length; _i < _len; _i++) {
        x = a[_i];
        if (!isInt(x)) {
          throw DomainError();
        }
      }
      if (omega.shape.length === 0) {
        omega = new APLArray(omega.data, repeat([1], a.length), omega.stride, omega.offset);
      } else {
        if (a.length > omega.shape.length) {
          throw RankError();
        }
      }
      shape = omega.shape.slice(0);
      offset = omega.offset;
      for (i = _j = 0, _len1 = a.length; _j < _len1; i = ++_j) {
        x = a[i];
        shape[i] = Math.max(0, omega.shape[i] - Math.abs(x));
        if (x > 0) {
          offset += x * omega.stride[i];
        }
      }
      if (prod(shape) === 0) {
        return new APLArray([], shape);
      } else {
        return new APLArray(omega.data, shape, omega.stride, offset);
      }
    } else {
      throw Error('Not implemented');
    }
  };

}).call(this);
}, "vocabulary/each": function(exports, require, module) {(function() {
  var APLArray, LengthError, arrayEquals, assert;

  APLArray = require('../array').APLArray;

  LengthError = require('../errors').LengthError;

  assert = require('../helpers').assert;

  this['¨'] = function(f, g) {
    assert(typeof f === 'function');
    assert(typeof g === 'undefined');
    return function(omega, alpha) {
      var x, y;
      if (!alpha) {
        return omega.map(function(x) {
          var r;
          if (!(x instanceof APLArray)) {
            x = new APLArray([x], []);
          }
          r = f(x);
          assert(r instanceof APLArray);
          if (r.shape.length === 0) {
            return r.unwrap();
          } else {
            return r;
          }
        });
      } else if (arrayEquals(alpha.shape, omega.shape)) {
        return omega.map2(alpha, function(x, y) {
          var r;
          if (!(x instanceof APLArray)) {
            x = new APLArray([x], []);
          }
          if (!(y instanceof APLArray)) {
            y = new APLArray([y], []);
          }
          r = f(x, y);
          assert(r instanceof APLArray);
          if (r.shape.length === 0) {
            return r.unwrap();
          } else {
            return r;
          }
        });
      } else if (alpha.isSingleton()) {
        y = alpha.data[0] instanceof APLArray ? alpha.unwrap() : alpha;
        return omega.map(function(x) {
          var r;
          if (!(x instanceof APLArray)) {
            x = new APLArray([x], []);
          }
          r = f(x, y);
          assert(r instanceof APLArray);
          if (r.shape.length === 0) {
            return r.unwrap();
          } else {
            return r;
          }
        });
      } else if (omega.isSingleton()) {
        x = omega.data[0] instanceof APLArray ? omega.unwrap() : omega;
        return alpha.map(function(y) {
          var r;
          if (!(y instanceof APLArray)) {
            y = new APLArray([y], []);
          }
          r = f(x, y);
          assert(r instanceof APLArray);
          if (r.shape.length === 0) {
            return r.unwrap();
          } else {
            return r;
          }
        });
      } else {
        throw LengthError();
      }
    };
  };

  arrayEquals = function(a, b) {
    var i, x, _i, _len;
    assert(a instanceof Array);
    assert(b instanceof Array);
    if (a.length !== b.length) {
      return false;
    }
    for (i = _i = 0, _len = a.length; _i < _len; i = ++_i) {
      x = a[i];
      if (x !== b[i]) {
        return false;
      }
    }
    return true;
  };

}).call(this);
}, "vocabulary/enclose": function(exports, require, module) {(function() {
  var APLArray, getAxisList, repeat,
    __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  APLArray = require('../array').APLArray;

  repeat = require('../helpers').repeat;

  getAxisList = require('./vhelpers').getAxisList;

  this['⊂'] = function(omega, alpha, axes) {
    var a, axis, data, indices, p, resultAxes, shape, stride, unitShape, unitStride, _i, _ref, _results;
    if (alpha) {
      throw Error('Not implemented');
    } else {
      axes = axes != null ? getAxisList(axes, omega.shape.length) : (function() {
        _results = [];
        for (var _i = 0, _ref = omega.shape.length; 0 <= _ref ? _i < _ref : _i > _ref; 0 <= _ref ? _i++ : _i--){ _results.push(_i); }
        return _results;
      }).apply(this);
      if (omega.shape.length === 0) {
        return omega;
      }
      unitShape = (function() {
        var _j, _len, _results1;
        _results1 = [];
        for (_j = 0, _len = axes.length; _j < _len; _j++) {
          axis = axes[_j];
          _results1.push(omega.shape[axis]);
        }
        return _results1;
      })();
      unitStride = (function() {
        var _j, _len, _results1;
        _results1 = [];
        for (_j = 0, _len = axes.length; _j < _len; _j++) {
          axis = axes[_j];
          _results1.push(omega.stride[axis]);
        }
        return _results1;
      })();
      resultAxes = (function() {
        var _j, _ref1, _results1;
        _results1 = [];
        for (axis = _j = 0, _ref1 = omega.shape.length; 0 <= _ref1 ? _j < _ref1 : _j > _ref1; axis = 0 <= _ref1 ? ++_j : --_j) {
          if (__indexOf.call(axes, axis) < 0) {
            _results1.push(axis);
          }
        }
        return _results1;
      })();
      shape = (function() {
        var _j, _len, _results1;
        _results1 = [];
        for (_j = 0, _len = resultAxes.length; _j < _len; _j++) {
          axis = resultAxes[_j];
          _results1.push(omega.shape[axis]);
        }
        return _results1;
      })();
      stride = (function() {
        var _j, _len, _results1;
        _results1 = [];
        for (_j = 0, _len = resultAxes.length; _j < _len; _j++) {
          axis = resultAxes[_j];
          _results1.push(omega.stride[axis]);
        }
        return _results1;
      })();
      data = [];
      p = omega.offset;
      indices = repeat([0], shape.length);
      while (true) {
        data.push(new APLArray(omega.data, unitShape, unitStride, p));
        a = indices.length - 1;
        while (a >= 0 && indices[a] + 1 === shape[a]) {
          p -= indices[a] * stride[a];
          indices[a--] = 0;
        }
        if (a < 0) {
          break;
        }
        p += stride[a];
        indices[a]++;
      }
      return new APLArray(data, shape);
    }
  };

}).call(this);
}, "vocabulary/encode": function(exports, require, module) {(function() {
  var APLArray, assert, prod, _ref;

  APLArray = require('../array').APLArray;

  _ref = require('../helpers'), prod = _ref.prod, assert = _ref.assert;

  this['⊤'] = function(omega, alpha) {
    var a, b, data, i, isNeg, j, k, m, n, shape, x, y, _i, _j, _k, _len, _ref1;
    assert(alpha);
    a = alpha.toArray();
    b = omega.toArray();
    shape = alpha.shape.concat(omega.shape);
    data = Array(prod(shape));
    n = alpha.shape.length ? alpha.shape[0] : 1;
    m = a.length / n;
    for (i = _i = 0; 0 <= m ? _i < m : _i > m; i = 0 <= m ? ++_i : --_i) {
      for (j = _j = 0, _len = b.length; _j < _len; j = ++_j) {
        y = b[j];
        if (isNeg = y < 0) {
          y = -y;
        }
        for (k = _k = _ref1 = n - 1; _k >= 0; k = _k += -1) {
          x = a[k * m + i];
          if (x === 0) {
            data[(k * m + i) * b.length + j] = y;
            y = 0;
          } else {
            data[(k * m + i) * b.length + j] = y % x;
            y = Math.round((y - (y % x)) / x);
          }
        }
      }
    }
    return new APLArray(data, shape);
  };

}).call(this);
}, "vocabulary/epsilon": function(exports, require, module) {(function() {
  var APLArray, enlist, match;

  APLArray = require('../array').APLArray;

  match = require('./vhelpers').match;

  enlist = function(x, r) {
    if (x instanceof APLArray) {
      return x.each(function(y) {
        return enlist(y, r);
      });
    } else {
      return r.push(x);
    }
  };

  this['∊'] = function(omega, alpha) {
    var a, data;
    if (alpha) {
      a = omega.toArray();
      return alpha.map(function(x) {
        var y, _i, _len;
        for (_i = 0, _len = a.length; _i < _len; _i++) {
          y = a[_i];
          if (match(x, y)) {
            return 1;
          }
        }
        return 0;
      });
    } else {
      data = [];
      enlist(omega, data);
      return new APLArray(data);
    }
  };

}).call(this);
}, "vocabulary/exclamation": function(exports, require, module) {(function() {
  var Gamma, isInt, numeric, pervasive, _ref;

  _ref = require('./vhelpers'), pervasive = _ref.pervasive, numeric = _ref.numeric;

  isInt = require('../helpers').isInt;

  this['!'] = pervasive({
    monad: numeric(function(x) {
      var i, r;
      if (isInt(x, 0, 25)) {
        r = 1;
        i = 2;
        while (i <= x) {
          r *= i++;
        }
        return r;
      } else if (x < -150) {
        return 0;
      } else if (x > 150) {
        return 1 / 0;
      } else {
        return Gamma(x + 1);
      }
    }),
    dyad: numeric(function(n, k) {
      var i, u, v, _i;
      if (isInt(k, 0, 100) && isInt(n, 0, 100)) {
        if (n < k) {
          return 0;
        }
        if (2 * k > n) {
          k = n - k;
        }
        u = v = 1;
        for (i = _i = 0; _i < k; i = _i += 1) {
          u *= n - i;
          v *= i + 1;
        }
        return u / v;
      } else {
        return factorial(n) / (factorial(k) * factorial(n - k));
      }
    })
  });

  Gamma = function(x) {
    var a, i, p, t, _i, _ref1;
    p = [0.99999999999980993, 676.5203681218851, -1259.1392167224028, 771.32342877765313, -176.61502916214059, 12.507343278686905, -0.13857109526572012, 9.9843695780195716e-6, 1.5056327351493116e-7];
    if (x < 0.5) {
      return Math.PI / (Math.sin(Math.PI * x) * Gamma(1 - x));
    }
    x--;
    a = p[0];
    t = x + 7.5;
    for (i = _i = 1, _ref1 = p.length; 1 <= _ref1 ? _i < _ref1 : _i > _ref1; i = 1 <= _ref1 ? ++_i : --_i) {
      a += p[i] / (x + i);
    }
    return Math.sqrt(2 * Math.PI) * Math.pow(t, x + 0.5) * Math.exp(-t) * a;
  };

}).call(this);
}, "vocabulary/execute": function(exports, require, module) {(function() {
  var DomainError;

  DomainError = require('../errors').DomainError;

  this['⍎'] = function(omega, alpha) {
    var s;
    if (alpha) {
      throw Error('Not implemented');
    } else {
      s = '';
      omega.each(function(c) {
        if (typeof c !== 'string') {
          throw DomainError();
        }
        return s += c;
      });
      return require('../compiler').exec(s);
    }
  };

}).call(this);
}, "vocabulary/find": function(exports, require, module) {(function() {
  var APLArray, match, prod, repeat, strideForShape, _ref, _ref1;

  _ref = require('../array'), APLArray = _ref.APLArray, strideForShape = _ref.strideForShape;

  _ref1 = require('../helpers'), prod = _ref1.prod, repeat = _ref1.repeat;

  match = require('./vhelpers').match;

  this['⍷'] = function(omega, alpha) {
    var a, d, data, findShape, i, indices, p, q, stride, _i, _ref2;
    if (alpha) {
      if (alpha.shape.length > omega.shape.length) {
        return new APLArray([0], omega.shape, repeat([0], omega.shape.length));
      }
      if (alpha.shape.length < omega.shape.length) {
        alpha = new APLArray(alpha.data, repeat([1], omega.shape.length - alpha.shape.length).concat(alpha.shape), repeat([0], omega.shape.length - alpha.shape.length).concat(alpha.stride), alpha.offset);
      }
      if (prod(alpha.shape) === 0) {
        return new APLArray([1], omega.shape, repeat([0], omega.shape.length));
      }
      findShape = [];
      for (i = _i = 0, _ref2 = omega.shape.length; 0 <= _ref2 ? _i < _ref2 : _i > _ref2; i = 0 <= _ref2 ? ++_i : --_i) {
        d = omega.shape[i] - alpha.shape[i] + 1;
        if (d <= 0) {
          return new APLArray([0], omega.shape, repeat([0], omega.shape.length));
        }
        findShape.push(d);
      }
      stride = strideForShape(omega.shape);
      data = repeat([0], prod(omega.shape));
      p = omega.offset;
      q = 0;
      indices = repeat([0], findShape.length);
      while (true) {
        data[q] = +match(alpha, new APLArray(omega.data, alpha.shape, omega.stride, p));
        a = findShape.length - 1;
        while (a >= 0 && indices[a] + 1 === findShape[a]) {
          p -= indices[a] * omega.stride[a];
          q -= indices[a] * stride[a];
          indices[a--] = 0;
        }
        if (a < 0) {
          break;
        }
        p += omega.stride[a];
        q += stride[a];
        indices[a]++;
      }
      return new APLArray(data, omega.shape);
    } else {
      throw Error('Not implemented');
    }
  };

}).call(this);
}, "vocabulary/floorceil": function(exports, require, module) {(function() {
  var numeric, pervasive, _ref;

  _ref = require('./vhelpers'), pervasive = _ref.pervasive, numeric = _ref.numeric;

  this['⌊'] = pervasive({
    monad: numeric(Math.floor),
    dyad: numeric(function(y, x) {
      return Math.min(y, x);
    })
  });

  this['⌈'] = pervasive({
    monad: numeric(Math.ceil),
    dyad: numeric(function(y, x) {
      return Math.max(y, x);
    })
  });

}).call(this);
}, "vocabulary/forkhook": function(exports, require, module) {(function() {
  var assert;

  assert = require('../helpers').assert;

  this._hook = function(g, f) {
    assert(typeof f === 'function');
    assert(typeof g === 'function');
    return function(b, a) {
      return f(g(b), a != null ? a : b);
    };
  };

  this._fork = function(verbs) {
    var f, _i, _len;
    assert(verbs.length % 2 === 1);
    assert(verbs.length >= 3);
    for (_i = 0, _len = verbs.length; _i < _len; _i++) {
      f = verbs[_i];
      assert(typeof f === 'function');
    }
    return function(b, a) {
      var i, r, _j, _ref;
      r = verbs[verbs.length - 1](b, a);
      for (i = _j = _ref = verbs.length - 2; _j > 0; i = _j += -2) {
        r = verbs[i](r, verbs[i - 1](b, a));
      }
      return r;
    };
  };

}).call(this);
}, "vocabulary/format": function(exports, require, module) {(function() {
  var APLArray, format, prod, repeat, _ref;

  APLArray = require('../array').APLArray;

  _ref = require('../helpers'), prod = _ref.prod, repeat = _ref.repeat;

  this['⍕'] = function(omega, alpha) {
    var t;
    if (alpha) {
      throw Error('Not implemented');
    } else {
      t = format(omega);
      return new APLArray(t.join(''), [t.length, t[0].length]);
    }
  };

  this.format = format = function(a) {
    var bottom, box, c, cols, d, grid, i, j, k, left, nCols, nRows, r, result, right, rows, sa, step, t, x, _i, _j, _k, _l, _len, _len1, _len2, _m, _n, _o, _p, _ref1, _ref2, _ref3, _ref4, _ref5, _ref6, _ref7, _ref8;
    if (typeof a === 'undefined') {
      return ['undefined'];
    } else if (a === null) {
      return ['null'];
    } else if (typeof a === 'string') {
      return [a];
    } else if (typeof a === 'number') {
      return [('' + a).replace(/-|Infinity/g, '¯')];
    } else if (typeof a === 'function') {
      return ['function'];
    } else if (!(a instanceof APLArray)) {
      return ['' + a];
    } else if (a.length === 0) {
      return [''];
    } else {
      sa = a.shape;
      a = a.toArray();
      if (!sa.length) {
        return format(a[0]);
      }
      nRows = prod(sa.slice(0, sa.length - 1));
      nCols = sa[sa.length - 1];
      rows = (function() {
        var _i, _results;
        _results = [];
        for (_i = 0; 0 <= nRows ? _i < nRows : _i > nRows; 0 <= nRows ? _i++ : _i--) {
          _results.push({
            height: 0,
            bottomMargin: 0
          });
        }
        return _results;
      })();
      cols = (function() {
        var _i, _results;
        _results = [];
        for (_i = 0; 0 <= nCols ? _i < nCols : _i > nCols; 0 <= nCols ? _i++ : _i--) {
          _results.push({
            type: 0,
            width: 0,
            leftMargin: 0,
            rightMargin: 0
          });
        }
        return _results;
      })();
      grid = (function() {
        var _i, _len, _results;
        _results = [];
        for (i = _i = 0, _len = rows.length; _i < _len; i = ++_i) {
          r = rows[i];
          _results.push((function() {
            var _j, _len1, _results1;
            _results1 = [];
            for (j = _j = 0, _len1 = cols.length; _j < _len1; j = ++_j) {
              c = cols[j];
              x = a[nCols * i + j];
              box = format(x);
              r.height = Math.max(r.height, box.length);
              c.width = Math.max(c.width, box[0].length);
              c.type = Math.max(c.type, typeof x === 'string' && x.length === 1 ? 0 : !(x instanceof APLArray) ? 1 : 2);
              _results1.push(box);
            }
            return _results1;
          })());
        }
        return _results;
      })();
      step = 1;
      for (d = _i = _ref1 = sa.length - 2; _i >= 1; d = _i += -1) {
        step *= sa[d];
        for (i = _j = _ref2 = step - 1, _ref3 = nRows - 1; step > 0 ? _j < _ref3 : _j > _ref3; i = _j += step) {
          rows[i].bottomMargin++;
        }
      }
      for (j = _k = 0, _len = cols.length; _k < _len; j = ++_k) {
        c = cols[j];
        if (j !== nCols - 1 && !((c.type === (_ref4 = cols[j + 1].type) && _ref4 === 0))) {
          c.rightMargin++;
        }
        if (c.type === 2) {
          c.leftMargin++;
          c.rightMargin++;
        }
      }
      result = [];
      for (i = _l = 0, _len1 = rows.length; _l < _len1; i = ++_l) {
        r = rows[i];
        for (j = _m = 0, _len2 = cols.length; _m < _len2; j = ++_m) {
          c = cols[j];
          t = grid[i][j];
          if (c.type === 1) {
            left = repeat(' ', c.leftMargin + c.width - t[0].length);
            right = repeat(' ', c.rightMargin);
          } else {
            left = repeat(' ', c.leftMargin);
            right = repeat(' ', c.rightMargin + c.width - t[0].length);
          }
          for (k = _n = 0, _ref5 = t.length; 0 <= _ref5 ? _n < _ref5 : _n > _ref5; k = 0 <= _ref5 ? ++_n : --_n) {
            t[k] = left + t[k] + right;
          }
          bottom = repeat(' ', t[0].length);
          for (_o = _ref6 = t.length, _ref7 = r.height + r.bottomMargin; _ref6 <= _ref7 ? _o < _ref7 : _o > _ref7; _ref6 <= _ref7 ? _o++ : _o--) {
            t.push(bottom);
          }
        }
        for (k = _p = 0, _ref8 = r.height + r.bottomMargin; 0 <= _ref8 ? _p < _ref8 : _p > _ref8; k = 0 <= _ref8 ? ++_p : --_p) {
          result.push(((function() {
            var _q, _results;
            _results = [];
            for (j = _q = 0; 0 <= nCols ? _q < nCols : _q > nCols; j = 0 <= nCols ? ++_q : --_q) {
              _results.push(grid[i][j][k]);
            }
            return _results;
          })()).join(''));
        }
      }
      return result;
    }
  };

}).call(this);
}, "vocabulary/grade": function(exports, require, module) {(function() {
  var APLArray, DomainError, RankError, grade, repeat, _ref;

  APLArray = require('../array').APLArray;

  _ref = require('../errors'), RankError = _ref.RankError, DomainError = _ref.DomainError;

  repeat = require('../helpers').repeat;

  this['⍋'] = function(omega, alpha) {
    return grade(omega, alpha, 1);
  };

  this['⍒'] = function(omega, alpha) {
    return grade(omega, alpha, -1);
  };

  grade = function(omega, alpha, direction) {
    var h, _i, _ref1, _results;
    h = {};
    if (alpha) {
      if (!alpha.shape.length) {
        throw RankError();
      }
      h = {};
      alpha.each(function(x, indices) {
        if (typeof x !== 'string') {
          throw DomainError();
        }
        return h[x] = indices[indices.length - 1];
      });
    }
    if (!omega.shape.length) {
      throw RankError();
    }
    return new APLArray((function() {
      _results = [];
      for (var _i = 0, _ref1 = omega.shape[0]; 0 <= _ref1 ? _i < _ref1 : _i > _ref1; 0 <= _ref1 ? _i++ : _i--){ _results.push(_i); }
      return _results;
    }).apply(this).sort(function(i, j) {
      var a, indices, p, tx, ty, x, y;
      p = omega.offset;
      indices = repeat([0], omega.shape.length);
      while (true) {
        x = omega.data[p + i * omega.stride[0]];
        y = omega.data[p + j * omega.stride[0]];
        tx = typeof x;
        ty = typeof y;
        if (tx < ty) {
          return -direction;
        }
        if (tx > ty) {
          return direction;
        }
        if (h[x] != null) {
          x = h[x];
        }
        if (h[y] != null) {
          y = h[y];
        }
        if (x < y) {
          return -direction;
        }
        if (x > y) {
          return direction;
        }
        a = indices.length - 1;
        while (a > 0 && indices[a] + 1 === omega.shape[a]) {
          p -= omega.stride[a] * indices[a];
          indices[a--] = 0;
        }
        if (a <= 0) {
          break;
        }
        p += omega.stride[a];
        indices[a]++;
      }
      return 0;
    }));
  };

}).call(this);
}, "vocabulary/innerproduct": function(exports, require, module) {(function() {
  var APLArray, each, enclose, outerProduct, reduce;

  APLArray = require('../array').APLArray;

  reduce = require('./slash')['/'];

  enclose = require('./enclose')['⊂'];

  outerProduct = require('./outerproduct')['∘.'];

  each = require('./each')['¨'];

  this['.'] = function(g, f) {
    var F, G;
    F = each(reduce(f));
    G = outerProduct(g);
    return function(omega, alpha) {
      if (alpha.shape.length === 0) {
        alpha = new APLArray([alpha.unwrap()]);
      }
      if (omega.shape.length === 0) {
        omega = new APLArray([omega.unwrap()]);
      }
      return F(G(enclose(omega, void 0, new APLArray([0])), enclose(alpha, void 0, new APLArray([alpha.shape.length - 1]))));
    };
  };

}).call(this);
}, "vocabulary/iota": function(exports, require, module) {(function() {
  var APLArray, DomainError, RankError, isInt, match, prod, repeat, _ref, _ref1;

  APLArray = require('../array').APLArray;

  _ref = require('../errors'), DomainError = _ref.DomainError, RankError = _ref.RankError;

  _ref1 = require('../helpers'), repeat = _ref1.repeat, prod = _ref1.prod, isInt = _ref1.isInt;

  match = require('./vhelpers').match;

  this['⍳'] = function(omega, alpha) {
    var a, axis, d, data, indices, _i, _j, _len, _ref2, _results;
    if (alpha) {
      if (alpha.shape.length !== 1) {
        throw RankError();
      }
      return omega.map(function(x) {
        var e, r;
        try {
          r = alpha.shape;
          alpha.each(function(y, indices) {
            if (match(x, y)) {
              r = indices;
              throw 'break';
            }
          });
        } catch (_error) {
          e = _error;
          if (e !== 'break') {
            throw e;
          }
        }
        if (r.length === 1) {
          return r[0];
        } else {
          return new APLArray(r);
        }
      });
    } else {
      if (omega.shape.length > 1) {
        throw RankError();
      }
      a = omega.toArray();
      for (_i = 0, _len = a.length; _i < _len; _i++) {
        d = a[_i];
        if (!isInt(d, 0)) {
          throw DomainError();
        }
      }
      data = [];
      if (prod(a)) {
        if (a.length === 1) {
          data = (function() {
            _results = [];
            for (var _j = 0, _ref2 = a[0]; 0 <= _ref2 ? _j < _ref2 : _j > _ref2; 0 <= _ref2 ? _j++ : _j--){ _results.push(_j); }
            return _results;
          }).apply(this);
        } else {
          indices = repeat([0], a.length);
          while (true) {
            data.push(new APLArray(indices.slice(0)));
            axis = a.length - 1;
            while (axis >= 0 && indices[axis] + 1 === a[axis]) {
              indices[axis--] = 0;
            }
            if (axis < 0) {
              break;
            }
            indices[axis]++;
          }
        }
      }
      return new APLArray(data, a);
    }
  };

}).call(this);
}, "vocabulary/logic": function(exports, require, module) {(function() {
  var APLArray, DomainError, RankError, assert, bool, isInt, match, negate, numeric, pervasive, _ref, _ref1, _ref2;

  APLArray = require('../array').APLArray;

  _ref = require('../errors'), RankError = _ref.RankError, DomainError = _ref.DomainError;

  _ref1 = require('./vhelpers'), numeric = _ref1.numeric, pervasive = _ref1.pervasive, bool = _ref1.bool, match = _ref1.match;

  _ref2 = require('../helpers'), assert = _ref2.assert, isInt = _ref2.isInt;

  negate = pervasive({
    monad: function(x) {
      return +(!bool(x));
    }
  });

  this['~'] = function(omega, alpha) {
    var data;
    if (alpha) {
      if (alpha.shape.length > 1) {
        throw RankError();
      }
      data = [];
      alpha.each(function(x) {
        var e;
        try {
          omega.each(function(y) {
            if (match(x, y)) {
              throw 'break';
            }
          });
          return data.push(x);
        } catch (_error) {
          e = _error;
          if (e !== 'break') {
            throw e;
          }
        }
      });
      return new APLArray(data);
    } else {
      return negate(omega);
    }
  };

  this['∨'] = pervasive({
    dyad: numeric(function(y, x) {
      var _ref3, _ref4;
      if (!(isInt(x, 0) && isInt(y, 0))) {
        throw DomainError('∨ is implemented only for non-negative integers');
      }
      if (x === 0 && y === 0) {
        return 0;
      }
      if (x < y) {
        _ref3 = [y, x], x = _ref3[0], y = _ref3[1];
      }
      while (y) {
        _ref4 = [y, x % y], x = _ref4[0], y = _ref4[1];
      }
      return x;
    })
  });

  this['∧'] = pervasive({
    dyad: numeric(function(y, x) {
      var p, _ref3, _ref4;
      assert(x === Math.floor(x) && y === Math.floor(y), '∧ is defined only for integers');
      if (x === 0 || y === 0) {
        return 0;
      }
      p = x * y;
      if (x < y) {
        _ref3 = [y, x], x = _ref3[0], y = _ref3[1];
      }
      while (y) {
        _ref4 = [y, x % y], x = _ref4[0], y = _ref4[1];
      }
      return p / x;
    })
  });

  this['⍱'] = pervasive({
    dyad: numeric(function(y, x) {
      return +(!(bool(x) | bool(y)));
    })
  });

  this['⍲'] = pervasive({
    dyad: numeric(function(y, x) {
      return +(!(bool(x) & bool(y)));
    })
  });

}).call(this);
}, "vocabulary/outerproduct": function(exports, require, module) {(function() {
  var APLArray, assert;

  APLArray = require('../array').APLArray;

  assert = require('../helpers').assert;

  this['∘.'] = function(f) {
    assert(typeof f === 'function');
    return function(omega, alpha) {
      var a, b, data, x, y, z, _i, _j, _len, _len1;
      if (!alpha) {
        throw Error('Adverb ∘. (Outer product) can be applied to dyadic verbs only');
      }
      a = alpha.toArray();
      b = omega.toArray();
      data = [];
      for (_i = 0, _len = a.length; _i < _len; _i++) {
        x = a[_i];
        for (_j = 0, _len1 = b.length; _j < _len1; _j++) {
          y = b[_j];
          if (!(x instanceof APLArray)) {
            x = APLArray.scalar(x);
          }
          if (!(y instanceof APLArray)) {
            y = APLArray.scalar(y);
          }
          z = f(y, x);
          if (z.shape.length === 0) {
            z = z.unwrap();
          }
          data.push(z);
        }
      }
      return new APLArray(data, alpha.shape.concat(omega.shape));
    };
  };

}).call(this);
}, "vocabulary/poweroperator": function(exports, require, module) {(function() {
  var assert, isInt, _ref;

  _ref = require('../helpers'), assert = _ref.assert, isInt = _ref.isInt;

  this['⍣'] = function(g, f) {
    var h, n;
    if (typeof f === 'number' && typeof g === 'function') {
      h = f;
      f = g;
      g = h;
    } else {
      assert(typeof f === 'function');
    }
    if (typeof g === 'function') {
      return function(omega, alpha) {
        var omega1;
        while (true) {
          omega1 = f(omega, alpha);
          if (g(omega, omega1).toBool()) {
            return omega;
          }
          omega = omega1;
        }
      };
    } else {
      n = g.toInt(0);
      return function(omega, alpha) {
        var _i;
        for (_i = 0; 0 <= n ? _i < n : _i > n; 0 <= n ? _i++ : _i--) {
          omega = f(omega, alpha);
        }
        return omega;
      };
    }
  };

}).call(this);
}, "vocabulary/quad": function(exports, require, module) {(function() {
  var format;

  format = require('./format').format;

  this['get_⎕'] = function() {
    if (typeof (typeof window !== "undefined" && window !== null ? window.prompt : void 0) === 'function') {
      return new APLArray(prompt('⎕:') || '');
    } else {
      throw Error('Reading from ⎕ is not implemented.');
    }
  };

  this['set_⎕'] = function(x) {
    var s;
    s = format(x).join('\n') + '\n';
    if (typeof (typeof window !== "undefined" && window !== null ? window.alert : void 0) === 'function') {
      window.alert(s);
    } else {
      process.stdout.write(s);
    }
    return x;
  };

  this['get_⍞'] = function() {
    if (typeof (typeof window !== "undefined" && window !== null ? window.prompt : void 0) === 'function') {
      return prompt('') || '';
    } else {
      throw Error('Reading from ⍞ is not implemented.');
    }
  };

  this['set_⍞'] = function(x) {
    var s;
    s = format(x).join('\n');
    if (typeof (typeof window !== "undefined" && window !== null ? window.alert : void 0) === 'function') {
      window.alert(s);
    } else {
      process.stdout.write(s);
    }
    return x;
  };

}).call(this);
}, "vocabulary/question": function(exports, require, module) {(function() {
  var APLArray, DomainError, deal, numeric, pervasive, roll, _ref;

  APLArray = require('../array').APLArray;

  DomainError = require('../errors').DomainError;

  _ref = require('./vhelpers'), numeric = _ref.numeric, pervasive = _ref.pervasive;

  roll = pervasive({
    monad: numeric(function(x) {
      return Math.floor(Math.random() * x);
    })
  });

  deal = function(omega, alpha) {
    var available, x, y, _i, _results;
    y = omega.unwrap();
    x = alpha.unwrap();
    if (x > y) {
      throw DomainError();
    }
    available = (function() {
      _results = [];
      for (var _i = 0; 0 <= y ? _i < y : _i > y; 0 <= y ? _i++ : _i--){ _results.push(_i); }
      return _results;
    }).apply(this);
    return new APLArray((function() {
      var _j, _results1;
      _results1 = [];
      for (_j = 0; 0 <= x ? _j < x : _j > x; 0 <= x ? _j++ : _j--) {
        _results1.push(available.splice(Math.floor(available.length * Math.random()), 1)[0]);
      }
      return _results1;
    })());
  };

  this['?'] = function(omega, alpha) {
    if (alpha) {
      return deal(omega, alpha);
    } else {
      return roll(omega);
    }
  };

}).call(this);
}, "vocabulary/rho": function(exports, require, module) {(function() {
  var APLArray, DomainError, RankError, assert, isInt, prod, repeat, _ref, _ref1;

  APLArray = require('../array').APLArray;

  _ref = require('../errors'), RankError = _ref.RankError, DomainError = _ref.DomainError;

  _ref1 = require('../helpers'), assert = _ref1.assert, prod = _ref1.prod, isInt = _ref1.isInt, repeat = _ref1.repeat;

  this['⍴'] = function(omega, alpha) {
    var a, d, n, shape, _i, _len;
    if (alpha) {
      if (alpha.shape.length > 1) {
        throw RankError();
      }
      shape = alpha.toArray();
      for (_i = 0, _len = shape.length; _i < _len; _i++) {
        d = shape[_i];
        if (!isInt(d, 0)) {
          throw DomainError();
        }
      }
      n = prod(shape);
      a = omega.toArray(n);
      assert(a.length <= n);
      if (a.length) {
        while (2 * a.length < n) {
          a = a.concat(a);
        }
        if (a.length !== n) {
          a = a.concat(a.slice(0, n - a.length));
        }
      } else {
        a = repeat([omega.getPrototype()], n);
      }
      return new APLArray(a, shape);
    } else {
      return new APLArray(omega.shape);
    }
  };

}).call(this);
}, "vocabulary/rotate": function(exports, require, module) {(function() {
  var APLArray, DomainError, IndexError, LengthError, assert, isInt, prod, repeat, rotate, _ref, _ref1;

  APLArray = require('../array').APLArray;

  _ref = require('../errors'), DomainError = _ref.DomainError, LengthError = _ref.LengthError, IndexError = _ref.IndexError;

  _ref1 = require('../helpers'), assert = _ref1.assert, prod = _ref1.prod, repeat = _ref1.repeat, isInt = _ref1.isInt;

  this['⌽'] = rotate = function(omega, alpha, axis) {
    var a, data, indices, n, offset, p, shape, step, stride;
    assert(typeof axis === 'undefined' || axis instanceof APLArray);
    if (alpha) {
      axis = !axis ? omega.shape.length - 1 : axis.unwrap();
      if (!isInt(axis)) {
        throw DomainError();
      }
      if (omega.shape.length && !((0 <= axis && axis < omega.shape.length))) {
        throw IndexError();
      }
      step = alpha.unwrap();
      if (!isInt(step)) {
        throw DomainError();
      }
      if (!step) {
        return omega;
      }
      n = omega.shape[axis];
      step = (n + (step % n)) % n;
      if (omega.empty() || step === 0) {
        return omega;
      }
      data = [];
      shape = omega.shape, stride = omega.stride;
      p = omega.offset;
      indices = repeat([0], shape.length);
      while (true) {
        data.push(omega.data[p + ((indices[axis] + step) % shape[axis] - indices[axis]) * stride[axis]]);
        a = shape.length - 1;
        while (a >= 0 && indices[a] + 1 === shape[a]) {
          p -= indices[a] * stride[a];
          indices[a--] = 0;
        }
        if (a < 0) {
          break;
        }
        indices[a]++;
        p += stride[a];
      }
      return new APLArray(data, shape);
    } else {
      if (axis) {
        if (!axis.isSingleton()) {
          throw LengthError();
        }
        axis = axis.unwrap();
        if (!isInt(axis)) {
          throw DomainError();
        }
        if (!((0 <= axis && axis < omega.shape.length))) {
          throw IndexError();
        }
      } else {
        axis = [omega.shape.length - 1];
      }
      if (omega.shape.length === 0) {
        return omega;
      }
      stride = omega.stride.slice(0);
      stride[axis] = -stride[axis];
      offset = omega.offset + (omega.shape[axis] - 1) * omega.stride[axis];
      return new APLArray(omega.data, omega.shape, stride, offset);
    }
  };

  this['⊖'] = function(omega, alpha, axis) {
    if (axis == null) {
      axis = APLArray.zero;
    }
    return rotate(omega, alpha, axis);
  };

}).call(this);
}, "vocabulary/slash": function(exports, require, module) {(function() {
  var APLArray, DomainError, LengthError, RankError, assert, compressOrReplicate, isInt, reduce, repeat, _ref, _ref1;

  APLArray = require('../array').APLArray;

  _ref = require('../errors'), RankError = _ref.RankError, LengthError = _ref.LengthError, DomainError = _ref.DomainError;

  _ref1 = require('../helpers'), assert = _ref1.assert, repeat = _ref1.repeat, isInt = _ref1.isInt;

  this['/'] = function(omega, alpha, axis) {
    if (typeof omega === 'function') {
      return reduce(omega, alpha, axis);
    } else {
      return compressOrReplicate(omega, alpha, axis);
    }
  };

  this['⌿'] = function(omega, alpha, axis) {
    if (axis == null) {
      axis = APLArray.zero;
    }
    if (typeof omega === 'function') {
      return reduce(omega, alpha, axis);
    } else {
      return compressOrReplicate(omega, alpha, axis);
    }
  };

  reduce = this.reduce = function(f, g, axis0) {
    assert(typeof f === 'function');
    assert(typeof g === 'undefined');
    assert((typeof axis0 === 'undefined') || (axis0 instanceof APLArray));
    return function(omega, alpha) {
      var a, axis, data, i, indices, isBackwards, isMonadic, isNWise, n, p, rShape, shape, x, y, _i, _j, _ref2;
      if (omega.shape.length === 0) {
        omega = new APLArray([omega.unwrap()]);
      }
      axis = axis0 != null ? axis0.toInt() : omega.shape.length - 1;
      if (!((0 <= axis && axis < omega.shape.length))) {
        throw RankError();
      }
      if (alpha) {
        isNWise = true;
        n = alpha.toInt();
        if (n < 0) {
          isBackwards = true;
          n = -n;
        }
      } else {
        n = omega.shape[axis];
        isMonadic = true;
      }
      shape = omega.shape.slice(0);
      shape[axis] = omega.shape[axis] - n + 1;
      rShape = shape;
      if (isNWise) {
        if (shape[axis] === 0) {
          return new APLArray([], rShape);
        }
        if (shape[axis] < 0) {
          throw LengthError();
        }
      } else {
        rShape = rShape.slice(0);
        rShape.splice(axis, 1);
      }
      if (omega.empty()) {
        throw DomainError();
      }
      data = [];
      indices = repeat([0], shape.length);
      p = omega.offset;
      while (true) {
        if (isBackwards) {
          x = omega.data[p];
          x = x instanceof APLArray ? x : APLArray.scalar(x);
          for (i = _i = 1; _i < n; i = _i += 1) {
            y = omega.data[p + i * omega.stride[axis]];
            y = y instanceof APLArray ? y : APLArray.scalar(y);
            x = f(x, y);
          }
        } else {
          x = omega.data[p + (n - 1) * omega.stride[axis]];
          x = x instanceof APLArray ? x : APLArray.scalar(x);
          for (i = _j = _ref2 = n - 2; _j >= 0; i = _j += -1) {
            y = omega.data[p + i * omega.stride[axis]];
            y = y instanceof APLArray ? y : APLArray.scalar(y);
            x = f(x, y);
          }
        }
        if (x.shape.length === 0) {
          x = x.unwrap();
        }
        data.push(x);
        a = indices.length - 1;
        while (a >= 0 && indices[a] + 1 === shape[a]) {
          p -= indices[a] * omega.stride[a];
          indices[a--] = 0;
        }
        if (a < 0) {
          break;
        }
        p += omega.stride[a];
        indices[a]++;
      }
      return new APLArray(data, rShape);
    };
  };

  compressOrReplicate = function(omega, alpha, axis) {
    var a, b, data, filler, i, indices, n, p, shape, x, _i, _j, _len, _ref2;
    if (omega.shape.length === 0) {
      omega = new APLArray([omega.unwrap()]);
    }
    axis = axis ? axis.toInt(0, omega.shape.length) : omega.shape.length - 1;
    if (alpha.shape.length > 1) {
      throw RankError();
    }
    a = alpha.toArray();
    n = omega.shape[axis];
    if (a.length === 1) {
      a = repeat(a, n);
    }
    if (n !== 1 && n !== a.length) {
      throw LengthError();
    }
    shape = omega.shape.slice(0);
    shape[axis] = 0;
    b = [];
    for (i = _i = 0, _len = a.length; _i < _len; i = ++_i) {
      x = a[i];
      if (!isInt(x)) {
        throw DomainError();
      }
      shape[axis] += Math.abs(x);
      for (_j = 0, _ref2 = Math.abs(x); 0 <= _ref2 ? _j < _ref2 : _j > _ref2; 0 <= _ref2 ? _j++ : _j--) {
        b.push(x > 0 ? i : null);
      }
    }
    if (n === 1) {
      b = (function() {
        var _k, _len1, _results;
        _results = [];
        for (_k = 0, _len1 = b.length; _k < _len1; _k++) {
          x = b[_k];
          _results.push(x != null ? 0 : x);
        }
        return _results;
      })();
    }
    data = [];
    if (shape[axis] !== 0 && !omega.empty()) {
      filler = omega.getPrototype();
      p = omega.offset;
      indices = repeat([0], shape.length);
      while (true) {
        x = b[indices[axis]] != null ? omega.data[p + b[indices[axis]] * omega.stride[axis]] : filler;
        data.push(x);
        i = shape.length - 1;
        while (i >= 0 && indices[i] + 1 === shape[i]) {
          if (i !== axis) {
            p -= omega.stride[i] * indices[i];
          }
          indices[i--] = 0;
        }
        if (i < 0) {
          break;
        }
        if (i !== axis) {
          p += omega.stride[i];
        }
        indices[i]++;
      }
    }
    return new APLArray(data, shape);
  };

}).call(this);
}, "vocabulary/special": function(exports, require, module) {(function() {
  var APLArray, Complex, assert, match;

  APLArray = require('../array').APLArray;

  assert = require('../helpers').assert;

  Complex = require('../complex').Complex;

  match = require('./vhelpers').match;

  this._aplify = function(x) {
    var y;
    assert(x != null);
    if (typeof x === 'string') {
      if (x.length === 1) {
        return APLArray.scalar(x);
      } else {
        return new APLArray(x);
      }
    } else if (typeof x === 'number') {
      return APLArray.scalar(x);
    } else if (x instanceof Array) {
      return new APLArray((function() {
        var _i, _len, _results;
        _results = [];
        for (_i = 0, _len = x.length; _i < _len; _i++) {
          y = x[_i];
          if (y instanceof APLArray && y.shape.length === 0) {
            _results.push(y.unwrap());
          } else {
            _results.push(y);
          }
        }
        return _results;
      })());
    } else if (x instanceof APLArray) {
      return x;
    } else {
      throw Error('Cannot aplify object ' + x);
    }
  };

  this._complex = function(re, im) {
    return APLArray.scalar(new Complex(re, im));
  };

  this._bool = function(x) {
    assert(x instanceof APLArray);
    return x.toBool();
  };

  this['get_⎕IO'] = function() {
    return APLArray.zero;
  };

  this['set_⎕IO'] = function(x) {
    if (match(x, APLArray.zero)) {
      return x;
    } else {
      throw Error('The index origin (⎕IO) is fixed at 0');
    }
  };

}).call(this);
}, "vocabulary/squish": function(exports, require, module) {(function() {
  var APLArray, DomainError, IndexError, LengthError, RankError, assert, isInt, prod, repeat, squish, _ref, _ref1;

  APLArray = require('../array').APLArray;

  _ref = require('../errors'), DomainError = _ref.DomainError, IndexError = _ref.IndexError, RankError = _ref.RankError, LengthError = _ref.LengthError;

  _ref1 = require('../helpers'), assert = _ref1.assert, prod = _ref1.prod, repeat = _ref1.repeat, isInt = _ref1.isInt;

  this['⌷'] = squish = function(omega, alpha, axes) {
    var a, alphaItems, axis, d, data, i, p, subscriptShapes, subscripts, u, x, _i, _j, _k, _l, _len, _len1, _m, _n, _ref2, _ref3, _ref4, _ref5, _ref6, _ref7, _results, _results1;
    if (typeof omega === 'function') {
      return function(x, y) {
        return omega(x, y, alpha);
      };
    }
    if (!alpha) {
      throw Error('Not implemented');
    }
    assert(alpha instanceof APLArray);
    assert(omega instanceof APLArray);
    assert((axes == null) || axes instanceof APLArray);
    if (alpha.shape.length > 1) {
      throw RankError();
    }
    alphaItems = alpha.toArray();
    if (alphaItems.length > omega.shape.length) {
      throw LengthError();
    }
    axes = axes ? axes.toArray() : (function() {
      _results = [];
      for (var _i = 0, _ref2 = alphaItems.length; 0 <= _ref2 ? _i < _ref2 : _i > _ref2; 0 <= _ref2 ? _i++ : _i--){ _results.push(_i); }
      return _results;
    }).apply(this);
    if (alphaItems.length !== axes.length) {
      throw LengthError();
    }
    subscripts = Array(omega.shape.length);
    subscriptShapes = Array(omega.shape.length);
    for (i = _j = 0, _len = axes.length; _j < _len; i = ++_j) {
      axis = axes[i];
      if (!isInt(axis)) {
        throw DomainError();
      }
      if (!((0 <= axis && axis < omega.shape.length))) {
        throw RankError();
      }
      if (typeof subscripts[axis] !== 'undefined') {
        throw RankError('Duplicate axis');
      }
      d = alphaItems[i];
      subscripts[axis] = d instanceof APLArray ? d.toArray() : [d];
      assert(subscripts[axis].length);
      subscriptShapes[axis] = d instanceof APLArray ? d.shape : [];
      _ref3 = subscripts[axis];
      for (_k = 0, _len1 = _ref3.length; _k < _len1; _k++) {
        x = _ref3[_k];
        if (!isInt(x)) {
          throw DomainError();
        }
        if (!((0 <= x && x < omega.shape[axis]))) {
          throw IndexError();
        }
      }
    }
    for (i = _l = 0, _ref4 = subscripts.length; 0 <= _ref4 ? _l < _ref4 : _l > _ref4; i = 0 <= _ref4 ? ++_l : --_l) {
      if (!(typeof subscripts[i] === 'undefined')) {
        continue;
      }
      subscripts[i] = (function() {
        _results1 = [];
        for (var _m = 0, _ref5 = omega.shape[i]; 0 <= _ref5 ? _m < _ref5 : _m > _ref5; 0 <= _ref5 ? _m++ : _m--){ _results1.push(_m); }
        return _results1;
      }).apply(this);
      subscriptShapes[i] = [omega.shape[i]];
    }
    data = [];
    u = repeat([0], subscripts.length);
    p = omega.offset;
    for (a = _n = 0, _ref6 = subscripts.length; 0 <= _ref6 ? _n < _ref6 : _n > _ref6; a = 0 <= _ref6 ? ++_n : --_n) {
      p += subscripts[a][0] * omega.stride[a];
    }
    while (true) {
      data.push(omega.data[p]);
      a = subscripts.length - 1;
      while (a >= 0 && u[a] + 1 === subscripts[a].length) {
        p += (subscripts[a][0] - subscripts[a][u[a]]) * omega.stride[a];
        u[a--] = 0;
      }
      if (a < 0) {
        break;
      }
      p += (subscripts[a][u[a] + 1] - subscripts[a][u[a]]) * omega.stride[a];
      u[a]++;
    }
    return new APLArray(data, (_ref7 = []).concat.apply(_ref7, subscriptShapes));
  };

  this._index = function(alpha, omega, axes) {
    return squish(omega, alpha, axes);
  };

}).call(this);
}, "vocabulary/tack": function(exports, require, module) {(function() {
  var APLArray;

  APLArray = require('../array').APLArray;

  this['⊣'] = function(omega, alpha) {
    if (alpha == null) {
      alpha = APLArray.zilde;
    }
    return alpha;
  };

  this['⊢'] = function(omega) {
    return omega;
  };

}).call(this);
}, "vocabulary/take": function(exports, require, module) {(function() {
  var APLArray, DomainError, RankError, prod, repeat, _ref, _ref1;

  APLArray = require('../array').APLArray;

  _ref = require('../errors'), DomainError = _ref.DomainError, RankError = _ref.RankError;

  _ref1 = require('../helpers'), prod = _ref1.prod, repeat = _ref1.repeat;

  this['↑'] = function(omega, alpha) {
    var a, axis, copyIndices, copyShape, data, i, mustCopy, offset, p, q, shape, stride, x, _i, _j, _k, _l, _len, _len1, _len2, _len3, _m, _ref2;
    if (alpha) {
      if (alpha.shape.length > 1) {
        throw RankError();
      }
      if (omega.shape.length === 0) {
        omega = new APLArray([omega.unwrap()]);
      }
      a = alpha.toArray();
      if (a.length > omega.shape.length) {
        throw RankError();
      }
      for (_i = 0, _len = a.length; _i < _len; _i++) {
        x = a[_i];
        if (typeof x !== 'number' || x !== Math.floor(x)) {
          throw DomainError();
        }
      }
      mustCopy = false;
      shape = [];
      for (i = _j = 0, _len1 = a.length; _j < _len1; i = ++_j) {
        x = a[i];
        shape.push(Math.abs(x));
        if (shape[i] > omega.shape[i]) {
          mustCopy = true;
        }
      }
      if (mustCopy) {
        stride = Array(shape.length);
        stride[stride.length - 1] = 1;
        for (i = _k = _ref2 = stride.length - 2; _k >= 0; i = _k += -1) {
          stride[i] = stride[i + 1] * shape[i + 1];
        }
        data = repeat([omega.getPrototype()], prod(shape));
        copyShape = [];
        p = omega.offset;
        q = 0;
        for (i = _l = 0, _len2 = a.length; _l < _len2; i = ++_l) {
          x = a[i];
          copyShape.push(Math.min(omega.shape[i], Math.abs(x)));
          if (x < 0) {
            if (x < -omega.shape[i]) {
              q -= (x + omega.shape[i]) * stride[i];
            } else {
              p += (x + omega.shape[i]) * omega.stride[i];
            }
          }
        }
        if (prod(copyShape)) {
          copyIndices = repeat([0], copyShape.length);
          while (true) {
            data[q] = omega.data[p];
            axis = copyShape.length - 1;
            while (axis >= 0 && copyIndices[axis] + 1 === copyShape[axis]) {
              p -= copyIndices[axis] * omega.stride[axis];
              q -= copyIndices[axis] * stride[axis];
              copyIndices[axis--] = 0;
            }
            if (axis < 0) {
              break;
            }
            p += omega.stride[axis];
            q += stride[axis];
            copyIndices[axis]++;
          }
        }
        return new APLArray(data, shape, stride);
      } else {
        stride = [];
        offset = omega.offset;
        for (i = _m = 0, _len3 = a.length; _m < _len3; i = ++_m) {
          x = a[i];
          if (x >= 0) {
            stride.push(omega.stride[i]);
          } else {
            stride.push(omega.stride[i]);
            offset += (omega.shape[i] + x) * omega.stride[i];
          }
        }
        return new APLArray(omega.data, shape, stride, offset);
      }
    } else {
      throw Error('Not implemented');
    }
  };

}).call(this);
}, "vocabulary/transpose": function(exports, require, module) {(function() {
  var APLArray, assert, prod, _ref;

  APLArray = require('../array').APLArray;

  _ref = require('../helpers'), assert = _ref.assert, prod = _ref.prod;

  this['⍉'] = function(omega, alpha) {
    if (alpha) {
      throw Error('Not implemented');
    } else {
      return new APLArray(omega.data, omega.shape.slice(0).reverse(), omega.stride.slice(0).reverse(), omega.offset);
    }
  };

}).call(this);
}, "vocabulary/vhelpers": function(exports, require, module) {(function() {
  var APLArray, Complex, DomainError, LengthError, RankError, SyntaxError, approx, assert, eps, isInt, match, multiplicitySymbol, numApprox, _ref, _ref1,
    __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  _ref = require('../helpers'), assert = _ref.assert, isInt = _ref.isInt;

  _ref1 = require('../errors'), DomainError = _ref1.DomainError, LengthError = _ref1.LengthError, RankError = _ref1.RankError, SyntaxError = _ref1.SyntaxError;

  APLArray = require('../array').APLArray;

  Complex = require('../complex').Complex;

  multiplicitySymbol = function(z) {
    if (z instanceof APLArray) {
      if (z.isSingleton()) {
        return '1';
      } else {
        return '*';
      }
    } else {
      return '.';
    }
  };

  this.pervasive = function(_arg) {
    var F, dyad, monad, pervadeDyadic, pervadeMonadic;
    monad = _arg.monad, dyad = _arg.dyad;
    pervadeMonadic = monad ? function(x) {
      var _name, _ref2;
      if (x instanceof APLArray) {
        return x.map(pervadeMonadic);
      } else {
        return (_ref2 = typeof x[_name = F.aplName] === "function" ? x[_name]() : void 0) != null ? _ref2 : monad(x);
      }
    } : function() {
      throw Error('Not implemented');
    };
    pervadeDyadic = dyad ? function(x, y) {
      var axis, tx, ty, xi, yi, _i, _name, _name1, _ref2, _ref3, _ref4;
      tx = multiplicitySymbol(x);
      ty = multiplicitySymbol(y);
      switch (tx + ty) {
        case '..':
          return (_ref2 = (_ref3 = y != null ? typeof y[_name = F.aplName] === "function" ? y[_name](x) : void 0 : void 0) != null ? _ref3 : x != null ? typeof x[_name1 = 'right_' + F.aplName] === "function" ? x[_name1](y) : void 0 : void 0) != null ? _ref2 : dyad(x, y);
        case '.1':
          return y.map(function(yi) {
            return pervadeDyadic(x, yi);
          });
        case '.*':
          return y.map(function(yi) {
            return pervadeDyadic(x, yi);
          });
        case '1.':
          return x.map(function(xi) {
            return pervadeDyadic(xi, y);
          });
        case '*.':
          return x.map(function(xi) {
            return pervadeDyadic(xi, y);
          });
        case '1*':
          xi = x.unwrap();
          return y.map(function(yi) {
            return pervadeDyadic(xi, yi);
          });
        case '*1':
          yi = y.unwrap();
          return x.map(function(xi) {
            return pervadeDyadic(xi, yi);
          });
        case '11':
          yi = y.unwrap();
          return x.map(function(xi) {
            return pervadeDyadic(xi, yi);
          });
        case '**':
          if (x.shape.length !== y.shape.length) {
            throw RankError();
          }
          for (axis = _i = 0, _ref4 = x.shape.length; 0 <= _ref4 ? _i < _ref4 : _i > _ref4; axis = 0 <= _ref4 ? ++_i : --_i) {
            if (x.shape[axis] !== y.shape[axis]) {
              throw LengthError();
            }
          }
          return x.map2(y, pervadeDyadic);
      }
    } : function() {
      throw Error('Not implemented');
    };
    return F = function(omega, alpha) {
      assert(omega instanceof APLArray);
      assert(alpha instanceof APLArray || typeof alpha === 'undefined');
      return (alpha ? pervadeDyadic : pervadeMonadic)(omega, alpha);
    };
  };

  this.numeric = function(f) {
    return function(x, y, axis) {
      if (typeof x !== 'number' || ((y != null) && typeof y !== 'number')) {
        throw DomainError();
      }
      return f(x, y, axis);
    };
  };

  this.match = match = function(x, y) {
    var axis, r, _i, _ref2;
    if (x instanceof APLArray) {
      if (!(y instanceof APLArray)) {
        return false;
      } else {
        if (x.shape.length !== y.shape.length) {
          return false;
        }
        for (axis = _i = 0, _ref2 = x.shape.length; 0 <= _ref2 ? _i < _ref2 : _i > _ref2; axis = 0 <= _ref2 ? ++_i : --_i) {
          if (x.shape[axis] !== y.shape[axis]) {
            return false;
          }
        }
        r = true;
        x.each2(y, function(xi, yi) {
          if (!match(xi, yi)) {
            return r = false;
          }
        });
        return r;
      }
    } else {
      if (y instanceof APLArray) {
        return false;
      } else {
        if (x instanceof Complex && y instanceof Complex) {
          return x.re === y.re && x.im === y.im;
        } else {
          return x === y;
        }
      }
    }
  };

  eps = 1e-13;

  numApprox = function(x, y) {
    return x === y || Math.abs(x - y) < eps;
  };

  this.approx = approx = function(x, y) {
    var axis, r, _i, _ref2, _ref3, _ref4;
    if (x instanceof APLArray) {
      if (!(y instanceof APLArray)) {
        return false;
      } else {
        if (x.shape.length !== y.shape.length) {
          return false;
        }
        for (axis = _i = 0, _ref2 = x.shape.length; 0 <= _ref2 ? _i < _ref2 : _i > _ref2; axis = 0 <= _ref2 ? ++_i : --_i) {
          if (x.shape[axis] !== y.shape[axis]) {
            return false;
          }
        }
        r = true;
        x.each2(y, function(xi, yi) {
          if (!approx(xi, yi)) {
            return r = false;
          }
        });
        return r;
      }
    } else {
      if (y instanceof APLArray) {
        return false;
      } else if (!((x != null) && (y != null))) {
        return false;
      } else {
        if (typeof x === 'number') {
          x = new Complex(x);
        }
        if (typeof y === 'number') {
          y = new Complex(y);
        }
        if (x instanceof Complex) {
          return y instanceof Complex && numApprox(x.re, y.re) && numApprox(x.im, y.im);
        } else {
          return (_ref3 = (_ref4 = typeof x['≡'] === "function" ? x['≡'](y) : void 0) != null ? _ref4 : typeof y['≡'] === "function" ? y['≡'](x) : void 0) != null ? _ref3 : x === y;
        }
      }
    }
  };

  this.bool = function(x) {
    if (x !== 0 && x !== 1) {
      throw DomainError();
    }
    return x;
  };

  this.getAxisList = function(axes, rank) {
    var a, i, x, _i, _len;
    assert(isInt(rank, 0));
    if (typeof axes === 'undefined') {
      return [];
    }
    assert(axes instanceof APLArray);
    if (axes.shape.length !== 1 || axes.shape[0] !== 1) {
      throw SyntaxError();
    }
    a = axes.unwrap();
    if (a instanceof APLArray) {
      a = a.toArray();
      for (i = _i = 0, _len = a.length; _i < _len; i = ++_i) {
        x = a[i];
        if (!isInt(x, 0, rank)) {
          throw DomainError();
        }
        if (__indexOf.call(a.slice(0, i), x) >= 0) {
          throw Error('Non-unique axes');
        }
      }
      return a;
    } else if (isInt(a, 0, rank)) {
      return [a];
    } else {
      throw DomainError();
    }
  };

}).call(this);
}, "vocabulary/zilde": function(exports, require, module) {(function() {
  var APLArray;

  APLArray = require('../array').APLArray;

  this['get_⍬'] = function() {
    return APLArray.zilde;
  };

  this['set_⍬'] = function() {
    throw Error('Symbol zilde (⍬) is read-only.');
  };

}).call(this);
}});
/*! jQuery v1.10.1 | (c) 2005, 2013 jQuery Foundation, Inc. | jquery.org/license
//@ sourceMappingURL=jquery.min.map
*/
(function(e,t){var n,r,i=typeof t,o=e.location,a=e.document,s=a.documentElement,l=e.jQuery,u=e.$,c={},p=[],f="1.10.1",d=p.concat,h=p.push,g=p.slice,m=p.indexOf,y=c.toString,v=c.hasOwnProperty,b=f.trim,x=function(e,t){return new x.fn.init(e,t,r)},w=/[+-]?(?:\d*\.|)\d+(?:[eE][+-]?\d+|)/.source,T=/\S+/g,C=/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g,N=/^(?:\s*(<[\w\W]+>)[^>]*|#([\w-]*))$/,k=/^<(\w+)\s*\/?>(?:<\/\1>|)$/,E=/^[\],:{}\s]*$/,S=/(?:^|:|,)(?:\s*\[)+/g,A=/\\(?:["\\\/bfnrt]|u[\da-fA-F]{4})/g,j=/"[^"\\\r\n]*"|true|false|null|-?(?:\d+\.|)\d+(?:[eE][+-]?\d+|)/g,D=/^-ms-/,L=/-([\da-z])/gi,H=function(e,t){return t.toUpperCase()},q=function(e){(a.addEventListener||"load"===e.type||"complete"===a.readyState)&&(_(),x.ready())},_=function(){a.addEventListener?(a.removeEventListener("DOMContentLoaded",q,!1),e.removeEventListener("load",q,!1)):(a.detachEvent("onreadystatechange",q),e.detachEvent("onload",q))};x.fn=x.prototype={jquery:f,constructor:x,init:function(e,n,r){var i,o;if(!e)return this;if("string"==typeof e){if(i="<"===e.charAt(0)&&">"===e.charAt(e.length-1)&&e.length>=3?[null,e,null]:N.exec(e),!i||!i[1]&&n)return!n||n.jquery?(n||r).find(e):this.constructor(n).find(e);if(i[1]){if(n=n instanceof x?n[0]:n,x.merge(this,x.parseHTML(i[1],n&&n.nodeType?n.ownerDocument||n:a,!0)),k.test(i[1])&&x.isPlainObject(n))for(i in n)x.isFunction(this[i])?this[i](n[i]):this.attr(i,n[i]);return this}if(o=a.getElementById(i[2]),o&&o.parentNode){if(o.id!==i[2])return r.find(e);this.length=1,this[0]=o}return this.context=a,this.selector=e,this}return e.nodeType?(this.context=this[0]=e,this.length=1,this):x.isFunction(e)?r.ready(e):(e.selector!==t&&(this.selector=e.selector,this.context=e.context),x.makeArray(e,this))},selector:"",length:0,toArray:function(){return g.call(this)},get:function(e){return null==e?this.toArray():0>e?this[this.length+e]:this[e]},pushStack:function(e){var t=x.merge(this.constructor(),e);return t.prevObject=this,t.context=this.context,t},each:function(e,t){return x.each(this,e,t)},ready:function(e){return x.ready.promise().done(e),this},slice:function(){return this.pushStack(g.apply(this,arguments))},first:function(){return this.eq(0)},last:function(){return this.eq(-1)},eq:function(e){var t=this.length,n=+e+(0>e?t:0);return this.pushStack(n>=0&&t>n?[this[n]]:[])},map:function(e){return this.pushStack(x.map(this,function(t,n){return e.call(t,n,t)}))},end:function(){return this.prevObject||this.constructor(null)},push:h,sort:[].sort,splice:[].splice},x.fn.init.prototype=x.fn,x.extend=x.fn.extend=function(){var e,n,r,i,o,a,s=arguments[0]||{},l=1,u=arguments.length,c=!1;for("boolean"==typeof s&&(c=s,s=arguments[1]||{},l=2),"object"==typeof s||x.isFunction(s)||(s={}),u===l&&(s=this,--l);u>l;l++)if(null!=(o=arguments[l]))for(i in o)e=s[i],r=o[i],s!==r&&(c&&r&&(x.isPlainObject(r)||(n=x.isArray(r)))?(n?(n=!1,a=e&&x.isArray(e)?e:[]):a=e&&x.isPlainObject(e)?e:{},s[i]=x.extend(c,a,r)):r!==t&&(s[i]=r));return s},x.extend({expando:"jQuery"+(f+Math.random()).replace(/\D/g,""),noConflict:function(t){return e.$===x&&(e.$=u),t&&e.jQuery===x&&(e.jQuery=l),x},isReady:!1,readyWait:1,holdReady:function(e){e?x.readyWait++:x.ready(!0)},ready:function(e){if(e===!0?!--x.readyWait:!x.isReady){if(!a.body)return setTimeout(x.ready);x.isReady=!0,e!==!0&&--x.readyWait>0||(n.resolveWith(a,[x]),x.fn.trigger&&x(a).trigger("ready").off("ready"))}},isFunction:function(e){return"function"===x.type(e)},isArray:Array.isArray||function(e){return"array"===x.type(e)},isWindow:function(e){return null!=e&&e==e.window},isNumeric:function(e){return!isNaN(parseFloat(e))&&isFinite(e)},type:function(e){return null==e?e+"":"object"==typeof e||"function"==typeof e?c[y.call(e)]||"object":typeof e},isPlainObject:function(e){var n;if(!e||"object"!==x.type(e)||e.nodeType||x.isWindow(e))return!1;try{if(e.constructor&&!v.call(e,"constructor")&&!v.call(e.constructor.prototype,"isPrototypeOf"))return!1}catch(r){return!1}if(x.support.ownLast)for(n in e)return v.call(e,n);for(n in e);return n===t||v.call(e,n)},isEmptyObject:function(e){var t;for(t in e)return!1;return!0},error:function(e){throw Error(e)},parseHTML:function(e,t,n){if(!e||"string"!=typeof e)return null;"boolean"==typeof t&&(n=t,t=!1),t=t||a;var r=k.exec(e),i=!n&&[];return r?[t.createElement(r[1])]:(r=x.buildFragment([e],t,i),i&&x(i).remove(),x.merge([],r.childNodes))},parseJSON:function(n){return e.JSON&&e.JSON.parse?e.JSON.parse(n):null===n?n:"string"==typeof n&&(n=x.trim(n),n&&E.test(n.replace(A,"@").replace(j,"]").replace(S,"")))?Function("return "+n)():(x.error("Invalid JSON: "+n),t)},parseXML:function(n){var r,i;if(!n||"string"!=typeof n)return null;try{e.DOMParser?(i=new DOMParser,r=i.parseFromString(n,"text/xml")):(r=new ActiveXObject("Microsoft.XMLDOM"),r.async="false",r.loadXML(n))}catch(o){r=t}return r&&r.documentElement&&!r.getElementsByTagName("parsererror").length||x.error("Invalid XML: "+n),r},noop:function(){},globalEval:function(t){t&&x.trim(t)&&(e.execScript||function(t){e.eval.call(e,t)})(t)},camelCase:function(e){return e.replace(D,"ms-").replace(L,H)},nodeName:function(e,t){return e.nodeName&&e.nodeName.toLowerCase()===t.toLowerCase()},each:function(e,t,n){var r,i=0,o=e.length,a=M(e);if(n){if(a){for(;o>i;i++)if(r=t.apply(e[i],n),r===!1)break}else for(i in e)if(r=t.apply(e[i],n),r===!1)break}else if(a){for(;o>i;i++)if(r=t.call(e[i],i,e[i]),r===!1)break}else for(i in e)if(r=t.call(e[i],i,e[i]),r===!1)break;return e},trim:b&&!b.call("\ufeff\u00a0")?function(e){return null==e?"":b.call(e)}:function(e){return null==e?"":(e+"").replace(C,"")},makeArray:function(e,t){var n=t||[];return null!=e&&(M(Object(e))?x.merge(n,"string"==typeof e?[e]:e):h.call(n,e)),n},inArray:function(e,t,n){var r;if(t){if(m)return m.call(t,e,n);for(r=t.length,n=n?0>n?Math.max(0,r+n):n:0;r>n;n++)if(n in t&&t[n]===e)return n}return-1},merge:function(e,n){var r=n.length,i=e.length,o=0;if("number"==typeof r)for(;r>o;o++)e[i++]=n[o];else while(n[o]!==t)e[i++]=n[o++];return e.length=i,e},grep:function(e,t,n){var r,i=[],o=0,a=e.length;for(n=!!n;a>o;o++)r=!!t(e[o],o),n!==r&&i.push(e[o]);return i},map:function(e,t,n){var r,i=0,o=e.length,a=M(e),s=[];if(a)for(;o>i;i++)r=t(e[i],i,n),null!=r&&(s[s.length]=r);else for(i in e)r=t(e[i],i,n),null!=r&&(s[s.length]=r);return d.apply([],s)},guid:1,proxy:function(e,n){var r,i,o;return"string"==typeof n&&(o=e[n],n=e,e=o),x.isFunction(e)?(r=g.call(arguments,2),i=function(){return e.apply(n||this,r.concat(g.call(arguments)))},i.guid=e.guid=e.guid||x.guid++,i):t},access:function(e,n,r,i,o,a,s){var l=0,u=e.length,c=null==r;if("object"===x.type(r)){o=!0;for(l in r)x.access(e,n,l,r[l],!0,a,s)}else if(i!==t&&(o=!0,x.isFunction(i)||(s=!0),c&&(s?(n.call(e,i),n=null):(c=n,n=function(e,t,n){return c.call(x(e),n)})),n))for(;u>l;l++)n(e[l],r,s?i:i.call(e[l],l,n(e[l],r)));return o?e:c?n.call(e):u?n(e[0],r):a},now:function(){return(new Date).getTime()},swap:function(e,t,n,r){var i,o,a={};for(o in t)a[o]=e.style[o],e.style[o]=t[o];i=n.apply(e,r||[]);for(o in t)e.style[o]=a[o];return i}}),x.ready.promise=function(t){if(!n)if(n=x.Deferred(),"complete"===a.readyState)setTimeout(x.ready);else if(a.addEventListener)a.addEventListener("DOMContentLoaded",q,!1),e.addEventListener("load",q,!1);else{a.attachEvent("onreadystatechange",q),e.attachEvent("onload",q);var r=!1;try{r=null==e.frameElement&&a.documentElement}catch(i){}r&&r.doScroll&&function o(){if(!x.isReady){try{r.doScroll("left")}catch(e){return setTimeout(o,50)}_(),x.ready()}}()}return n.promise(t)},x.each("Boolean Number String Function Array Date RegExp Object Error".split(" "),function(e,t){c["[object "+t+"]"]=t.toLowerCase()});function M(e){var t=e.length,n=x.type(e);return x.isWindow(e)?!1:1===e.nodeType&&t?!0:"array"===n||"function"!==n&&(0===t||"number"==typeof t&&t>0&&t-1 in e)}r=x(a),function(e,t){var n,r,i,o,a,s,l,u,c,p,f,d,h,g,m,y,v,b="sizzle"+-new Date,w=e.document,T=0,C=0,N=lt(),k=lt(),E=lt(),S=!1,A=function(){return 0},j=typeof t,D=1<<31,L={}.hasOwnProperty,H=[],q=H.pop,_=H.push,M=H.push,O=H.slice,F=H.indexOf||function(e){var t=0,n=this.length;for(;n>t;t++)if(this[t]===e)return t;return-1},B="checked|selected|async|autofocus|autoplay|controls|defer|disabled|hidden|ismap|loop|multiple|open|readonly|required|scoped",P="[\\x20\\t\\r\\n\\f]",R="(?:\\\\.|[\\w-]|[^\\x00-\\xa0])+",W=R.replace("w","w#"),$="\\["+P+"*("+R+")"+P+"*(?:([*^$|!~]?=)"+P+"*(?:(['\"])((?:\\\\.|[^\\\\])*?)\\3|("+W+")|)|)"+P+"*\\]",I=":("+R+")(?:\\(((['\"])((?:\\\\.|[^\\\\])*?)\\3|((?:\\\\.|[^\\\\()[\\]]|"+$.replace(3,8)+")*)|.*)\\)|)",z=RegExp("^"+P+"+|((?:^|[^\\\\])(?:\\\\.)*)"+P+"+$","g"),X=RegExp("^"+P+"*,"+P+"*"),U=RegExp("^"+P+"*([>+~]|"+P+")"+P+"*"),V=RegExp(P+"*[+~]"),Y=RegExp("="+P+"*([^\\]'\"]*)"+P+"*\\]","g"),J=RegExp(I),G=RegExp("^"+W+"$"),Q={ID:RegExp("^#("+R+")"),CLASS:RegExp("^\\.("+R+")"),TAG:RegExp("^("+R.replace("w","w*")+")"),ATTR:RegExp("^"+$),PSEUDO:RegExp("^"+I),CHILD:RegExp("^:(only|first|last|nth|nth-last)-(child|of-type)(?:\\("+P+"*(even|odd|(([+-]|)(\\d*)n|)"+P+"*(?:([+-]|)"+P+"*(\\d+)|))"+P+"*\\)|)","i"),bool:RegExp("^(?:"+B+")$","i"),needsContext:RegExp("^"+P+"*[>+~]|:(even|odd|eq|gt|lt|nth|first|last)(?:\\("+P+"*((?:-\\d)?\\d*)"+P+"*\\)|)(?=[^-]|$)","i")},K=/^[^{]+\{\s*\[native \w/,Z=/^(?:#([\w-]+)|(\w+)|\.([\w-]+))$/,et=/^(?:input|select|textarea|button)$/i,tt=/^h\d$/i,nt=/'|\\/g,rt=RegExp("\\\\([\\da-f]{1,6}"+P+"?|("+P+")|.)","ig"),it=function(e,t,n){var r="0x"+t-65536;return r!==r||n?t:0>r?String.fromCharCode(r+65536):String.fromCharCode(55296|r>>10,56320|1023&r)};try{M.apply(H=O.call(w.childNodes),w.childNodes),H[w.childNodes.length].nodeType}catch(ot){M={apply:H.length?function(e,t){_.apply(e,O.call(t))}:function(e,t){var n=e.length,r=0;while(e[n++]=t[r++]);e.length=n-1}}}function at(e,t,n,i){var o,a,s,l,u,c,d,m,y,x;if((t?t.ownerDocument||t:w)!==f&&p(t),t=t||f,n=n||[],!e||"string"!=typeof e)return n;if(1!==(l=t.nodeType)&&9!==l)return[];if(h&&!i){if(o=Z.exec(e))if(s=o[1]){if(9===l){if(a=t.getElementById(s),!a||!a.parentNode)return n;if(a.id===s)return n.push(a),n}else if(t.ownerDocument&&(a=t.ownerDocument.getElementById(s))&&v(t,a)&&a.id===s)return n.push(a),n}else{if(o[2])return M.apply(n,t.getElementsByTagName(e)),n;if((s=o[3])&&r.getElementsByClassName&&t.getElementsByClassName)return M.apply(n,t.getElementsByClassName(s)),n}if(r.qsa&&(!g||!g.test(e))){if(m=d=b,y=t,x=9===l&&e,1===l&&"object"!==t.nodeName.toLowerCase()){c=bt(e),(d=t.getAttribute("id"))?m=d.replace(nt,"\\$&"):t.setAttribute("id",m),m="[id='"+m+"'] ",u=c.length;while(u--)c[u]=m+xt(c[u]);y=V.test(e)&&t.parentNode||t,x=c.join(",")}if(x)try{return M.apply(n,y.querySelectorAll(x)),n}catch(T){}finally{d||t.removeAttribute("id")}}}return At(e.replace(z,"$1"),t,n,i)}function st(e){return K.test(e+"")}function lt(){var e=[];function t(n,r){return e.push(n+=" ")>o.cacheLength&&delete t[e.shift()],t[n]=r}return t}function ut(e){return e[b]=!0,e}function ct(e){var t=f.createElement("div");try{return!!e(t)}catch(n){return!1}finally{t.parentNode&&t.parentNode.removeChild(t),t=null}}function pt(e,t,n){e=e.split("|");var r,i=e.length,a=n?null:t;while(i--)(r=o.attrHandle[e[i]])&&r!==t||(o.attrHandle[e[i]]=a)}function ft(e,t){var n=e.getAttributeNode(t);return n&&n.specified?n.value:e[t]===!0?t.toLowerCase():null}function dt(e,t){return e.getAttribute(t,"type"===t.toLowerCase()?1:2)}function ht(e){return"input"===e.nodeName.toLowerCase()?e.defaultValue:t}function gt(e,t){var n=t&&e,r=n&&1===e.nodeType&&1===t.nodeType&&(~t.sourceIndex||D)-(~e.sourceIndex||D);if(r)return r;if(n)while(n=n.nextSibling)if(n===t)return-1;return e?1:-1}function mt(e){return function(t){var n=t.nodeName.toLowerCase();return"input"===n&&t.type===e}}function yt(e){return function(t){var n=t.nodeName.toLowerCase();return("input"===n||"button"===n)&&t.type===e}}function vt(e){return ut(function(t){return t=+t,ut(function(n,r){var i,o=e([],n.length,t),a=o.length;while(a--)n[i=o[a]]&&(n[i]=!(r[i]=n[i]))})})}s=at.isXML=function(e){var t=e&&(e.ownerDocument||e).documentElement;return t?"HTML"!==t.nodeName:!1},r=at.support={},p=at.setDocument=function(e){var n=e?e.ownerDocument||e:w,i=n.parentWindow;return n!==f&&9===n.nodeType&&n.documentElement?(f=n,d=n.documentElement,h=!s(n),i&&i.frameElement&&i.attachEvent("onbeforeunload",function(){p()}),r.attributes=ct(function(e){return e.innerHTML="<a href='#'></a>",pt("type|href|height|width",dt,"#"===e.firstChild.getAttribute("href")),pt(B,ft,null==e.getAttribute("disabled")),e.className="i",!e.getAttribute("className")}),r.input=ct(function(e){return e.innerHTML="<input>",e.firstChild.setAttribute("value",""),""===e.firstChild.getAttribute("value")}),pt("value",ht,r.attributes&&r.input),r.getElementsByTagName=ct(function(e){return e.appendChild(n.createComment("")),!e.getElementsByTagName("*").length}),r.getElementsByClassName=ct(function(e){return e.innerHTML="<div class='a'></div><div class='a i'></div>",e.firstChild.className="i",2===e.getElementsByClassName("i").length}),r.getById=ct(function(e){return d.appendChild(e).id=b,!n.getElementsByName||!n.getElementsByName(b).length}),r.getById?(o.find.ID=function(e,t){if(typeof t.getElementById!==j&&h){var n=t.getElementById(e);return n&&n.parentNode?[n]:[]}},o.filter.ID=function(e){var t=e.replace(rt,it);return function(e){return e.getAttribute("id")===t}}):(delete o.find.ID,o.filter.ID=function(e){var t=e.replace(rt,it);return function(e){var n=typeof e.getAttributeNode!==j&&e.getAttributeNode("id");return n&&n.value===t}}),o.find.TAG=r.getElementsByTagName?function(e,n){return typeof n.getElementsByTagName!==j?n.getElementsByTagName(e):t}:function(e,t){var n,r=[],i=0,o=t.getElementsByTagName(e);if("*"===e){while(n=o[i++])1===n.nodeType&&r.push(n);return r}return o},o.find.CLASS=r.getElementsByClassName&&function(e,n){return typeof n.getElementsByClassName!==j&&h?n.getElementsByClassName(e):t},m=[],g=[],(r.qsa=st(n.querySelectorAll))&&(ct(function(e){e.innerHTML="<select><option selected=''></option></select>",e.querySelectorAll("[selected]").length||g.push("\\["+P+"*(?:value|"+B+")"),e.querySelectorAll(":checked").length||g.push(":checked")}),ct(function(e){var t=n.createElement("input");t.setAttribute("type","hidden"),e.appendChild(t).setAttribute("t",""),e.querySelectorAll("[t^='']").length&&g.push("[*^$]="+P+"*(?:''|\"\")"),e.querySelectorAll(":enabled").length||g.push(":enabled",":disabled"),e.querySelectorAll("*,:x"),g.push(",.*:")})),(r.matchesSelector=st(y=d.webkitMatchesSelector||d.mozMatchesSelector||d.oMatchesSelector||d.msMatchesSelector))&&ct(function(e){r.disconnectedMatch=y.call(e,"div"),y.call(e,"[s!='']:x"),m.push("!=",I)}),g=g.length&&RegExp(g.join("|")),m=m.length&&RegExp(m.join("|")),v=st(d.contains)||d.compareDocumentPosition?function(e,t){var n=9===e.nodeType?e.documentElement:e,r=t&&t.parentNode;return e===r||!(!r||1!==r.nodeType||!(n.contains?n.contains(r):e.compareDocumentPosition&&16&e.compareDocumentPosition(r)))}:function(e,t){if(t)while(t=t.parentNode)if(t===e)return!0;return!1},r.sortDetached=ct(function(e){return 1&e.compareDocumentPosition(n.createElement("div"))}),A=d.compareDocumentPosition?function(e,t){if(e===t)return S=!0,0;var i=t.compareDocumentPosition&&e.compareDocumentPosition&&e.compareDocumentPosition(t);return i?1&i||!r.sortDetached&&t.compareDocumentPosition(e)===i?e===n||v(w,e)?-1:t===n||v(w,t)?1:c?F.call(c,e)-F.call(c,t):0:4&i?-1:1:e.compareDocumentPosition?-1:1}:function(e,t){var r,i=0,o=e.parentNode,a=t.parentNode,s=[e],l=[t];if(e===t)return S=!0,0;if(!o||!a)return e===n?-1:t===n?1:o?-1:a?1:c?F.call(c,e)-F.call(c,t):0;if(o===a)return gt(e,t);r=e;while(r=r.parentNode)s.unshift(r);r=t;while(r=r.parentNode)l.unshift(r);while(s[i]===l[i])i++;return i?gt(s[i],l[i]):s[i]===w?-1:l[i]===w?1:0},n):f},at.matches=function(e,t){return at(e,null,null,t)},at.matchesSelector=function(e,t){if((e.ownerDocument||e)!==f&&p(e),t=t.replace(Y,"='$1']"),!(!r.matchesSelector||!h||m&&m.test(t)||g&&g.test(t)))try{var n=y.call(e,t);if(n||r.disconnectedMatch||e.document&&11!==e.document.nodeType)return n}catch(i){}return at(t,f,null,[e]).length>0},at.contains=function(e,t){return(e.ownerDocument||e)!==f&&p(e),v(e,t)},at.attr=function(e,n){(e.ownerDocument||e)!==f&&p(e);var i=o.attrHandle[n.toLowerCase()],a=i&&L.call(o.attrHandle,n.toLowerCase())?i(e,n,!h):t;return a===t?r.attributes||!h?e.getAttribute(n):(a=e.getAttributeNode(n))&&a.specified?a.value:null:a},at.error=function(e){throw Error("Syntax error, unrecognized expression: "+e)},at.uniqueSort=function(e){var t,n=[],i=0,o=0;if(S=!r.detectDuplicates,c=!r.sortStable&&e.slice(0),e.sort(A),S){while(t=e[o++])t===e[o]&&(i=n.push(o));while(i--)e.splice(n[i],1)}return e},a=at.getText=function(e){var t,n="",r=0,i=e.nodeType;if(i){if(1===i||9===i||11===i){if("string"==typeof e.textContent)return e.textContent;for(e=e.firstChild;e;e=e.nextSibling)n+=a(e)}else if(3===i||4===i)return e.nodeValue}else for(;t=e[r];r++)n+=a(t);return n},o=at.selectors={cacheLength:50,createPseudo:ut,match:Q,attrHandle:{},find:{},relative:{">":{dir:"parentNode",first:!0}," ":{dir:"parentNode"},"+":{dir:"previousSibling",first:!0},"~":{dir:"previousSibling"}},preFilter:{ATTR:function(e){return e[1]=e[1].replace(rt,it),e[3]=(e[4]||e[5]||"").replace(rt,it),"~="===e[2]&&(e[3]=" "+e[3]+" "),e.slice(0,4)},CHILD:function(e){return e[1]=e[1].toLowerCase(),"nth"===e[1].slice(0,3)?(e[3]||at.error(e[0]),e[4]=+(e[4]?e[5]+(e[6]||1):2*("even"===e[3]||"odd"===e[3])),e[5]=+(e[7]+e[8]||"odd"===e[3])):e[3]&&at.error(e[0]),e},PSEUDO:function(e){var n,r=!e[5]&&e[2];return Q.CHILD.test(e[0])?null:(e[3]&&e[4]!==t?e[2]=e[4]:r&&J.test(r)&&(n=bt(r,!0))&&(n=r.indexOf(")",r.length-n)-r.length)&&(e[0]=e[0].slice(0,n),e[2]=r.slice(0,n)),e.slice(0,3))}},filter:{TAG:function(e){var t=e.replace(rt,it).toLowerCase();return"*"===e?function(){return!0}:function(e){return e.nodeName&&e.nodeName.toLowerCase()===t}},CLASS:function(e){var t=N[e+" "];return t||(t=RegExp("(^|"+P+")"+e+"("+P+"|$)"))&&N(e,function(e){return t.test("string"==typeof e.className&&e.className||typeof e.getAttribute!==j&&e.getAttribute("class")||"")})},ATTR:function(e,t,n){return function(r){var i=at.attr(r,e);return null==i?"!="===t:t?(i+="","="===t?i===n:"!="===t?i!==n:"^="===t?n&&0===i.indexOf(n):"*="===t?n&&i.indexOf(n)>-1:"$="===t?n&&i.slice(-n.length)===n:"~="===t?(" "+i+" ").indexOf(n)>-1:"|="===t?i===n||i.slice(0,n.length+1)===n+"-":!1):!0}},CHILD:function(e,t,n,r,i){var o="nth"!==e.slice(0,3),a="last"!==e.slice(-4),s="of-type"===t;return 1===r&&0===i?function(e){return!!e.parentNode}:function(t,n,l){var u,c,p,f,d,h,g=o!==a?"nextSibling":"previousSibling",m=t.parentNode,y=s&&t.nodeName.toLowerCase(),v=!l&&!s;if(m){if(o){while(g){p=t;while(p=p[g])if(s?p.nodeName.toLowerCase()===y:1===p.nodeType)return!1;h=g="only"===e&&!h&&"nextSibling"}return!0}if(h=[a?m.firstChild:m.lastChild],a&&v){c=m[b]||(m[b]={}),u=c[e]||[],d=u[0]===T&&u[1],f=u[0]===T&&u[2],p=d&&m.childNodes[d];while(p=++d&&p&&p[g]||(f=d=0)||h.pop())if(1===p.nodeType&&++f&&p===t){c[e]=[T,d,f];break}}else if(v&&(u=(t[b]||(t[b]={}))[e])&&u[0]===T)f=u[1];else while(p=++d&&p&&p[g]||(f=d=0)||h.pop())if((s?p.nodeName.toLowerCase()===y:1===p.nodeType)&&++f&&(v&&((p[b]||(p[b]={}))[e]=[T,f]),p===t))break;return f-=i,f===r||0===f%r&&f/r>=0}}},PSEUDO:function(e,t){var n,r=o.pseudos[e]||o.setFilters[e.toLowerCase()]||at.error("unsupported pseudo: "+e);return r[b]?r(t):r.length>1?(n=[e,e,"",t],o.setFilters.hasOwnProperty(e.toLowerCase())?ut(function(e,n){var i,o=r(e,t),a=o.length;while(a--)i=F.call(e,o[a]),e[i]=!(n[i]=o[a])}):function(e){return r(e,0,n)}):r}},pseudos:{not:ut(function(e){var t=[],n=[],r=l(e.replace(z,"$1"));return r[b]?ut(function(e,t,n,i){var o,a=r(e,null,i,[]),s=e.length;while(s--)(o=a[s])&&(e[s]=!(t[s]=o))}):function(e,i,o){return t[0]=e,r(t,null,o,n),!n.pop()}}),has:ut(function(e){return function(t){return at(e,t).length>0}}),contains:ut(function(e){return function(t){return(t.textContent||t.innerText||a(t)).indexOf(e)>-1}}),lang:ut(function(e){return G.test(e||"")||at.error("unsupported lang: "+e),e=e.replace(rt,it).toLowerCase(),function(t){var n;do if(n=h?t.lang:t.getAttribute("xml:lang")||t.getAttribute("lang"))return n=n.toLowerCase(),n===e||0===n.indexOf(e+"-");while((t=t.parentNode)&&1===t.nodeType);return!1}}),target:function(t){var n=e.location&&e.location.hash;return n&&n.slice(1)===t.id},root:function(e){return e===d},focus:function(e){return e===f.activeElement&&(!f.hasFocus||f.hasFocus())&&!!(e.type||e.href||~e.tabIndex)},enabled:function(e){return e.disabled===!1},disabled:function(e){return e.disabled===!0},checked:function(e){var t=e.nodeName.toLowerCase();return"input"===t&&!!e.checked||"option"===t&&!!e.selected},selected:function(e){return e.parentNode&&e.parentNode.selectedIndex,e.selected===!0},empty:function(e){for(e=e.firstChild;e;e=e.nextSibling)if(e.nodeName>"@"||3===e.nodeType||4===e.nodeType)return!1;return!0},parent:function(e){return!o.pseudos.empty(e)},header:function(e){return tt.test(e.nodeName)},input:function(e){return et.test(e.nodeName)},button:function(e){var t=e.nodeName.toLowerCase();return"input"===t&&"button"===e.type||"button"===t},text:function(e){var t;return"input"===e.nodeName.toLowerCase()&&"text"===e.type&&(null==(t=e.getAttribute("type"))||t.toLowerCase()===e.type)},first:vt(function(){return[0]}),last:vt(function(e,t){return[t-1]}),eq:vt(function(e,t,n){return[0>n?n+t:n]}),even:vt(function(e,t){var n=0;for(;t>n;n+=2)e.push(n);return e}),odd:vt(function(e,t){var n=1;for(;t>n;n+=2)e.push(n);return e}),lt:vt(function(e,t,n){var r=0>n?n+t:n;for(;--r>=0;)e.push(r);return e}),gt:vt(function(e,t,n){var r=0>n?n+t:n;for(;t>++r;)e.push(r);return e})}};for(n in{radio:!0,checkbox:!0,file:!0,password:!0,image:!0})o.pseudos[n]=mt(n);for(n in{submit:!0,reset:!0})o.pseudos[n]=yt(n);function bt(e,t){var n,r,i,a,s,l,u,c=k[e+" "];if(c)return t?0:c.slice(0);s=e,l=[],u=o.preFilter;while(s){(!n||(r=X.exec(s)))&&(r&&(s=s.slice(r[0].length)||s),l.push(i=[])),n=!1,(r=U.exec(s))&&(n=r.shift(),i.push({value:n,type:r[0].replace(z," ")}),s=s.slice(n.length));for(a in o.filter)!(r=Q[a].exec(s))||u[a]&&!(r=u[a](r))||(n=r.shift(),i.push({value:n,type:a,matches:r}),s=s.slice(n.length));if(!n)break}return t?s.length:s?at.error(e):k(e,l).slice(0)}function xt(e){var t=0,n=e.length,r="";for(;n>t;t++)r+=e[t].value;return r}function wt(e,t,n){var r=t.dir,o=n&&"parentNode"===r,a=C++;return t.first?function(t,n,i){while(t=t[r])if(1===t.nodeType||o)return e(t,n,i)}:function(t,n,s){var l,u,c,p=T+" "+a;if(s){while(t=t[r])if((1===t.nodeType||o)&&e(t,n,s))return!0}else while(t=t[r])if(1===t.nodeType||o)if(c=t[b]||(t[b]={}),(u=c[r])&&u[0]===p){if((l=u[1])===!0||l===i)return l===!0}else if(u=c[r]=[p],u[1]=e(t,n,s)||i,u[1]===!0)return!0}}function Tt(e){return e.length>1?function(t,n,r){var i=e.length;while(i--)if(!e[i](t,n,r))return!1;return!0}:e[0]}function Ct(e,t,n,r,i){var o,a=[],s=0,l=e.length,u=null!=t;for(;l>s;s++)(o=e[s])&&(!n||n(o,r,i))&&(a.push(o),u&&t.push(s));return a}function Nt(e,t,n,r,i,o){return r&&!r[b]&&(r=Nt(r)),i&&!i[b]&&(i=Nt(i,o)),ut(function(o,a,s,l){var u,c,p,f=[],d=[],h=a.length,g=o||St(t||"*",s.nodeType?[s]:s,[]),m=!e||!o&&t?g:Ct(g,f,e,s,l),y=n?i||(o?e:h||r)?[]:a:m;if(n&&n(m,y,s,l),r){u=Ct(y,d),r(u,[],s,l),c=u.length;while(c--)(p=u[c])&&(y[d[c]]=!(m[d[c]]=p))}if(o){if(i||e){if(i){u=[],c=y.length;while(c--)(p=y[c])&&u.push(m[c]=p);i(null,y=[],u,l)}c=y.length;while(c--)(p=y[c])&&(u=i?F.call(o,p):f[c])>-1&&(o[u]=!(a[u]=p))}}else y=Ct(y===a?y.splice(h,y.length):y),i?i(null,a,y,l):M.apply(a,y)})}function kt(e){var t,n,r,i=e.length,a=o.relative[e[0].type],s=a||o.relative[" "],l=a?1:0,c=wt(function(e){return e===t},s,!0),p=wt(function(e){return F.call(t,e)>-1},s,!0),f=[function(e,n,r){return!a&&(r||n!==u)||((t=n).nodeType?c(e,n,r):p(e,n,r))}];for(;i>l;l++)if(n=o.relative[e[l].type])f=[wt(Tt(f),n)];else{if(n=o.filter[e[l].type].apply(null,e[l].matches),n[b]){for(r=++l;i>r;r++)if(o.relative[e[r].type])break;return Nt(l>1&&Tt(f),l>1&&xt(e.slice(0,l-1).concat({value:" "===e[l-2].type?"*":""})).replace(z,"$1"),n,r>l&&kt(e.slice(l,r)),i>r&&kt(e=e.slice(r)),i>r&&xt(e))}f.push(n)}return Tt(f)}function Et(e,t){var n=0,r=t.length>0,a=e.length>0,s=function(s,l,c,p,d){var h,g,m,y=[],v=0,b="0",x=s&&[],w=null!=d,C=u,N=s||a&&o.find.TAG("*",d&&l.parentNode||l),k=T+=null==C?1:Math.random()||.1;for(w&&(u=l!==f&&l,i=n);null!=(h=N[b]);b++){if(a&&h){g=0;while(m=e[g++])if(m(h,l,c)){p.push(h);break}w&&(T=k,i=++n)}r&&((h=!m&&h)&&v--,s&&x.push(h))}if(v+=b,r&&b!==v){g=0;while(m=t[g++])m(x,y,l,c);if(s){if(v>0)while(b--)x[b]||y[b]||(y[b]=q.call(p));y=Ct(y)}M.apply(p,y),w&&!s&&y.length>0&&v+t.length>1&&at.uniqueSort(p)}return w&&(T=k,u=C),x};return r?ut(s):s}l=at.compile=function(e,t){var n,r=[],i=[],o=E[e+" "];if(!o){t||(t=bt(e)),n=t.length;while(n--)o=kt(t[n]),o[b]?r.push(o):i.push(o);o=E(e,Et(i,r))}return o};function St(e,t,n){var r=0,i=t.length;for(;i>r;r++)at(e,t[r],n);return n}function At(e,t,n,i){var a,s,u,c,p,f=bt(e);if(!i&&1===f.length){if(s=f[0]=f[0].slice(0),s.length>2&&"ID"===(u=s[0]).type&&r.getById&&9===t.nodeType&&h&&o.relative[s[1].type]){if(t=(o.find.ID(u.matches[0].replace(rt,it),t)||[])[0],!t)return n;e=e.slice(s.shift().value.length)}a=Q.needsContext.test(e)?0:s.length;while(a--){if(u=s[a],o.relative[c=u.type])break;if((p=o.find[c])&&(i=p(u.matches[0].replace(rt,it),V.test(s[0].type)&&t.parentNode||t))){if(s.splice(a,1),e=i.length&&xt(s),!e)return M.apply(n,i),n;break}}}return l(e,f)(i,t,!h,n,V.test(e)),n}o.pseudos.nth=o.pseudos.eq;function jt(){}jt.prototype=o.filters=o.pseudos,o.setFilters=new jt,r.sortStable=b.split("").sort(A).join("")===b,p(),[0,0].sort(A),r.detectDuplicates=S,x.find=at,x.expr=at.selectors,x.expr[":"]=x.expr.pseudos,x.unique=at.uniqueSort,x.text=at.getText,x.isXMLDoc=at.isXML,x.contains=at.contains}(e);var O={};function F(e){var t=O[e]={};return x.each(e.match(T)||[],function(e,n){t[n]=!0}),t}x.Callbacks=function(e){e="string"==typeof e?O[e]||F(e):x.extend({},e);var n,r,i,o,a,s,l=[],u=!e.once&&[],c=function(t){for(r=e.memory&&t,i=!0,a=s||0,s=0,o=l.length,n=!0;l&&o>a;a++)if(l[a].apply(t[0],t[1])===!1&&e.stopOnFalse){r=!1;break}n=!1,l&&(u?u.length&&c(u.shift()):r?l=[]:p.disable())},p={add:function(){if(l){var t=l.length;(function i(t){x.each(t,function(t,n){var r=x.type(n);"function"===r?e.unique&&p.has(n)||l.push(n):n&&n.length&&"string"!==r&&i(n)})})(arguments),n?o=l.length:r&&(s=t,c(r))}return this},remove:function(){return l&&x.each(arguments,function(e,t){var r;while((r=x.inArray(t,l,r))>-1)l.splice(r,1),n&&(o>=r&&o--,a>=r&&a--)}),this},has:function(e){return e?x.inArray(e,l)>-1:!(!l||!l.length)},empty:function(){return l=[],o=0,this},disable:function(){return l=u=r=t,this},disabled:function(){return!l},lock:function(){return u=t,r||p.disable(),this},locked:function(){return!u},fireWith:function(e,t){return t=t||[],t=[e,t.slice?t.slice():t],!l||i&&!u||(n?u.push(t):c(t)),this},fire:function(){return p.fireWith(this,arguments),this},fired:function(){return!!i}};return p},x.extend({Deferred:function(e){var t=[["resolve","done",x.Callbacks("once memory"),"resolved"],["reject","fail",x.Callbacks("once memory"),"rejected"],["notify","progress",x.Callbacks("memory")]],n="pending",r={state:function(){return n},always:function(){return i.done(arguments).fail(arguments),this},then:function(){var e=arguments;return x.Deferred(function(n){x.each(t,function(t,o){var a=o[0],s=x.isFunction(e[t])&&e[t];i[o[1]](function(){var e=s&&s.apply(this,arguments);e&&x.isFunction(e.promise)?e.promise().done(n.resolve).fail(n.reject).progress(n.notify):n[a+"With"](this===r?n.promise():this,s?[e]:arguments)})}),e=null}).promise()},promise:function(e){return null!=e?x.extend(e,r):r}},i={};return r.pipe=r.then,x.each(t,function(e,o){var a=o[2],s=o[3];r[o[1]]=a.add,s&&a.add(function(){n=s},t[1^e][2].disable,t[2][2].lock),i[o[0]]=function(){return i[o[0]+"With"](this===i?r:this,arguments),this},i[o[0]+"With"]=a.fireWith}),r.promise(i),e&&e.call(i,i),i},when:function(e){var t=0,n=g.call(arguments),r=n.length,i=1!==r||e&&x.isFunction(e.promise)?r:0,o=1===i?e:x.Deferred(),a=function(e,t,n){return function(r){t[e]=this,n[e]=arguments.length>1?g.call(arguments):r,n===s?o.notifyWith(t,n):--i||o.resolveWith(t,n)}},s,l,u;if(r>1)for(s=Array(r),l=Array(r),u=Array(r);r>t;t++)n[t]&&x.isFunction(n[t].promise)?n[t].promise().done(a(t,u,n)).fail(o.reject).progress(a(t,l,s)):--i;return i||o.resolveWith(u,n),o.promise()}}),x.support=function(t){var n,r,o,s,l,u,c,p,f,d=a.createElement("div");if(d.setAttribute("className","t"),d.innerHTML="  <link/><table></table><a href='/a'>a</a><input type='checkbox'/>",n=d.getElementsByTagName("*")||[],r=d.getElementsByTagName("a")[0],!r||!r.style||!n.length)return t;s=a.createElement("select"),u=s.appendChild(a.createElement("option")),o=d.getElementsByTagName("input")[0],r.style.cssText="top:1px;float:left;opacity:.5",t.getSetAttribute="t"!==d.className,t.leadingWhitespace=3===d.firstChild.nodeType,t.tbody=!d.getElementsByTagName("tbody").length,t.htmlSerialize=!!d.getElementsByTagName("link").length,t.style=/top/.test(r.getAttribute("style")),t.hrefNormalized="/a"===r.getAttribute("href"),t.opacity=/^0.5/.test(r.style.opacity),t.cssFloat=!!r.style.cssFloat,t.checkOn=!!o.value,t.optSelected=u.selected,t.enctype=!!a.createElement("form").enctype,t.html5Clone="<:nav></:nav>"!==a.createElement("nav").cloneNode(!0).outerHTML,t.inlineBlockNeedsLayout=!1,t.shrinkWrapBlocks=!1,t.pixelPosition=!1,t.deleteExpando=!0,t.noCloneEvent=!0,t.reliableMarginRight=!0,t.boxSizingReliable=!0,o.checked=!0,t.noCloneChecked=o.cloneNode(!0).checked,s.disabled=!0,t.optDisabled=!u.disabled;try{delete d.test}catch(h){t.deleteExpando=!1}o=a.createElement("input"),o.setAttribute("value",""),t.input=""===o.getAttribute("value"),o.value="t",o.setAttribute("type","radio"),t.radioValue="t"===o.value,o.setAttribute("checked","t"),o.setAttribute("name","t"),l=a.createDocumentFragment(),l.appendChild(o),t.appendChecked=o.checked,t.checkClone=l.cloneNode(!0).cloneNode(!0).lastChild.checked,d.attachEvent&&(d.attachEvent("onclick",function(){t.noCloneEvent=!1}),d.cloneNode(!0).click());for(f in{submit:!0,change:!0,focusin:!0})d.setAttribute(c="on"+f,"t"),t[f+"Bubbles"]=c in e||d.attributes[c].expando===!1;d.style.backgroundClip="content-box",d.cloneNode(!0).style.backgroundClip="",t.clearCloneStyle="content-box"===d.style.backgroundClip;for(f in x(t))break;return t.ownLast="0"!==f,x(function(){var n,r,o,s="padding:0;margin:0;border:0;display:block;box-sizing:content-box;-moz-box-sizing:content-box;-webkit-box-sizing:content-box;",l=a.getElementsByTagName("body")[0];l&&(n=a.createElement("div"),n.style.cssText="border:0;width:0;height:0;position:absolute;top:0;left:-9999px;margin-top:1px",l.appendChild(n).appendChild(d),d.innerHTML="<table><tr><td></td><td>t</td></tr></table>",o=d.getElementsByTagName("td"),o[0].style.cssText="padding:0;margin:0;border:0;display:none",p=0===o[0].offsetHeight,o[0].style.display="",o[1].style.display="none",t.reliableHiddenOffsets=p&&0===o[0].offsetHeight,d.innerHTML="",d.style.cssText="box-sizing:border-box;-moz-box-sizing:border-box;-webkit-box-sizing:border-box;padding:1px;border:1px;display:block;width:4px;margin-top:1%;position:absolute;top:1%;",x.swap(l,null!=l.style.zoom?{zoom:1}:{},function(){t.boxSizing=4===d.offsetWidth}),e.getComputedStyle&&(t.pixelPosition="1%"!==(e.getComputedStyle(d,null)||{}).top,t.boxSizingReliable="4px"===(e.getComputedStyle(d,null)||{width:"4px"}).width,r=d.appendChild(a.createElement("div")),r.style.cssText=d.style.cssText=s,r.style.marginRight=r.style.width="0",d.style.width="1px",t.reliableMarginRight=!parseFloat((e.getComputedStyle(r,null)||{}).marginRight)),typeof d.style.zoom!==i&&(d.innerHTML="",d.style.cssText=s+"width:1px;padding:1px;display:inline;zoom:1",t.inlineBlockNeedsLayout=3===d.offsetWidth,d.style.display="block",d.innerHTML="<div></div>",d.firstChild.style.width="5px",t.shrinkWrapBlocks=3!==d.offsetWidth,t.inlineBlockNeedsLayout&&(l.style.zoom=1)),l.removeChild(n),n=d=o=r=null)
}),n=s=l=u=r=o=null,t}({});var B=/(?:\{[\s\S]*\}|\[[\s\S]*\])$/,P=/([A-Z])/g;function R(e,n,r,i){if(x.acceptData(e)){var o,a,s=x.expando,l=e.nodeType,u=l?x.cache:e,c=l?e[s]:e[s]&&s;if(c&&u[c]&&(i||u[c].data)||r!==t||"string"!=typeof n)return c||(c=l?e[s]=p.pop()||x.guid++:s),u[c]||(u[c]=l?{}:{toJSON:x.noop}),("object"==typeof n||"function"==typeof n)&&(i?u[c]=x.extend(u[c],n):u[c].data=x.extend(u[c].data,n)),a=u[c],i||(a.data||(a.data={}),a=a.data),r!==t&&(a[x.camelCase(n)]=r),"string"==typeof n?(o=a[n],null==o&&(o=a[x.camelCase(n)])):o=a,o}}function W(e,t,n){if(x.acceptData(e)){var r,i,o=e.nodeType,a=o?x.cache:e,s=o?e[x.expando]:x.expando;if(a[s]){if(t&&(r=n?a[s]:a[s].data)){x.isArray(t)?t=t.concat(x.map(t,x.camelCase)):t in r?t=[t]:(t=x.camelCase(t),t=t in r?[t]:t.split(" ")),i=t.length;while(i--)delete r[t[i]];if(n?!I(r):!x.isEmptyObject(r))return}(n||(delete a[s].data,I(a[s])))&&(o?x.cleanData([e],!0):x.support.deleteExpando||a!=a.window?delete a[s]:a[s]=null)}}}x.extend({cache:{},noData:{applet:!0,embed:!0,object:"clsid:D27CDB6E-AE6D-11cf-96B8-444553540000"},hasData:function(e){return e=e.nodeType?x.cache[e[x.expando]]:e[x.expando],!!e&&!I(e)},data:function(e,t,n){return R(e,t,n)},removeData:function(e,t){return W(e,t)},_data:function(e,t,n){return R(e,t,n,!0)},_removeData:function(e,t){return W(e,t,!0)},acceptData:function(e){if(e.nodeType&&1!==e.nodeType&&9!==e.nodeType)return!1;var t=e.nodeName&&x.noData[e.nodeName.toLowerCase()];return!t||t!==!0&&e.getAttribute("classid")===t}}),x.fn.extend({data:function(e,n){var r,i,o=null,a=0,s=this[0];if(e===t){if(this.length&&(o=x.data(s),1===s.nodeType&&!x._data(s,"parsedAttrs"))){for(r=s.attributes;r.length>a;a++)i=r[a].name,0===i.indexOf("data-")&&(i=x.camelCase(i.slice(5)),$(s,i,o[i]));x._data(s,"parsedAttrs",!0)}return o}return"object"==typeof e?this.each(function(){x.data(this,e)}):arguments.length>1?this.each(function(){x.data(this,e,n)}):s?$(s,e,x.data(s,e)):null},removeData:function(e){return this.each(function(){x.removeData(this,e)})}});function $(e,n,r){if(r===t&&1===e.nodeType){var i="data-"+n.replace(P,"-$1").toLowerCase();if(r=e.getAttribute(i),"string"==typeof r){try{r="true"===r?!0:"false"===r?!1:"null"===r?null:+r+""===r?+r:B.test(r)?x.parseJSON(r):r}catch(o){}x.data(e,n,r)}else r=t}return r}function I(e){var t;for(t in e)if(("data"!==t||!x.isEmptyObject(e[t]))&&"toJSON"!==t)return!1;return!0}x.extend({queue:function(e,n,r){var i;return e?(n=(n||"fx")+"queue",i=x._data(e,n),r&&(!i||x.isArray(r)?i=x._data(e,n,x.makeArray(r)):i.push(r)),i||[]):t},dequeue:function(e,t){t=t||"fx";var n=x.queue(e,t),r=n.length,i=n.shift(),o=x._queueHooks(e,t),a=function(){x.dequeue(e,t)};"inprogress"===i&&(i=n.shift(),r--),i&&("fx"===t&&n.unshift("inprogress"),delete o.stop,i.call(e,a,o)),!r&&o&&o.empty.fire()},_queueHooks:function(e,t){var n=t+"queueHooks";return x._data(e,n)||x._data(e,n,{empty:x.Callbacks("once memory").add(function(){x._removeData(e,t+"queue"),x._removeData(e,n)})})}}),x.fn.extend({queue:function(e,n){var r=2;return"string"!=typeof e&&(n=e,e="fx",r--),r>arguments.length?x.queue(this[0],e):n===t?this:this.each(function(){var t=x.queue(this,e,n);x._queueHooks(this,e),"fx"===e&&"inprogress"!==t[0]&&x.dequeue(this,e)})},dequeue:function(e){return this.each(function(){x.dequeue(this,e)})},delay:function(e,t){return e=x.fx?x.fx.speeds[e]||e:e,t=t||"fx",this.queue(t,function(t,n){var r=setTimeout(t,e);n.stop=function(){clearTimeout(r)}})},clearQueue:function(e){return this.queue(e||"fx",[])},promise:function(e,n){var r,i=1,o=x.Deferred(),a=this,s=this.length,l=function(){--i||o.resolveWith(a,[a])};"string"!=typeof e&&(n=e,e=t),e=e||"fx";while(s--)r=x._data(a[s],e+"queueHooks"),r&&r.empty&&(i++,r.empty.add(l));return l(),o.promise(n)}});var z,X,U=/[\t\r\n\f]/g,V=/\r/g,Y=/^(?:input|select|textarea|button|object)$/i,J=/^(?:a|area)$/i,G=/^(?:checked|selected)$/i,Q=x.support.getSetAttribute,K=x.support.input;x.fn.extend({attr:function(e,t){return x.access(this,x.attr,e,t,arguments.length>1)},removeAttr:function(e){return this.each(function(){x.removeAttr(this,e)})},prop:function(e,t){return x.access(this,x.prop,e,t,arguments.length>1)},removeProp:function(e){return e=x.propFix[e]||e,this.each(function(){try{this[e]=t,delete this[e]}catch(n){}})},addClass:function(e){var t,n,r,i,o,a=0,s=this.length,l="string"==typeof e&&e;if(x.isFunction(e))return this.each(function(t){x(this).addClass(e.call(this,t,this.className))});if(l)for(t=(e||"").match(T)||[];s>a;a++)if(n=this[a],r=1===n.nodeType&&(n.className?(" "+n.className+" ").replace(U," "):" ")){o=0;while(i=t[o++])0>r.indexOf(" "+i+" ")&&(r+=i+" ");n.className=x.trim(r)}return this},removeClass:function(e){var t,n,r,i,o,a=0,s=this.length,l=0===arguments.length||"string"==typeof e&&e;if(x.isFunction(e))return this.each(function(t){x(this).removeClass(e.call(this,t,this.className))});if(l)for(t=(e||"").match(T)||[];s>a;a++)if(n=this[a],r=1===n.nodeType&&(n.className?(" "+n.className+" ").replace(U," "):"")){o=0;while(i=t[o++])while(r.indexOf(" "+i+" ")>=0)r=r.replace(" "+i+" "," ");n.className=e?x.trim(r):""}return this},toggleClass:function(e,t){var n=typeof e,r="boolean"==typeof t;return x.isFunction(e)?this.each(function(n){x(this).toggleClass(e.call(this,n,this.className,t),t)}):this.each(function(){if("string"===n){var o,a=0,s=x(this),l=t,u=e.match(T)||[];while(o=u[a++])l=r?l:!s.hasClass(o),s[l?"addClass":"removeClass"](o)}else(n===i||"boolean"===n)&&(this.className&&x._data(this,"__className__",this.className),this.className=this.className||e===!1?"":x._data(this,"__className__")||"")})},hasClass:function(e){var t=" "+e+" ",n=0,r=this.length;for(;r>n;n++)if(1===this[n].nodeType&&(" "+this[n].className+" ").replace(U," ").indexOf(t)>=0)return!0;return!1},val:function(e){var n,r,i,o=this[0];{if(arguments.length)return i=x.isFunction(e),this.each(function(n){var o;1===this.nodeType&&(o=i?e.call(this,n,x(this).val()):e,null==o?o="":"number"==typeof o?o+="":x.isArray(o)&&(o=x.map(o,function(e){return null==e?"":e+""})),r=x.valHooks[this.type]||x.valHooks[this.nodeName.toLowerCase()],r&&"set"in r&&r.set(this,o,"value")!==t||(this.value=o))});if(o)return r=x.valHooks[o.type]||x.valHooks[o.nodeName.toLowerCase()],r&&"get"in r&&(n=r.get(o,"value"))!==t?n:(n=o.value,"string"==typeof n?n.replace(V,""):null==n?"":n)}}}),x.extend({valHooks:{option:{get:function(e){var t=x.find.attr(e,"value");return null!=t?t:e.text}},select:{get:function(e){var t,n,r=e.options,i=e.selectedIndex,o="select-one"===e.type||0>i,a=o?null:[],s=o?i+1:r.length,l=0>i?s:o?i:0;for(;s>l;l++)if(n=r[l],!(!n.selected&&l!==i||(x.support.optDisabled?n.disabled:null!==n.getAttribute("disabled"))||n.parentNode.disabled&&x.nodeName(n.parentNode,"optgroup"))){if(t=x(n).val(),o)return t;a.push(t)}return a},set:function(e,t){var n,r,i=e.options,o=x.makeArray(t),a=i.length;while(a--)r=i[a],(r.selected=x.inArray(x(r).val(),o)>=0)&&(n=!0);return n||(e.selectedIndex=-1),o}}},attr:function(e,n,r){var o,a,s=e.nodeType;if(e&&3!==s&&8!==s&&2!==s)return typeof e.getAttribute===i?x.prop(e,n,r):(1===s&&x.isXMLDoc(e)||(n=n.toLowerCase(),o=x.attrHooks[n]||(x.expr.match.bool.test(n)?X:z)),r===t?o&&"get"in o&&null!==(a=o.get(e,n))?a:(a=x.find.attr(e,n),null==a?t:a):null!==r?o&&"set"in o&&(a=o.set(e,r,n))!==t?a:(e.setAttribute(n,r+""),r):(x.removeAttr(e,n),t))},removeAttr:function(e,t){var n,r,i=0,o=t&&t.match(T);if(o&&1===e.nodeType)while(n=o[i++])r=x.propFix[n]||n,x.expr.match.bool.test(n)?K&&Q||!G.test(n)?e[r]=!1:e[x.camelCase("default-"+n)]=e[r]=!1:x.attr(e,n,""),e.removeAttribute(Q?n:r)},attrHooks:{type:{set:function(e,t){if(!x.support.radioValue&&"radio"===t&&x.nodeName(e,"input")){var n=e.value;return e.setAttribute("type",t),n&&(e.value=n),t}}}},propFix:{"for":"htmlFor","class":"className"},prop:function(e,n,r){var i,o,a,s=e.nodeType;if(e&&3!==s&&8!==s&&2!==s)return a=1!==s||!x.isXMLDoc(e),a&&(n=x.propFix[n]||n,o=x.propHooks[n]),r!==t?o&&"set"in o&&(i=o.set(e,r,n))!==t?i:e[n]=r:o&&"get"in o&&null!==(i=o.get(e,n))?i:e[n]},propHooks:{tabIndex:{get:function(e){var t=x.find.attr(e,"tabindex");return t?parseInt(t,10):Y.test(e.nodeName)||J.test(e.nodeName)&&e.href?0:-1}}}}),X={set:function(e,t,n){return t===!1?x.removeAttr(e,n):K&&Q||!G.test(n)?e.setAttribute(!Q&&x.propFix[n]||n,n):e[x.camelCase("default-"+n)]=e[n]=!0,n}},x.each(x.expr.match.bool.source.match(/\w+/g),function(e,n){var r=x.expr.attrHandle[n]||x.find.attr;x.expr.attrHandle[n]=K&&Q||!G.test(n)?function(e,n,i){var o=x.expr.attrHandle[n],a=i?t:(x.expr.attrHandle[n]=t)!=r(e,n,i)?n.toLowerCase():null;return x.expr.attrHandle[n]=o,a}:function(e,n,r){return r?t:e[x.camelCase("default-"+n)]?n.toLowerCase():null}}),K&&Q||(x.attrHooks.value={set:function(e,n,r){return x.nodeName(e,"input")?(e.defaultValue=n,t):z&&z.set(e,n,r)}}),Q||(z={set:function(e,n,r){var i=e.getAttributeNode(r);return i||e.setAttributeNode(i=e.ownerDocument.createAttribute(r)),i.value=n+="","value"===r||n===e.getAttribute(r)?n:t}},x.expr.attrHandle.id=x.expr.attrHandle.name=x.expr.attrHandle.coords=function(e,n,r){var i;return r?t:(i=e.getAttributeNode(n))&&""!==i.value?i.value:null},x.valHooks.button={get:function(e,n){var r=e.getAttributeNode(n);return r&&r.specified?r.value:t},set:z.set},x.attrHooks.contenteditable={set:function(e,t,n){z.set(e,""===t?!1:t,n)}},x.each(["width","height"],function(e,n){x.attrHooks[n]={set:function(e,r){return""===r?(e.setAttribute(n,"auto"),r):t}}})),x.support.hrefNormalized||x.each(["href","src"],function(e,t){x.propHooks[t]={get:function(e){return e.getAttribute(t,4)}}}),x.support.style||(x.attrHooks.style={get:function(e){return e.style.cssText||t},set:function(e,t){return e.style.cssText=t+""}}),x.support.optSelected||(x.propHooks.selected={get:function(e){var t=e.parentNode;return t&&(t.selectedIndex,t.parentNode&&t.parentNode.selectedIndex),null}}),x.each(["tabIndex","readOnly","maxLength","cellSpacing","cellPadding","rowSpan","colSpan","useMap","frameBorder","contentEditable"],function(){x.propFix[this.toLowerCase()]=this}),x.support.enctype||(x.propFix.enctype="encoding"),x.each(["radio","checkbox"],function(){x.valHooks[this]={set:function(e,n){return x.isArray(n)?e.checked=x.inArray(x(e).val(),n)>=0:t}},x.support.checkOn||(x.valHooks[this].get=function(e){return null===e.getAttribute("value")?"on":e.value})});var Z=/^(?:input|select|textarea)$/i,et=/^key/,tt=/^(?:mouse|contextmenu)|click/,nt=/^(?:focusinfocus|focusoutblur)$/,rt=/^([^.]*)(?:\.(.+)|)$/;function it(){return!0}function ot(){return!1}function at(){try{return a.activeElement}catch(e){}}x.event={global:{},add:function(e,n,r,o,a){var s,l,u,c,p,f,d,h,g,m,y,v=x._data(e);if(v){r.handler&&(c=r,r=c.handler,a=c.selector),r.guid||(r.guid=x.guid++),(l=v.events)||(l=v.events={}),(f=v.handle)||(f=v.handle=function(e){return typeof x===i||e&&x.event.triggered===e.type?t:x.event.dispatch.apply(f.elem,arguments)},f.elem=e),n=(n||"").match(T)||[""],u=n.length;while(u--)s=rt.exec(n[u])||[],g=y=s[1],m=(s[2]||"").split(".").sort(),g&&(p=x.event.special[g]||{},g=(a?p.delegateType:p.bindType)||g,p=x.event.special[g]||{},d=x.extend({type:g,origType:y,data:o,handler:r,guid:r.guid,selector:a,needsContext:a&&x.expr.match.needsContext.test(a),namespace:m.join(".")},c),(h=l[g])||(h=l[g]=[],h.delegateCount=0,p.setup&&p.setup.call(e,o,m,f)!==!1||(e.addEventListener?e.addEventListener(g,f,!1):e.attachEvent&&e.attachEvent("on"+g,f))),p.add&&(p.add.call(e,d),d.handler.guid||(d.handler.guid=r.guid)),a?h.splice(h.delegateCount++,0,d):h.push(d),x.event.global[g]=!0);e=null}},remove:function(e,t,n,r,i){var o,a,s,l,u,c,p,f,d,h,g,m=x.hasData(e)&&x._data(e);if(m&&(c=m.events)){t=(t||"").match(T)||[""],u=t.length;while(u--)if(s=rt.exec(t[u])||[],d=g=s[1],h=(s[2]||"").split(".").sort(),d){p=x.event.special[d]||{},d=(r?p.delegateType:p.bindType)||d,f=c[d]||[],s=s[2]&&RegExp("(^|\\.)"+h.join("\\.(?:.*\\.|)")+"(\\.|$)"),l=o=f.length;while(o--)a=f[o],!i&&g!==a.origType||n&&n.guid!==a.guid||s&&!s.test(a.namespace)||r&&r!==a.selector&&("**"!==r||!a.selector)||(f.splice(o,1),a.selector&&f.delegateCount--,p.remove&&p.remove.call(e,a));l&&!f.length&&(p.teardown&&p.teardown.call(e,h,m.handle)!==!1||x.removeEvent(e,d,m.handle),delete c[d])}else for(d in c)x.event.remove(e,d+t[u],n,r,!0);x.isEmptyObject(c)&&(delete m.handle,x._removeData(e,"events"))}},trigger:function(n,r,i,o){var s,l,u,c,p,f,d,h=[i||a],g=v.call(n,"type")?n.type:n,m=v.call(n,"namespace")?n.namespace.split("."):[];if(u=f=i=i||a,3!==i.nodeType&&8!==i.nodeType&&!nt.test(g+x.event.triggered)&&(g.indexOf(".")>=0&&(m=g.split("."),g=m.shift(),m.sort()),l=0>g.indexOf(":")&&"on"+g,n=n[x.expando]?n:new x.Event(g,"object"==typeof n&&n),n.isTrigger=o?2:3,n.namespace=m.join("."),n.namespace_re=n.namespace?RegExp("(^|\\.)"+m.join("\\.(?:.*\\.|)")+"(\\.|$)"):null,n.result=t,n.target||(n.target=i),r=null==r?[n]:x.makeArray(r,[n]),p=x.event.special[g]||{},o||!p.trigger||p.trigger.apply(i,r)!==!1)){if(!o&&!p.noBubble&&!x.isWindow(i)){for(c=p.delegateType||g,nt.test(c+g)||(u=u.parentNode);u;u=u.parentNode)h.push(u),f=u;f===(i.ownerDocument||a)&&h.push(f.defaultView||f.parentWindow||e)}d=0;while((u=h[d++])&&!n.isPropagationStopped())n.type=d>1?c:p.bindType||g,s=(x._data(u,"events")||{})[n.type]&&x._data(u,"handle"),s&&s.apply(u,r),s=l&&u[l],s&&x.acceptData(u)&&s.apply&&s.apply(u,r)===!1&&n.preventDefault();if(n.type=g,!o&&!n.isDefaultPrevented()&&(!p._default||p._default.apply(h.pop(),r)===!1)&&x.acceptData(i)&&l&&i[g]&&!x.isWindow(i)){f=i[l],f&&(i[l]=null),x.event.triggered=g;try{i[g]()}catch(y){}x.event.triggered=t,f&&(i[l]=f)}return n.result}},dispatch:function(e){e=x.event.fix(e);var n,r,i,o,a,s=[],l=g.call(arguments),u=(x._data(this,"events")||{})[e.type]||[],c=x.event.special[e.type]||{};if(l[0]=e,e.delegateTarget=this,!c.preDispatch||c.preDispatch.call(this,e)!==!1){s=x.event.handlers.call(this,e,u),n=0;while((o=s[n++])&&!e.isPropagationStopped()){e.currentTarget=o.elem,a=0;while((i=o.handlers[a++])&&!e.isImmediatePropagationStopped())(!e.namespace_re||e.namespace_re.test(i.namespace))&&(e.handleObj=i,e.data=i.data,r=((x.event.special[i.origType]||{}).handle||i.handler).apply(o.elem,l),r!==t&&(e.result=r)===!1&&(e.preventDefault(),e.stopPropagation()))}return c.postDispatch&&c.postDispatch.call(this,e),e.result}},handlers:function(e,n){var r,i,o,a,s=[],l=n.delegateCount,u=e.target;if(l&&u.nodeType&&(!e.button||"click"!==e.type))for(;u!=this;u=u.parentNode||this)if(1===u.nodeType&&(u.disabled!==!0||"click"!==e.type)){for(o=[],a=0;l>a;a++)i=n[a],r=i.selector+" ",o[r]===t&&(o[r]=i.needsContext?x(r,this).index(u)>=0:x.find(r,this,null,[u]).length),o[r]&&o.push(i);o.length&&s.push({elem:u,handlers:o})}return n.length>l&&s.push({elem:this,handlers:n.slice(l)}),s},fix:function(e){if(e[x.expando])return e;var t,n,r,i=e.type,o=e,s=this.fixHooks[i];s||(this.fixHooks[i]=s=tt.test(i)?this.mouseHooks:et.test(i)?this.keyHooks:{}),r=s.props?this.props.concat(s.props):this.props,e=new x.Event(o),t=r.length;while(t--)n=r[t],e[n]=o[n];return e.target||(e.target=o.srcElement||a),3===e.target.nodeType&&(e.target=e.target.parentNode),e.metaKey=!!e.metaKey,s.filter?s.filter(e,o):e},props:"altKey bubbles cancelable ctrlKey currentTarget eventPhase metaKey relatedTarget shiftKey target timeStamp view which".split(" "),fixHooks:{},keyHooks:{props:"char charCode key keyCode".split(" "),filter:function(e,t){return null==e.which&&(e.which=null!=t.charCode?t.charCode:t.keyCode),e}},mouseHooks:{props:"button buttons clientX clientY fromElement offsetX offsetY pageX pageY screenX screenY toElement".split(" "),filter:function(e,n){var r,i,o,s=n.button,l=n.fromElement;return null==e.pageX&&null!=n.clientX&&(i=e.target.ownerDocument||a,o=i.documentElement,r=i.body,e.pageX=n.clientX+(o&&o.scrollLeft||r&&r.scrollLeft||0)-(o&&o.clientLeft||r&&r.clientLeft||0),e.pageY=n.clientY+(o&&o.scrollTop||r&&r.scrollTop||0)-(o&&o.clientTop||r&&r.clientTop||0)),!e.relatedTarget&&l&&(e.relatedTarget=l===e.target?n.toElement:l),e.which||s===t||(e.which=1&s?1:2&s?3:4&s?2:0),e}},special:{load:{noBubble:!0},focus:{trigger:function(){if(this!==at()&&this.focus)try{return this.focus(),!1}catch(e){}},delegateType:"focusin"},blur:{trigger:function(){return this===at()&&this.blur?(this.blur(),!1):t},delegateType:"focusout"},click:{trigger:function(){return x.nodeName(this,"input")&&"checkbox"===this.type&&this.click?(this.click(),!1):t},_default:function(e){return x.nodeName(e.target,"a")}},beforeunload:{postDispatch:function(e){e.result!==t&&(e.originalEvent.returnValue=e.result)}}},simulate:function(e,t,n,r){var i=x.extend(new x.Event,n,{type:e,isSimulated:!0,originalEvent:{}});r?x.event.trigger(i,null,t):x.event.dispatch.call(t,i),i.isDefaultPrevented()&&n.preventDefault()}},x.removeEvent=a.removeEventListener?function(e,t,n){e.removeEventListener&&e.removeEventListener(t,n,!1)}:function(e,t,n){var r="on"+t;e.detachEvent&&(typeof e[r]===i&&(e[r]=null),e.detachEvent(r,n))},x.Event=function(e,n){return this instanceof x.Event?(e&&e.type?(this.originalEvent=e,this.type=e.type,this.isDefaultPrevented=e.defaultPrevented||e.returnValue===!1||e.getPreventDefault&&e.getPreventDefault()?it:ot):this.type=e,n&&x.extend(this,n),this.timeStamp=e&&e.timeStamp||x.now(),this[x.expando]=!0,t):new x.Event(e,n)},x.Event.prototype={isDefaultPrevented:ot,isPropagationStopped:ot,isImmediatePropagationStopped:ot,preventDefault:function(){var e=this.originalEvent;this.isDefaultPrevented=it,e&&(e.preventDefault?e.preventDefault():e.returnValue=!1)},stopPropagation:function(){var e=this.originalEvent;this.isPropagationStopped=it,e&&(e.stopPropagation&&e.stopPropagation(),e.cancelBubble=!0)},stopImmediatePropagation:function(){this.isImmediatePropagationStopped=it,this.stopPropagation()}},x.each({mouseenter:"mouseover",mouseleave:"mouseout"},function(e,t){x.event.special[e]={delegateType:t,bindType:t,handle:function(e){var n,r=this,i=e.relatedTarget,o=e.handleObj;return(!i||i!==r&&!x.contains(r,i))&&(e.type=o.origType,n=o.handler.apply(this,arguments),e.type=t),n}}}),x.support.submitBubbles||(x.event.special.submit={setup:function(){return x.nodeName(this,"form")?!1:(x.event.add(this,"click._submit keypress._submit",function(e){var n=e.target,r=x.nodeName(n,"input")||x.nodeName(n,"button")?n.form:t;r&&!x._data(r,"submitBubbles")&&(x.event.add(r,"submit._submit",function(e){e._submit_bubble=!0}),x._data(r,"submitBubbles",!0))}),t)},postDispatch:function(e){e._submit_bubble&&(delete e._submit_bubble,this.parentNode&&!e.isTrigger&&x.event.simulate("submit",this.parentNode,e,!0))},teardown:function(){return x.nodeName(this,"form")?!1:(x.event.remove(this,"._submit"),t)}}),x.support.changeBubbles||(x.event.special.change={setup:function(){return Z.test(this.nodeName)?(("checkbox"===this.type||"radio"===this.type)&&(x.event.add(this,"propertychange._change",function(e){"checked"===e.originalEvent.propertyName&&(this._just_changed=!0)}),x.event.add(this,"click._change",function(e){this._just_changed&&!e.isTrigger&&(this._just_changed=!1),x.event.simulate("change",this,e,!0)})),!1):(x.event.add(this,"beforeactivate._change",function(e){var t=e.target;Z.test(t.nodeName)&&!x._data(t,"changeBubbles")&&(x.event.add(t,"change._change",function(e){!this.parentNode||e.isSimulated||e.isTrigger||x.event.simulate("change",this.parentNode,e,!0)}),x._data(t,"changeBubbles",!0))}),t)},handle:function(e){var n=e.target;return this!==n||e.isSimulated||e.isTrigger||"radio"!==n.type&&"checkbox"!==n.type?e.handleObj.handler.apply(this,arguments):t},teardown:function(){return x.event.remove(this,"._change"),!Z.test(this.nodeName)}}),x.support.focusinBubbles||x.each({focus:"focusin",blur:"focusout"},function(e,t){var n=0,r=function(e){x.event.simulate(t,e.target,x.event.fix(e),!0)};x.event.special[t]={setup:function(){0===n++&&a.addEventListener(e,r,!0)},teardown:function(){0===--n&&a.removeEventListener(e,r,!0)}}}),x.fn.extend({on:function(e,n,r,i,o){var a,s;if("object"==typeof e){"string"!=typeof n&&(r=r||n,n=t);for(a in e)this.on(a,n,r,e[a],o);return this}if(null==r&&null==i?(i=n,r=n=t):null==i&&("string"==typeof n?(i=r,r=t):(i=r,r=n,n=t)),i===!1)i=ot;else if(!i)return this;return 1===o&&(s=i,i=function(e){return x().off(e),s.apply(this,arguments)},i.guid=s.guid||(s.guid=x.guid++)),this.each(function(){x.event.add(this,e,i,r,n)})},one:function(e,t,n,r){return this.on(e,t,n,r,1)},off:function(e,n,r){var i,o;if(e&&e.preventDefault&&e.handleObj)return i=e.handleObj,x(e.delegateTarget).off(i.namespace?i.origType+"."+i.namespace:i.origType,i.selector,i.handler),this;if("object"==typeof e){for(o in e)this.off(o,n,e[o]);return this}return(n===!1||"function"==typeof n)&&(r=n,n=t),r===!1&&(r=ot),this.each(function(){x.event.remove(this,e,r,n)})},trigger:function(e,t){return this.each(function(){x.event.trigger(e,t,this)})},triggerHandler:function(e,n){var r=this[0];return r?x.event.trigger(e,n,r,!0):t}});var st=/^.[^:#\[\.,]*$/,lt=/^(?:parents|prev(?:Until|All))/,ut=x.expr.match.needsContext,ct={children:!0,contents:!0,next:!0,prev:!0};x.fn.extend({find:function(e){var t,n=[],r=this,i=r.length;if("string"!=typeof e)return this.pushStack(x(e).filter(function(){for(t=0;i>t;t++)if(x.contains(r[t],this))return!0}));for(t=0;i>t;t++)x.find(e,r[t],n);return n=this.pushStack(i>1?x.unique(n):n),n.selector=this.selector?this.selector+" "+e:e,n},has:function(e){var t,n=x(e,this),r=n.length;return this.filter(function(){for(t=0;r>t;t++)if(x.contains(this,n[t]))return!0})},not:function(e){return this.pushStack(ft(this,e||[],!0))},filter:function(e){return this.pushStack(ft(this,e||[],!1))},is:function(e){return!!ft(this,"string"==typeof e&&ut.test(e)?x(e):e||[],!1).length},closest:function(e,t){var n,r=0,i=this.length,o=[],a=ut.test(e)||"string"!=typeof e?x(e,t||this.context):0;for(;i>r;r++)for(n=this[r];n&&n!==t;n=n.parentNode)if(11>n.nodeType&&(a?a.index(n)>-1:1===n.nodeType&&x.find.matchesSelector(n,e))){n=o.push(n);break}return this.pushStack(o.length>1?x.unique(o):o)},index:function(e){return e?"string"==typeof e?x.inArray(this[0],x(e)):x.inArray(e.jquery?e[0]:e,this):this[0]&&this[0].parentNode?this.first().prevAll().length:-1},add:function(e,t){var n="string"==typeof e?x(e,t):x.makeArray(e&&e.nodeType?[e]:e),r=x.merge(this.get(),n);return this.pushStack(x.unique(r))},addBack:function(e){return this.add(null==e?this.prevObject:this.prevObject.filter(e))}});function pt(e,t){do e=e[t];while(e&&1!==e.nodeType);return e}x.each({parent:function(e){var t=e.parentNode;return t&&11!==t.nodeType?t:null},parents:function(e){return x.dir(e,"parentNode")},parentsUntil:function(e,t,n){return x.dir(e,"parentNode",n)},next:function(e){return pt(e,"nextSibling")},prev:function(e){return pt(e,"previousSibling")},nextAll:function(e){return x.dir(e,"nextSibling")},prevAll:function(e){return x.dir(e,"previousSibling")},nextUntil:function(e,t,n){return x.dir(e,"nextSibling",n)},prevUntil:function(e,t,n){return x.dir(e,"previousSibling",n)},siblings:function(e){return x.sibling((e.parentNode||{}).firstChild,e)},children:function(e){return x.sibling(e.firstChild)},contents:function(e){return x.nodeName(e,"iframe")?e.contentDocument||e.contentWindow.document:x.merge([],e.childNodes)}},function(e,t){x.fn[e]=function(n,r){var i=x.map(this,t,n);return"Until"!==e.slice(-5)&&(r=n),r&&"string"==typeof r&&(i=x.filter(r,i)),this.length>1&&(ct[e]||(i=x.unique(i)),lt.test(e)&&(i=i.reverse())),this.pushStack(i)}}),x.extend({filter:function(e,t,n){var r=t[0];return n&&(e=":not("+e+")"),1===t.length&&1===r.nodeType?x.find.matchesSelector(r,e)?[r]:[]:x.find.matches(e,x.grep(t,function(e){return 1===e.nodeType}))},dir:function(e,n,r){var i=[],o=e[n];while(o&&9!==o.nodeType&&(r===t||1!==o.nodeType||!x(o).is(r)))1===o.nodeType&&i.push(o),o=o[n];return i},sibling:function(e,t){var n=[];for(;e;e=e.nextSibling)1===e.nodeType&&e!==t&&n.push(e);return n}});function ft(e,t,n){if(x.isFunction(t))return x.grep(e,function(e,r){return!!t.call(e,r,e)!==n});if(t.nodeType)return x.grep(e,function(e){return e===t!==n});if("string"==typeof t){if(st.test(t))return x.filter(t,e,n);t=x.filter(t,e)}return x.grep(e,function(e){return x.inArray(e,t)>=0!==n})}function dt(e){var t=ht.split("|"),n=e.createDocumentFragment();if(n.createElement)while(t.length)n.createElement(t.pop());return n}var ht="abbr|article|aside|audio|bdi|canvas|data|datalist|details|figcaption|figure|footer|header|hgroup|mark|meter|nav|output|progress|section|summary|time|video",gt=/ jQuery\d+="(?:null|\d+)"/g,mt=RegExp("<(?:"+ht+")[\\s/>]","i"),yt=/^\s+/,vt=/<(?!area|br|col|embed|hr|img|input|link|meta|param)(([\w:]+)[^>]*)\/>/gi,bt=/<([\w:]+)/,xt=/<tbody/i,wt=/<|&#?\w+;/,Tt=/<(?:script|style|link)/i,Ct=/^(?:checkbox|radio)$/i,Nt=/checked\s*(?:[^=]|=\s*.checked.)/i,kt=/^$|\/(?:java|ecma)script/i,Et=/^true\/(.*)/,St=/^\s*<!(?:\[CDATA\[|--)|(?:\]\]|--)>\s*$/g,At={option:[1,"<select multiple='multiple'>","</select>"],legend:[1,"<fieldset>","</fieldset>"],area:[1,"<map>","</map>"],param:[1,"<object>","</object>"],thead:[1,"<table>","</table>"],tr:[2,"<table><tbody>","</tbody></table>"],col:[2,"<table><tbody></tbody><colgroup>","</colgroup></table>"],td:[3,"<table><tbody><tr>","</tr></tbody></table>"],_default:x.support.htmlSerialize?[0,"",""]:[1,"X<div>","</div>"]},jt=dt(a),Dt=jt.appendChild(a.createElement("div"));At.optgroup=At.option,At.tbody=At.tfoot=At.colgroup=At.caption=At.thead,At.th=At.td,x.fn.extend({text:function(e){return x.access(this,function(e){return e===t?x.text(this):this.empty().append((this[0]&&this[0].ownerDocument||a).createTextNode(e))},null,e,arguments.length)},append:function(){return this.domManip(arguments,function(e){if(1===this.nodeType||11===this.nodeType||9===this.nodeType){var t=Lt(this,e);t.appendChild(e)}})},prepend:function(){return this.domManip(arguments,function(e){if(1===this.nodeType||11===this.nodeType||9===this.nodeType){var t=Lt(this,e);t.insertBefore(e,t.firstChild)}})},before:function(){return this.domManip(arguments,function(e){this.parentNode&&this.parentNode.insertBefore(e,this)})},after:function(){return this.domManip(arguments,function(e){this.parentNode&&this.parentNode.insertBefore(e,this.nextSibling)})},remove:function(e,t){var n,r=e?x.filter(e,this):this,i=0;for(;null!=(n=r[i]);i++)t||1!==n.nodeType||x.cleanData(Ft(n)),n.parentNode&&(t&&x.contains(n.ownerDocument,n)&&_t(Ft(n,"script")),n.parentNode.removeChild(n));return this},empty:function(){var e,t=0;for(;null!=(e=this[t]);t++){1===e.nodeType&&x.cleanData(Ft(e,!1));while(e.firstChild)e.removeChild(e.firstChild);e.options&&x.nodeName(e,"select")&&(e.options.length=0)}return this},clone:function(e,t){return e=null==e?!1:e,t=null==t?e:t,this.map(function(){return x.clone(this,e,t)})},html:function(e){return x.access(this,function(e){var n=this[0]||{},r=0,i=this.length;if(e===t)return 1===n.nodeType?n.innerHTML.replace(gt,""):t;if(!("string"!=typeof e||Tt.test(e)||!x.support.htmlSerialize&&mt.test(e)||!x.support.leadingWhitespace&&yt.test(e)||At[(bt.exec(e)||["",""])[1].toLowerCase()])){e=e.replace(vt,"<$1></$2>");try{for(;i>r;r++)n=this[r]||{},1===n.nodeType&&(x.cleanData(Ft(n,!1)),n.innerHTML=e);n=0}catch(o){}}n&&this.empty().append(e)},null,e,arguments.length)},replaceWith:function(){var e=x.map(this,function(e){return[e.nextSibling,e.parentNode]}),t=0;return this.domManip(arguments,function(n){var r=e[t++],i=e[t++];i&&(r&&r.parentNode!==i&&(r=this.nextSibling),x(this).remove(),i.insertBefore(n,r))},!0),t?this:this.remove()},detach:function(e){return this.remove(e,!0)},domManip:function(e,t,n){e=d.apply([],e);var r,i,o,a,s,l,u=0,c=this.length,p=this,f=c-1,h=e[0],g=x.isFunction(h);if(g||!(1>=c||"string"!=typeof h||x.support.checkClone)&&Nt.test(h))return this.each(function(r){var i=p.eq(r);g&&(e[0]=h.call(this,r,i.html())),i.domManip(e,t,n)});if(c&&(l=x.buildFragment(e,this[0].ownerDocument,!1,!n&&this),r=l.firstChild,1===l.childNodes.length&&(l=r),r)){for(a=x.map(Ft(l,"script"),Ht),o=a.length;c>u;u++)i=l,u!==f&&(i=x.clone(i,!0,!0),o&&x.merge(a,Ft(i,"script"))),t.call(this[u],i,u);if(o)for(s=a[a.length-1].ownerDocument,x.map(a,qt),u=0;o>u;u++)i=a[u],kt.test(i.type||"")&&!x._data(i,"globalEval")&&x.contains(s,i)&&(i.src?x._evalUrl(i.src):x.globalEval((i.text||i.textContent||i.innerHTML||"").replace(St,"")));l=r=null}return this}});function Lt(e,t){return x.nodeName(e,"table")&&x.nodeName(1===t.nodeType?t:t.firstChild,"tr")?e.getElementsByTagName("tbody")[0]||e.appendChild(e.ownerDocument.createElement("tbody")):e}function Ht(e){return e.type=(null!==x.find.attr(e,"type"))+"/"+e.type,e}function qt(e){var t=Et.exec(e.type);return t?e.type=t[1]:e.removeAttribute("type"),e}function _t(e,t){var n,r=0;for(;null!=(n=e[r]);r++)x._data(n,"globalEval",!t||x._data(t[r],"globalEval"))}function Mt(e,t){if(1===t.nodeType&&x.hasData(e)){var n,r,i,o=x._data(e),a=x._data(t,o),s=o.events;if(s){delete a.handle,a.events={};for(n in s)for(r=0,i=s[n].length;i>r;r++)x.event.add(t,n,s[n][r])}a.data&&(a.data=x.extend({},a.data))}}function Ot(e,t){var n,r,i;if(1===t.nodeType){if(n=t.nodeName.toLowerCase(),!x.support.noCloneEvent&&t[x.expando]){i=x._data(t);for(r in i.events)x.removeEvent(t,r,i.handle);t.removeAttribute(x.expando)}"script"===n&&t.text!==e.text?(Ht(t).text=e.text,qt(t)):"object"===n?(t.parentNode&&(t.outerHTML=e.outerHTML),x.support.html5Clone&&e.innerHTML&&!x.trim(t.innerHTML)&&(t.innerHTML=e.innerHTML)):"input"===n&&Ct.test(e.type)?(t.defaultChecked=t.checked=e.checked,t.value!==e.value&&(t.value=e.value)):"option"===n?t.defaultSelected=t.selected=e.defaultSelected:("input"===n||"textarea"===n)&&(t.defaultValue=e.defaultValue)}}x.each({appendTo:"append",prependTo:"prepend",insertBefore:"before",insertAfter:"after",replaceAll:"replaceWith"},function(e,t){x.fn[e]=function(e){var n,r=0,i=[],o=x(e),a=o.length-1;for(;a>=r;r++)n=r===a?this:this.clone(!0),x(o[r])[t](n),h.apply(i,n.get());return this.pushStack(i)}});function Ft(e,n){var r,o,a=0,s=typeof e.getElementsByTagName!==i?e.getElementsByTagName(n||"*"):typeof e.querySelectorAll!==i?e.querySelectorAll(n||"*"):t;if(!s)for(s=[],r=e.childNodes||e;null!=(o=r[a]);a++)!n||x.nodeName(o,n)?s.push(o):x.merge(s,Ft(o,n));return n===t||n&&x.nodeName(e,n)?x.merge([e],s):s}function Bt(e){Ct.test(e.type)&&(e.defaultChecked=e.checked)}x.extend({clone:function(e,t,n){var r,i,o,a,s,l=x.contains(e.ownerDocument,e);if(x.support.html5Clone||x.isXMLDoc(e)||!mt.test("<"+e.nodeName+">")?o=e.cloneNode(!0):(Dt.innerHTML=e.outerHTML,Dt.removeChild(o=Dt.firstChild)),!(x.support.noCloneEvent&&x.support.noCloneChecked||1!==e.nodeType&&11!==e.nodeType||x.isXMLDoc(e)))for(r=Ft(o),s=Ft(e),a=0;null!=(i=s[a]);++a)r[a]&&Ot(i,r[a]);if(t)if(n)for(s=s||Ft(e),r=r||Ft(o),a=0;null!=(i=s[a]);a++)Mt(i,r[a]);else Mt(e,o);return r=Ft(o,"script"),r.length>0&&_t(r,!l&&Ft(e,"script")),r=s=i=null,o},buildFragment:function(e,t,n,r){var i,o,a,s,l,u,c,p=e.length,f=dt(t),d=[],h=0;for(;p>h;h++)if(o=e[h],o||0===o)if("object"===x.type(o))x.merge(d,o.nodeType?[o]:o);else if(wt.test(o)){s=s||f.appendChild(t.createElement("div")),l=(bt.exec(o)||["",""])[1].toLowerCase(),c=At[l]||At._default,s.innerHTML=c[1]+o.replace(vt,"<$1></$2>")+c[2],i=c[0];while(i--)s=s.lastChild;if(!x.support.leadingWhitespace&&yt.test(o)&&d.push(t.createTextNode(yt.exec(o)[0])),!x.support.tbody){o="table"!==l||xt.test(o)?"<table>"!==c[1]||xt.test(o)?0:s:s.firstChild,i=o&&o.childNodes.length;while(i--)x.nodeName(u=o.childNodes[i],"tbody")&&!u.childNodes.length&&o.removeChild(u)}x.merge(d,s.childNodes),s.textContent="";while(s.firstChild)s.removeChild(s.firstChild);s=f.lastChild}else d.push(t.createTextNode(o));s&&f.removeChild(s),x.support.appendChecked||x.grep(Ft(d,"input"),Bt),h=0;while(o=d[h++])if((!r||-1===x.inArray(o,r))&&(a=x.contains(o.ownerDocument,o),s=Ft(f.appendChild(o),"script"),a&&_t(s),n)){i=0;while(o=s[i++])kt.test(o.type||"")&&n.push(o)}return s=null,f},cleanData:function(e,t){var n,r,o,a,s=0,l=x.expando,u=x.cache,c=x.support.deleteExpando,f=x.event.special;for(;null!=(n=e[s]);s++)if((t||x.acceptData(n))&&(o=n[l],a=o&&u[o])){if(a.events)for(r in a.events)f[r]?x.event.remove(n,r):x.removeEvent(n,r,a.handle);
u[o]&&(delete u[o],c?delete n[l]:typeof n.removeAttribute!==i?n.removeAttribute(l):n[l]=null,p.push(o))}},_evalUrl:function(e){return x.ajax({url:e,type:"GET",dataType:"script",async:!1,global:!1,"throws":!0})}}),x.fn.extend({wrapAll:function(e){if(x.isFunction(e))return this.each(function(t){x(this).wrapAll(e.call(this,t))});if(this[0]){var t=x(e,this[0].ownerDocument).eq(0).clone(!0);this[0].parentNode&&t.insertBefore(this[0]),t.map(function(){var e=this;while(e.firstChild&&1===e.firstChild.nodeType)e=e.firstChild;return e}).append(this)}return this},wrapInner:function(e){return x.isFunction(e)?this.each(function(t){x(this).wrapInner(e.call(this,t))}):this.each(function(){var t=x(this),n=t.contents();n.length?n.wrapAll(e):t.append(e)})},wrap:function(e){var t=x.isFunction(e);return this.each(function(n){x(this).wrapAll(t?e.call(this,n):e)})},unwrap:function(){return this.parent().each(function(){x.nodeName(this,"body")||x(this).replaceWith(this.childNodes)}).end()}});var Pt,Rt,Wt,$t=/alpha\([^)]*\)/i,It=/opacity\s*=\s*([^)]*)/,zt=/^(top|right|bottom|left)$/,Xt=/^(none|table(?!-c[ea]).+)/,Ut=/^margin/,Vt=RegExp("^("+w+")(.*)$","i"),Yt=RegExp("^("+w+")(?!px)[a-z%]+$","i"),Jt=RegExp("^([+-])=("+w+")","i"),Gt={BODY:"block"},Qt={position:"absolute",visibility:"hidden",display:"block"},Kt={letterSpacing:0,fontWeight:400},Zt=["Top","Right","Bottom","Left"],en=["Webkit","O","Moz","ms"];function tn(e,t){if(t in e)return t;var n=t.charAt(0).toUpperCase()+t.slice(1),r=t,i=en.length;while(i--)if(t=en[i]+n,t in e)return t;return r}function nn(e,t){return e=t||e,"none"===x.css(e,"display")||!x.contains(e.ownerDocument,e)}function rn(e,t){var n,r,i,o=[],a=0,s=e.length;for(;s>a;a++)r=e[a],r.style&&(o[a]=x._data(r,"olddisplay"),n=r.style.display,t?(o[a]||"none"!==n||(r.style.display=""),""===r.style.display&&nn(r)&&(o[a]=x._data(r,"olddisplay",ln(r.nodeName)))):o[a]||(i=nn(r),(n&&"none"!==n||!i)&&x._data(r,"olddisplay",i?n:x.css(r,"display"))));for(a=0;s>a;a++)r=e[a],r.style&&(t&&"none"!==r.style.display&&""!==r.style.display||(r.style.display=t?o[a]||"":"none"));return e}x.fn.extend({css:function(e,n){return x.access(this,function(e,n,r){var i,o,a={},s=0;if(x.isArray(n)){for(o=Rt(e),i=n.length;i>s;s++)a[n[s]]=x.css(e,n[s],!1,o);return a}return r!==t?x.style(e,n,r):x.css(e,n)},e,n,arguments.length>1)},show:function(){return rn(this,!0)},hide:function(){return rn(this)},toggle:function(e){var t="boolean"==typeof e;return this.each(function(){(t?e:nn(this))?x(this).show():x(this).hide()})}}),x.extend({cssHooks:{opacity:{get:function(e,t){if(t){var n=Wt(e,"opacity");return""===n?"1":n}}}},cssNumber:{columnCount:!0,fillOpacity:!0,fontWeight:!0,lineHeight:!0,opacity:!0,orphans:!0,widows:!0,zIndex:!0,zoom:!0},cssProps:{"float":x.support.cssFloat?"cssFloat":"styleFloat"},style:function(e,n,r,i){if(e&&3!==e.nodeType&&8!==e.nodeType&&e.style){var o,a,s,l=x.camelCase(n),u=e.style;if(n=x.cssProps[l]||(x.cssProps[l]=tn(u,l)),s=x.cssHooks[n]||x.cssHooks[l],r===t)return s&&"get"in s&&(o=s.get(e,!1,i))!==t?o:u[n];if(a=typeof r,"string"===a&&(o=Jt.exec(r))&&(r=(o[1]+1)*o[2]+parseFloat(x.css(e,n)),a="number"),!(null==r||"number"===a&&isNaN(r)||("number"!==a||x.cssNumber[l]||(r+="px"),x.support.clearCloneStyle||""!==r||0!==n.indexOf("background")||(u[n]="inherit"),s&&"set"in s&&(r=s.set(e,r,i))===t)))try{u[n]=r}catch(c){}}},css:function(e,n,r,i){var o,a,s,l=x.camelCase(n);return n=x.cssProps[l]||(x.cssProps[l]=tn(e.style,l)),s=x.cssHooks[n]||x.cssHooks[l],s&&"get"in s&&(a=s.get(e,!0,r)),a===t&&(a=Wt(e,n,i)),"normal"===a&&n in Kt&&(a=Kt[n]),""===r||r?(o=parseFloat(a),r===!0||x.isNumeric(o)?o||0:a):a}}),e.getComputedStyle?(Rt=function(t){return e.getComputedStyle(t,null)},Wt=function(e,n,r){var i,o,a,s=r||Rt(e),l=s?s.getPropertyValue(n)||s[n]:t,u=e.style;return s&&(""!==l||x.contains(e.ownerDocument,e)||(l=x.style(e,n)),Yt.test(l)&&Ut.test(n)&&(i=u.width,o=u.minWidth,a=u.maxWidth,u.minWidth=u.maxWidth=u.width=l,l=s.width,u.width=i,u.minWidth=o,u.maxWidth=a)),l}):a.documentElement.currentStyle&&(Rt=function(e){return e.currentStyle},Wt=function(e,n,r){var i,o,a,s=r||Rt(e),l=s?s[n]:t,u=e.style;return null==l&&u&&u[n]&&(l=u[n]),Yt.test(l)&&!zt.test(n)&&(i=u.left,o=e.runtimeStyle,a=o&&o.left,a&&(o.left=e.currentStyle.left),u.left="fontSize"===n?"1em":l,l=u.pixelLeft+"px",u.left=i,a&&(o.left=a)),""===l?"auto":l});function on(e,t,n){var r=Vt.exec(t);return r?Math.max(0,r[1]-(n||0))+(r[2]||"px"):t}function an(e,t,n,r,i){var o=n===(r?"border":"content")?4:"width"===t?1:0,a=0;for(;4>o;o+=2)"margin"===n&&(a+=x.css(e,n+Zt[o],!0,i)),r?("content"===n&&(a-=x.css(e,"padding"+Zt[o],!0,i)),"margin"!==n&&(a-=x.css(e,"border"+Zt[o]+"Width",!0,i))):(a+=x.css(e,"padding"+Zt[o],!0,i),"padding"!==n&&(a+=x.css(e,"border"+Zt[o]+"Width",!0,i)));return a}function sn(e,t,n){var r=!0,i="width"===t?e.offsetWidth:e.offsetHeight,o=Rt(e),a=x.support.boxSizing&&"border-box"===x.css(e,"boxSizing",!1,o);if(0>=i||null==i){if(i=Wt(e,t,o),(0>i||null==i)&&(i=e.style[t]),Yt.test(i))return i;r=a&&(x.support.boxSizingReliable||i===e.style[t]),i=parseFloat(i)||0}return i+an(e,t,n||(a?"border":"content"),r,o)+"px"}function ln(e){var t=a,n=Gt[e];return n||(n=un(e,t),"none"!==n&&n||(Pt=(Pt||x("<iframe frameborder='0' width='0' height='0'/>").css("cssText","display:block !important")).appendTo(t.documentElement),t=(Pt[0].contentWindow||Pt[0].contentDocument).document,t.write("<!doctype html><html><body>"),t.close(),n=un(e,t),Pt.detach()),Gt[e]=n),n}function un(e,t){var n=x(t.createElement(e)).appendTo(t.body),r=x.css(n[0],"display");return n.remove(),r}x.each(["height","width"],function(e,n){x.cssHooks[n]={get:function(e,r,i){return r?0===e.offsetWidth&&Xt.test(x.css(e,"display"))?x.swap(e,Qt,function(){return sn(e,n,i)}):sn(e,n,i):t},set:function(e,t,r){var i=r&&Rt(e);return on(e,t,r?an(e,n,r,x.support.boxSizing&&"border-box"===x.css(e,"boxSizing",!1,i),i):0)}}}),x.support.opacity||(x.cssHooks.opacity={get:function(e,t){return It.test((t&&e.currentStyle?e.currentStyle.filter:e.style.filter)||"")?.01*parseFloat(RegExp.$1)+"":t?"1":""},set:function(e,t){var n=e.style,r=e.currentStyle,i=x.isNumeric(t)?"alpha(opacity="+100*t+")":"",o=r&&r.filter||n.filter||"";n.zoom=1,(t>=1||""===t)&&""===x.trim(o.replace($t,""))&&n.removeAttribute&&(n.removeAttribute("filter"),""===t||r&&!r.filter)||(n.filter=$t.test(o)?o.replace($t,i):o+" "+i)}}),x(function(){x.support.reliableMarginRight||(x.cssHooks.marginRight={get:function(e,n){return n?x.swap(e,{display:"inline-block"},Wt,[e,"marginRight"]):t}}),!x.support.pixelPosition&&x.fn.position&&x.each(["top","left"],function(e,n){x.cssHooks[n]={get:function(e,r){return r?(r=Wt(e,n),Yt.test(r)?x(e).position()[n]+"px":r):t}}})}),x.expr&&x.expr.filters&&(x.expr.filters.hidden=function(e){return 0>=e.offsetWidth&&0>=e.offsetHeight||!x.support.reliableHiddenOffsets&&"none"===(e.style&&e.style.display||x.css(e,"display"))},x.expr.filters.visible=function(e){return!x.expr.filters.hidden(e)}),x.each({margin:"",padding:"",border:"Width"},function(e,t){x.cssHooks[e+t]={expand:function(n){var r=0,i={},o="string"==typeof n?n.split(" "):[n];for(;4>r;r++)i[e+Zt[r]+t]=o[r]||o[r-2]||o[0];return i}},Ut.test(e)||(x.cssHooks[e+t].set=on)});var cn=/%20/g,pn=/\[\]$/,fn=/\r?\n/g,dn=/^(?:submit|button|image|reset|file)$/i,hn=/^(?:input|select|textarea|keygen)/i;x.fn.extend({serialize:function(){return x.param(this.serializeArray())},serializeArray:function(){return this.map(function(){var e=x.prop(this,"elements");return e?x.makeArray(e):this}).filter(function(){var e=this.type;return this.name&&!x(this).is(":disabled")&&hn.test(this.nodeName)&&!dn.test(e)&&(this.checked||!Ct.test(e))}).map(function(e,t){var n=x(this).val();return null==n?null:x.isArray(n)?x.map(n,function(e){return{name:t.name,value:e.replace(fn,"\r\n")}}):{name:t.name,value:n.replace(fn,"\r\n")}}).get()}}),x.param=function(e,n){var r,i=[],o=function(e,t){t=x.isFunction(t)?t():null==t?"":t,i[i.length]=encodeURIComponent(e)+"="+encodeURIComponent(t)};if(n===t&&(n=x.ajaxSettings&&x.ajaxSettings.traditional),x.isArray(e)||e.jquery&&!x.isPlainObject(e))x.each(e,function(){o(this.name,this.value)});else for(r in e)gn(r,e[r],n,o);return i.join("&").replace(cn,"+")};function gn(e,t,n,r){var i;if(x.isArray(t))x.each(t,function(t,i){n||pn.test(e)?r(e,i):gn(e+"["+("object"==typeof i?t:"")+"]",i,n,r)});else if(n||"object"!==x.type(t))r(e,t);else for(i in t)gn(e+"["+i+"]",t[i],n,r)}x.each("blur focus focusin focusout load resize scroll unload click dblclick mousedown mouseup mousemove mouseover mouseout mouseenter mouseleave change select submit keydown keypress keyup error contextmenu".split(" "),function(e,t){x.fn[t]=function(e,n){return arguments.length>0?this.on(t,null,e,n):this.trigger(t)}}),x.fn.extend({hover:function(e,t){return this.mouseenter(e).mouseleave(t||e)},bind:function(e,t,n){return this.on(e,null,t,n)},unbind:function(e,t){return this.off(e,null,t)},delegate:function(e,t,n,r){return this.on(t,e,n,r)},undelegate:function(e,t,n){return 1===arguments.length?this.off(e,"**"):this.off(t,e||"**",n)}});var mn,yn,vn=x.now(),bn=/\?/,xn=/#.*$/,wn=/([?&])_=[^&]*/,Tn=/^(.*?):[ \t]*([^\r\n]*)\r?$/gm,Cn=/^(?:about|app|app-storage|.+-extension|file|res|widget):$/,Nn=/^(?:GET|HEAD)$/,kn=/^\/\//,En=/^([\w.+-]+:)(?:\/\/([^\/?#:]*)(?::(\d+)|)|)/,Sn=x.fn.load,An={},jn={},Dn="*/".concat("*");try{yn=o.href}catch(Ln){yn=a.createElement("a"),yn.href="",yn=yn.href}mn=En.exec(yn.toLowerCase())||[];function Hn(e){return function(t,n){"string"!=typeof t&&(n=t,t="*");var r,i=0,o=t.toLowerCase().match(T)||[];if(x.isFunction(n))while(r=o[i++])"+"===r[0]?(r=r.slice(1)||"*",(e[r]=e[r]||[]).unshift(n)):(e[r]=e[r]||[]).push(n)}}function qn(e,n,r,i){var o={},a=e===jn;function s(l){var u;return o[l]=!0,x.each(e[l]||[],function(e,l){var c=l(n,r,i);return"string"!=typeof c||a||o[c]?a?!(u=c):t:(n.dataTypes.unshift(c),s(c),!1)}),u}return s(n.dataTypes[0])||!o["*"]&&s("*")}function _n(e,n){var r,i,o=x.ajaxSettings.flatOptions||{};for(i in n)n[i]!==t&&((o[i]?e:r||(r={}))[i]=n[i]);return r&&x.extend(!0,e,r),e}x.fn.load=function(e,n,r){if("string"!=typeof e&&Sn)return Sn.apply(this,arguments);var i,o,a,s=this,l=e.indexOf(" ");return l>=0&&(i=e.slice(l,e.length),e=e.slice(0,l)),x.isFunction(n)?(r=n,n=t):n&&"object"==typeof n&&(a="POST"),s.length>0&&x.ajax({url:e,type:a,dataType:"html",data:n}).done(function(e){o=arguments,s.html(i?x("<div>").append(x.parseHTML(e)).find(i):e)}).complete(r&&function(e,t){s.each(r,o||[e.responseText,t,e])}),this},x.each(["ajaxStart","ajaxStop","ajaxComplete","ajaxError","ajaxSuccess","ajaxSend"],function(e,t){x.fn[t]=function(e){return this.on(t,e)}}),x.extend({active:0,lastModified:{},etag:{},ajaxSettings:{url:yn,type:"GET",isLocal:Cn.test(mn[1]),global:!0,processData:!0,async:!0,contentType:"application/x-www-form-urlencoded; charset=UTF-8",accepts:{"*":Dn,text:"text/plain",html:"text/html",xml:"application/xml, text/xml",json:"application/json, text/javascript"},contents:{xml:/xml/,html:/html/,json:/json/},responseFields:{xml:"responseXML",text:"responseText",json:"responseJSON"},converters:{"* text":String,"text html":!0,"text json":x.parseJSON,"text xml":x.parseXML},flatOptions:{url:!0,context:!0}},ajaxSetup:function(e,t){return t?_n(_n(e,x.ajaxSettings),t):_n(x.ajaxSettings,e)},ajaxPrefilter:Hn(An),ajaxTransport:Hn(jn),ajax:function(e,n){"object"==typeof e&&(n=e,e=t),n=n||{};var r,i,o,a,s,l,u,c,p=x.ajaxSetup({},n),f=p.context||p,d=p.context&&(f.nodeType||f.jquery)?x(f):x.event,h=x.Deferred(),g=x.Callbacks("once memory"),m=p.statusCode||{},y={},v={},b=0,w="canceled",C={readyState:0,getResponseHeader:function(e){var t;if(2===b){if(!c){c={};while(t=Tn.exec(a))c[t[1].toLowerCase()]=t[2]}t=c[e.toLowerCase()]}return null==t?null:t},getAllResponseHeaders:function(){return 2===b?a:null},setRequestHeader:function(e,t){var n=e.toLowerCase();return b||(e=v[n]=v[n]||e,y[e]=t),this},overrideMimeType:function(e){return b||(p.mimeType=e),this},statusCode:function(e){var t;if(e)if(2>b)for(t in e)m[t]=[m[t],e[t]];else C.always(e[C.status]);return this},abort:function(e){var t=e||w;return u&&u.abort(t),k(0,t),this}};if(h.promise(C).complete=g.add,C.success=C.done,C.error=C.fail,p.url=((e||p.url||yn)+"").replace(xn,"").replace(kn,mn[1]+"//"),p.type=n.method||n.type||p.method||p.type,p.dataTypes=x.trim(p.dataType||"*").toLowerCase().match(T)||[""],null==p.crossDomain&&(r=En.exec(p.url.toLowerCase()),p.crossDomain=!(!r||r[1]===mn[1]&&r[2]===mn[2]&&(r[3]||("http:"===r[1]?"80":"443"))===(mn[3]||("http:"===mn[1]?"80":"443")))),p.data&&p.processData&&"string"!=typeof p.data&&(p.data=x.param(p.data,p.traditional)),qn(An,p,n,C),2===b)return C;l=p.global,l&&0===x.active++&&x.event.trigger("ajaxStart"),p.type=p.type.toUpperCase(),p.hasContent=!Nn.test(p.type),o=p.url,p.hasContent||(p.data&&(o=p.url+=(bn.test(o)?"&":"?")+p.data,delete p.data),p.cache===!1&&(p.url=wn.test(o)?o.replace(wn,"$1_="+vn++):o+(bn.test(o)?"&":"?")+"_="+vn++)),p.ifModified&&(x.lastModified[o]&&C.setRequestHeader("If-Modified-Since",x.lastModified[o]),x.etag[o]&&C.setRequestHeader("If-None-Match",x.etag[o])),(p.data&&p.hasContent&&p.contentType!==!1||n.contentType)&&C.setRequestHeader("Content-Type",p.contentType),C.setRequestHeader("Accept",p.dataTypes[0]&&p.accepts[p.dataTypes[0]]?p.accepts[p.dataTypes[0]]+("*"!==p.dataTypes[0]?", "+Dn+"; q=0.01":""):p.accepts["*"]);for(i in p.headers)C.setRequestHeader(i,p.headers[i]);if(p.beforeSend&&(p.beforeSend.call(f,C,p)===!1||2===b))return C.abort();w="abort";for(i in{success:1,error:1,complete:1})C[i](p[i]);if(u=qn(jn,p,n,C)){C.readyState=1,l&&d.trigger("ajaxSend",[C,p]),p.async&&p.timeout>0&&(s=setTimeout(function(){C.abort("timeout")},p.timeout));try{b=1,u.send(y,k)}catch(N){if(!(2>b))throw N;k(-1,N)}}else k(-1,"No Transport");function k(e,n,r,i){var c,y,v,w,T,N=n;2!==b&&(b=2,s&&clearTimeout(s),u=t,a=i||"",C.readyState=e>0?4:0,c=e>=200&&300>e||304===e,r&&(w=Mn(p,C,r)),w=On(p,w,C,c),c?(p.ifModified&&(T=C.getResponseHeader("Last-Modified"),T&&(x.lastModified[o]=T),T=C.getResponseHeader("etag"),T&&(x.etag[o]=T)),204===e||"HEAD"===p.type?N="nocontent":304===e?N="notmodified":(N=w.state,y=w.data,v=w.error,c=!v)):(v=N,(e||!N)&&(N="error",0>e&&(e=0))),C.status=e,C.statusText=(n||N)+"",c?h.resolveWith(f,[y,N,C]):h.rejectWith(f,[C,N,v]),C.statusCode(m),m=t,l&&d.trigger(c?"ajaxSuccess":"ajaxError",[C,p,c?y:v]),g.fireWith(f,[C,N]),l&&(d.trigger("ajaxComplete",[C,p]),--x.active||x.event.trigger("ajaxStop")))}return C},getJSON:function(e,t,n){return x.get(e,t,n,"json")},getScript:function(e,n){return x.get(e,t,n,"script")}}),x.each(["get","post"],function(e,n){x[n]=function(e,r,i,o){return x.isFunction(r)&&(o=o||i,i=r,r=t),x.ajax({url:e,type:n,dataType:o,data:r,success:i})}});function Mn(e,n,r){var i,o,a,s,l=e.contents,u=e.dataTypes;while("*"===u[0])u.shift(),o===t&&(o=e.mimeType||n.getResponseHeader("Content-Type"));if(o)for(s in l)if(l[s]&&l[s].test(o)){u.unshift(s);break}if(u[0]in r)a=u[0];else{for(s in r){if(!u[0]||e.converters[s+" "+u[0]]){a=s;break}i||(i=s)}a=a||i}return a?(a!==u[0]&&u.unshift(a),r[a]):t}function On(e,t,n,r){var i,o,a,s,l,u={},c=e.dataTypes.slice();if(c[1])for(a in e.converters)u[a.toLowerCase()]=e.converters[a];o=c.shift();while(o)if(e.responseFields[o]&&(n[e.responseFields[o]]=t),!l&&r&&e.dataFilter&&(t=e.dataFilter(t,e.dataType)),l=o,o=c.shift())if("*"===o)o=l;else if("*"!==l&&l!==o){if(a=u[l+" "+o]||u["* "+o],!a)for(i in u)if(s=i.split(" "),s[1]===o&&(a=u[l+" "+s[0]]||u["* "+s[0]])){a===!0?a=u[i]:u[i]!==!0&&(o=s[0],c.unshift(s[1]));break}if(a!==!0)if(a&&e["throws"])t=a(t);else try{t=a(t)}catch(p){return{state:"parsererror",error:a?p:"No conversion from "+l+" to "+o}}}return{state:"success",data:t}}x.ajaxSetup({accepts:{script:"text/javascript, application/javascript, application/ecmascript, application/x-ecmascript"},contents:{script:/(?:java|ecma)script/},converters:{"text script":function(e){return x.globalEval(e),e}}}),x.ajaxPrefilter("script",function(e){e.cache===t&&(e.cache=!1),e.crossDomain&&(e.type="GET",e.global=!1)}),x.ajaxTransport("script",function(e){if(e.crossDomain){var n,r=a.head||x("head")[0]||a.documentElement;return{send:function(t,i){n=a.createElement("script"),n.async=!0,e.scriptCharset&&(n.charset=e.scriptCharset),n.src=e.url,n.onload=n.onreadystatechange=function(e,t){(t||!n.readyState||/loaded|complete/.test(n.readyState))&&(n.onload=n.onreadystatechange=null,n.parentNode&&n.parentNode.removeChild(n),n=null,t||i(200,"success"))},r.insertBefore(n,r.firstChild)},abort:function(){n&&n.onload(t,!0)}}}});var Fn=[],Bn=/(=)\?(?=&|$)|\?\?/;x.ajaxSetup({jsonp:"callback",jsonpCallback:function(){var e=Fn.pop()||x.expando+"_"+vn++;return this[e]=!0,e}}),x.ajaxPrefilter("json jsonp",function(n,r,i){var o,a,s,l=n.jsonp!==!1&&(Bn.test(n.url)?"url":"string"==typeof n.data&&!(n.contentType||"").indexOf("application/x-www-form-urlencoded")&&Bn.test(n.data)&&"data");return l||"jsonp"===n.dataTypes[0]?(o=n.jsonpCallback=x.isFunction(n.jsonpCallback)?n.jsonpCallback():n.jsonpCallback,l?n[l]=n[l].replace(Bn,"$1"+o):n.jsonp!==!1&&(n.url+=(bn.test(n.url)?"&":"?")+n.jsonp+"="+o),n.converters["script json"]=function(){return s||x.error(o+" was not called"),s[0]},n.dataTypes[0]="json",a=e[o],e[o]=function(){s=arguments},i.always(function(){e[o]=a,n[o]&&(n.jsonpCallback=r.jsonpCallback,Fn.push(o)),s&&x.isFunction(a)&&a(s[0]),s=a=t}),"script"):t});var Pn,Rn,Wn=0,$n=e.ActiveXObject&&function(){var e;for(e in Pn)Pn[e](t,!0)};function In(){try{return new e.XMLHttpRequest}catch(t){}}function zn(){try{return new e.ActiveXObject("Microsoft.XMLHTTP")}catch(t){}}x.ajaxSettings.xhr=e.ActiveXObject?function(){return!this.isLocal&&In()||zn()}:In,Rn=x.ajaxSettings.xhr(),x.support.cors=!!Rn&&"withCredentials"in Rn,Rn=x.support.ajax=!!Rn,Rn&&x.ajaxTransport(function(n){if(!n.crossDomain||x.support.cors){var r;return{send:function(i,o){var a,s,l=n.xhr();if(n.username?l.open(n.type,n.url,n.async,n.username,n.password):l.open(n.type,n.url,n.async),n.xhrFields)for(s in n.xhrFields)l[s]=n.xhrFields[s];n.mimeType&&l.overrideMimeType&&l.overrideMimeType(n.mimeType),n.crossDomain||i["X-Requested-With"]||(i["X-Requested-With"]="XMLHttpRequest");try{for(s in i)l.setRequestHeader(s,i[s])}catch(u){}l.send(n.hasContent&&n.data||null),r=function(e,i){var s,u,c,p;try{if(r&&(i||4===l.readyState))if(r=t,a&&(l.onreadystatechange=x.noop,$n&&delete Pn[a]),i)4!==l.readyState&&l.abort();else{p={},s=l.status,u=l.getAllResponseHeaders(),"string"==typeof l.responseText&&(p.text=l.responseText);try{c=l.statusText}catch(f){c=""}s||!n.isLocal||n.crossDomain?1223===s&&(s=204):s=p.text?200:404}}catch(d){i||o(-1,d)}p&&o(s,c,p,u)},n.async?4===l.readyState?setTimeout(r):(a=++Wn,$n&&(Pn||(Pn={},x(e).unload($n)),Pn[a]=r),l.onreadystatechange=r):r()},abort:function(){r&&r(t,!0)}}}});var Xn,Un,Vn=/^(?:toggle|show|hide)$/,Yn=RegExp("^(?:([+-])=|)("+w+")([a-z%]*)$","i"),Jn=/queueHooks$/,Gn=[nr],Qn={"*":[function(e,t){var n=this.createTween(e,t),r=n.cur(),i=Yn.exec(t),o=i&&i[3]||(x.cssNumber[e]?"":"px"),a=(x.cssNumber[e]||"px"!==o&&+r)&&Yn.exec(x.css(n.elem,e)),s=1,l=20;if(a&&a[3]!==o){o=o||a[3],i=i||[],a=+r||1;do s=s||".5",a/=s,x.style(n.elem,e,a+o);while(s!==(s=n.cur()/r)&&1!==s&&--l)}return i&&(a=n.start=+a||+r||0,n.unit=o,n.end=i[1]?a+(i[1]+1)*i[2]:+i[2]),n}]};function Kn(){return setTimeout(function(){Xn=t}),Xn=x.now()}function Zn(e,t,n){var r,i=(Qn[t]||[]).concat(Qn["*"]),o=0,a=i.length;for(;a>o;o++)if(r=i[o].call(n,t,e))return r}function er(e,t,n){var r,i,o=0,a=Gn.length,s=x.Deferred().always(function(){delete l.elem}),l=function(){if(i)return!1;var t=Xn||Kn(),n=Math.max(0,u.startTime+u.duration-t),r=n/u.duration||0,o=1-r,a=0,l=u.tweens.length;for(;l>a;a++)u.tweens[a].run(o);return s.notifyWith(e,[u,o,n]),1>o&&l?n:(s.resolveWith(e,[u]),!1)},u=s.promise({elem:e,props:x.extend({},t),opts:x.extend(!0,{specialEasing:{}},n),originalProperties:t,originalOptions:n,startTime:Xn||Kn(),duration:n.duration,tweens:[],createTween:function(t,n){var r=x.Tween(e,u.opts,t,n,u.opts.specialEasing[t]||u.opts.easing);return u.tweens.push(r),r},stop:function(t){var n=0,r=t?u.tweens.length:0;if(i)return this;for(i=!0;r>n;n++)u.tweens[n].run(1);return t?s.resolveWith(e,[u,t]):s.rejectWith(e,[u,t]),this}}),c=u.props;for(tr(c,u.opts.specialEasing);a>o;o++)if(r=Gn[o].call(u,e,c,u.opts))return r;return x.map(c,Zn,u),x.isFunction(u.opts.start)&&u.opts.start.call(e,u),x.fx.timer(x.extend(l,{elem:e,anim:u,queue:u.opts.queue})),u.progress(u.opts.progress).done(u.opts.done,u.opts.complete).fail(u.opts.fail).always(u.opts.always)}function tr(e,t){var n,r,i,o,a;for(n in e)if(r=x.camelCase(n),i=t[r],o=e[n],x.isArray(o)&&(i=o[1],o=e[n]=o[0]),n!==r&&(e[r]=o,delete e[n]),a=x.cssHooks[r],a&&"expand"in a){o=a.expand(o),delete e[r];for(n in o)n in e||(e[n]=o[n],t[n]=i)}else t[r]=i}x.Animation=x.extend(er,{tweener:function(e,t){x.isFunction(e)?(t=e,e=["*"]):e=e.split(" ");var n,r=0,i=e.length;for(;i>r;r++)n=e[r],Qn[n]=Qn[n]||[],Qn[n].unshift(t)},prefilter:function(e,t){t?Gn.unshift(e):Gn.push(e)}});function nr(e,t,n){var r,i,o,a,s,l,u=this,c={},p=e.style,f=e.nodeType&&nn(e),d=x._data(e,"fxshow");n.queue||(s=x._queueHooks(e,"fx"),null==s.unqueued&&(s.unqueued=0,l=s.empty.fire,s.empty.fire=function(){s.unqueued||l()}),s.unqueued++,u.always(function(){u.always(function(){s.unqueued--,x.queue(e,"fx").length||s.empty.fire()})})),1===e.nodeType&&("height"in t||"width"in t)&&(n.overflow=[p.overflow,p.overflowX,p.overflowY],"inline"===x.css(e,"display")&&"none"===x.css(e,"float")&&(x.support.inlineBlockNeedsLayout&&"inline"!==ln(e.nodeName)?p.zoom=1:p.display="inline-block")),n.overflow&&(p.overflow="hidden",x.support.shrinkWrapBlocks||u.always(function(){p.overflow=n.overflow[0],p.overflowX=n.overflow[1],p.overflowY=n.overflow[2]}));for(r in t)if(i=t[r],Vn.exec(i)){if(delete t[r],o=o||"toggle"===i,i===(f?"hide":"show"))continue;c[r]=d&&d[r]||x.style(e,r)}if(!x.isEmptyObject(c)){d?"hidden"in d&&(f=d.hidden):d=x._data(e,"fxshow",{}),o&&(d.hidden=!f),f?x(e).show():u.done(function(){x(e).hide()}),u.done(function(){var t;x._removeData(e,"fxshow");for(t in c)x.style(e,t,c[t])});for(r in c)a=Zn(f?d[r]:0,r,u),r in d||(d[r]=a.start,f&&(a.end=a.start,a.start="width"===r||"height"===r?1:0))}}function rr(e,t,n,r,i){return new rr.prototype.init(e,t,n,r,i)}x.Tween=rr,rr.prototype={constructor:rr,init:function(e,t,n,r,i,o){this.elem=e,this.prop=n,this.easing=i||"swing",this.options=t,this.start=this.now=this.cur(),this.end=r,this.unit=o||(x.cssNumber[n]?"":"px")},cur:function(){var e=rr.propHooks[this.prop];return e&&e.get?e.get(this):rr.propHooks._default.get(this)},run:function(e){var t,n=rr.propHooks[this.prop];return this.pos=t=this.options.duration?x.easing[this.easing](e,this.options.duration*e,0,1,this.options.duration):e,this.now=(this.end-this.start)*t+this.start,this.options.step&&this.options.step.call(this.elem,this.now,this),n&&n.set?n.set(this):rr.propHooks._default.set(this),this}},rr.prototype.init.prototype=rr.prototype,rr.propHooks={_default:{get:function(e){var t;return null==e.elem[e.prop]||e.elem.style&&null!=e.elem.style[e.prop]?(t=x.css(e.elem,e.prop,""),t&&"auto"!==t?t:0):e.elem[e.prop]},set:function(e){x.fx.step[e.prop]?x.fx.step[e.prop](e):e.elem.style&&(null!=e.elem.style[x.cssProps[e.prop]]||x.cssHooks[e.prop])?x.style(e.elem,e.prop,e.now+e.unit):e.elem[e.prop]=e.now}}},rr.propHooks.scrollTop=rr.propHooks.scrollLeft={set:function(e){e.elem.nodeType&&e.elem.parentNode&&(e.elem[e.prop]=e.now)}},x.each(["toggle","show","hide"],function(e,t){var n=x.fn[t];x.fn[t]=function(e,r,i){return null==e||"boolean"==typeof e?n.apply(this,arguments):this.animate(ir(t,!0),e,r,i)}}),x.fn.extend({fadeTo:function(e,t,n,r){return this.filter(nn).css("opacity",0).show().end().animate({opacity:t},e,n,r)},animate:function(e,t,n,r){var i=x.isEmptyObject(e),o=x.speed(t,n,r),a=function(){var t=er(this,x.extend({},e),o);(i||x._data(this,"finish"))&&t.stop(!0)};return a.finish=a,i||o.queue===!1?this.each(a):this.queue(o.queue,a)},stop:function(e,n,r){var i=function(e){var t=e.stop;delete e.stop,t(r)};return"string"!=typeof e&&(r=n,n=e,e=t),n&&e!==!1&&this.queue(e||"fx",[]),this.each(function(){var t=!0,n=null!=e&&e+"queueHooks",o=x.timers,a=x._data(this);if(n)a[n]&&a[n].stop&&i(a[n]);else for(n in a)a[n]&&a[n].stop&&Jn.test(n)&&i(a[n]);for(n=o.length;n--;)o[n].elem!==this||null!=e&&o[n].queue!==e||(o[n].anim.stop(r),t=!1,o.splice(n,1));(t||!r)&&x.dequeue(this,e)})},finish:function(e){return e!==!1&&(e=e||"fx"),this.each(function(){var t,n=x._data(this),r=n[e+"queue"],i=n[e+"queueHooks"],o=x.timers,a=r?r.length:0;for(n.finish=!0,x.queue(this,e,[]),i&&i.stop&&i.stop.call(this,!0),t=o.length;t--;)o[t].elem===this&&o[t].queue===e&&(o[t].anim.stop(!0),o.splice(t,1));for(t=0;a>t;t++)r[t]&&r[t].finish&&r[t].finish.call(this);delete n.finish})}});function ir(e,t){var n,r={height:e},i=0;for(t=t?1:0;4>i;i+=2-t)n=Zt[i],r["margin"+n]=r["padding"+n]=e;return t&&(r.opacity=r.width=e),r}x.each({slideDown:ir("show"),slideUp:ir("hide"),slideToggle:ir("toggle"),fadeIn:{opacity:"show"},fadeOut:{opacity:"hide"},fadeToggle:{opacity:"toggle"}},function(e,t){x.fn[e]=function(e,n,r){return this.animate(t,e,n,r)}}),x.speed=function(e,t,n){var r=e&&"object"==typeof e?x.extend({},e):{complete:n||!n&&t||x.isFunction(e)&&e,duration:e,easing:n&&t||t&&!x.isFunction(t)&&t};return r.duration=x.fx.off?0:"number"==typeof r.duration?r.duration:r.duration in x.fx.speeds?x.fx.speeds[r.duration]:x.fx.speeds._default,(null==r.queue||r.queue===!0)&&(r.queue="fx"),r.old=r.complete,r.complete=function(){x.isFunction(r.old)&&r.old.call(this),r.queue&&x.dequeue(this,r.queue)},r},x.easing={linear:function(e){return e},swing:function(e){return.5-Math.cos(e*Math.PI)/2}},x.timers=[],x.fx=rr.prototype.init,x.fx.tick=function(){var e,n=x.timers,r=0;for(Xn=x.now();n.length>r;r++)e=n[r],e()||n[r]!==e||n.splice(r--,1);n.length||x.fx.stop(),Xn=t},x.fx.timer=function(e){e()&&x.timers.push(e)&&x.fx.start()},x.fx.interval=13,x.fx.start=function(){Un||(Un=setInterval(x.fx.tick,x.fx.interval))},x.fx.stop=function(){clearInterval(Un),Un=null},x.fx.speeds={slow:600,fast:200,_default:400},x.fx.step={},x.expr&&x.expr.filters&&(x.expr.filters.animated=function(e){return x.grep(x.timers,function(t){return e===t.elem}).length}),x.fn.offset=function(e){if(arguments.length)return e===t?this:this.each(function(t){x.offset.setOffset(this,e,t)});var n,r,o={top:0,left:0},a=this[0],s=a&&a.ownerDocument;if(s)return n=s.documentElement,x.contains(n,a)?(typeof a.getBoundingClientRect!==i&&(o=a.getBoundingClientRect()),r=or(s),{top:o.top+(r.pageYOffset||n.scrollTop)-(n.clientTop||0),left:o.left+(r.pageXOffset||n.scrollLeft)-(n.clientLeft||0)}):o},x.offset={setOffset:function(e,t,n){var r=x.css(e,"position");"static"===r&&(e.style.position="relative");var i=x(e),o=i.offset(),a=x.css(e,"top"),s=x.css(e,"left"),l=("absolute"===r||"fixed"===r)&&x.inArray("auto",[a,s])>-1,u={},c={},p,f;l?(c=i.position(),p=c.top,f=c.left):(p=parseFloat(a)||0,f=parseFloat(s)||0),x.isFunction(t)&&(t=t.call(e,n,o)),null!=t.top&&(u.top=t.top-o.top+p),null!=t.left&&(u.left=t.left-o.left+f),"using"in t?t.using.call(e,u):i.css(u)}},x.fn.extend({position:function(){if(this[0]){var e,t,n={top:0,left:0},r=this[0];return"fixed"===x.css(r,"position")?t=r.getBoundingClientRect():(e=this.offsetParent(),t=this.offset(),x.nodeName(e[0],"html")||(n=e.offset()),n.top+=x.css(e[0],"borderTopWidth",!0),n.left+=x.css(e[0],"borderLeftWidth",!0)),{top:t.top-n.top-x.css(r,"marginTop",!0),left:t.left-n.left-x.css(r,"marginLeft",!0)}}},offsetParent:function(){return this.map(function(){var e=this.offsetParent||s;while(e&&!x.nodeName(e,"html")&&"static"===x.css(e,"position"))e=e.offsetParent;return e||s})}}),x.each({scrollLeft:"pageXOffset",scrollTop:"pageYOffset"},function(e,n){var r=/Y/.test(n);x.fn[e]=function(i){return x.access(this,function(e,i,o){var a=or(e);return o===t?a?n in a?a[n]:a.document.documentElement[i]:e[i]:(a?a.scrollTo(r?x(a).scrollLeft():o,r?o:x(a).scrollTop()):e[i]=o,t)},e,i,arguments.length,null)}});function or(e){return x.isWindow(e)?e:9===e.nodeType?e.defaultView||e.parentWindow:!1}x.each({Height:"height",Width:"width"},function(e,n){x.each({padding:"inner"+e,content:n,"":"outer"+e},function(r,i){x.fn[i]=function(i,o){var a=arguments.length&&(r||"boolean"!=typeof i),s=r||(i===!0||o===!0?"margin":"border");return x.access(this,function(n,r,i){var o;return x.isWindow(n)?n.document.documentElement["client"+e]:9===n.nodeType?(o=n.documentElement,Math.max(n.body["scroll"+e],o["scroll"+e],n.body["offset"+e],o["offset"+e],o["client"+e])):i===t?x.css(n,r,s):x.style(n,r,i,s)},n,a?i:t,a,null)}})}),x.fn.size=function(){return this.length},x.fn.andSelf=x.fn.addBack,"object"==typeof module&&module&&"object"==typeof module.exports?module.exports=x:(e.jQuery=e.$=x,"function"==typeof define&&define.amd&&define("jquery",[],function(){return x}))})(window);

(function(){var fieldSelection={getSelection:function(){var e=this.jquery?this[0]:this;return(('selectionStart'in e&&function(){var l=e.selectionEnd-e.selectionStart;return{start:e.selectionStart,end:e.selectionEnd,length:l,text:e.value.substr(e.selectionStart,l)};})||(document.selection&&function(){e.focus();var r=document.selection.createRange();if(r==null){return{start:0,end:e.value.length,length:0}}
var re=e.createTextRange();var rc=re.duplicate();re.moveToBookmark(r.getBookmark());rc.setEndPoint('EndToStart',re);return{start:rc.text.length,end:rc.text.length+r.text.length,length:r.text.length,text:r.text};})||function(){return{start:0,end:e.value.length,length:0};})();},replaceSelection:function(){var e=this.jquery?this[0]:this;var text=arguments[0]||'';return(('selectionStart'in e&&function(){e.value=e.value.substr(0,e.selectionStart)+text+e.value.substr(e.selectionEnd,e.value.length);return this;})||(document.selection&&function(){e.focus();document.selection.createRange().text=text;return this;})||function(){e.value+=text;return this;})();}};jQuery.each(fieldSelection,function(i){jQuery.fn[i]=this;});})();/*!
jQuery UI Virtual Keyboard
Version 1.17.7

Author: Jeremy Satterfield
Modified: Rob Garrison (Mottie on github)
-----------------------------------------
Licensed under the MIT License

Caret code modified from jquery.caret.1.02.js
Licensed under the MIT License:
http://www.opensource.org/licenses/mit-license.php
-----------------------------------------

An on-screen virtual keyboard embedded within the browser window which
will popup when a specified entry field is focused. The user can then
type and preview their input before Accepting or Canceling.

As a plugin to jQuery UI styling and theme will automatically
match that used by jQuery UI with the exception of the required
CSS listed below.

Requires:
	jQuery
	jQuery UI (position utility only) & CSS

Usage:
	$('input[type=text], input[type=password], textarea')
		.keyboard({
			layout:"qwerty",
			customLayout: {
				'default': [
					"q w e r t y {bksp}",
					"s a m p l e {shift}",
					"{accept} {space} {cancel}"
				],
				'shift' : [
					"Q W E R T Y {bksp}",
					"S A M P L E {shift}",
					"{accept} {space} {cancel}"
				]
			}
		});

Options:
	layout
		[String] specify which keyboard layout to use
		qwerty - Standard QWERTY layout (Default)
		international - US international layout
		alpha  - Alphabetical layout
		dvorak - Dvorak Simplified layout
		num    - Numerical (ten-key) layout
		custom - Uses a custom layout as defined by the customLayout option

	customLayout
		[Object] Specify a custom layout
			An Object containing a set of key:value pairs, each key is a keyset.
			The key can be one to four rows (default, shifted, alt and alt-shift) or any number of meta key sets (meta1, meta2, etc).
			The value is an array with string elements of which each defines a new keyboard row.
			Each string element must have each character or key seperated by a space.
			To include an action key, select the desired one from the list below, or define your own by adding it to the $.keyboard.keyaction variable
			In the list below where two special/"Action" keys are shown, both keys have the same action but different appearances (abbreviated/full name keys).
			Special/"Action" keys include:
				{a}, {accept} - Updates element value and closes keyboard
				{alt},{altgr} - AltGr for International keyboard
				{b}, {bksp}   - Backspace
				{c}, {cancel} - Clears changes and closes keyboard
				{clear}       - Clear input window - used in num pad
				{combo}       - Toggle combo (diacritic) key
				{dec}         - Decimal for numeric entry, only allows one decimal (optional use in num pad)
				{default}     - Switch to the default keyset
				{e}, {enter}  - Return/New Line
				{empty}       - empty (blank) key
				{lock}        - Caps lock key
				{meta#}       - Meta keys that change the key set (# can be any integer)
				{next}        - Switch to next keyboard input/textarea
				{prev}        - Switch to previous keyboard input/textarea
				{s}, {shift}  - Shift
				{sign}        - Change sign of numeric entry (positive or negative)
				{sp:#}        - Replace # with a numerical value, adds blank space, value of 1 ~ width of one key
				{space}       - Spacebar
				{t}, {tab}    - Tab

CSS:
	Please see the keyboard.css file
*/
/*jshint browser:true, jquery:true, unused:false */
;(function($){
"use strict";
$.keyboard = function(el, options){
	var base = this, o;

	// Access to jQuery and DOM versions of element
	base.$el = $(el);
	base.el = el;

	// Add a reverse reference to the DOM object
	base.$el.data("keyboard", base);

	base.init = function(){
		base.options = o = $.extend(true, {}, $.keyboard.defaultOptions, options);

		// Shift and Alt key toggles, sets is true if a layout has more than one keyset - used for mousewheel message
		base.shiftActive = base.altActive = base.metaActive = base.sets = base.capsLock = false;
		base.lastKeyset = [false, false, false]; // [shift, alt, meta]
		// Class names of the basic key set - meta keysets are handled by the keyname
		base.rows = [ '', '-shift', '-alt', '-alt-shift' ];
		base.acceptedKeys = [];
		base.mappedKeys = {}; // for remapping manually typed in keys
		$('<!--[if lte IE 8]><script>jQuery("body").addClass("oldie");</script><![endif]--><!--[if IE]><script>jQuery("body").addClass("ie");</script><![endif]-->').appendTo('body').remove();
		base.msie = $('body').hasClass('oldie'); // Old IE flag, used for caret positioning
		base.allie = $('body').hasClass('ie');
		base.inPlaceholder = base.$el.attr('placeholder') || '';
		base.watermark = (typeof(document.createElement('input').placeholder) !== 'undefined' && base.inPlaceholder !== ''); // html 5 placeholder/watermark
		base.regex = $.keyboard.comboRegex; // save default regex (in case loading another layout changes it)
		base.decimal = ( /^\./.test(o.display.dec) ) ? true : false; // determine if US "." or European "," system being used
		// convert mouse repeater rate (characters per second) into a time in milliseconds.
		base.repeatTime = 1000/(o.repeatRate || 20);

		// Check if caret position is saved when input is hidden or loses focus
		// (*cough* all versions of IE and I think Opera has/had an issue as well
		base.temp = $('<input style="position:absolute;left:-9999em;top:-9999em;" type="text" value="testing">').appendTo('body').caret(3,3);
		// Also save caret position of the input if it is locked
		base.checkCaret = (o.lockInput || base.temp.hide().show().caret().start !== 3 ) ? true : false;
		base.temp.remove();
		base.lastCaret = { start:0, end:0 };

		base.temp = [ '', 0, 0 ]; // used when building the keyboard - [keyset element, row, index]

		// Bind events
		$.each('initialized beforeVisible visible hidden canceled accepted beforeClose'.split(' '), function(i,f){
			if ($.isFunction(o[f])){
				base.$el.bind(f + '.keyboard', o[f]);
			}
		});

		// Close with esc key & clicking outside
		if (o.alwaysOpen) { o.stayOpen = true; }
		$(document).bind('mousedown.keyboard keyup.keyboard touchstart.keyboard', function(e){
			if (base.opening) { return; }
			base.escClose(e);
			// needed for IE to allow switching between keyboards smoothly
			if ( e.target && $(e.target).hasClass('ui-keyboard-input') ) {
				var kb = $(e.target).data('keyboard');
				if (kb && kb.options.openOn) {
					kb.focusOn();
				}
			}
		});

		// Display keyboard on focus
		base.$el
			.addClass('ui-keyboard-input ' + o.css.input)
			.attr({ 'aria-haspopup' : 'true', 'role' : 'textbox' });

		// add disabled/readonly class - dynamically updated on reveal
		if (base.$el.is(':disabled') || (base.$el.attr('readonly') && !base.$el.hasClass('ui-keyboard-lockedinput'))) {
			base.$el.addClass('ui-keyboard-nokeyboard');
		}
		if (o.openOn) {
			base.$el.bind(o.openOn + '.keyboard', function(){
				base.focusOn();
			});
		}

		// Add placeholder if not supported by the browser
		if (!base.watermark && base.$el.val() === '' && base.inPlaceholder !== '' && base.$el.attr('placeholder') !== '') {
			base.$el
				.addClass('ui-keyboard-placeholder') // css watermark style (darker text)
				.val( base.inPlaceholder );
		}

		base.$el.trigger( 'initialized.keyboard', [ base, base.el ] );

		// initialized with keyboard open
		if (o.alwaysOpen) {
			base.reveal();
		}

	};

	base.focusOn = function(){
		if (o.usePreview && base.$el.is(':visible')) {
			// caret position is always 0,0 in webkit; and nothing is focused at this point... odd
			// save caret position in the input to transfer it to the preview
			base.lastCaret = base.$el.caret();
		}
		if (!base.isVisible() || o.alwaysOpen) {
			clearTimeout(base.timer);
			base.reveal();
		}
	};

	base.reveal = function(){
		base.opening = true;
		// close all keyboards
		$('.ui-keyboard:not(.ui-keyboard-always-open)').hide();

		// Don't open if disabled
		if (base.$el.is(':disabled') || (base.$el.attr('readonly') && !base.$el.hasClass('ui-keyboard-lockedinput'))) {
			base.$el.addClass('ui-keyboard-nokeyboard');
			return;
		} else {
			base.$el.removeClass('ui-keyboard-nokeyboard');
		}

		// Unbind focus to prevent recursion - openOn may be empty if keyboard is opened externally
		if (o.openOn) {
			base.$el.unbind( o.openOn + '.keyboard' );
		}

		// build keyboard if it doesn't exist
		if (typeof(base.$keyboard) === 'undefined') { base.startup(); }

		// ui-keyboard-has-focus is applied in case multiple keyboards have alwaysOpen = true and are stacked
		$('.ui-keyboard-has-focus').removeClass('ui-keyboard-has-focus');
		$('.ui-keyboard-input-current').removeClass('ui-keyboard-input-current');

		base.$el.addClass('ui-keyboard-input-current');
		base.isCurrent(true);

		// clear watermark
		if (!base.watermark && base.el.value === base.inPlaceholder) {
			base.$el
				.removeClass('ui-keyboard-placeholder')
				.val('');
		}
		// save starting content, in case we cancel
		base.originalContent = base.$el.val();
		base.$preview.val( base.originalContent );

		// disable/enable accept button
		if (o.acceptValid) { base.checkValid(); }

		// get single target position || target stored in element data (multiple targets) || default, at the element
		var p, s;
		base.position = o.position;
		base.position.of = base.position.of || base.$el.data('keyboardPosition') || base.$el;
		base.position.collision = (o.usePreview) ? base.position.collision || 'fit fit' : 'flip flip';

		if (o.resetDefault) {
			base.shiftActive = base.altActive = base.metaActive = false;
			base.showKeySet();
		}

		// basic positioning before it is set by position utility
		base.$keyboard.css({ position: 'absolute', left: 0, top: 0 });

		// beforeVisible event
		base.$el.trigger( 'beforeVisible.keyboard', [ base, base.el ] );

		// show keyboard
		base.$keyboard
			.addClass('ui-keyboard-has-focus')
			.show();

		// adjust keyboard preview window width - save width so IE won't keep expanding (fix issue #6)
		if (o.usePreview && base.msie) {
			if (typeof base.width === 'undefined') {
				base.$preview.hide(); // preview is 100% browser width in IE7, so hide the damn thing
				base.width = Math.ceil(base.$keyboard.width()); // set input width to match the widest keyboard row
				base.$preview.show();
			}
			base.$preview.width(base.width);
		}

		// position after keyboard is visible (required for UI position utility) and appropriately sized
//		if ($.ui.position) {
//			base.$keyboard.position(base.position);
//		}

		if (o.initialFocus) {
			base.$preview.focus();
		}

		base.checkDecimal();

		// get preview area line height
		// add roughly 4px to get line height from font height, works well for font-sizes from 14-36px - needed for textareas
		base.lineHeight = parseInt( base.$preview.css('lineHeight'), 10) || parseInt(base.$preview.css('font-size') ,10) + 4;

		if (o.caretToEnd) {
			s = base.originalContent.length;
			base.lastCaret = {
				start: s,
				end  : s
			};
		}

		// IE caret haxx0rs
		if (base.allie){
			// ensure caret is at the end of the text (needed for IE)
			s = base.lastCaret.start || base.originalContent.length;
			p = { start: s, end: s };
			if (!base.lastCaret) { base.lastCaret = p; } // set caret at end of content, if undefined
			if (base.lastCaret.end === 0 && base.lastCaret.start > 0) { base.lastCaret.end = base.lastCaret.start; } // sometimes end = 0 while start is > 0
			if (base.lastCaret.start < 0) { base.lastCaret = p; } // IE will have start -1, end of 0 when not focused (see demo: http://jsfiddle.net/Mottie/fgryQ/3/).
		}

		// opening keyboard flag; delay allows switching between keyboards without immediately closing the keyboard
		setTimeout(function(){
			base.opening = false;
			if (o.initialFocus) {
				base.$preview.caret( base.lastCaret.start, base.lastCaret.end );
			}
			base.$el.trigger( 'visible.keyboard', [ base, base.el ] );
		}, 10);
		// return base to allow chaining in typing extension
		return base;
	};

	base.startup = function(){
		base.$keyboard = base.buildKeyboard();
		base.$allKeys = base.$keyboard.find('button.ui-keyboard-button');
		base.preview = base.$preview[0];
		base.$decBtn = base.$keyboard.find('.ui-keyboard-dec');
		base.wheel = $.isFunction( $.fn.mousewheel ); // is mousewheel plugin loaded?
		// keyCode of keys always allowed to be typed - caps lock, page up & down, end, home, arrow, insert & delete keys
		base.alwaysAllowed = [20,33,34,35,36,37,38,39,40,45,46];
		if (o.enterNavigation) { base.alwaysAllowed.push(13); } // add enter to allowed keys
		base.$preview
			.bind('keypress.keyboard', function(e){
				var k = base.lastKey = String.fromCharCode(e.charCode || e.which);
				base.$lastKey = []; // not a virtual keyboard key
				if (base.checkCaret) { base.lastCaret = base.$preview.caret(); }

				// update caps lock - can only do this while typing =(
				base.capsLock = (((k >= 65 && k <= 90) && !e.shiftKey) || ((k >= 97 && k <= 122) && e.shiftKey)) ? true : false;

				// restrict input - keyCode in keypress special keys: see http://www.asquare.net/javascript/tests/KeyCode.html
				if (o.restrictInput) {
					// allow navigation keys to work - Chrome doesn't fire a keypress event (8 = bksp)
					if ( (e.which === 8 || e.which === 0) && $.inArray( e.keyCode, base.alwaysAllowed ) ) { return; }
					if ($.inArray(k, base.acceptedKeys) === -1) { e.preventDefault(); } // quick key check
				} else if ( (e.ctrlKey || e.metaKey) && (e.which === 97 || e.which === 99 || e.which === 118 || (e.which >= 120 && e.which <=122)) ) {
					// Allow select all (ctrl-a:97), copy (ctrl-c:99), paste (ctrl-v:118) & cut (ctrl-x:120) & redo (ctrl-y:121)& undo (ctrl-z:122); meta key for mac
					return;
				}
				// Mapped Keys - allows typing on a regular keyboard and the mapped key is entered
				// Set up a key in the layout as follows: "m(a):label"; m = key to map, (a) = actual keyboard key to map to (optional), ":label" = title/tooltip (optional)
				// example: \u0391 or \u0391(A) or \u0391:alpha or \u0391(A):alpha
				if (base.hasMappedKeys) {
					if (base.mappedKeys.hasOwnProperty(k)){
						base.lastKey = base.mappedKeys[k];
						base.insertText( base.lastKey );
						e.preventDefault();
					}
				}
				base.checkMaxLength();

			})
			.bind('keyup.keyboard', function(e){
				switch (e.which) {
					// Insert tab key
					case 9 :
						// Added a flag to prevent from tabbing into an input, keyboard opening, then adding the tab to the keyboard preview
						// area on keyup. Sadly it still happens if you don't release the tab key immediately because keydown event auto-repeats
						if (base.tab && o.tabNavigation && !o.lockInput) {
							base.shiftActive = e.shiftKey;
							$.keyboard.keyaction.tab(base);
							base.tab = false;
						} else {
							e.preventDefault();
						}
						break;

					// Escape will hide the keyboard
					case 27:
						base.close();
						return false;
				}

				// throttle the check combo function because fast typers will have an incorrectly positioned caret
				clearTimeout(base.throttled);
				base.throttled = setTimeout(function(){
					// fix error in OSX? see issue #102
					if (base.isVisible()) {
						base.checkCombos();
					}
				}, 100);

				base.checkMaxLength();
				// change callback is no longer bound to the input element as the callback could be
				// called during an external change event with all the necessary parameters (issue #157)
				if ($.isFunction(o.change)){ o.change( $.Event("change"), base, base.el ); }
				base.$el.trigger( 'change.keyboard', [ base, base.el ] );
			})
			.bind('keydown.keyboard', function(e){
				switch (e.which) {
					// prevent tab key from leaving the preview window
					case 9 :
						if (o.tabNavigation) {
							// allow tab to pass through - tab to next input/shift-tab for prev
							base.tab = true;
							return false;
						} else {
							base.tab = true; // see keyup comment above
							return false;
						}
						break; // adding a break here to make jsHint happy

					case 13:
						$.keyboard.keyaction.enter(base, null, e);
						break;

					// Show capsLock
					case 20:
						base.shiftActive = base.capsLock = !base.capsLock;
						base.showKeySet(this);
						break;

					case 86:
						// prevent ctrl-v/cmd-v
						if (e.ctrlKey || e.metaKey) {
							if (o.preventPaste) { e.preventDefault(); return; }
							base.checkCombos(); // check pasted content
						}
						break;
				}
			})
			.bind('mouseup.keyboard touchend.keyboard', function(){
				if (base.checkCaret) { base.lastCaret = base.$preview.caret(); }
			});
			//.bind('mousemove.keyboard', function(){
			//	if (!o.alwaysOpen && $.keyboard.currentKeyboard === base.el && !base.opening) { base.$preview.focus(); }
			//});
			// prevent keyboard event bubbling
			base.$keyboard.bind('mousedown.keyboard click.keyboard touchstart.keyboard', function(e){
				e.stopPropagation();
			});

		// If preventing paste, block context menu (right click)
		if (o.preventPaste){
			base.$preview.bind('contextmenu.keyboard', function(e){ e.preventDefault(); });
			base.$el.bind('contextmenu.keyboard', function(e){ e.preventDefault(); });
		}

		if (o.appendLocally) {
			base.$el.after( base.$keyboard );
		} else {
			base.$keyboard.appendTo('body');
		}

		base.$allKeys
			.bind(o.keyBinding.split(' ').join('.keyboard ') + '.keyboard repeater.keyboard', function(e){
				// prevent errors when external triggers attempt to "type" - see issue #158
				if (!base.$keyboard.is(":visible")){ return false; }
				// 'key', { action: doAction, original: n, curTxt : n, curNum: 0 }
				var txt, key = $.data(this, 'key'), action = key.action.split(':')[0];
				base.$preview.focus();
				base.$lastKey = $(this);
				base.lastKey = key.curTxt;
				// Start caret in IE when not focused (happens with each virtual keyboard button click
				if (base.checkCaret) { base.$preview.caret( base.lastCaret.start, base.lastCaret.end ); }
				if (action.match('meta')) { action = 'meta'; }
				if ($.keyboard.keyaction.hasOwnProperty(action) && $(this).hasClass('ui-keyboard-actionkey')) {
					// stop processing if action returns false (close & cancel)
					if ($.keyboard.keyaction[action](base,this,e) === false) { return false; }
				} else if (typeof key.action !== 'undefined') {
					txt = base.lastKey = (base.wheel && !$(this).hasClass('ui-keyboard-actionkey')) ? key.curTxt : key.action;
					base.insertText(txt);
					if (!base.capsLock && !o.stickyShift && !e.shiftKey) {
						base.shiftActive = false;
						base.showKeySet(this);
					}
				}
				base.checkCombos();
				base.checkMaxLength();
				if ($.isFunction(o.change)){ o.change( $.Event("change"), base, base.el ); }
				base.$el.trigger( 'change.keyboard', [ base, base.el ] );
				base.$preview.focus();
				// attempt to fix issue #131
				if (base.checkCaret) { base.$preview.caret( base.lastCaret.start, base.lastCaret.end ); }
				e.preventDefault();
			})
			// Change hover class and tooltip
			.bind('mouseenter.keyboard mouseleave.keyboard', function(e){
				if (!base.isCurrent()) { return; }
				var el = this, $this = $(this),
					// 'key' = { action: doAction, original: n, curTxt : n, curNum: 0 }
					key = $.data(el, 'key');
				if (e.type === 'mouseenter' && base.el.type !== 'password' && !$this.hasClass(o.css.buttonDisabled) ){
					$this
						.addClass(o.css.buttonHover)
						.attr('title', function(i,t){
							// show mouse wheel message
							return (base.wheel && t === '' && base.sets) ? o.wheelMessage : t;
						});
				}
				if (e.type === 'mouseleave'){
					key.curTxt = key.original;
					key.curNum = 0;
					$.data(el, 'key', key);
					$this
						.removeClass( (base.el.type === 'password') ? '' : o.css.buttonHover) // needed or IE flickers really bad
						.attr('title', function(i,t){ return (t === o.wheelMessage) ? '' : t; })
						.find('span').text( key.original ); // restore original button text
				}
			})
			// Allow mousewheel to scroll through other key sets of the same key
			.bind('mousewheel.keyboard', function(e, delta){
				if (base.wheel) {
					var txt, $this = $(this), key = $.data(this, 'key');
					txt = key.layers || base.getLayers( $this );
					key.curNum += (delta > 0) ? -1 : 1;
					if (key.curNum > txt.length-1) { key.curNum = 0; }
					if (key.curNum < 0) { key.curNum = txt.length-1; }
					key.layers = txt;
					key.curTxt = txt[key.curNum];
					$.data(this, 'key', key);
					$this.find('span').text( txt[key.curNum] );
					return false;
				}
			})
			// using "kb" namespace for mouse repeat functionality to keep it separate
			// I need to trigger a "repeater.keyboard" to make it work
			.bind('mouseup.keyboard mouseleave.kb touchend.kb touchmove.kb touchcancel.kb', function(e){
				if (e.type === 'mouseleave') {
					$(this).removeClass(o.css.buttonHover); // needed for touch devices
				} else {
					if (base.isVisible() && base.isCurrent()) { base.$preview.focus(); }
					if (base.checkCaret) { base.$preview.caret( base.lastCaret.start, base.lastCaret.end ); }
				}
				base.mouseRepeat = [false,''];
				clearTimeout(base.repeater); // make sure key repeat stops!
				return false;
			})
			// prevent form submits when keyboard is bound locally - issue #64
			.bind('click.keyboard', function(){
				return false;
			})
			// no mouse repeat for action keys (shift, ctrl, alt, meta, etc)
			.filter(':not(.ui-keyboard-actionkey)')
			// mouse repeated action key exceptions
			.add('.ui-keyboard-tab, .ui-keyboard-bksp, .ui-keyboard-space, .ui-keyboard-enter', base.$keyboard)
			.bind('mousedown.kb touchstart.kb', function(){
				if (o.repeatRate !== 0) {
					var key = $(this);
					base.mouseRepeat = [true, key]; // save the key, make sure we are repeating the right one (fast typers)
					setTimeout(function() {
						if (base.mouseRepeat[0] && base.mouseRepeat[1] === key) { base.repeatKey(key); }
					}, o.repeatDelay);
				}
				return false;
			});

		// adjust with window resize
		$(window).resize(function(){
			if (base.isVisible()) {
				base.$keyboard.position(base.position);
			}
		});

	};

	base.isVisible = function() {
		if (typeof(base.$keyboard) === 'undefined') {
			return false;
		}
		return base.$keyboard.is(":visible");
	};

	// Insert text at caret/selection - thanks to Derek Wickwire for fixing this up!
	base.insertText = function(txt){
		var bksp, t, h,
			// use base.$preview.val() instead of base.preview.value (val.length includes carriage returns in IE).
			val = base.$preview.val(),
			pos = base.$preview.caret(),
			scrL = base.$preview.scrollLeft(),
			scrT = base.$preview.scrollTop(),
			len = val.length; // save original content length

		// silly IE caret hacks... it should work correctly, but navigating using arrow keys in a textarea is still difficult
		if (pos.end < pos.start) { pos.end = pos.start; } // in IE, pos.end can be zero after input loses focus
		if (pos.start > len) { pos.end = pos.start = len; }

		if (base.preview.tagName === 'TEXTAREA') {
			// This makes sure the caret moves to the next line after clicking on enter (manual typing works fine)
			if (base.msie && val.substr(pos.start, 1) === '\n') { pos.start += 1; pos.end += 1; }
			// Set scroll top so current text is in view - needed for virtual keyboard typing, not manual typing
			// this doesn't appear to work correctly in Opera
			h = (val.split('\n').length - 1);
			base.preview.scrollTop = (h>0) ? base.lineHeight * h : scrT;
		}

		bksp = (txt === 'bksp' && pos.start === pos.end) ? true : false;
		txt = (txt === 'bksp') ? '' : txt;
		t = pos.start + (bksp ? -1 : txt.length);
		scrL += parseInt(base.$preview.css('fontSize'),10) * (txt === 'bksp' ? -1 : 1);

		base.$preview
			.val( base.$preview.val().substr(0, pos.start - (bksp ? 1 : 0)) + txt + base.$preview.val().substr(pos.end) )
			.caret(t, t)
			.scrollLeft(scrL);

		if (base.checkCaret) { base.lastCaret = { start: t, end: t }; } // save caret in case of bksp

	};

	// check max length
	base.checkMaxLength = function(){
		var t, p = base.$preview.val();
		if (o.maxLength !== false && p.length > o.maxLength) {
			t = Math.min(base.$preview.caret().start, o.maxLength); 
			base.$preview.val( p.substring(0, o.maxLength) );
			// restore caret on change, otherwise it ends up at the end.
			base.$preview.caret( t, t );
			base.lastCaret = { start: t, end: t };
		}
		if (base.$decBtn.length) {
			base.checkDecimal();
		}
	};

	// mousedown repeater
	base.repeatKey = function(key){
		key.trigger('repeater.keyboard');
		if (base.mouseRepeat[0]) {
			base.repeater = setTimeout(function() {
				base.repeatKey(key);
			}, base.repeatTime);
		}
	};

	base.showKeySet = function(el){
		var key = '',
		toShow = (base.shiftActive ? 1 : 0) + (base.altActive ? 2 : 0);
		if (!base.shiftActive) { base.capsLock = false; }
		// check meta key set
		if (base.metaActive) {
			// the name attribute contains the meta set # "meta99"
			key = (el && el.name && /meta/.test(el.name)) ? el.name : '';
			// save active meta keyset name
			if (key === '') {
				key = (base.metaActive === true) ? '' : base.metaActive;
			} else {
				base.metaActive = key;
			}
			// if meta keyset doesn't have a shift or alt keyset, then show just the meta key set
			if ( (!o.stickyShift && base.lastKeyset[2] !== base.metaActive) ||
				( (base.shiftActive || base.altActive) && !base.$keyboard.find('.ui-keyboard-keyset-' + key + base.rows[toShow]).length) ) {
				base.shiftActive = base.altActive = false;
			}
		} else if (!o.stickyShift && base.lastKeyset[2] !== base.metaActive && base.shiftActive) {
			// switching from meta key set back to default, reset shift & alt if using stickyShift
			base.shiftActive = base.altActive = false;
		}
		toShow = (base.shiftActive ? 1 : 0) + (base.altActive ? 2 : 0);
		key = (toShow === 0 && !base.metaActive) ? '-default' : (key === '') ? '' : '-' + key;
		if (!base.$keyboard.find('.ui-keyboard-keyset' + key + base.rows[toShow]).length) {
			// keyset doesn't exist, so restore last keyset settings
			base.shiftActive = base.lastKeyset[0];
			base.altActive = base.lastKeyset[1];
			base.metaActive = base.lastKeyset[2];
			return;
		}
		base.$keyboard
			.find('.ui-keyboard-alt, .ui-keyboard-shift, .ui-keyboard-actionkey[class*=meta]').removeClass(o.css.buttonAction).end()
			.find('.ui-keyboard-alt')[(base.altActive) ? 'addClass' : 'removeClass'](o.css.buttonAction).end()
			.find('.ui-keyboard-shift')[(base.shiftActive) ? 'addClass' : 'removeClass'](o.css.buttonAction).end()
			.find('.ui-keyboard-lock')[(base.capsLock) ? 'addClass' : 'removeClass'](o.css.buttonAction).end()
			.find('.ui-keyboard-keyset').hide().end()
			.find('.ui-keyboard-keyset' + key + base.rows[toShow]).show().end()
			.find('.ui-keyboard-actionkey.ui-keyboard' + key).addClass(o.css.buttonAction);
		base.lastKeyset = [ base.shiftActive, base.altActive, base.metaActive ];
	};

	// check for key combos (dead keys)
	base.checkCombos = function(){
		if (!base.isVisible()) { return; }
		var i, r, t, t2,
			// use base.$preview.val() instead of base.preview.value (val.length includes carriage returns in IE).
			val = base.$preview.val(),
			pos = base.$preview.caret(),
			len = val.length; // save original content length

		// silly IE caret hacks... it should work correctly, but navigating using arrow keys in a textarea is still difficult
		if (pos.end < pos.start) { pos.end = pos.start; } // in IE, pos.end can be zero after input loses focus
		if (pos.start > len) { pos.end = pos.start = len; }
		// This makes sure the caret moves to the next line after clicking on enter (manual typing works fine)
		if (base.msie && val.substr(pos.start, 1) === '\n') { pos.start += 1; pos.end += 1; }

		if (o.useCombos) {
			// keep 'a' and 'o' in the regex for ae and oe ligature (æ,œ)
			// thanks to KennyTM: http://stackoverflow.com/questions/4275077/replace-characters-to-make-international-letters-diacritics
			// original regex /([`\'~\^\"ao])([a-z])/mig moved to $.keyboard.comboRegex
			if (base.msie) {
				// old IE may not have the caret positioned correctly, so just check the whole thing
				val = val.replace(base.regex, function(s, accent, letter){
					return (o.combos.hasOwnProperty(accent)) ? o.combos[accent][letter] || s : s;
				});
			// prevent combo replace error, in case the keyboard closes - see issue #116
			} else if (base.$preview.length) {
				// Modern browsers - check for combos from last two characters left of the caret
				t = pos.start - (pos.start - 2 >= 0 ? 2 : 0);
				// target last two characters
				base.$preview.caret(t, pos.end);
				// do combo replace
				t2 = (base.$preview.caret().text || '').replace(base.regex, function(s, accent, letter){
					return (o.combos.hasOwnProperty(accent)) ? o.combos[accent][letter] || s : s;
				});
				// add combo back
				base.$preview.val( base.$preview.caret().replace(t2) );
				val = base.$preview.val();
			}
		}

		// check input restrictions - in case content was pasted
		if (o.restrictInput && val !== '') {
			t = val;
			r = base.acceptedKeys.length;
			for (i=0; i < r; i++){
				if (t === '') { continue; }
				t2 = base.acceptedKeys[i];
				if (val.indexOf(t2) >= 0) {
					// escape out all special characters
					if (/[\[|\]|\\|\^|\$|\.|\||\?|\*|\+|\(|\)|\{|\}]/g.test(t2)) { t2 = '\\' + t2; }
					t = t.replace( (new RegExp(t2, "g")), '');
				}
			}
			// what's left over are keys that aren't in the acceptedKeys array
			if (t !== '') { val = val.replace(t, ''); }
		}

		// save changes, then reposition caret
		pos.start += val.length - len;
		pos.end += val.length - len;
		base.$preview.val(val);

		base.$preview.caret(pos.start, pos.end);

		// calculate current cursor scroll location and set scrolltop to keep it in view
		base.preview.scrollTop = base.lineHeight * (val.substring(0, pos.start).split('\n').length - 1); // find row, multiply by font-size

		base.lastCaret = { start: pos.start, end: pos.end };

		if (o.acceptValid) { base.checkValid(); }

		return val; // return text, used for keyboard closing section
	};

	// Toggle accept button classes, if validating
	base.checkValid = function(){
		var valid = true;
		if (o.validate && typeof o.validate === "function") {
			valid = o.validate(base, base.$preview.val(), false);
		}
		// toggle accept button classes; defined in the css
		base.$keyboard.find('.ui-keyboard-accept')
			[valid ? 'removeClass' : 'addClass']('ui-keyboard-invalid-input')
			[valid ? 'addClass' : 'removeClass']('ui-keyboard-valid-input');
	};

	// Decimal button for num pad - only allow one (not used by default)
	base.checkDecimal = function(){
		// Check US "." or European "," format
		if ( ( base.decimal && /\./g.test(base.preview.value) ) || ( !base.decimal && /\,/g.test(base.preview.value) ) ) {
			base.$decBtn
				.attr({ 'disabled': 'disabled', 'aria-disabled': 'true' })
				.removeClass(o.css.buttonDefault + ' ' + o.css.buttonHover)
				.addClass(o.css.buttonDisabled);
		} else {
			base.$decBtn
				.removeAttr('disabled')
				.attr({ 'aria-disabled': 'false' })
				.addClass(o.css.buttonDefault)
				.removeClass(o.css.buttonDisabled);
		}
	};

	// get other layer values for a specific key
	base.getLayers = function(el){
		var key, keys;
		key = el.attr('data-pos');
		keys = el.closest('.ui-keyboard').find('button[data-pos="' + key + '"]').map(function(){
			// added '> span' because jQuery mobile adds multiple spans inside the button
			return $(this).find('> span').text();
		}).get();
		return keys;
	};

	base.isCurrent = function(set){
		var cur = $.keyboard.currentKeyboard || false;
		if (set) {
			cur = $.keyboard.currentKeyboard = base.el;
		} else if (set === false && cur === base.el) {
			cur = $.keyboard.currentKeyboard = '';
		}
		return cur === base.el;
	};

	// Go to next or prev inputs
	// goToNext = true, then go to next input; if false go to prev
	// isAccepted is from autoAccept option or true if user presses shift-enter
	base.switchInput = function(goToNext, isAccepted){
		if (typeof o.switchInput === "function") {
			o.switchInput(base, goToNext, isAccepted);
		} else {
			base.$keyboard.hide();
			var kb, stopped = false,
				all = $('button, input, textarea, a').filter(':visible'),
				indx = all.index(base.$el) + (goToNext ? 1 : -1);
				base.$keyboard.show();
			if (indx > all.length - 1) {
				stopped = o.stopAtEnd;
				indx = 0; // go to first input
			}
			if (indx < 0) {
				stopped = o.stopAtEnd;
				indx = all.length - 1; // stop or go to last
			}
			if (!stopped) {
				base.close(isAccepted);
				kb = all.eq(indx).data('keyboard');
				if (kb && kb.options.openOn.length) {
					kb.focusOn();
				} else {
					all.eq(indx).focus();
				}
			}
		}
		return false;
	};

	// Close the keyboard, if visible. Pass a status of true, if the content was accepted (for the event trigger).
	base.close = function(accepted){
		if (base.isVisible()) {
			clearTimeout(base.throttled);
			var val = (accepted) ?  base.checkCombos() : base.originalContent;
			// validate input if accepted
			if (accepted && o.validate && typeof(o.validate) === "function" && !o.validate(base, val, true)) {
				val = base.originalContent;
				accepted = false;
				if (o.cancelClose) { return; }
			}
			base.isCurrent(false);
			base.$el
				.removeClass('ui-keyboard-input-current ui-keyboard-autoaccepted')
				// add "ui-keyboard-autoaccepted" to inputs
				.addClass( (accepted || false) ? accepted === true ? '' : 'ui-keyboard-autoaccepted' : '' )
				.trigger( (o.alwaysOpen) ? '' : 'beforeClose.keyboard', [ base, base.el, (accepted || false) ] )
				.val( val )
				.scrollTop( base.el.scrollHeight )
				.trigger( ((accepted || false) ? 'accepted.keyboard' : 'canceled.keyboard'), [ base, base.el ] )
				.trigger( (o.alwaysOpen) ? 'inactive.keyboard' : 'hidden.keyboard', [ base, base.el ] )
				.blur();
			if (o.openOn) {
				// rebind input focus - delayed to fix IE issue #72
				base.timer = setTimeout(function(){
					base.$el.bind( o.openOn + '.keyboard', function(){ base.focusOn(); });
					// remove focus from element (needed for IE since blur doesn't seem to work)
					if ($(':focus')[0] === base.el) { base.$el.blur(); }
				}, 500);
			}
			if (!o.alwaysOpen) {
				base.$keyboard.hide();
			}
			if (!base.watermark && base.el.value === '' && base.inPlaceholder !== '') {
				base.$el
					.addClass('ui-keyboard-placeholder')
					.val(base.inPlaceholder);
			}
			// trigger default change event - see issue #146
			base.$el.trigger('change');
		}
		return !!accepted;
	};

	base.accept = function(){
		return base.close(true);
	};

	base.escClose = function(e){
		if ( e.type === 'keyup' ) {
			return ( e.which === 27 )  ? base.close() : '';
		}
		var cur = base.isCurrent();
		// keep keyboard open if alwaysOpen or stayOpen is true - fixes mutliple always open keyboards or single stay open keyboard
		if ( !base.isVisible() || (o.alwaysOpen && !cur) || (!o.alwaysOpen && o.stayOpen && cur && !base.isVisible()) ) { return; }
		// ignore autoaccept if using escape - good idea?

		if ( e.target !== base.el && cur ) {
			// stop propogation in IE - an input getting focus doesn't open a keyboard if one is already open
			if ( base.allie ) {
				e.preventDefault();
			}
			base.close( o.autoAccept ? 'true' : false );
		}
	};

	// Build default button
	base.keyBtn = $('<button />')
		.attr({ 'role': 'button', 'aria-disabled': 'false', 'tabindex' : '-1' })
		.addClass('ui-keyboard-button');

	// Add key function
	// keyName = the name of the function called in $.keyboard.keyaction when the button is clicked
	// name = name added to key, or cross-referenced in the display options
	// newSet = keyset to attach the new button
	// regKey = true when it is not an action key
	base.addKey = function(keyName, name, regKey){
		var t, keyType, m, map, nm,
			n = (regKey === true) ? keyName : o.display[name] || keyName,
			kn = (regKey === true) ? keyName.charCodeAt(0) : keyName;
		// map defined keys - format "key(A):Label_for_key"
		// "key" = key that is seen (can any character; but it might need to be escaped using "\" or entered as unicode "\u####"
		// "(A)" = the actual key on the real keyboard to remap, ":Label_for_key" ends up in the title/tooltip
		if (/\(.+\)/.test(n)) { // n = "\u0391(A):alpha"
			map = n.replace(/\(([^()]+)\)/, ''); // remove "(A)", left with "\u0391:alpha"
			m = n.match(/\(([^()]+)\)/)[1]; // extract "A" from "(A)"
			n = map;
			nm = map.split(':');
			map = (nm[0] !== '' && nm.length > 1) ? nm[0] : map; // get "\u0391" from "\u0391:alpha"
			base.mappedKeys[m] = map;
		}

		// find key label
		nm = n.split(':');
		if (nm[0] === '' && nm[1] === '') { n = ':'; } // corner case of ":(:):;" reduced to "::;", split as ["", "", ";"]
		n = (nm[0] !== '' && nm.length > 1) ? $.trim(nm[0]) : n;
		t = (nm.length > 1) ? $.trim(nm[1]).replace(/_/g, " ") || '' : ''; // added to title

		// Action keys will have the 'ui-keyboard-actionkey' class
		// '\u2190'.length = 1 because the unicode is converted, so if more than one character, add the wide class
		keyType = (n.length > 1) ? ' ui-keyboard-widekey' : '';
		keyType += (regKey) ? '' : ' ui-keyboard-actionkey';
		return base.keyBtn
			.clone()
			.attr({ 'data-value' : n, 'name': kn, 'data-pos': base.temp[1] + ',' + base.temp[2], 'title' : t })
			.data('key', { action: keyName, original: n, curTxt : n, curNum: 0 })
			// add "ui-keyboard-" + keyName, if this is an action key (e.g. "Bksp" will have 'ui-keyboard-bskp' class)
			// add "ui-keyboard-" + unicode of 1st character (e.g. "~" is a regular key, class = 'ui-keyboard-126' (126 is the unicode value - same as typing &#126;)
			.addClass('ui-keyboard-' + kn + keyType + ' ' + o.css.buttonDefault)
			.html('<span>' + n + '</span>')
			.appendTo(base.temp[0]);
	};

	base.buildKeyboard = function(){
		var action, row, newSet, isAction,
			currentSet, key, keys, margin,
			sets = 0,

		container = $('<div />')
			.addClass('ui-keyboard ' + o.css.container + (o.alwaysOpen ? ' ui-keyboard-always-open' : '') )
			.attr({ 'role': 'textbox' })
			.hide();

		// build preview display
		if (o.usePreview) {
			base.$preview = base.$el.clone(false)
				.removeAttr('id')
				.removeClass('ui-keyboard-placeholder ui-keyboard-input')
				.addClass('ui-keyboard-preview ' + o.css.input)
				.attr('tabindex', '-1')
				.show(); // for hidden inputs
			// build preview container and append preview display
			$('<div />')
				.addClass('ui-keyboard-preview-wrapper')
				.append(base.$preview)
				.appendTo(container);
		} else {
			// No preview display, use element and reposition the keyboard under it.
			base.$preview = base.$el;
			o.position.at = o.position.at2;
		}
		if (o.lockInput) {
			base.$preview.addClass('ui-keyboard-lockedinput').attr({ 'readonly': 'readonly'});
		}

		// verify layout or setup custom keyboard
		if (o.layout === 'custom' || !$.keyboard.layouts.hasOwnProperty(o.layout)) {
			o.layout = 'custom';
			$.keyboard.layouts.custom = o.customLayout || { 'default' : ['{cancel}'] };
		}

		// Main keyboard building loop
		$.each($.keyboard.layouts[o.layout], function(set, keySet){
			if (set !== "") {
				sets++;
				newSet = $('<div />')
					.attr('name', set) // added for typing extension
					.addClass('ui-keyboard-keyset ui-keyboard-keyset-' + set)
					.appendTo(container)[(set === 'default') ? 'show' : 'hide']();

				for ( row = 0; row < keySet.length; row++ ){

					// remove extra spaces before spliting (regex probably could be improved)
					currentSet = $.trim(keySet[row]).replace(/\{(\.?)[\s+]?:[\s+]?(\.?)\}/g,'{$1:$2}');
					keys = currentSet.split(/\s+/);

					for ( key = 0; key < keys.length; key++ ) {
						// used by addKey function
						base.temp = [ newSet, row, key ];
						isAction = false;

						// ignore empty keys
						if (keys[key].length === 0) { continue; }

						// process here if it's an action key
						if( /^\{\S+\}$/.test(keys[key])){
							action = keys[key].match(/^\{(\S+)\}$/)[1].toLowerCase();
							// add active class if there are double exclamation points in the name
							if (/\!\!/.test(action)) {
								action = action.replace('!!','');
								isAction = true;
							}

							// add empty space
							if (/^sp:((\d+)?([\.|,]\d+)?)(em|px)?$/.test(action)) {
								// not perfect globalization, but allows you to use {sp:1,1em}, {sp:1.2em} or {sp:15px}
								margin = parseFloat( action.replace(/,/,'.').match(/^sp:((\d+)?([\.|,]\d+)?)(em|px)?$/)[1] || 0 );
								$('<span>&nbsp;</span>')
									// previously {sp:1} would add 1em margin to each side of a 0 width span
									// now Firefox doesn't seem to render 0px dimensions, so now we set the 
									// 1em margin x 2 for the width
									.width( (action.match('px') ? margin + 'px' : (margin * 2) + 'em') )
									.addClass('ui-keyboard-button ui-keyboard-spacer')
									.appendTo(newSet);
							}

							// meta keys
							if (/^meta\d+\:?(\w+)?/.test(action)){
								base.addKey(action, action);
								continue;
							}

							// switch needed for action keys with multiple names/shortcuts or
							// default will catch all others
							switch(action){

								case 'a':
								case 'accept':
									base
										.addKey('accept', action)
										.addClass(o.css.buttonAction);
									break;

								case 'alt':
								case 'altgr':
									base.addKey('alt', 'alt');
									break;

								case 'b':
								case 'bksp':
									base.addKey('bksp', action);
									break;

								case 'c':
								case 'cancel':
									base
										.addKey('cancel', action)
										.addClass(o.css.buttonAction);
									break;

								// toggle combo/diacritic key
								case 'combo':
									base
										.addKey('combo', 'combo')
										.addClass(o.css.buttonAction);
									break;

								// Decimal - unique decimal point (num pad layout)
								case 'dec':
									base.acceptedKeys.push((base.decimal) ? '.' : ',');
									base.addKey('dec', 'dec');
									break;

								case 'e':
								case 'enter':
									base
										.addKey('enter', action)
										.addClass(o.css.buttonAction);
									break;

								case 'empty':
									base
										.addKey('', ' ')
										.addClass(o.css.buttonDisabled)
										.attr('aria-disabled', true);
									break;

								case 's':
								case 'shift':
									base.addKey('shift', action);
									break;

								// Change sign (for num pad layout)
								case 'sign':
									base.acceptedKeys.push('-');
									base.addKey('sign', 'sign');
									break;

								case 'space':
									base.acceptedKeys.push(' ');
									base.addKey('space', 'space');
									break;

								case 't':
								case 'tab':
									base.addKey('tab', action);
									break;

								default:
									if ($.keyboard.keyaction.hasOwnProperty(action)){
										// base.acceptedKeys.push(action);
										base.addKey(action, action)[isAction ? 'addClass' : 'removeClass'](o.css.buttonAction);
									}

							}

						} else {

							// regular button (not an action key)
							base.acceptedKeys.push(keys[key].split(':')[0]);
							base.addKey(keys[key], keys[key], true);
						}
					}
					newSet.find('.ui-keyboard-button:last').after('<br class="ui-keyboard-button-endrow">');
				}
			}
		});
	
		if (sets > 1) { base.sets = true; }
		base.hasMappedKeys = !( $.isEmptyObject(base.mappedKeys) ); // $.isEmptyObject() requires jQuery 1.4+
		return container;
	};

	base.destroy = function() {
		$(document).unbind('mousedown.keyboard keyup.keyboard touchstart.keyboard');
		if (base.$keyboard) { base.$keyboard.remove(); }
		var unb = $.trim(o.openOn + ' accepted beforeClose canceled change contextmenu hidden initialized keydown keypress keyup visible').split(' ').join('.keyboard ');
		base.$el
			.removeClass('ui-keyboard-input ui-keyboard-lockedinput ui-keyboard-placeholder ui-keyboard-notallowed ui-keyboard-always-open ' + o.css.input)
			.removeAttr('aria-haspopup')
			.removeAttr('role')
			.unbind( unb + '.keyboard')
			.removeData('keyboard');
	};

		// Run initializer
		base.init();
	};

	// Action key function list
	$.keyboard.keyaction = {
		accept : function(base){
			base.close(true); // same as base.accept();
			return false;     // return false prevents further processing
		},
		alt : function(base,el){
			base.altActive = !base.altActive;
			base.showKeySet(el);
		},
		bksp : function(base){
			base.insertText('bksp'); // the script looks for the "bksp" string and initiates a backspace
		},
		cancel : function(base){
			base.close();
			return false; // return false prevents further processing
		},
		clear : function(base){
			base.$preview.val('');
		},
		combo : function(base){
			var c = !base.options.useCombos;
			base.options.useCombos = c;
			base.$keyboard.find('.ui-keyboard-combo')[(c) ? 'addClass' : 'removeClass'](base.options.css.buttonAction);
			if (c) { base.checkCombos(); }
			return false;
		},
		dec : function(base){
			base.insertText((base.decimal) ? '.' : ',');
		},
		"default" : function(base,el){
			base.shiftActive = base.altActive = base.metaActive = false;
			base.showKeySet(el);
		},
		// el is the pressed key (button) object; it is null when the real keyboard enter is pressed
		enter : function(base, el, e) {
			var tag = base.el.tagName, o = base.options;
			// shift-enter in textareas
			if (e.shiftKey) {
				// textarea & input - enterMod + shift + enter = accept, then go to prev; base.switchInput(goToNext, autoAccept)
				// textarea & input - shift + enter = accept (no navigation)
				return (o.enterNavigation) ? base.switchInput(!e[o.enterMod], true) : base.close(true);
			}
			// input only - enterMod + enter to navigate
			if (o.enterNavigation && (tag !== 'TEXTAREA' || e[o.enterMod])) {
				return base.switchInput(!e[o.enterMod], o.autoAccept ? 'true' : false);
			}
			// pressing virtual enter button inside of a textarea - add a carriage return
			// e.target is span when clicking on text and button at other times
			if (tag === 'TEXTAREA' && $(e.target).closest('button').length) {
				base.insertText(' \n'); // IE8 fix (space + \n) - fixes #71 thanks Blookie!
			}
		},
		// caps lock key
		lock : function(base,el){
			base.lastKeyset[0] = base.shiftActive = base.capsLock = !base.capsLock;
			base.showKeySet(el);
		},
		meta : function(base,el){
			base.metaActive = ($(el).hasClass(base.options.css.buttonAction)) ? false : true;
			base.showKeySet(el);
		},
		next : function(base) {
			base.switchInput(true, base.options.autoAccept);
			return false;
		},
		prev : function(base) {
			base.switchInput(false, base.options.autoAccept);
			return false;
		},
		shift : function(base,el){
			base.lastKeyset[0] = base.shiftActive = !base.shiftActive;
			base.showKeySet(el);
		},
		sign : function(base){
			if(/^\-?\d*\.?\d*$/.test( base.$preview.val() )) {
				base.$preview.val( (base.$preview.val() * -1) );
			}
		},
		space : function(base){
			base.insertText(' ');
		},
		tab : function(base) {
			var tag = base.el.tagName,
				o = base.options;
			if (tag === 'INPUT') {
				if (o.tabNavigation) {
					return base.switchInput(!base.shiftActive, true);
				} else {
					// ignore tab key in input
					return false;
				}
			}
			base.insertText('\t');
		}
	};

	// Default keyboard layouts
	$.keyboard.layouts = {
		'alpha' : {
			'default': [
				'` 1 2 3 4 5 6 7 8 9 0 - = {bksp}',
				'{tab} a b c d e f g h i j [ ] \\',
				'k l m n o p q r s ; \' {enter}',
				'{shift} t u v w x y z , . / {shift}',
				'{accept} {space} {cancel}'
			],
			'shift': [
				'~ ! @ # $ % ^ & * ( ) _ + {bksp}',
				'{tab} A B C D E F G H I J { } |',
				'K L M N O P Q R S : " {enter}',
				'{shift} T U V W X Y Z < > ? {shift}',
				'{accept} {space} {cancel}'
			]
		},
		'qwerty' : {
			'default': [
				'` 1 2 3 4 5 6 7 8 9 0 - = {bksp}',
				'{tab} q w e r t y u i o p [ ] \\',
				'a s d f g h j k l ; \' {enter}',
				'{shift} z x c v b n m , . / {shift}',
				'{accept} {space} {cancel}'
			],
			'shift': [
				'~ ! @ # $ % ^ & * ( ) _ + {bksp}',
				'{tab} Q W E R T Y U I O P { } |',
				'A S D F G H J K L : " {enter}',
				'{shift} Z X C V B N M < > ? {shift}',
				'{accept} {space} {cancel}'
			]
		},
		'international' : {
			'default': [
				'` 1 2 3 4 5 6 7 8 9 0 - = {bksp}',
				'{tab} q w e r t y u i o p [ ] \\',
				'a s d f g h j k l ; \' {enter}',
				'{shift} z x c v b n m , . / {shift}',
				'{accept} {alt} {space} {alt} {cancel}'
			],
			'shift': [
				'~ ! @ # $ % ^ & * ( ) _ + {bksp}',
				'{tab} Q W E R T Y U I O P { } |',
				'A S D F G H J K L : " {enter}',
				'{shift} Z X C V B N M < > ? {shift}',
				'{accept} {alt} {space} {alt} {cancel}'
			],
			'alt': [
				'~ \u00a1 \u00b2 \u00b3 \u00a4 \u20ac \u00bc \u00bd \u00be \u2018 \u2019 \u00a5 \u00d7 {bksp}',
				'{tab} \u00e4 \u00e5 \u00e9 \u00ae \u00fe \u00fc \u00fa \u00ed \u00f3 \u00f6 \u00ab \u00bb \u00ac',
				'\u00e1 \u00df \u00f0 f g h j k \u00f8 \u00b6 \u00b4 {enter}',
				'{shift} \u00e6 x \u00a9 v b \u00f1 \u00b5 \u00e7 > \u00bf {shift}',
				'{accept} {alt} {space} {alt} {cancel}'
			],
			'alt-shift': [
				'~ \u00b9 \u00b2 \u00b3 \u00a3 \u20ac \u00bc \u00bd \u00be \u2018 \u2019 \u00a5 \u00f7 {bksp}',
				'{tab} \u00c4 \u00c5 \u00c9 \u00ae \u00de \u00dc \u00da \u00cd \u00d3 \u00d6 \u00ab \u00bb \u00a6',
				'\u00c4 \u00a7 \u00d0 F G H J K \u00d8 \u00b0 \u00a8 {enter}',
				'{shift} \u00c6 X \u00a2 V B \u00d1 \u00b5 \u00c7 . \u00bf {shift}',
				'{accept} {alt} {space} {alt} {cancel}'
			]
		},
		'dvorak' : {
			'default': [
				'` 1 2 3 4 5 6 7 8 9 0 [ ] {bksp}',
				'{tab} \' , . p y f g c r l / = \\',
				'a o e u i d h t n s - {enter}',
				'{shift} ; q j k x b m w v z {shift}',
				'{accept} {space} {cancel}'
			],
			'shift' : [
				'~ ! @ # $ % ^ & * ( ) { } {bksp}',
				'{tab} " < > P Y F G C R L ? + |', 
				'A O E U I D H T N S _ {enter}',
				'{shift} : Q J K X B M W V Z {shift}',
				'{accept} {space} {cancel}'
			]
		},
		'num' : {
			'default' : [
				'= ( ) {b}',
				'{clear} / * -',
				'7 8 9 +',
				'4 5 6 {sign}',
				'1 2 3 %',
				'0 . {a} {c}'
			]
		}
	};

	$.keyboard.defaultOptions = {

		// *** choose layout & positioning ***
		layout       : 'qwerty',
		customLayout : null,

		position     : {
			of : null, // optional - null (attach to input/textarea) or a jQuery object (attach elsewhere)
			my : 'center top',
			at : 'center top',
			at2: 'center bottom' // used when "usePreview" is false (centers the keyboard at the bottom of the input/textarea)
		},

		// preview added above keyboard if true, original input/textarea used if false
		usePreview   : true,

		// if true, the keyboard will always be visible
		alwaysOpen   : false,

		// give the preview initial focus when the keyboard becomes visible
		initialFocus : true,

		// if true, keyboard will remain open even if the input loses focus, but closes on escape or when another keyboard opens.
		stayOpen     : false,

		// *** change keyboard language & look ***
		display : {
			'a'      : '\u2714:Accept (Shift-Enter)', // check mark - same action as accept
			'accept' : 'Accept:Accept (Shift-Enter)',
			'alt'    : 'Alt:\u2325 AltGr',        // other alternatives \u2311 
			'b'      : '\u232b:Backspace',    // Left arrow (same as &larr;)
			'bksp'   : 'Bksp:Backspace',
			'c'      : '\u2716:Cancel (Esc)', // big X, close - same action as cancel
			'cancel' : 'Cancel:Cancel (Esc)',
			'clear'  : 'C:Clear',             // clear num pad
			'combo'  : '\u00f6:Toggle Combo Keys',
			'dec'    : '.:Decimal',           // decimal point for num pad (optional), change '.' to ',' for European format
			'e'      : '\u23ce:Enter',        // down, then left arrow - enter symbol
			'empty'  : '\u00a0',
			'enter'  : 'Enter:Enter \u23ce',
			'lock'   : 'Lock:\u21ea Caps Lock', // caps lock
			'next'   : 'Next \u21e8',
			'prev'   : '\u21e6 Prev',
			's'      : '\u21e7:Shift',        // thick hollow up arrow
			'shift'  : 'Shift:Shift',
			'sign'   : '\u00b1:Change Sign',  // +/- sign for num pad
			'space'  : '&nbsp;:Space',
			't'      : '\u21e5:Tab',          // right arrow to bar (used since this virtual keyboard works with one directional tabs)
			'tab'    : '\u21e5 Tab:Tab'       // \u21b9 is the true tab symbol (left & right arrows)
		},

		// Message added to the key title while hovering, if the mousewheel plugin exists
		wheelMessage : 'Use mousewheel to see other keys',

		css : {
			input          : 'ui-widget-content ui-corner-all', // input & preview
			container      : 'ui-widget-content ui-widget ui-corner-all ui-helper-clearfix', // keyboard container
			buttonDefault  : 'ui-state-default ui-corner-all', // default state
			buttonHover    : 'ui-state-hover',  // hovered button
			buttonAction   : 'ui-state-active', // Action keys (e.g. Accept, Cancel, Tab, etc); this replaces "actionClass" option
			buttonDisabled : 'ui-state-disabled' // used when disabling the decimal button {dec} when a decimal exists in the input area
		},

		// *** Useability ***
		// Auto-accept content when clicking outside the keyboard (popup will close)
		autoAccept   : false,

		// Prevents direct input in the preview window when true
		lockInput    : false,

		// Prevent keys not in the displayed keyboard from being typed in
		restrictInput: false,

		// Check input against validate function, if valid the accept button gets a class name of "ui-keyboard-valid-input"
		// if invalid, the accept button gets a class name of "ui-keyboard-invalid-input"
		acceptValid  : false,

		// if acceptValid is true & the validate function returns a false, this option will cancel a keyboard
		// close only after the accept button is pressed
		cancelClose  : true,

		// tab to go to next, shift-tab for previous (default behavior)
		tabNavigation: false,

		// enter for next input; shift-enter accepts content & goes to next
		// shift + "enterMod" + enter ("enterMod" is the alt as set below) will accept content and go to previous in a textarea
		enterNavigation : false,
		// mod key options: 'ctrlKey', 'shiftKey', 'altKey', 'metaKey' (MAC only)
		enterMod : 'altKey', // alt-enter to go to previous; shift-alt-enter to accept & go to previous

		// if true, the next button will stop on the last keyboard input/textarea; prev button stops at first
		// if false, the next button will wrap to target the first input/textarea; prev will go to the last
		stopAtEnd : true,

		// Set this to append the keyboard immediately after the input/textarea it is attached to. This option
		// works best when the input container doesn't have a set width and when the "tabNavigation" option is true
		appendLocally: false,

		// If false, the shift key will remain active until the next key is (mouse) clicked on; if true it will stay active until pressed again
		stickyShift  : true,

		// Prevent pasting content into the area
		preventPaste : false,

		// caret places at the end of any text
		caretToEnd   : false,

		// Set the max number of characters allowed in the input, setting it to false disables this option
		maxLength    : false,

		// Mouse repeat delay - when clicking/touching a virtual keyboard key, after this delay the key will start repeating
		repeatDelay  : 500,

		// Mouse repeat rate - after the repeatDelay, this is the rate (characters per second) at which the key is repeated
		// Added to simulate holding down a real keyboard key and having it repeat. I haven't calculated the upper limit of
		// this rate, but it is limited to how fast the javascript can process the keys. And for me, in Firefox, it's around 20.
		repeatRate   : 20,

		// resets the keyboard to the default keyset when visible
		resetDefault : false,

		// Event (namespaced) on the input to reveal the keyboard. To disable it, just set it to ''.
		openOn       : 'focus',

		// Event (namepaced) for when the character is added to the input (clicking on the keyboard)
		keyBinding   : 'mousedown touchstart',

		// combos (emulate dead keys : http://en.wikipedia.org/wiki/Keyboard_layout#US-International)
		// if user inputs `a the script converts it to à, ^o becomes ô, etc.
		useCombos : true,
		combos    : {
			'`' : { a:"\u00e0", A:"\u00c0", e:"\u00e8", E:"\u00c8", i:"\u00ec", I:"\u00cc", o:"\u00f2", O:"\u00d2", u:"\u00f9", U:"\u00d9", y:"\u1ef3", Y:"\u1ef2" }, // grave
			"'" : { a:"\u00e1", A:"\u00c1", e:"\u00e9", E:"\u00c9", i:"\u00ed", I:"\u00cd", o:"\u00f3", O:"\u00d3", u:"\u00fa", U:"\u00da", y:"\u00fd", Y:"\u00dd" }, // acute & cedilla
			'"' : { a:"\u00e4", A:"\u00c4", e:"\u00eb", E:"\u00cb", i:"\u00ef", I:"\u00cf", o:"\u00f6", O:"\u00d6", u:"\u00fc", U:"\u00dc", y:"\u00ff", Y:"\u0178" }, // umlaut/trema
			'^' : { a:"\u00e2", A:"\u00c2", e:"\u00ea", E:"\u00ca", i:"\u00ee", I:"\u00ce", o:"\u00f4", O:"\u00d4", u:"\u00fb", U:"\u00db", y:"\u0177", Y:"\u0176" }, // circumflex
			'~' : { a:"\u00e3", A:"\u00c3", e:"\u1ebd", E:"\u1ebc", i:"\u0129", I:"\u0128", o:"\u00f5", O:"\u00d5", u:"\u0169", U:"\u0168", y:"\u1ef9", Y:"\u1ef8", n:"\u00f1", N:"\u00d1" } // tilde
		},

/*
		// *** Methods ***
		// commenting these out to reduce the size of the minified version
		// Callbacks - attach a function to any of these callbacks as desired
		initialized : function(e, keyboard, el) {},
		visible     : function(e, keyboard, el) {},
		change      : function(e, keyboard, el) {},
		beforeClose : function(e, keyboard, el, accepted) {},
		accepted    : function(e, keyboard, el) {},
		canceled    : function(e, keyboard, el) {},
		hidden      : function(e, keyboard, el) {},
		switchInput : null, // called instead of base.switchInput
*/

		// this callback is called just before the "beforeClose" to check the value
		// if the value is valid, return true and the keyboard will continue as it should (close if not always open, etc)
		// if the value is not value, return false and the clear the keyboard value ( like this "keyboard.$preview.val('');" ), if desired
		// The validate function is called after each input, the "isClosing" value will be false; when the accept button is clicked, "isClosing" is true
		validate    : function(keyboard, value, isClosing) { return true; }

	};

	// for checking combos
	$.keyboard.comboRegex = /([`\'~\^\"ao])([a-z])/mig;

	// store current keyboard element; used by base.isCurrent()
	$.keyboard.currentKeyboard = '';

	$.fn.keyboard = function(options){
		return this.each(function(){
			if (!$(this).data('keyboard')) {
				(new $.keyboard(this, options));
			}
		});
	};

	$.fn.getkeyboard = function(){
		return this.data("keyboard");
	};

})(jQuery);

/* Copyright (c) 2010 C. F., Wong (<a href="http://cloudgen.w0ng.hk">Cloudgen Examplet Store</a>)
 * Licensed under the MIT License:
 * http://www.opensource.org/licenses/mit-license.php
 * Highly modified from the original
 */
(function($, len, createRange, duplicate){
"use strict";
$.fn.caret = function(options,opt2) {
	if ( typeof this[0] === 'undefined' || this.is(':hidden') || this.css('visibility') === 'hidden' ) { return this; }
	var n, s, start, e, end, selRange, range, stored_range, te, val,
		selection = document.selection, t = this[0], sTop = t.scrollTop,
		ss = typeof t.selectionStart !== 'undefined';
	if (typeof options === 'number' && typeof opt2 === 'number') {
		start = options;
		end = opt2;
	}
	if (typeof start !== 'undefined') {
		if (ss){
			t.selectionStart=start;
			t.selectionEnd=end;
		} else {
			selRange = t.createTextRange();
			selRange.collapse(true);
			selRange.moveStart('character', start);
			selRange.moveEnd('character', end-start);
			selRange.select();
		}
		// must be visible or IE8 crashes; IE9 in compatibility mode works fine - issue #56
		if (this.is(':visible') || this.css('visibility') !== 'hidden') { this.focus(); }
		t.scrollTop = sTop;
		return this;
	} else {
		if (ss) {
			s = t.selectionStart;
			e = t.selectionEnd;
		} else {
			if (t.tagName === 'TEXTAREA') {
				val = this.val();
				range = selection[createRange]();
				stored_range = range[duplicate]();
				stored_range.moveToElementText(t);
				stored_range.setEndPoint('EndToEnd', range);
				// thanks to the awesome comments in the rangy plugin
				s = stored_range.text.replace(/\r/g, '\n')[len];
				e = s + range.text.replace(/\r/g, '\n')[len];
			} else {
				val = this.val().replace(/\r/g, '\n');
				range = selection[createRange]()[duplicate]();
				range.moveEnd('character', val[len]);
				s = (range.text === '' ? val[len] : val.lastIndexOf(range.text));
				range = selection[createRange]()[duplicate]();
				range.moveStart('character', -val[len]);
				e = range.text[len];
			}
		}
		te = (t.value || '').substring(s,e);
		return { start : s, end : e, text : te, replace : function(st){
			return t.value.substring(0,s) + st + t.value.substring(e, t.value[len]);
		}};
	}
};
})(jQuery, 'length', 'createRange', 'duplicate');

var prev_caret_position=-1;(function($){function getRetypeStyledHtml(options){var construct="";construct=construct+('<div class="retype-container">');construct=construct+('<div class="retype-div">');construct=construct+('<div class="retype-textarea">');construct=construct+('<textarea id="'+options.id+'" rows="10" cols="50" scrolltop="scrollHeight"></textarea>');construct=construct+('</div>');construct=construct+('<div class="retype-options">');for(var i=0;i<options.language.length;i++){var languageId='retype-language-'+options.language[i].name;var languageName=options.language[i].name;var languageDisplayName=languageName;if(options.language[i].displayName){languageDisplayName=options.language[i].displayName;}
construct=construct+('<li class="retype-option">');construct=construct+('<a href="#'+languageName+'" id="'+languageId+'">'+languageDisplayName+'</a>');construct=construct+('</li>');}
construct=construct+('<li class="retype-option-keyboard"><a href="#">Keyboard</a></li>');construct=construct+('</div><!-- options -->');construct=construct+('<div class="retype-help"></div>');construct=construct+('</div><!-- div --></div><!-- container -->');return construct;}
$.fn.retypeStyled=function(mode,options){mode=mode||'on';return this.each(function(){$this=$(this);var number_of_retype_containers_in_dom=$(".retype-container").size();var unique_id="retype-container-no-"+number_of_retype_containers_in_dom;var construct=getRetypeStyledHtml(options);$this.append(construct);$(this).children(".retype-container").attr('id',unique_id);$("#"+unique_id+" .retype-option").each(function(intIndex){$(this).bind("click",function(e){$("#"+unique_id+" *").removeClass("retype-option-selected");$("#"+unique_id+" #retype-language-"+options.language[intIndex].name).addClass("retype-option-selected");$("#"+options.id).retype("off");$("#"+options.id).retype("on",options.language[intIndex]);$("#"+unique_id+" .retype-help").hide();if(options.language[intIndex].help){$("#"+unique_id+" .retype-help").html("<p>"+options.language[intIndex].help+"</p>");}
if(options.language[intIndex].help_url){$("#"+unique_id+" .retype-help").load(options.language[intIndex].help_url);}
$("#"+unique_id+" .retype-help").fadeIn("fast");$("#"+options.id).focus();});});$("#retype-language-"+options.language[0].name).addClass("retype-option-selected");$("#"+options.id).retype("off");$("#"+options.id).retype("on",options.language[0]);if(options.language[0].help){$("#"+unique_id+" .retype-help").html("<p>"+options.language[0].help+"</p>");}
if(options.language[0].help_url){$("#"+unique_id+" .retype-help").load(options.language[0].help_url);}
$("#"+options.id).focus();});};$.fn.retype=function(mode,options){mode=mode||'on';options=$.extend({},$.fn.retype.options,options);if(options.mapping_url){$.get(options.mapping_url,function(data){eval("options.mapping = "+data);});}
return this.each(function(){$this=$(this);if(mode=="on"||mode=="enable"){$this.keydown(handle_echoid);$this.keydown(handle_escape);$this.keypress(handle_alpha);if(options.name!='Dvorak'){$this.keyup(handle_composite);}
$this.keydown(retype_debug).keypress(retype_debug);}else{$this.unbind("keydown");$this.unbind("keyup");$this.unbind("keypress");}
function retype_debug(e){$("#retype-debug").html("clientHeight: "+$("#"+options.id).attr("clientHeight")+"\n"+"scrollHeight: "+$("#"+options.id).attr("scrollHeight")+"\n"+"KeyCode: "+e.charCode+"\n"+"Alt: "+e.altKey+"\n"+"Meta: "+e.metaKey+"\n"+"Shift: "+e.shiftKey+"\n"+"Ctrl: "+e.ctrlKey+"\n");}
function handle_escape(e){if(e.keyCode==27){var scrollTop=this.scrollTop;var range=$(this).getSelection();var current=this.value;var prefix=current.substring(0,range.start);var suffix=current.substring(range.start,current.length);var caret_position=range.start;var the_new_current="";var replacement_length=1;if(e.shiftKey){if(options.mapping["shift-escape"]){replacement_length=options.mapping["shift-escape"].length;the_new_current=prefix+options.mapping["shift-escape"]+suffix;}else{return;}}else{if(options.mapping["escape"]){replacement_length=options.mapping["escape"].length;the_new_current=prefix+options.mapping["escape"]+suffix;}else{return;}}
this.value=the_new_current;this.setSelectionRange(caret_position+replacement_length,caret_position+replacement_length);this.scrollTop=scrollTop;return false;}}
function handle_composite(e){var scrollTop=this.scrollTop;var range=$(this).getSelection();var current=this.value;var prefix=current.substring(0,range.start);var suffix=current.substring(range.start,current.length);var caret_position=range.start;var the_new_current="";var last_typed=current.substring(range.start-1,range.start);if(last_typed=='\u00E4'||last_typed=='\u00F6'||last_typed=='\u00FC'||last_typed=='\u00C4'||last_typed=='\u00D6'||last_typed=='\u00DC'||last_typed=='<'||last_typed=='>'){prefix=current.substring(0,range.start-1);if(options.mapping[last_typed]){var replacement_length=options.mapping[last_typed].length;var the_new_current=prefix+options.mapping[last_typed]+suffix;this.value=the_new_current;this.setSelectionRange(caret_position+replacement_length,caret_position+replacement_length);this.scrollTop=scrollTop;return false;}else{return;}}
this.scrollTop=scrollTop;return false;}
function handle_echoid(e){var scrollTop=this.scrollTop;var range=$(this).getSelection();var current=this.value;var prefix=current.substring(0,range.start);var suffix=current.substring(range.start,current.length);var caret_position=range.start;if(e.altKey){var the_key_string=null;if(e.shiftKey){the_key_string="shift+alt+"+String.fromCharCode(e.keyCode);}else{the_key_string="alt+"+String.fromCharCode(e.keyCode);}
if(options.mapping[the_key_string]){var the_new_current=prefix+options.mapping[the_key_string]+suffix;this.value=the_new_current;this.setSelectionRange(caret_position+1,caret_position+1);this.scrollTop=scrollTop;return false;}}}
function handle_alpha(e){var returnval=true;var caret_position;var scrollTop=this.scrollTop;if(!e.ctrlKey&&!e.altKey&&!e.metaKey){var range=$(this).getSelection();caret_position=range.start;var current=this.value;var the_key_string=String.fromCharCode(e.charCode);if(prev_caret_position+1==caret_position){var prevKey=current.substring(prev_caret_position,caret_position);if(options.mapping[prevKey+the_key_string]){the_key_string=prevKey+the_key_string;--caret_position;}}
if(options.mapping[the_key_string]){var range=$(this).getSelection();var current=this.value;var prefix=current.substring(0,caret_position);var suffix=current.substring(range.start,current.length);var replacement_length=options.mapping[the_key_string].length;var the_new_current=prefix+options.mapping[the_key_string]+suffix;this.value=the_new_current;if(caret_position==-1){caret_position+=1;}
this.setSelectionRange(caret_position+replacement_length,caret_position+replacement_length);returnval=false;}else{}
this.scrollTop=scrollTop;prev_caret_position=caret_position;return returnval;}}});};})(jQuery);// tipsy, facebook style tooltips for jquery
// version 1.0.0a
// (c) 2008-2010 jason frame [jason@onehackoranother.com]
// releated under the MIT license

(function($) {
    
    function fixTitle($ele) {
        if ($ele.attr('title') || typeof($ele.attr('original-title')) != 'string') {
            $ele.attr('original-title', $ele.attr('title') || '').removeAttr('title');
        }
    }
    
    function Tipsy(element, options) {
        this.$element = $(element);
        this.options = options;
        this.enabled = true;
        fixTitle(this.$element);
    }
    
    Tipsy.prototype = {
        show: function() {
            var title = this.getTitle();
            if (title && this.enabled) {
                var $tip = this.tip();
                
                $tip.find('.tipsy-inner')[this.options.html ? 'html' : 'text'](title);
                $tip[0].className = 'tipsy'; // reset classname in case of dynamic gravity
                $tip.remove().css({top: 0, left: 0, visibility: 'hidden', display: 'block'}).appendTo(document.body);
                
                var pos = $.extend({}, this.$element.offset(), {
                    width: this.$element[0].offsetWidth,
                    height: this.$element[0].offsetHeight
                });
                
                var actualWidth = $tip[0].offsetWidth, actualHeight = $tip[0].offsetHeight;
                var gravity = (typeof this.options.gravity == 'function')
                                ? this.options.gravity.call(this.$element[0])
                                : this.options.gravity;
                
                var tp;
                switch (gravity.charAt(0)) {
                    case 'n':
                        tp = {top: pos.top + pos.height + this.options.offset, left: pos.left + pos.width / 2 - actualWidth / 2};
                        break;
                    case 's':
                        tp = {top: pos.top - actualHeight - this.options.offset, left: pos.left + pos.width / 2 - actualWidth / 2};
                        break;
                    case 'e':
                        tp = {top: pos.top + pos.height / 2 - actualHeight / 2, left: pos.left - actualWidth - this.options.offset};
                        break;
                    case 'w':
                        tp = {top: pos.top + pos.height / 2 - actualHeight / 2, left: pos.left + pos.width + this.options.offset};
                        break;
                }
                
                if (gravity.length == 2) {
                    if (gravity.charAt(1) == 'w') {
                        tp.left = pos.left + pos.width / 2 - 15;
                    } else {
                        tp.left = pos.left + pos.width / 2 - actualWidth + 15;
                    }
                }
                
                $tip.css(tp).addClass('tipsy-' + gravity);
                
                if (this.options.fade) {
                    $tip.stop().css({opacity: 0, display: 'block', visibility: 'visible'}).animate({opacity: this.options.opacity});
                } else {
                    $tip.css({visibility: 'visible', opacity: this.options.opacity});
                }
            }
        },
        
        hide: function() {
            if (this.options.fade) {
                this.tip().stop().fadeOut(function() { $(this).remove(); });
            } else {
                this.tip().remove();
            }
        },
        
        getTitle: function() {
            var title, $e = this.$element, o = this.options;
            fixTitle($e);
            var title, o = this.options;
            if (typeof o.title == 'string') {
                title = $e.attr(o.title == 'title' ? 'original-title' : o.title);
            } else if (typeof o.title == 'function') {
                title = o.title.call($e[0]);
            }
            title = ('' + title).replace(/(^\s*|\s*$)/, "");
            return title || o.fallback;
        },
        
        tip: function() {
            if (!this.$tip) {
                this.$tip = $('<div class="tipsy"></div>').html('<div class="tipsy-arrow"></div><div class="tipsy-inner"/></div>');
            }
            return this.$tip;
        },
        
        validate: function() {
            if (!this.$element[0].parentNode) {
                this.hide();
                this.$element = null;
                this.options = null;
            }
        },
        
        enable: function() { this.enabled = true; },
        disable: function() { this.enabled = false; },
        toggleEnabled: function() { this.enabled = !this.enabled; }
    };
    
    $.fn.tipsy = function(options) {
        
        if (options === true) {
            return this.data('tipsy');
        } else if (typeof options == 'string') {
            return this.data('tipsy')[options]();
        }
        
        options = $.extend({}, $.fn.tipsy.defaults, options);
        
        function get(ele) {
            var tipsy = $.data(ele, 'tipsy');
            if (!tipsy) {
                tipsy = new Tipsy(ele, $.fn.tipsy.elementOptions(ele, options));
                $.data(ele, 'tipsy', tipsy);
            }
            return tipsy;
        }
        
        function enter() {
            var tipsy = get(this);
            tipsy.hoverState = 'in';
            if (options.delayIn == 0) {
                tipsy.show();
            } else {
                setTimeout(function() { if (tipsy.hoverState == 'in') tipsy.show(); }, options.delayIn);
            }
        };
        
        function leave() {
            var tipsy = get(this);
            tipsy.hoverState = 'out';
            if (options.delayOut == 0) {
                tipsy.hide();
            } else {
                setTimeout(function() { if (tipsy.hoverState == 'out') tipsy.hide(); }, options.delayOut);
            }
        };
        
        if (!options.live) this.each(function() { get(this); });
        
        if (options.trigger != 'manual') {
            var binder   = options.live ? 'live' : 'bind',
                eventIn  = options.trigger == 'hover' ? 'mouseenter' : 'focus',
                eventOut = options.trigger == 'hover' ? 'mouseleave' : 'blur';
            this[binder](eventIn, enter)[binder](eventOut, leave);
        }
        
        return this;
        
    };
    
    $.fn.tipsy.defaults = {
        delayIn: 0,
        delayOut: 0,
        fade: false,
        fallback: '',
        gravity: 'n',
        html: false,
        live: false,
        offset: 0,
        opacity: 0.8,
        title: 'title',
        trigger: 'hover'
    };
    
    // Overwrite this method to provide options on a per-element basis.
    // For example, you could store the gravity in a 'tipsy-gravity' attribute:
    // return $.extend({}, options, {gravity: $(ele).attr('tipsy-gravity') || 'n' });
    // (remember - do not modify 'options' in place!)
    $.fn.tipsy.elementOptions = function(ele, options) {
        return $.metadata ? $.extend({}, options, $(ele).metadata()) : options;
    };
    
    $.fn.tipsy.autoNS = function() {
        return $(this).offset().top > ($(document).scrollTop() + $(window).height() / 2) ? 's' : 'n';
    };
    
    $.fn.tipsy.autoWE = function() {
        return $(this).offset().left > ($(document).scrollLeft() + $(window).width() / 2) ? 'e' : 'w';
    };
    
})(jQuery);
// Generated code, do not edit
window.examples = [
  ["rho-iota","⍝  ⍳ n  generates a list of numbers from 0 to n-1\n⍝  n n ⍴ A  arranges the elements of A in an n×n matrix\n\n5 5 ⍴ ⍳ 25"],
  ["mult","⍝ Multiplication table\n⍝  a × b    scalar multiplication, \"a times b\"\n⍝  ∘.       is the \"outer product\" operator\n⍝  A ∘.× B  every item in A times every item in B\n(⍳ 10) ∘.× ⍳ 10"],
  ["sierpinski","⍝ Sierpinski's triangle\n\n⍝ It's a recursively defined figure.\n⍝ We will use the following definition:\n⍝\n⍝   * the Sierpinski triangle of rank 0 is a one-by-one matrix 'X'\n⍝\n⍝   * if S is the triangle of rank n, then rank n+1 would be\n⍝     the two-dimensional catenation:\n⍝             S 0\n⍝             S S\n⍝     where \"0\" is an all-blank matrix same size as S.\n\nf ← {(⍵,(⍴⍵)⍴0)⍪⍵,⍵}\nS ← {' #'[(f⍣⍵) 1 1 ⍴ 1]}\nS 5"],
  ["primes","⍝ Sieve of Eratosthenes\n(2=+⌿0=A∘.∣A)/A←⍳100"],
  ["life","⍝ Conway's game of life\n\n⍝ This example was inspired by the impressive demo at\n⍝ http://www.youtube.com/watch?v=a9xAKttWgP4\n\n⍝ Create a matrix:\n⍝     0 1 1\n⍝     1 1 0\n⍝     0 1 0\ncreature ← (3 3 ⍴ ⍳ 9) ∊ 1 2 3 4 7   ⍝ Original creature from demo\ncreature ← (3 3 ⍴ ⍳ 9) ∊ 1 3 6 7 8   ⍝ Glider\n\n⍝ Place the creature on a larger board, near the centre\nboard ← ¯1 ⊖ ¯2 ⌽ 5 7 ↑ creature\n\n⍝ A function to move from one generation to the next\nlife ← {∨/ 1 ⍵ ∧ 3 4 = ⊂+/ +⌿ 1 0 ¯1 ∘.⊖ 1 0 ¯1 ⌽¨ ⊂⍵}\n\n⍝ Compute n-th generation and format it as a\n⍝ character matrix\ngen ← {' #'[(life ⍣ ⍵) board]}\n\n⍝ Show first three generations\n(gen 1) (gen 2) (gen 3)"],
  ["langton","⍝ Langton's ant\n⍝\n⍝ It lives in an infinite boolean matrix and has a position and a direction\n⍝ (north, south, east, or west).  At every step the ant:\n⍝   * turns left or right depending on whether the occupied cell is true or false\n⍝   * inverts the value of the occupied cell\n⍝   * moves one cell forward\n⍝\n⍝ In this program, we use a finite matrix with torus topology, and we keep the\n⍝ ant in the centre, pointing upwards (north), rotating the whole matrix\n⍝ instead.\n\nm ← 5\nn ← 1+2×m\n\nA0 ← (-m) ⊖ (-m) ⌽ n n ↑ 1 1 ⍴ 1\nnext ← {0≠A0-¯1⊖⌽[⍵[m;m]]⍉⍵}\n\n' #'[(next⍣300) A0]"]
];(function() {
  var exec, format;

  exec = require('./compiler').exec;

  format = require('./vocabulary/format').format;

  jQuery(function($) {
    var a, code, execute, hSymbolDefs, hashParams, i, k, mapping, name, nameValue, rMapping, symbolDef, symbolDefs, tipsyOpts, v, value, _i, _j, _k, _l, _len, _len1, _len2, _ref, _ref1, _ref2, _ref3, _ref4;

    hashParams = {};
    if (location.hash) {
      _ref = location.hash.substring(1).split(',');
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        nameValue = _ref[_i];
        _ref1 = nameValue.split('='), name = _ref1[0], value = _ref1[1];
        hashParams[name] = unescape(value);
      }
    }
    $('#code').text(hashParams.code || '').focus();
    $('#permalink').tipsy({
      gravity: 'e',
      opacity: 1,
      delayIn: 1000
    }).bind('mouseover focus', function() {
      $(this).attr('href', '#code=' + escape($('#code').val()));
      return false;
    });
    execute = function() {
      var err, result;

      try {
        result = exec($('#code').val());
        $('#result').removeClass('error').text(format(result).join('\n'));
      } catch (_error) {
        err = _error;
        if (typeof console !== "undefined" && console !== null) {
          if (typeof console.error === "function") {
            console.error(err.stack);
          }
        }
        $('#result').addClass('error').text(err);
      }
    };
    $('#go').tipsy({
      gravity: 'e',
      opacity: 1,
      delayIn: 1000
    }).closest('form').submit(function() {
      execute();
      return false;
    });
    if (hashParams.run) {
      $('#go').click();
    }
    symbolDefs = [
      ['+', 'Conjugate, Add'], ['-', 'Negate, Subtract'], ['×', 'Sign of, Multiply'], ['÷', 'Reciprocal, Divide'], ['⌈', 'Ceiling, Greater of'], ['⌊', 'Floor, Lesser of'], ['∣', 'Absolute value, Residue'], ['⍳', 'Index generator, Index of'], ['?', 'Roll, Deal'], ['*', 'Exponential, To the power of'], ['⍟', 'Natural logarithm, Logarithm to the base'], ['○', 'Pi times, Circular and hyperbolic functions'], ['!', 'Factorial, Binomial'], ['⌹', 'Matrix inverse, Matrix divide'], ['<', 'Less than'], ['≤', 'Less than or equal'], ['=', 'Equal'], ['≥', 'Greater than or equal'], ['>', 'Greater than'], ['≠', 'Not equal'], ['≡', 'Depth, Match'], ['≢', 'Not match'], ['∊', 'Enlist, Membership'], ['⍷', 'Find'], ['∪', 'Unique, Union'], ['∩', 'Intersection'], ['~', 'Not, Without'], ['∨', 'Or (Greatest Common Divisor)'], ['∧', 'And (Least Common Multiple)'], ['⍱', 'Nor'], ['⍲', 'Nand'], ['⍴', 'Shape of, Reshape'], [',', 'Ravel, Catenate'], ['⍪', 'First axis catenate'], ['⌽', 'Reverse, Rotate'], ['⊖', 'First axis rotate'], ['⍉', 'Transpose'], ['↑', 'First, Take'], ['↓', 'Drop'], ['⊂', 'Enclose, Partition'], ['⊃', 'Disclose, Pick'], ['⌷', 'Index'], ['⍋', 'Grade up'], ['⍒', 'Grade down'], ['⊤', 'Encode'], ['⊥', 'Decode'], ['⍕', 'Format, Format by specification'], ['⍎', 'Execute'], ['⊣', 'Stop, Left'], ['⊢', 'Pass, Right'], ['⎕', 'Evaluated input, Output with a newline'], ['⍞', 'Character input, Bare output'], ['¨', 'Each'], [
        '∘.', 'Outer product', {
          keys: '`j.'
        }
      ], ['/', 'Reduce'], ['⌿', '1st axis reduce'], ['\\', 'Scan'], ['⍀', '1st axis scan'], ['⍣', 'Power operator'], ['⍨', 'Commute'], ['¯', 'Negative number sign'], ['⍝', 'Comment'], ['←', 'Assignment'], ['⍬', 'Zilde'], ['⋄', 'Statement separator'], ['⍺', 'Left formal parameter'], ['⍵', 'Right formal parameter']
    ];
    mapping = {};
    rMapping = {};
    a = '`< «   `= ×   `> »   `_ ≡   `- -   `, ⍪   `; ⋄   `: ÷   `! ⍣   `/ ⌿   `( ⍱\n`) ⍲   `[ ←   `\\ ⍀  `0 ∧   `1 ¨   `2 ¯   `4 ≤   `6 ≥   `8 ≠   `9 ∨   `a ⍺\n`A ⊖   `b ⊥   `B ⍎   `c ∩   `C ⍝   `d ⌊   `e ∊   `E ⍷   `g ∇   `G ⍒   `h ∆\n`H ⍋   `i ⍳   `I ⌷   `j ∘   `l ⎕   `L ⍞   `m ∣   `n ⊤   `N ⍕   `o ○   `O ⍬\n`p *   `P ⍟   `r ⍴   `s ⌈   `S ⍨   `t ~   `T ⍉   `u ↓   `v ∪   `w ⍵   `W ⌽\n`x ⊃   `y ↑   `z ⊂'.replace(/(^\s+|\s+$)/g, '').split(/\s+/);
    for (i = _j = 0, _ref2 = a.length / 2; 0 <= _ref2 ? _j < _ref2 : _j > _ref2; i = 0 <= _ref2 ? ++_j : --_j) {
      k = a[2 * i];
      v = a[2 * i + 1];
      mapping[k] = v;
      rMapping[v] = k;
    }
    hSymbolDefs = {};
    for (_k = 0, _len1 = symbolDefs.length; _k < _len1; _k++) {
      symbolDef = symbolDefs[_k];
      hSymbolDefs[symbolDef[0]] = symbolDef;
    }
    $('#code').keydown(function(event) {
      if (event.keyCode === 13 && event.ctrlKey) {
        $('#go').click();
        return false;
      }
    });
    $('#code').retype('on', {
      mapping: mapping
    });
    $('textarea').keyboard({
      layout: 'custom',
      useCombos: false,
      display: {
        bksp: 'Bksp',
        shift: '⇧',
        alt: 'Alt',
        enter: 'Enter',
        exec: '⍎'
      },
      autoAccept: true,
      usePreview: false,
      customLayout: {
        "default": ['1 2 3 4 5 6 7 8 9 0 - =', 'q w e r t y u i o p [ ]', 'a s d f g h j k l {enter}', '{shift} z x c v b n m , . {bksp}', '{alt} {space} {exec!!}'],
        shift: ['! @ # $ % ^ & * ( ) _ +', 'Q W E R T Y U I O P { }', 'A S D F G H J K L {enter}', '{shift} Z X C V B N M < > {bksp}', '{alt} {space} {exec!!}'],
        alt: ['¨ ¯ < ≤ = ≥ > ≠ ∨ ∧ - ×', '{empty} ⍵ ∊ ⍴ ~ ↑ ↓ ⍳ ○ * ← {empty}', '⍺ ⌈ ⌊ {empty} ∇ ∆ ∘ {empty} ⎕ {enter}', '{shift} ⊂ ⊃ ∩ ∪ ⊥ ⊤ ∣ ⍪ ÷ {bksp}', '{alt} {space} {exec!!}'],
        'alt-shift': ['⍣ {empty} {empty} {empty} {empty} {empty} {empty} {empty} ⍱ ⍲ ≡ {empty}', '{empty} ⌽ ⍷ {empty} ⍉ {empty} {empty} ⌷ ⍬ ⍟ {empty} {empty}', '⊖ ⍨ {empty} {empty} ⍒ ⍋ {empty} {empty} ⍞ {enter}', '{shift} {empty} {empty} ⍝ {empty} ⍎ ⍕ {empty} « » {bksp}', '{alt} {space} {exec!!}']
      }
    });
    $.keyboard.keyaction.exec = execute;
    $('textarea').focus();
    tipsyOpts = {
      title: function() {
        return (hSymbolDefs[$(this).text()] || {})[1] || '';
      },
      gravity: 's',
      delayIn: 1000,
      opacity: 1
    };
    $('.ui-keyboard').on('mouseover', '.ui-keyboard-button', function(event) {
      var $b;

      $b = $(event.target).closest('.ui-keyboard-button');
      if (!$b.data('tipsyInitialised')) {
        $b.data('tipsyInitialised', true).tipsy(tipsyOpts).tipsy('show');
      }
      return false;
    });
    _ref3 = window.examples;
    for (i = _l = 0, _len2 = _ref3.length; _l < _len2; i = ++_l) {
      _ref4 = _ref3[i], name = _ref4[0], code = _ref4[1];
      $('#examples').append(" <a href='#example" + i + "'>" + name + "</a>");
    }
    $('#examples').on('click', 'a', function() {
      var _ref5;

      _ref5 = window.examples[parseInt($(this).attr('href').replace(/#example(\d+)$/, '$1'))], name = _ref5[0], code = _ref5[1];
      $('#code').val(code).focus();
      return false;
    });
    return {};
  });

}).call(this);
