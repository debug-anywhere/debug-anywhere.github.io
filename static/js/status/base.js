function urlparseQuery (queryString) {
    var query = {};
    var pairs = (queryString[0] === '?' ? queryString.substr(1) : queryString).split('&');
    for (var i = 0; i < pairs.length; i++) {
        var pair = pairs[i].split('=');
        query[decodeURIComponent(pair[0])] = decodeURIComponent(pair[1] || '');
    }
    return query;
}

// jsonp
function Jsonp(url_or_attrs, cb, finished) {
    var s = document.createElement('script'),
        tid = setTimeout(finished, 1e4, 'timeout');
    typeof cb === 'function' && cb();
    s.onload = s.onerror = function (e) {
        clearTimeout(tid);
        typeof finished === 'function' && finished(e.type == 'error' ? e : 1[1])
        document.body.removeChild(s)
    };
    if (typeof url_or_attrs === 'string') {
        s.src = url_or_attrs;
    } else {
        for (var i in url_or_attrs) {
            s[i] = url_or_attrs[i]
        }
    }
    document.body.appendChild(s)
}

// ajax
function Ajax(url, method, data, cb) {
    var t1 = Date.now(), a = new XMLHttpRequest;
    a.onreadystatechange = function () {
        if (a.readyState == 4) {
            return cb(0, a.responseText)
        }
    }
    a.onerror = cb
    a.open(method, url, !1)
    var s = '', t = typeof data;
    if (!data) { } else if (t == 'object') {
        var r = []
        for (var i in data) {
            if (data.hasOwnProperty(i)) {
                r.push(encodeURIComponent(i) + '=' + encodeURIComponent(data[i]))
            }
        }
        s = r.join('&')
    } else { s = data + '' }
    a.send(s);
}
Ajax.get = function (url, data, cb) { return Ajax(url, 'GET', data, cb); }
Ajax.post = function (url, data, cb) { return Ajax(url, 'POST', data, cb); }
Ajax.head = function (url, data, cb) { return Ajax(url, 'HEAD', data, cb); }

var statusTool = {
    getNetWork: function () {
        return new Promise(function (done, fail) {
            var net = { ipList: [], dnsIP: '-', dnsCarrier: '-' },
                finishes = 0, errors = 0, ajax = 0,
                handers = [
                    [{
                        src: 'http://nstool.netease.com/ip.js',
                        charset: 'gbk'
                    }, function () {
                        window.ip = function (ip, isp, dnsIP, dnsCarrier) {
                            net.ipList.push({ ip: ip, isp: isp, prodiver: 'from netease' });
                            net.dnsIP = dnsIP;
                            net.dnsCarrier = dnsCarrier;
                            ++finishes;
                            then();
                        }
                    }, onerror]
                ];
            function onerror(e) {
                e && ++errors; then();
            }
            function then() {
                if (finishes + errors + ajax == handers.length + 1) { return done(net) }
            }
            handers.map(function (x) { Jsonp.apply(0, x) })
            // from httpbin
            Ajax.get('https://httpbin.org/ip', '', function (err, text) {
                ++ajax;
                if (!err) {
                    try {
                        var data = JSON.parse(text)
                        net.ipList.push({ ip: data.origin.split(',')[0], isp: '-', prodiver: 'from HttpBin' });
                    } catch (e) { }
                }
                then()
            })
        })
    },

    checkNetInfo : function() {
        var common_cell = ['cellular', '2g', '3g', '4g', '5g','3G/2G'];
        var user_agent = navigator.userAgent.toLowerCase();
        var connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection ||{type: 'unknown'};
        var type;
        // wechat
        var isWeixin = /micromessenger/.test(user_agent);
        if(isWeixin) {
            if(user_agent.indexOf('nettype') !== -1){
                type = user_agent.match(/nettype\/\w+/) ? user_agent.match(/nettype\/\w+/)[0] : 'nettype/unknow';
                type = type.replace('nettype/', '')
            }else {
                var weixinType = {"network_type:wifi":"wifi","network_type:edge":"3G/2G","network_type:fail":"fail","network_type:wwan":"3G/2G"}
                document.addEventListener("WeixinJSBridgeReady",function onBridgeReady(){
                    WeixinJSBridge.invoke('getNetworkType',{},function(e){
                        type = weixinType[e.err_msg];
                    });
                }); 
            }
        }else {
            type = (connection && connection.type) || 'unknown';
        }

        if(type && common_cell.indexOf(type) !== -1){
            return 'cellular'
        }else if ( type === 'wifi'){
            return 'wifi'
        }
        return 'unknown'
    },

    getBroswer: function () {
        var e = navigator,
            result = (new UAParser).getResult(),
            os = result.os,
            broswer = result.browser;

        // network
        var netType = statusTool.checkNetInfo();
        return {
            os: [os.name, os.version].join(' '),
            name: [broswer.name, broswer.version].join(' '),
            ua: e.userAgent,
            cookieEnable: e.cookieEnabled,
            jsEnable: !0,
            storageStatus: typeof localStorage !== 'object' ? -1 : e.cookieEnabled ? 1 : 0,
            cacheEnable: !0,
            netType: netType
        }
    }
};