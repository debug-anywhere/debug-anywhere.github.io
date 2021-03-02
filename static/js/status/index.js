'use strict';

class StatusCheck extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            ipLoading: true,
            ipList: [],
            dnsIP: '',
            dnsCarrier: '',
            device: statusTool.getBroswer() || {},
            apiList: [],
            apiRet: {}
        };
        this.fetchNetwork();
    }

    componentDidMount () {
        this.getApis();
    }

    fetchNetwork () {
        var self = this;
        statusTool.getNetWork().then(function (ret) {
            self.setState({
                ...ret,
                ipLoading: false
            })
        });
    }

    getApis () {
        const self = this;
        var query = urlparseQuery(window.location.search);
        var repo = 'https://raw.githubusercontent.com/' + query.user || query.org || 'debug-anywhere';
        Ajax.get(repo +'/debug-anywhere-status/main/status.txt' + '?t=' + Date.now(), {}, function (err, text) {
            var apis = text && text.split('\n').map(function (it) { return it.trim(); }).filter(function (it) {
                if (/^https:\/\//i.test(it)) return true;
                return false;
            });
            if (!apis || !apis.length) {
                apis = ['https://www.debug-anywhere.com'];
            }
            self.setState({
                apiList: apis
            }, function () {
                self.checkAPIs();
            });
        })
    }

    checkAPIs () {
        var self = this;
        self.state.apiList.forEach(function (url) {
            var start = Date.now();
            var ret = { ok: 0, delay: 0 };
            try {
                Ajax.head(url, {}, function (e) {
                    if (e) {
                        ret.ok = 0;
                        ret.delay = -1;
                    } else {
                        var delay = Date.now() - start;
                        if (delay == 0) { delay = 1 }
                        ret.delay = delay;
                        ret.ok = 1;
                    }
                    stateUpdate();
                })
            } catch (e) {
                ret.ok = 0;
                ret.delay = -1;
                stateUpdate();
            } 
            function stateUpdate() {
                self.setState(function (prevState) {
                    const newApiRet = {
                        ...prevState.apiRet,
                    }; 
                    newApiRet[url] = ret; 
                    return {
                        apiRet: newApiRet
                    }
                })
            }
            /*
            Jsonp(url, 1, function (e) {
                if (e) {
                    ret.ok = 0
                    ret.delay = -1;
                } else {
                    var delay = Date.now() - start;
                    if (delay == 0) { delay = 1 }
                    ret.delay = delay;
                    ret.ok = 1;
                }

                self.setState(function (prevState) {
                    const newApiRet = {
                        ...prevState.apiRet,
                    }; 
                    newApiRet[url] = ret; 
                    return {
                        apiRet: newApiRet
                    }
                })
            }) */
        })
    }

    renderLoading () {
        return (
            <div className="spinner-grow spinner-grow-sm text-info" role="status">
                <span className="visually-hidden">Loading...</span>
            </div>
        );
    }

    renderIPBlock () {
        const { ipLoading, ipList, dnsCarrier, dnsIP } = this.state;

        return (
            <table className="table info-table">
                <thead>
                    <tr><th colSpan="2"><h3>IP Info</h3></th></tr>
                </thead>
                <tbody>
                <tr>
                    <td>IP Address</td>
                    <td>{ipLoading ? this.renderLoading() : ipList.map(function (it, index) {
                        return (
                            <div key={index}>
                                <strong>{it.ip}</strong>  {it.isp}  {it.prodiver}
                            </div>
                        )
                    })}</td>
                </tr>
                <tr>
                    <td>DNS IP</td>
                    <td>{ipLoading ? this.renderLoading() : dnsIP}</td>
                </tr>
                <tr>
                    <td>DNS Carrier</td>
                    <td>{ipLoading ? this.renderLoading() : dnsCarrier}</td>
                </tr>
                </tbody>
            </table>
        );
    }

    renderDeviceBlock () {
        const { device } = this.state;

        return (
            <table className="table info-table">
                <thead>
                    <tr><th colSpan="2"><h3>Device Info</h3></th></tr>
                </thead>
                <tbody>
                <tr>
                    <td>OS</td>
                    <td>{device.os}</td>
                </tr>
                <tr>
                    <td>Browser</td>
                    <td>{device.name}</td>
                </tr>
                <tr>
                    <td>User Agent</td>
                    <td>{device.ua}</td>
                </tr>
                <tr>
                    <td>Cookie</td>
                    <td>{device.cookieEnable ? 'Enable' : 'Disable'}</td>
                </tr>
                <tr>
                    <td>localStorage</td>
                    <td>{device.storageStatus === 1 ? 'Enable' : 'Disable'}</td>
                </tr>
                <tr>
                    <td>Cache</td>
                    <td>{device.cacheEnable ? 'Enable' : 'Disable'}</td>
                </tr>
                <tr>
                    <td>Net Type</td>
                    <td>{device.netType}</td>
                </tr>
                </tbody>
            </table>
        );
    }

    renderAPIBlock () {
        const { apiList, apiRet } = this.state;
        const self = this;

        return (
            <table className="table api-table">
                <thead>
                    <tr><th colSpan="2"><h3>API/Server Status</h3></th></tr>
                </thead>
                <tbody>
                {apiList.map(function (it) {
                    const curRet = apiRet[it] || {};
                    return <tr key={it}>
                        <td>{it}</td>
                        <td>{curRet.delay === undefined ? self.renderLoading() : curRet.delay === -1 ? <span className="badge rounded-pill bg-danger">fail</span> : <span className="badge rounded-pill bg-success">ok</span>}</td>
                        </tr>
                })}
                </tbody>
            </table>
        );
    }

    render() {
        return (
            <div>
                {this.renderIPBlock()}
                {this.renderDeviceBlock()}
                {this.renderAPIBlock()}
            </div>
        );
    }
}

const domContainer = document.querySelector('#wrap');
ReactDOM.render(React.createElement(StatusCheck), domContainer);