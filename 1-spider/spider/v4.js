/*
  线性队列法
*/

var request = require('request');
var fs = require('fs');
//
var cities = require('./data/cities');
var keywords = require('./data/input');

//生成城市名和adcode的列表
var adcodeMap = {};
cities
  .filter(function(d) {
    return d.level === 'city';
  })
  .forEach(function(d) {
    var str = d.name.substring(0, 2);
    adcodeMap[str] = d.adcode;
  });

//获取url的函数
function getURL(keyword) {
  str = keyword.substring(0, 2);
  adcode = adcodeMap[str];
  if (!adcode) return;
  return encodeURI('http://ditu.amap.com/service/poiInfo?query_type=TQUERY&pagesize=100&pagenum=1&cluster_state=4&city=' + adcode + '&keywords=' + keyword);
}

//
var data, list, d, obj, result = [];
var spiderIndex = 0, spiderSuccessIndex = 0;
var queryN = keywords.length;
function query(next) {
  var keyword = keywords[spiderIndex];
  var url = getURL(keyword);
  spiderIndex++;
  if(spiderIndex >= queryN) return next();
  request.get(url, function(e, res, body) {
    if (!e && res.statusCode == 200) {
      body = JSON.parse(body);
      data = body.data;
      if(!data || !data[0]) return query(next);
      list = data[0].list;
      if(!list || !list[0]) return query(next);
      //
      d = list[0];
      obj = {
        city: d.cityname,
        name: d.name,
        lat: d.location.lat,
        lng: d.location.lng,
        tel: d.tel
      };
      //
      spiderSuccessIndex++;
      console.log(spiderSuccessIndex + '/' + spiderIndex + '|' + queryN);
      result.push(obj);
      save(result);
      return query(next);
    } else {
      console.log('错误');
      return query(next);
    }
  });
}


function save(ds){
  fs.writeFileSync('./data/output.json', JSON.stringify(ds, null, 2), 'utf8');
}

////////////////////////////////////////////////////////////////
///////////////////////////// 主入口 ////////////////////////////
////////////////////////////////////////////////////////////////
query(function(){
  console.log('大功告成..');
  process.exit();
});



