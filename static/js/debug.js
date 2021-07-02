
window.addEventListener("message", function (event) {
    console.info('get message:', event);
}, false);

$(document).ready(function () {
    $('#user-agent').find('p').text(window.navigator.userAgent);
});

function loadJs(url, callback){
    if (document.getElementById('script' + url)) {
        return;
    }
    var script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = url;
    script.async = true;
    script.setAttribute('id', 'script' + url);

    var s = document.getElementsByTagName('script')[0];

    s.parentNode.insertBefore(script, s);
    script.onload = function () {
        callback();
    }
    script.onerror = function () {
        callback(new Error('load error'));
        s.parentNode.removeChild(script);
    } 
}

$('.list-group').on('click', 'button', function () {
    var $this = $(this);
    var $listItem = $this.closest('.list-group-item');
    var type = $listItem.attr('id');
    var $statusDom = $listItem.find('.status');
    var url = 'https://www.debug-anywhere.com/status?user=debug-anywhere';
    var ajaxUrl = 'https://www.debug-anywhere.com/static/data/app.json';

    function showStatus (isSucc, dataOrError) {
        $statusDom.text(typeof isSucc === 'boolean' ? isSucc ? 'Success' : ('Fail: ' + dataOrError.message) : isSucc);
        $statusDom.addClass(isSucc ? 'alert-success' : 'alert-danger');
    }

    switch (type) {
        case 'reload':
            window.location.reload();
            break;
        case 'trigger-debug':
            $statusDom.removeClass('d-none');
            showStatus('loading');
            loadJs('https://cdnjs.cloudflare.com/ajax/libs/eruda/2.4.1/eruda.min.js', function (err) {
                if (err) {
                    showStatus(false, err);
                } else {
                    showStatus(true);
                    eruda.init();
                    var offset = $listItem.offset();
                    eruda.position({ x: offset.left + $listItem.width() - 20,
                        y: offset.top + $listItem.height() - 30 });
                }
            });
            break;
        case 'ajax-request':
            $.ajax(ajaxUrl).done(function (data) {
                showStatus(true);
                console.log(data);
            }).fail(function (xhr, status, error) {
                showStatus(false, error);
                console.log(xhr, status);
                console.error(error)
            });
            break;
        case 'fetch-request':
            fetch(url).then(function (res) {
                showStatus(true);
                console.log(res);
            }).catch(function (error) {
                showStatus(false, error);
                console.error(error);
            });
            break;
        case 'log-message':
            console.log('[DebugAnywhere] console.log test');
            console.warn('[DebugAnywhere] console.warn test');
            console.error('[DebugAnywhere] console.error test');
            console.info('[DebugAnywhere] console.info test');
            showStatus(true);
            break;
        case 'trigger-error':
            throw new Error('throw by debug-anywhere.com');
            break;
        case 'navigator-share':
            if (navigator.canShare) {
                navigator.share({
                    url: 'https://www.debug-anywhere.com/',
                    title: 'Download DebugAnywhere',
                    text: 'DebugAnywhere is an efficient debugging tool for mobile'
                });
                showStatus(true);
            } else {
                showStatus(false, new Error('not support'));
            }
            break;
        case 'localStorage':
            localStorage.setItem('localstorage-demo-time', Date.now());
            console.log(localStorage.getItem('localstorage-demo-time'));
            showStatus(true);
            break;
        case 'sessionStorage':
            sessionStorage.setItem('sessionstorage-demo-time', Date.now());
            console.log(sessionStorage.getItem('sessionstorage-demo-time'));
            showStatus(true);
            break;
        case 'cookie':
            console.log(document.cookie);
            showStatus(true);
            break;
        case 'postMessage':
            postMessage({ type: 'test', from: 'postMessage' });
            showStatus(true);
            break;
        case 'geolocation':
            navigator.geolocation.getCurrentPosition(function (data) {
                showStatus(true);
                console.log(data);
            }, function (error) {
                showStatus(false, error)
                console.error(error);
            })
            break;
    }
})