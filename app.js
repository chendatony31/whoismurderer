$(document).ready(function() {
    var socket = io.connect('http://42.202.146.184:3000/game'); 
    socket.on('server is Ok',
    function() {
        console.log('连接上了');
        $('#loading').css("display", "none");
        $('#welcomeStage').css("display", "block");
    });
    
    var nickName;
    var whosTurn;
    var gamerNum;
    var roomNum;
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
    $("#btn_checkNickName").click(function(){
        if ($('#input_nickname').val()) {
            nickName = $('#input_nickname').val();
            userlogin(nickName);
        }
    });
    $("#btn_loginThisRoom").click(function(){
        roomNum = $('#input_roomnum').val();
        if (!isNaN(roomNum) && roomNum != "") {
            socket.emit('user loginRoom', [roomNum,nickName]);        
        }else{
            alert('房间号填数字');
        }
    });
    $("#btn_createNewRoom").click(function(){
        socket.emit('create new room',nickName);
    });


    function userlogin(nickName) {
            socket.emit('check nickName', nickName);
    }

    socket.on('login okornot',function(data){
        if(data){
            $('#nickNameLogin').css("display", "none");
            $('#roomNumLogin').css("display", "block");
            
            //localStorage.nickName = nickName;
        }else{ alert('用户名重复');}
    });


    //用户登录进来了
    socket.on('user inRoom',function(data){
        //alert(data[0] + ',' + data[1]); 
        $('#welcomeStage').css("display", "none");
        $('#gameStage').css("display", "block");
        $('#userList').html('');
        var userlist = data[1];
        roomNum = data[0];
        gameOver();
        for (i = 0; i < data[1].length; i++) {
            $('#userList').append($('<li>').text(data[1][i]));
        }
        $('#userNum').html(data[1].length);
        $('#roomNum').html(roomNum);
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

        $('#gameMessageArea').html('');
        $('.record').html('');
        socket.emit('im ready');
        $('#btn_ready').css('display', 'none');
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
        myPokers.sort(function(a, b) {
            return a - b
        });
        for (i = 0; i < myPokers.length; i++) {
            $('#pokerList').append($('<li>').html(_POKERS[myPokers[i]].color + _POKERS[myPokers[i]].num).attr({
                "id": 'p' + myPokers[i],
                "val": myPokers[i]
            }));
        }
    }
    //监听游戏轮到谁了
    socket.on('whos turn',
    function(who) {
        //alert(who);
        if (who == nickName) {
            $('#selectArea').css('display', 'block');
            $('#guessArea').css('display', 'block');
        }
        whosTurn = who;
        $('#gameMessageArea').prepend($('<p>').text(whosTurn + ' 开始要牌'));
    });
    //要牌
    $('#selectArea input').click(function(e) {
        var choice = e.target.id;
        socket.emit('user order', choice);
        reNum = 0;
        $('#selectArea').css('display', 'none');
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
        $('#dropArea').css('display', 'block');
        $('#btn_cancel').css('display','none');
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
                    $('#dropArea').css('display', 'none');
                    $('#guessArea').css('display', 'none');
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
                    $('#dropArea').css('display', 'none');
                    $('#guessArea').css('display', 'none');
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
        pokerList.sort(sortNumber);
        if(pokerList[2]-pokerList[1]==1 && pokerList[1]-pokerList[0]==1){
            return true;
        }else if(pokerList[0]%10 == pokerList[1]%10 && pokerList[1]%10 == pokerList[2]%10){
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
            $('#guessArea').css('display', 'none');
            $('#selectArea').css('display', 'none');
            $('#dropArea').css('display', 'none');
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
        $('#selectArea').css('display', 'none');
        $('#dropArea').css('display', 'none');
        $('#guessArea').css('display', 'none');
        $('#pokerList').html('');
        $('#btn_ready').css('display', 'block');
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