function get_elem_by_name(name) {
    var elem = `<li class="user-contact" id="${name}">
                  <div class="d-flex bd-highlight">
                    <div class="user_info user-info-tab">
                       <button class="tab-user-name">${name}</button>
                    </div>
                  </div>
                </li>`;
    return elem;
}

function get_chat_box(name) {
    var textarea_id = name + '-textarea_msg';
    var btn_id = name + '-btn_id';
    var elem = `<div class="card hidden chat-box" id="${name}-chat">

                    <div class="card-header msg_head">
                        <div class="d-flex bd-highlight">
                            <div class="user_info">
                                <span>Chat with ${name}</span>
                            </div>
                        </div>
                    </div>
                    
                    <div class="card-body msg_card_body"></div>
                    
                    <div class="card-footer">
                        <div class="input-group">
                                <textarea name="" class="form-control type_msg" id="${textarea_id}"
                                          placeholder="Type your message..."></textarea>
                            <div class="input-group-append">
                                <button class="input-group-text send_btn" id="${btn_id}">
                                    <i class="fas fa-location-arrow"></i>
                                </button>
                            </div>
                        </div>
                    </div>

                </div>`;
    return elem;
}

function create_msg(name, text, author) {
    var a = (author === name) ? 'end' : 'start';
    var b = (author === name) ? '_send' : '';
    text = (author === name) ? text : author + ': ' + text;

    var elem = `<div class="d-flex justify-content-${a} mb-4">
                   <div class="msg_cotainer${b}">
                       ${text}
                   </div>
                </div>`;
    return elem;
}

$(document).ready(function () {
    var conn = null;
    var name = "";
    var toName = "All";

    function connect() {
        var wsUri = (window.location.protocol === 'https:' && 'wss://' || 'ws://') + window.location.host;
        conn = new WebSocket(wsUri);

        conn.onopen = function () {
            var send_data = {
                type: 'connect',
                name: name,
            };
            conn.send(JSON.stringify(send_data));
        };
        conn.onmessage = function (e) {
            var data = JSON.parse(e.data);
            switch (data.type) {
                case 'open':
                    // self connect
                    var all_users = data.all_clients.split(';');

                    if (all_users[0] !== '') {
                        for (var user of all_users) {
                            var elem = get_elem_by_name(user);
                            $('#contacts').append(elem);
                            // $('#' + user + ' .tab-user-name').click(tab_user_click);
                            $("[id='" + user + "'] .tab-user-name").click(tab_user_click);

                            elem = get_chat_box(user);
                            $('#chat-box-container').append(elem);

                            // $('#' + user + '-btn_id').click(on_click);
                            $("[id='" + user + "-btn_id']").click(on_click);
                        }
                    }
                    break;
                case 'connect':
                    var elem = get_elem_by_name(data.name);
                    $('#contacts').append(elem);
                    // $('#' + data.name + ' .tab-user-name').click(tab_user_click);
                    $("[id='" + data.name + "'] .tab-user-name").click(tab_user_click);

                    elem = get_chat_box(data.name);
                    $('#chat-box-container').append(elem);

                    // $('#' + data.name + '-btn_id').click(on_click);
                    $("[id='" + data.name + "-btn_id']").click(on_click);
                    break;
                case 'disconnect':
                    // var elem = $('#' + data.name);
                    var elem = $("[id='" + data.name + "']");
                    if (elem.hasClass('active')) {
                        $('#All').addClass('active');
                        $('#All-chat').removeClass('hidden');
                    }

                    elem.remove();
                    // $('#' + data.name + '-chat').remove();
                    $("[id='" + data.name + "-chat']").remove();
                    break;
                case 'send_message':
                    var elem = create_msg(name, data.text, data.author);

                    if (data.all_recipients === true) {
                        $('#All-chat .msg_card_body').append(elem);
                    } else if (data.author === name) {
                        // $('#' + data.recipient + '-chat .msg_card_body').append(elem);
                        $("[id='" + data.recipient + "-chat'] .msg_card_body").append(elem);
                    } else if (data.recipient === name) {
                        // $('#' + data.author + '-chat .msg_card_body').append(elem);
                        $("[id='" + data.author + "-chat'] .msg_card_body").append(elem);
                    }
                    break;
            }
        };
        conn.onclose = function () {
            disconnect();
        };
    }

    function disconnect() {
        if (conn != null) {
            conn.close();
            conn = null;
            name = '';
            toName = 'All';
        }
    }

    $('#login-form').submit(function (event) {
        event.preventDefault();

        name = $('#login-username').val();

        if (name !== "") {
            $('#login-block').addClass('hidden');
            $('#chat-block').removeClass('hidden');
            connect();
            $('#login-username').val('');
        }
    });

    function tab_user_click() {
        $('.tab-user-name').parents('li').removeClass('active');
        $(this).parents('li').addClass('active');

        toName = $(this).parents('li').attr('id');

        $('.chat-box').addClass('hidden');
        // $(`#${toName}-chat`).removeClass('hidden');
        $("[id='" + toName + "-chat']").removeClass('hidden')
    }

    $('.tab-user-name').click(tab_user_click);

    function on_click() {
        var text = $("[id='" + toName + "-textarea_msg']").val();

        if (text !== null && text !== '') {
            var send_data = {
                type: 'send_message',
                text: text,
                author: name,
                recipient: toName,
            };
            conn.send(JSON.stringify(send_data));
            $("[id='" + toName + "-textarea_msg']").val('');
        }
    }

    $('.send_btn').click(on_click);

    $('#exit-btn').click(function () {
        var elements = $('.chat-box');

        for (var elem of elements) {
            if ($(elem).attr('id') !== 'All-chat') {
                $(elem).remove()
            }
        }

        elements = $('.user-contact');
        for (var elem of elements) {
            if ($(elem).attr('id') !== 'All') {
                $(elem).remove()
            }
        }

        $('#All').addClass('active');

        $('#All-chat .msg_card_body div').remove();
        $('#All-chat').removeClass('hidden');

        $('#chat-block').addClass('hidden');
        $('#login-block').removeClass('hidden');

        disconnect();
    });

});
