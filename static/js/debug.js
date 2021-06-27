
window.addEventListener("message", function (event) {
    console.info('get message:', event);
}, false);

$('.list-group').on('click', 'button', function () {
    var $this = $(this);
    var type = $this.closest('.list-group-item').attr('id');
    var $statusDom = $this.closest('.list-group-item').find('.status');
    var url = 'https://www.debug-anywhere.com/status?user=debug-anywhere';

    function showStatus (isSucc, dataOrError) {
        $statusDom.text(isSucc ? 'Success' : ('Fail: ' + dataOrError.message))
        $statusDom.addClass(isSucc ? 'alert-success' : 'alert-danger');
    }

    switch (type) {
        case 'ajax-request':
            $.ajax(url).done(function (data) {
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