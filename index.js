var http = require('http');
HTMLParser = require('./lib/html/htmlparser').HTMLParser;
HTMLtoDOM = require('./lib/html/htmlparser').HTMLtoDOM;

// Run some jQuery on a html fragment
var jsdom = require('jsdom');
var fs = require('fs');
var path = require('path');
var conf = require("argsparser").parse();
var config = {
    documentRoot    : conf['-root'] && conf['-root'] !== 'undefined'? conf['-root'] : process.cwd(),
    param            : conf['-param'] || ''
};
var filePath = path.join(config.documentRoot, 'data.json');
var htmlStr = fs.readFileSync(filePath, "utf8");
var data = htmlStr === '' ? {} : JSON.parse(htmlStr);
var updateJSON = function(orgJSON, newJSON){
   var returnFlag = false;
   for(var x in newJSON){
      if(!orgJSON[x]){
         orgJSON[x] = newJSON[x];
         returnFlag = true;
      }
   }
   if(!returnFlag){
      return false;
   }else{
      return orgJSON;
   }
}
var timeLoop = 1000 * 50, count = 0;
var loopSearch = function(time){
   console.log(count);
   jsdom.env({
      html: "http://search.hlgnet.com/?c=2&q=%E5%9B%9E%E9%BE%99%E8%A7%82%E4%BD%93%E8%82%B2%E5%85%AC%E5%9B%AD%E7%BE%BD%E6%AF%9B%E7%90%83%E5%8D%A1",
      scripts: ["http://code.jquery.com/jquery.js"],
      done: function (errors, window) {
         var $ = window.$;
         var table = $('table').eq(3);
         var info = {};
         table.find('tr').each(function(i){
            var url = $(this).find('a').attr('href');
            if(typeof url ==='undefined'){
               return ;
            }
            var content = '';
            content = $(this).find('font').eq(2).text();
            info[url] = {
               "title" : $(this).find('font').html() + $(this).find('a').html(),
               "content" : content,
               "time" : $(this).find('font:last').html()
            };
         });
         var newData = updateJSON(data, info);
         count ++;
         if(newData !== false){
            var writeStr = JSON.stringify(newData);
            fs.writeFile(filePath, writeStr, function(err){
            if (err) throw err;
            console.log('File Updated' + count);
            });
         }else{
            console.log('File Not Updated' + count);
         }
         setTimeout(function(){
            loopSearch(time);
         },time)
      }
   });
   
   
}
loopSearch(1000);
