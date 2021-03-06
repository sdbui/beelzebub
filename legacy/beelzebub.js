'use strict';

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var _ = require('lodash');
var co = require('co');
var manifest = require('../package.json');

var BzTasks = require('./bzTasks.js');
var util = require('./util.js');

/**
 * ========================================================
 * Beelzebub Class
 * ========================================================
 */

var Beelzebub = function () {
  function Beelzebub(config) {
    (0, _classCallCheck3.default)(this, Beelzebub);

    this.version = manifest.version;
    this.reset();
    this.init(config);

    // add Tasks to Beelzebub
    this.Tasks = BzTasks;
  }

  (0, _createClass3.default)(Beelzebub, [{
    key: 'init',
    value: function init() {
      var config = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : util.DefaultConfig;

      util.processConfig(config, util.DefaultConfig, this);

      this._config.beelzebub = this; // don't like this, but needed for BzTasks
      this._rootTasks = new BzTasks(this._config);
      this._rootTasks.$useAsRoot();
    }
  }, {
    key: 'reset',
    value: function reset() {
      // logger util
      // TODO: move this to util
      this.logger = console;
      // verbose logger
      // TODO: move over to stumpy
      this.vLogger = {
        log: function log() {},
        info: function info() {}
      };

      this._config = _.cloneDeep(util.DefaultConfig);
      this._rootTasks = null;

      this._initFunctionList = [];
      this._initDone = false;
    }
  }, {
    key: 'getConfig',
    value: function getConfig() {
      return this._config;
    }
  }, {
    key: 'setGlobalVars',
    value: function setGlobalVars(vars) {
      this._globalVars = vars;
    }
  }, {
    key: 'getGlobalVars',
    value: function getGlobalVars() {
      return this._globalVars;
    }
  }, {
    key: 'isLoading',
    value: function isLoading() {
      return !this._initDone;
    }
  }, {
    key: 'addInitFunction',
    value: function addInitFunction(func) {
      this._initFunctionList.push(func);
    }
  }, {
    key: 'getInitPromise',
    value: function getInitPromise() {
      var func = co.wrap(_regenerator2.default.mark(function _callee() {
        var results, i, result;
        return _regenerator2.default.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                results = [];
                i = 0;

              case 2:
                if (!(i < this._initFunctionList.length)) {
                  _context.next = 10;
                  break;
                }

                _context.next = 5;
                return this._initFunctionList[i]();

              case 5:
                result = _context.sent;

                results.push(result);

              case 7:
                i++;
                _context.next = 2;
                break;

              case 10:

                // this.vLogger.log('runTask initFunctionList done results:', results);
                this._initDone = true;

                return _context.abrupt('return', results);

              case 12:
              case 'end':
                return _context.stop();
            }
          }
        }, _callee, this);
      }).bind(this));

      return func();
    }
  }, {
    key: 'getRunning',
    value: function getRunning() {
      return this._rootTasks.$getRunning();
    }
  }, {
    key: 'getVarDefsForTaskName',
    value: function getVarDefsForTaskName(taskName) {
      return this._rootTasks.$getVarDefsForTaskName(taskName);
    }
  }, {
    key: 'add',
    value: function add(Tasks, config) {
      var tasks = null;

      if (_.isString(Tasks)) {
        try {
          // TODO: yanpm install this?
          Tasks = require(Tasks);
        } catch (err) {
          this.logger.error('Add Task Error:', err);
          return;
        }
      }

      if (_.isFunction(Tasks) && _.isObject(Tasks)) {
        config = _.merge(this._config, config || {});
        config.beelzebub = this;

        tasks = new Tasks(config || this._config);

        if (!util.isBaseTask(tasks)) {
          this.logger.error('Add Task Error: Invalid Class/prototype needs to be of type "Beelzebub.BzTasks" -', tasks);
          return;
        }
      } else if (_.isObject(Tasks) && util.isBaseTask(Tasks)) {
        tasks = Tasks;
      } else {
        this.logger.error('Add Task Error: Unknown Task type -', tasks);
        return;
      }

      if (tasks.$isRoot()) {
        // transfer all the current subTasks from old _rootTasks to current

        tasks.$setSubTask(this._rootTasks.$getSubTask());
        this._rootTasks = tasks;

        return tasks.$register().then(function (results) {
          // this.vLogger.log('task register done:', results);
        });
      } else {
        // this.vLogger.log('rootTask addSubTasks');
        this._rootTasks.$addSubTasks(tasks, config);
      }

      // this.vLogger.log( 'all tasks:', _.keys(this._rootTasks) );
    }

    /**
     * Runs task(s) - multi args run in sequence, arrays are run in parallel
     * @param task(s) (function or string)
     * @returns {Promise}
     */

  }, {
    key: 'run',
    value: function run(parent) {
      for (var _len = arguments.length, args = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
        args[_key - 1] = arguments[_key];
      }

      args.unshift(parent);
      // use internal function, because $run bounces back to root level
      return this._rootTasks._run.apply(this._rootTasks, args);
    }
  }, {
    key: 'sequence',
    value: function sequence(parent) {
      for (var _len2 = arguments.length, args = Array(_len2 > 1 ? _len2 - 1 : 0), _key2 = 1; _key2 < _len2; _key2++) {
        args[_key2 - 1] = arguments[_key2];
      }

      args.unshift(parent);
      // use internal function, because $sequence bounces back to root level
      return this._rootTasks._sequence.apply(this._rootTasks, args);
    }
  }, {
    key: 'parallel',
    value: function parallel(parent) {
      for (var _len3 = arguments.length, args = Array(_len3 > 1 ? _len3 - 1 : 0), _key3 = 1; _key3 < _len3; _key3++) {
        args[_key3 - 1] = arguments[_key3];
      }

      args.unshift(parent);
      // use internal function, because $parallel bounces back to root level
      return this._rootTasks._parallel.apply(this._rootTasks, args);
    }
  }, {
    key: 'printHelp',
    value: function printHelp() {
      this.drawBox('Help Docs', 80);
      this._rootTasks.$printHelp();
    }
  }, {
    key: 'drawBox',
    value: function drawBox(title) {
      var width = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 60;

      var sides = {
        'top': '─',
        'top-mid': '┬',
        'top-left': '┌',
        'top-right': '┐',
        'bottom': '─',
        'bottom-mid': '┴',
        'bottom-left': '└',
        'bottom-right': '┘',
        'left': '│',
        'left-mid': '├',
        'mid': '─',
        'mid-mid': '┼',
        'right': '│',
        'right-mid': '┤',
        'middle': '│'
      };

      var spaceLen = width - title.length - 5;
      this.logger.log(sides['top-left'] + sides['top'].repeat(width - 2) + sides['top-right']);
      this.logger.log(sides['left'], title, ' '.repeat(spaceLen), sides['right']);
      this.logger.log(sides['bottom-left'] + sides['bottom'].repeat(width - 2) + sides['bottom-right']);
    }
  }]);
  return Beelzebub;
}();

module.exports = Beelzebub;