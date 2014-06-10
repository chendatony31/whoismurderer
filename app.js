var nickName;
var socket = io.connect('http://172.18.145.54:3000');
//用户登录
$("#btn_enter").click(userlogin);
function userlogin() {
    if ($('#input_nickname').val()) {
        nickName = $('#input_nickname').val();
        socket.emit('user login', nickName);
        $('#welcomeStage').css("display", "none");
        $('#gameStage').css("display", "block");
    }
}

//监听用户登录登出
socket.on('note user login',
function(userList) {
    $('#userList').html('');
    for (i = 0; i < userList.users.length; i++) {
        $('#userList').append($('<li>').text(userList.users[i]));
    }
});

//房主进入
socket.on('host joined',
function(){
	$('#operateArea').append('<input id="btn_start" type="button" value="开始游戏" onclick="gameon()" />');
});

//开始游戏
function gameon(){
	$('#pokerList').html('');
	socket.emit('game start');
	$('#operateArea').html('');
	$('#operateArea').append('<input id="btn_restart" type="button" value="重新开始游戏" onclick="gameon()" />');
}

//接收初始牌
socket.on('send poker',function(poker){
	for (i=0;i<poker.length;i++){
		$('#pokerList').append($('<li>').text(poker[i]));
	}
});
//监听showmessage
socket.on('show message',
function(msg) {
    $('#messages').append($('<li>').text(msg));
});

//点击发送向后台发送消息
$("#btnSend").click(send_message);

function send_message() {
    if ($('#input_msg').val()) {
        socket.emit('send message', $('#input_msg').val());
        $('#input_msg').val('');
        return false;
    } else {
        return false;
    }
}

//根据浏览器动态设置高度
function setH() {
    var w = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
    var h = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight;

    document.getElementById("gameArea").style.height = (h - 2) + "px";
    document.getElementById("chatArea").style.height = (h - 152) + "px";
    document.getElementById("messages").style.height = (h - 186) + "px";
}

//按键控制
document.onkeydown = function() {
    keydown()
}
function keydown() {
    if (event.keyCode == 13) {
        send_message();
    }
}