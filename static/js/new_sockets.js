$(function () {
    var conn = null;
    var name = "UNKNOWN";
    var toName = "";

    function connect() {
        disconnect();
        var wsUri = (window.location.protocol === 'https:' && 'wss://' || 'ws://') + window.location.host;
        conn = new WebSocket(wsUri);

        conn.onopen = function () {
            var send_data = {
                type: 'connect',
                name: 'first name',
            };
            conn.send(JSON.stringify(send_data));
        };
        conn.onmessage = function (e) {
            var data = JSON.parse(e.data);
            switch (data.type) {
                case 'open':
                    // self connect
                    break;
                case 'connect':
                    // new connect
                    name = data.name;
                    break;
                case 'disconnect':
                    // disconnect
                    break;
                case 'send_message':
                    // receive msg
                    break;
            }
        };
        conn.onclose = function () {
            conn = null;
        };
    }

    function disconnect() {
        if (conn != null) {
            //log('Disconnecting...');
            conn.close();
            conn = null;
            name = 'UNKNOWN';
            update_ui();
        }
    }

    connect();
});