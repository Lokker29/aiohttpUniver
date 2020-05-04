$(function () {
    var conn = null;
    var name = "UNKNOWN";

    function log(msg) {
        var control = $('#log');
        var date = new Date();
        var date_prompt = '(' + date.toISOString().split('T')[1].slice(0, 8) + ') ';
        control.html(control.html() + date_prompt + msg + '<br/>');
        control.scrollTop(control.scrollTop() + 1000);
    }

    function connect() {
        disconnect();
        var wsUri = (window.location.protocol == 'https:' && 'wss://' || 'ws://') + window.location.host;
        conn = new WebSocket(wsUri);
        //log('Connecting...');
        conn.onopen = function () {
            //log('Connected.');
            update_ui();
        };
        conn.onmessage = function (e) {
            var data = JSON.parse(e.data);
            switch (data.action) {
                case  'connect':
                    name = data.name;
                    log('Connected as ' + name);
                    update_ui();
                    break;
                case  'disconnect':
                    name = data.name;
                    log('Disconnected ' + name);
                    update_ui();
                    break;
                case 'join':
                    log('Joined ' + data.name);
                    break;
                case 'sent':
                    log(data.name + ': ' + data.text);
                    break;
            }
        };
        conn.onclose = function () {
            log('Disconnected.');
            conn = null;
            update_ui();
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

    function update_ui() {
        if (conn == null) {
            $('#status').text('disconnected');
            $('#connect').html('Connect');
            $('#send').prop("disabled", true);
        } else {
            $('#status').text('connected (' + conn.protocol + ')');
            $('#connect').html('Disconnect');
            $('#send').prop("disabled", false);
        }
        $('#name').text(name);
    }

    $('#connect').on('click', function () {
        if (conn == null) {
            connect();
        } else {
            disconnect();
        }
        update_ui();
        return false;
    });
    $('#send').on('click', function () {
        var text = $('#text').val();
        // log('Sending: ' + text);
        log(text);
        conn.send(text);
        $('#text').val('').focus();
        return false;
    });

    $('.tablinks').click(function (event) {
        // Declare all variables
        var i, tabcontent, tablinks;

        var cityName = $(this).html();

        // Get all elements with class="tabcontent" and hide them
        tabcontent = document.getElementsByClassName("tab-content");
        for (i = 0; i < tabcontent.length; i++) {
            tabcontent[i].style.display = "none";
        }

        // Get all elements with class="tablinks" and remove the class "active"
        tablinks = document.getElementsByClassName("tab-links");
        for (i = 0; i < tablinks.length; i++) {
            tablinks[i].className = tablinks[i].className.replace(" active", "");
        }

        // Show the current tab, and add an "active" class to the link that opened the tab
        document.getElementById(cityName).style.display = "block";
        event.currentTarget.className += " active";
    });
})