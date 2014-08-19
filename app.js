$(document).ready(function() {
    var socket = io.connect('http://localhost:3000/game'); 
    var STATE = ["等待","游戏中"]
    socket.on('server is Ok',function(data) {
        console.log('连接上了');
        $('#loading').hide(300);
        $('#welcomeStage').show(300);
        $('#totalVisit').html(data[0]);
        $('#onlineNum').html(data[1]);
        // var tmp_roomlist = data[2];
        // for (i = 0; i < tmp_roomlist.length; i++) {
        //     $('#roomlist').append($('<li>').html("房间号:"+ tmp_roomlist[i].roomid + "人数："+ tmp_roomlist[i].num + "游戏状态：" + STATE[tmp_roomlist[i].gaming] ));
        //    //$('#roomlist').append($('<li>').html(tmp_roomlist));
        // }
    });
    
    var nickName;
    var whosTurn;
    var gamerNum;
    var roomNum;
    var roomUserNum;
    var myPokers = [];
    var reNum = 0;
    var dropList = [];
    var dropNum;
    var hasTripleCards = false;
    var hasCardsInRow = false;
    var _POKERCOLOR = {
        heart: '<span class="redIcon">&#9829;</span>',
        diamond: '<span class="redIcon">&#9830;</span>',
        spade: '<span class="blackIcon">&#9824;</span>',
        club: '<span class="blackIcon">&#9827;</span>'
    };
    var _COLOR = {
        heart: '0',
        diamond: '1',
        spade: '2',
        club: '3'
    };
    var _POKERS = {
        1 : {color: '<span class="redIcon">&#9829;</span>',num: 1},
        2 : {color: '<span class="redIcon">&#9829;</span>',num: 2},
        3 : {color: '<span class="redIcon">&#9829;</span>',num: 3},
        4 : {color: '<span class="redIcon">&#9829;</span>',num: 4},
        5 : {color: '<span class="redIcon">&#9829;</span>',num: 5},
        6 : {color: '<span class="redIcon">&#9829;</span>',num: 6},
        7 : {color: '<span class="redIcon">&#9829;</span>',num: 7},
        11 : {color: '<span class="redIcon">&#9830;</span>',num: 1},
        12 : {color: '<span class="redIcon">&#9830;</span>',num: 2},
        13 : {color: '<span class="redIcon">&#9830;</span>',num: 3},
        14 : {color: '<span class="redIcon">&#9830;</span>',num: 4},
        15 : {color: '<span class="redIcon">&#9830;</span>',num: 5},
        16 : {color: '<span class="redIcon">&#9830;</span>',num: 6},
        17 : {color: '<span class="redIcon">&#9830;</span>',num: 7},
        21 : {color: '<span class="blackIcon">&#9824;</span>',num: 1},
        22 : {color: '<span class="blackIcon">&#9824;</span>',num: 2},
        23 : {color: '<span class="blackIcon">&#9824;</span>',num: 3},
        24 : {color: '<span class="blackIcon">&#9824;</span>',num: 4},
        25 : {color: '<span class="blackIcon">&#9824;</span>',num: 5},
        26 : {color: '<span class="blackIcon">&#9824;</span>',num: 6},
        27 : {color: '<span class="blackIcon">&#9824;</span>',num: 7},
        31 : {color: '<span class="blackIcon">&#9827;</span>',num: 1},
        32 : {color: '<span class="blackIcon">&#9827;</span>',num: 2},
        33 : {color: '<span class="blackIcon">&#9827;</span>',num: 3},
        34 : {color: '<span class="blackIcon">&#9827;</span>',num: 4},
        35 : {color: '<span class="blackIcon">&#9827;</span>',num: 5},
        36 : {color: '<span class="blackIcon">&#9827;</span>',num: 6},
        37 : {color: '<span class="blackIcon">&#9827;</span>',num: 7}
    };

    //用户登录 start 
    /* 
    //localstorage
    (function (){
        if(localStorage.nickName){
            nickName = localStorage.nickName;
            userlogin(nickName);
        }
    })();
    */

    //点击进入游戏按钮
    $("#btn_checkNickName").click(function(){
        if ($('#input_nickname').val()) {
            nickName = $('#input_nickname').val();
            userlogin(nickName);
        }
    });

    function userlogin(nickName) {
            socket.emit('check nickName', nickName);
    }

    //加入指定房间
    $("#btn_loginThisRoom").click(function(){
        roomNum = $('#input_roomnum').val();
        if (!isNaN(roomNum) && roomNum != "") {
            socket.emit('user loginRoom', roomNum);        
        }else{
            alert('房间号填数字');
        }
    });

    socket.on('gaming',function(){
        alert('这个房间游戏正在进行中。。。')
    })

    //创建新房间
    $("#btn_createNewRoom").click(function(){
        socket.emit('create new room');
    });


    socket.on('nickName not ok',function(){
        alert('用户名重复');
    });


    socket.on('in the room',function(data){
        roomNum = data;
        dataForWeixin.title = "谁是凶手，我的房间号是" + roomNum +",速度来！在线等"
        $('#roomNumLogin').hide(300);
        $('#nickNameLogin').show(300);
        
    })

    //用户登录进来了
    socket.on('user inRoom',function(data){
        //alert(data[0] + ',' + data[1]); 
        $('#welcomeStage').hide(300);
        $('#gameStage').show(300);
        $('#userList').html('');
        var userlist = data[1];
        roomUserNum = userlist.length;
        roomNum = data[0];
        gameOver();
        for (i = 0; i < data[1].length; i++) {
            $('#userList').append($('<li>').text(data[1][i]));
        }
        $('#userNum').html(data[1].length);
        $('#roomNum').html(roomNum);
        if(roomUserNum == 1){
            alert('你的房间号是'+ roomNum + ",赶紧通过微信叫好友一起来玩吧");
        }
    });
    socket.on('not this room',function(){
        alert('没有这个房间号哦~你可以点击创建房间创建一个新的房间');
    });


    //监听用户登出
    socket.on('note user loginout',
    function(userList) {
        $('#userList').html('');
        gameOver();
        for (i = 0; i < userList.length; i++) {
            $('#userList').append($('<li>').text(userList[i]));
        }
        $('#userNum').html(userList.length);
    });
    //准备按钮点击
    $('#btn_ready').click(function() {
        if(roomUserNum == 1){
            alert('目前房间里只有你一个人哦，赶紧去叫你的小伙伴们吧,你的房间号是：' + roomNum);
        }else{
            
            socket.emit('im ready');
            $('#btn_ready').hide(300);
        }
    });

    socket.on('i am ready',function(who){
        $('#gameMessageArea').prepend($('<p>').html(who +" 准备了"));
    });
    socket.on('all is ready',function(){
        alert('游戏开始啦');
        $('#gameMessageArea').html('');
        $('.record').html('');
        $('#guessArea').html('');
    });
    socket.on('test',
    function() {
        alert('gege');
    });

    //接收初始牌
    socket.on('send poker',
    function(data) {
        //alert(data.poker);
        myPokers = data.poker;
        gamerNum = data.num;
        listMyPokers(myPokers);

    });

    //公共牌
    socket.on('public pokers',
    function(pokers) {
        var PUBLISH = '';
        for (i = 0; i < pokers.length; i++) {
            PUBLISH = PUBLISH + formatPoker(pokers[i]) + ' ';
        }
        $('#gameMessageArea').prepend($('<p>').html('公共牌有' + PUBLISH));
    });
    //将自己的手牌展示出来
    function listMyPokers(myPokers) {
        $('#pokerList').html('');
        myPokers.sort(sortNumber);
        for (i = 0; i < myPokers.length; i++) {
            $('#pokerList').append($('<li>').html(_POKERS[myPokers[i]].color + _POKERS[myPokers[i]].num).attr({
                "id": 'p' + myPokers[i],
                "val": myPokers[i]
            }));
        }
    }
    //展示底牌
    function listDarkPokers(darklist){
        $('#pokerList').html('');
        for(i=0;i<darklist.length;i++){
            if(i%3 == 0){
                $('#pokerList').append($('<li>').html(_POKERS[darklist[i]].color + _POKERS[darklist[i]].num).attr({
                    "id": 'p' + darklist[i],
                    "val": darklist[i],
                    "class" : "shortone"
                }));
            }else{
                $('#pokerList').append($('<li>').html("<span>查<br>看</span>").attr({
                    "id": 'p' + darklist[i],
                    "val": darklist[i],
                    "class" : "shortone darkpoker"
                }));
            }
        }
    }
    //绑定click事件
    $(document).on('click','.darkpoker',function(e){
        var tmpId = e.target.id.substring(1);
        $('#gameMessageArea').prepend($('<p>').html('这张牌是' + formatPoker(tmpId)));
        $('#passbyArea').show(300);
        $('#pokerList').html('');
    });
    $('#btn_passby').click(function(){
        $('#passbyArea').hide(300);
        $('guessArea').hide(300);
        socket.emit('passed by');
    })
    
    //监听游戏轮到谁了
    socket.on('whos turn',
    function(who) {
        //alert(who);
        if (who == nickName) {
            console.log(nickName +'还有' + myPokers.length + "张牌");
            if(myPokers.length == 0){
                alert('你没牌了,可以点击看一张底牌');
                socket.emit('i have no cards');
            }else{
                $('#selectArea').show(300);
            }
             $('#guessArea').show(300);
        }
        whosTurn = who;
        $('#gameMessageArea').prepend($('<p>').text('轮到'+ whosTurn + '了'));
    });

    //没牌了 要看底牌了
    socket.on('here is dark cards',function(data){
        listDarkPokers(data);
    })


    //要牌
    $('#selectArea input').click(function(e) {
        var choice = e.target.id;
        socket.emit('user order', choice);
        reNum = 0;
        $('#selectArea').hide(300);
    });
    //监听要的什么牌
    socket.on('request poker',
    function(choice) {
        $('#gameMessageArea').prepend($('<p>').html(whosTurn + '要了' + _POKERCOLOR[choice]));
        deliverAPoker(choice);
    });
    //给牌
    function deliverAPoker(choice) {
        var isHaveColor = false;
        for (var i = 0; i < myPokers.length; i++) {
            if (_POKERS[myPokers[i]].color == _POKERCOLOR[choice]) {
                isHaveColor = true;
                var pid = "#p" + myPokers[i];
                $(pid).addClass('drapablePoker').click(function(e) {
                    if(e.target.tagName == 'LI'){
                        var deliveredId = e.target.id.substring(1);
                        socket.emit('delivered poker', {
                            who: nickName,
                            poker: deliveredId
                        });
                        $('#gameMessageArea').prepend($('<p>').html('你给了' + whosTurn + _POKERS[deliveredId].color + _POKERS[deliveredId].num));
                        delPoker(deliveredId);
                    }
                });
            }
        }
        if (!isHaveColor) {
            socket.emit('deliver nopoker', nickName);
        }
    }
    //接受牌
    socket.on('accept poker',
    function(data) {
        reNum++;
        var who = data.who;
        var newPokerId = data.poker;
        $('#gameMessageArea').prepend($('<p>').html(who + '给了你 ' + _POKERS[newPokerId].color + _POKERS[newPokerId].num));
        myPokers.push(newPokerId);
        listMyPokers(myPokers);
        if (reNum == gamerNum - 1) {
            dropPokers();

        }
    });
    //没有收到牌
    socket.on('accept nopoker',
    function(name) {
        reNum++;
        $('#gameMessageArea').prepend($('<p>').text(name + '没有牌给你 '));
        if (reNum == gamerNum - 1) {
            dropPokers();
        }
    });
    //扔牌
    function dropPokers() {
        hasCardsInRow = false;
        hasTripleCards = false;
        dropNum = 0;
        dropList = [];
        detectTripleCards();
        $('#dropArea').show(300)
        $('#btn_cancel').hide(300);
        for (var i = 0; i < myPokers.length; i++) {
            var pid = "#p" + myPokers[i];
            $(pid).removeClass('drapablePoker');
            $(pid).unbind();
            $(pid).bind("click",
            function(e) {
                $(e.target).addClass('drapablePoker');
                $('#btn_cancel').css('display','inline');
                dropNum++;
                var dropId = e.target.id.substring(1);
                dropList.push(dropId);
                $(e.target).unbind();
            });
        }
    }

    //检测有没有三张的
    function detectTripleCards(){
        for(i=0;i<myPokers.length-2;i++){
            if(myPokers[i+1]-myPokers[i]==1 && myPokers[i+2]-myPokers[i+1]==1){
                hasCardsInRow = true;
                break;
            }
        }
        for(i=0;i<myPokers.length;i++){
            var count = 0;
            if(myPokers[i]>20){ break;}
            for(j=i+1;j<myPokers.length;j++){
                if(myPokers[i]%10 == myPokers[j]%10){ count++;}
            }
            if(count >= 2){
                hasTripleCards = true;
            }
        }

    }
    //删除牌
    function delPoker(id) {
        for (var i = 0; i < myPokers.length; i++) {
            if (myPokers[i] == id) {
                myPokers.splice(i, 1);
                listMyPokers(myPokers);
                break;
            }
        }
    }
    //点击出牌按钮
    $('#btn_drop').click(function() {
        switch(dropList.length){
            case 1:
                if(hasCardsInRow && hasTripleCards){
                    alert("你有三张相连的也有三张相同数字的牌，请出3张");
                }else if(hasCardsInRow){
                    alert("你有三张相连的牌，请出3张");
                }else if(hasTripleCards){
                    alert("你有三张相同数字的牌，请出3张");
                }else{
                    socket.emit('drop onePoker', dropList[0]);
                    delPoker(dropList[0]);
                    listMyPokers(myPokers);
                    dropList = [];
                    $('#dropArea').hide(300);
                    $('#guessArea').hide(300);
                }
                break;
            case 3:
                if(isThreeOk(dropList)){
                    socket.emit('drop firstPoker', dropList[0]);
                    socket.emit('drop otherPoker', dropList);
                    for (var i = 0; i < 3; i++) {
                        delPoker(dropList[i]);
                    }
                    listMyPokers(myPokers);
                    dropList = [];
                    $('#dropArea').hide(300);
                    $('#guessArea').hide(300);
                }else{
                    alert('这三张牌不符合3张相连或者3张相同数字');
                }
                break;
            default:
                alert('扔牌数量不对');
                break;
        }
    });
    function isThreeOk(pokerList){
        var tmp_pokerList = pokerList.slice(0);
        tmp_pokerList.sort(sortNumber);
        if(tmp_pokerList[2]-tmp_pokerList[1]==1 && tmp_pokerList[1]-tmp_pokerList[0]==1){
            return true;
        }else if(tmp_pokerList[0]%10 == tmp_pokerList[1]%10 && tmp_pokerList[1]%10 == tmp_pokerList[2]%10){
            return true;
        }else{ return false;}
    }
    function sortNumber(a,b)
    {
        return a - b
    }
    //guess!
    $('#btn_guess').click(function() {
        var g = confirm('猜错就输了哦~确定要猜么？');
        if(g == true){
            var color = $('#guessColor').val();
            var num = $('#guessNum').val();
            var id = (_COLOR[color] + num) * 1;
            socket.emit('guess', {
                pokerid: id,
                who: nickName
            });
        }else{ return false}
    });
    //猜测结果
    socket.on('bingo',
    function(data) {
        if (data.who == nickName) {
            alert('恭喜你！你抓住了凶手！');
            gameOver();

        } else {
            var resultShow = '神探' + data.who + '抓住了凶手' + formatPoker(data.pokerid);
            $('#gameMessageArea').html(resultShow);
            alert('神探' + data.who + '抓住了凶手');
            gameOver();
        }
    });
    //猜错了
    socket.on('guess failed',
    function(data) {
        if (data.who == nickName) {
            $('#gameMessageArea').prepend($('<p>').text('你猜错了~~'));
            socket.emit('show my pokers', {
                pokers: myPokers,
                who: nickName
            });
            var pNum = myPokers.length;
            for (j = pNum - 1; j >= 0; j--) {
                delPoker(myPokers[j]);
            }
            $('#guessArea').hide(300);
            $('#selectArea').hide(300);
            $('#dropArea').hide(300);
        } else {
            $('#gameMessageArea').prepend($('<p>').html('小伙伴' + data.who + '猜' + formatPoker(data.pokerid) + '猜错了'));
        }
    });
    //监听扔牌
    socket.on('one of three',
    function(data) {
        $('#gameMessageArea').prepend($('<p>').html(data.who + '扔了' + _POKERS[data.pokerid].color + _POKERS[data.pokerid].num + '和另外两张'));
    });
    socket.on('others poker',
    function(data) {
        $('#gameMessageArea').prepend($('<p>').html('我扔了' + formatPoker(data[0]) + ' ' + formatPoker(data[1]) + ' ' + formatPoker(data[2])));
    });
    socket.on('only onePoker',
    function(data) {
        $('#gameMessageArea').prepend($('<p>').html(data.who + '扔了' + formatPoker(data.pokerid)));
    });
    //展示输的手牌
    socket.on('show its pokers',
    function(data) {
        var pokerString = "";
        for (i = 0; i < data.pokers.length; i++) {
            pokerString += formatPoker(data.pokers[i]) + " ";
        }
        $('#gameMessageArea').prepend($('<p>').html(data.who + '扔了' + pokerString));
    });

    
    //监听游戏结束
    socket.on('game over',
    function() {
        gameOver();
    });

    //游戏结束
    function gameOver() {
        $('#selectArea').hide(300);
        $('#dropArea').hide(300);
        $('#guessArea').hide(300);
        $('#pokerList').html('');
        $('#btn_ready').show(300)
    }
    //点击重新选择按钮
    $('#btn_cancel').click(function() {
        dropPokers();
    });

    //记录table
    $('.record').click(function(e) {
        var curIcon = $(this).html();
        switch (curIcon) {
        case "":
            $(this).html('X');
            break;
        case "X":
            $(this).html('?');
            break;
        case "?":
            $(this).html("&#8730;");
            break;
        default:
            $(this).html("");
            break;
        }
    });
    //id向扑克转换
    function formatPoker(id) {
        return _POKERS[id].color + _POKERS[id].num
    }
     //监听showmessage
     
    /*socket.on('show message',
    function(data) {
        $('#messages').prepend($('<li>').text(data.who + ":" + data.msg));
    });
    function send_message() {
        if ($('#input_msg').val()) {
            socket.emit('send message', {
                msg: $('#input_msg').val(),
                who: nickName
            });
            $('#input_msg').val('');
            return false;
        } else {
            return false;
        }
    }
    //点击发送向后台发送消息
    $("#btnSend").click(send_message);
    //按键控制
    document.onkeydown = function() {
        keydown()
    }
    function keydown() {
        if (event.keyCode == 13) {
            send_message();
        }
    }*/

});