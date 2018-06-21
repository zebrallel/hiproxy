#!/usr/bin/env node

require('colors');
var path = require('path');
var homedir = require('os-homedir'); // 这个包可以用来获取不同平台下的home目录，比如mac下就是 /user/${username}
var hiproxy = require('../src/index');

var Args = require('hemsl'); // 根据命令行参数执行对应命令

var showImage = require('../src/helpers/showImage');
var packageInfo = require('../package');
var pluginManager = require('../src/plugin');

var mkdirp = require('../src/helpers/mkdirp');

var hiproxyDir = path.join(homedir(), '.hiproxy');
var _args = new Args({
  colors: {
    paragraph: 'white',
    title: 'white',
    command: 'white',
    parameter: 'white',
    option: 'white'
  }
});

global.hiproxy = hiproxy;

// global.log = log;

// 注册各个命令
'init start stop restart state open'.split(' ').forEach(function (cmd) {
  var cmdConfig = require(path.join(__dirname, '..', 'src', 'commands', cmd));

  if (cmdConfig && cmdConfig.command) {
    _args.command(cmdConfig);
  }
});

/* ============ load plugin ============ */
// var npmGlobalRoot = '/Users/zdy/.nvm/versions/node/v7.0.0/lib/node_modules';
// var testPlugin = path.join(npmGlobalRoot, 'hiproxy-plugin-test');
// var plugin = require(testPlugin);

// // console.log(plugin);

// // 添加Commands
// var commands = plugin.commands || [];
// commands.forEach(function (command) {
//   _args.command(command);
// });

// // 添加directives
// var customDirectives = plugin.directives || [];
// customDirectives.forEach(function (directive) {
//   directives.addDirective(directive);
// });

// // 添加router
// var routes = plugin.routes;

// routers.addRoute(routes);
/* ===================================== */

pluginManager.getInstalledPlugins().then(function (plugins) {
  if (plugins && plugins.length > 0) {
    pluginManager.loadPlugins(plugins, _args);
  }
  run();
}).catch(function () {
  run();
});

function run () {
  _args
    .version(packageInfo.version)
    .bin('hiproxy')
    // .option('debug', {
    //   alias: 'd',
    //   describe: '显示调试信息'
    // })
    // .option('detail', {
    //   alias: 'D',
    //   describe: '显示详细调试信息'
    // })
    .option('log-dir <dir>', {
      describe: 'The log directory when run in background, default: user home directory'
    })
    .option('log-time', {
      describe: 'Show time info before every log message'
    })
    .option('log-level', {
      describe: 'Log levels,format:<level1>[,<lavel2[,...]], available values: access,proxy,info,warn,error,debug,detail',
      default: 'access,proxy'
    })
    .option('grep <content>', {
      describe: 'Filter the log data'
    });

  // 解析参数，但是不执行命令
  global.args = _args.parse(false);

  mkdirp(hiproxyDir);

  _args.execute();

  if (!global.args.__error__ && global.args._.length === 0 && Object.keys(global.args).length === 1) {
    showImage([
      '',
      '',
      '   Welcome to use'.bold + (' hiproxy@' + packageInfo.version).bold.green,
      '   You can try `' + 'hiproxy --help'.cyan.underline + '` for more info',
      '   And the documentation site is ' + 'http://hiproxy.org/'.cyan.underline
    ]);
  }
}
