$(function () {
    var conn = null;
    var name = "UNKNOWN";
    var toName = "";

    var tabs = [];

    function log(msg, name = null) {
        if (name) {
            var control = $('#' + name);
            var date = new Date();
            var date_prompt = '(' + date.toISOString().split('T')[1].slice(0, 8) + ') ';

            control.html(control.html() + date_prompt + msg + '<br/>');
            control.scrollTop(control.scrollTop() + 1000);
        }
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
                    // log('Connected as ' + name);v
                    var names = data.other_names.split(',');
                    update_ui();
                    if (names[0]) {
                        for (var b of names) {
                            add_block_in_tab(b);
                        }
                    }
                    break;
                case  'disconnect':
                    name = data.name;
                    // log('Disconnected ' + name);
                    remove_from_tab(name);
                    update_ui();
                    break;
                case 'join':
                    // log('Joined ' + data.name);
                    add_block_in_tab(data.name);
                    tabs.push(name);
                    break;
                case 'sent':
                    log(data.name + ': ' + data.text, data.name);
                    break;
            }
        };
        conn.onclose = function () {
            // log('Disconnected.');
            conn = null;
            update_ui();
        };
    }

    function add_block_in_tab(name) {
        var html = `<button class="tab-links">${name}</button>`;

        $('.tab').append(html);

        html = `<div id="${name}" class="tab-content" style="display: none"></div>`;

        $('#connector').after(html);

        $('.tab-links').on('click', click_tab);
    }

    function remove_from_tab(name) {
        var find = ".tab-links:contains(" + name + ")";

        var elem = $(find);

        elem.remove();
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
        conn.send(text + "&" + name + "@" + toName);
        $('#text').val('').focus();
        return false;
    });

    $('.tab-links').click(click_tab);

    function click_tab(event) {
        var i, tabcontent, tablinks;

        toName = event.currentTarget.innerText;

        // Get all elements with class="tabcontent" and hide them
        tabcontent = $(".tab-content");
        for (i = 0; i < tabcontent.length; i++) {
            tabcontent[i].style.display = "none";
        }

        // Get all elements with class="tab-links" and remove the class "active"
        tablinks = $(".tab-links");
        for (i = 0; i < tablinks.length; i++) {
            tablinks[i].className = tablinks[i].className.replace(" active", "");
        }

        // Show the current tab, and add an "active" class to the link that opened the tab
        document.getElementById(toName).style.display = "block";
        event.currentTarget.className += " active";
        var a = 2;
    }
});