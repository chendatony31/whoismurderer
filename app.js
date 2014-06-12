var nickName;
var socket = io.connect('http://172.18.145.54:3000');
var whosTurn;
var gamerNum;
var myPokers = [];
var reNum = 0;
var dropList = [];
var dropNum;
var _POKERCOLOR = {heart:'红桃',diamond:'方片',spade:'黑桃',club:'梅花'};
var _POKERS = {
	1:{color:'红桃',num:1},
	2:{color:'红桃',num:2},
	3:{color:'红桃',num:3},
	4:{color:'红桃',num:4},
	5:{color:'红桃',num:5},
	6:{color:'红桃',num:6},
	7:{color:'红桃',num:7},
	11:{color:'方片',num:1},
	12:{color:'方片',num:2},
	13:{color:'方片',num:3},
	14:{color:'方片',num:4},
	15:{color:'方片',num:5},
	16:{color:'方片',num:6},
	17:{color:'方片',num:7},
	21:{color:'黑桃',num:1},
	22:{color:'黑桃',num:2},
	23:{color:'黑桃',num:3},
	24:{color:'黑桃',num:4},
	25:{color:'黑桃',num:5},
	26:{color:'黑桃',num:6},
	27:{color:'黑桃',num:7},
	31:{color:'梅花',num:1},
	32:{color:'梅花',num:2},
	33:{color:'梅花',num:3},
	34:{color:'梅花',num:4},
	35:{color:'梅花',num:5},
	36:{color:'梅花',num:6},
	37:{color:'梅花',num:7}
	}

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


socket.on('test',function(){alert('gege');});
//开始游戏
function gameon(){
	$('#pokerList').html('');
	socket.emit('game start');
	$('#operateArea').html('');
	$('#operateArea').append('<input id="btn_restart" type="button" value="重新开始游戏" onclick="gameon()" />');
}

//接收初始牌
socket.on('send poker',function(data){
	myPokers = data.poker;
	gamerNum = data.num;
	listMyPokers(myPokers);
});
//将自己的手牌展示出来
function listMyPokers(myPokers){
	$('#pokerList').html('');
	myPokers.sort();
	for (i=0;i<myPokers.length;i++){
		$('#pokerList').append($('<li>').text(_POKERS[myPokers[i]].color + _POKERS[myPokers[i]].num).attr({"id":'p' + myPokers[i],"val": myPokers[i]}));
	}
}
//监听游戏轮到谁了
socket.on('whos turn', function(who){
	if(who == nickName){
		$('#selectArea').css('display','block');
	}
	whosTurn=who;
	$('#gameMessageArea').append($('<p>').text(whosTurn + ' 开始要牌'));
});
//要牌
$('#selectArea').click(function(e){
	var choice = e.target.id;
	socket.emit('user order', choice);
	reNum = 0;
	$('#selectArea').css('display','none');
});
//监听要的什么牌
socket.on('request poker',function(choice){
	$('#gameMessageArea').append($('<p>').text(whosTurn + '要了' + _POKERCOLOR[choice] ));
	deliverAPoker(choice);
});
//给牌
function deliverAPoker(choice){
	var isHaveColor = false;
	for(var i=0;i<myPokers.length;i++){	
		if(_POKERS[myPokers[i]].color == _POKERCOLOR[choice]){
			isHaveColor = true;
			var pid = "#p" + myPokers[i];
			$(pid).addClass('drapablePoker').click(function(e){
				var deliveredId = e.target.id.substring(1);
				socket.emit('delivered poker', {who:nickName,poker:deliveredId});
				$('#gameMessageArea').append($('<p>').text('你给了'+whosTurn + _POKERS[deliveredId].color + _POKERS[deliveredId].num));
				delPoker(deliveredId);
			});
		}
	}
	if(!isHaveColor){
		alert("我没有牌给他");
		socket.emit('deliver nopoker', nickName);
	}
}
//接受牌
socket.on('accept poker',function(data){
	reNum++;
	var who = data.who;
	var newPokerId = data.poker;
	$('#gameMessageArea').append($('<p>').text(who + '给了你 '+ _POKERS[newPokerId].color + _POKERS[newPokerId].num));
	myPokers.push(newPokerId);
	listMyPokers(myPokers);
	if(reNum==gamerNum-1){
		dropNum = 0;
		$('#dropArea').css('display','block');
		for(var i=0;i<myPokers.length;i++){
			var pid = "#p" + myPokers[i];
			$(pid).addClass('drapablePoker').click(function(e){
				alert('好的呢');
				dropNum++;
				var dropId = e.target.id.substring(1);
				dropList.push(dropId);
				alert(dropList);
			});
		}
	}
});
//没有收到牌
socket.on('accept nopoker',function(name){
	reNum++;
	$('#gameMessageArea').append($('<p>').text(name + '没有牌给你 '));
	if(reNum==gamerNum-1){
		
	}
});
//删除牌
function delPoker(id){
	for(var i=0; i<myPokers.length;i++){
		if(myPokers[i] == id){
			myPokers.splice(i,1);
			listMyPokers(myPokers);
			break;
		}
	}
}
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
//点击弃牌按钮
$('#btn_drop').click(function(){
	if(dropList.length>1){
		alert('扔了不止一张啊' + dropList.length);
		socket.emit('drop firstPoker',dropList[0]);
		delPoker(dropList[0]);
		for(var i=1; i<dropList.length;i++){
			socket.emit('drop otherPoker', dropList[i]);
			delPoker(dropList[i]);
		}
		listMyPokers(myPokers);
	}
});
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