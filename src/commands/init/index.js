/**
 * @file command `init`
 * @author Vampire-Jason
 */

'use strict';

var fs = require('fs');
var path = require('path');

module.exports = {
  command: 'init',
  describe: 'Create a default rewrite file',
  usage: 'init',
  fn: function () {
    // 待拷贝的默认rewrite.conf文件位置
    var filePath = path.join(__dirname, 'rewrite.conf');

    fs.readFile(filePath, 'utf-8', function (err, data) {
      if (err) {
        console.log('Create a default rewrite file error:', err.message);
      } else {
        // 使用process.cwd() 可以获取当前执行程序的运行目录，比如： /Users/jearbilove/xlearn/repos/hiproxy-example/workspace
        fs.writeFile(path.resolve(process.cwd(), 'rewrite'), data, function (err) {
          if (err) {
            console.log('Create a default rewrite file error:', err.message);
          } else {
            console.log('Default rewrite file create success.');
          }
        });
      }
    });
  }
};
