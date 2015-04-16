谁是凶手
-----------------------------------
-----------------------------------


项目简介
-----------------------------------
> 这个项目有2部分client端 和 server端 ，server端有nodejs支持。

> 项目是一个基于socket.io的在线游戏，支持自建房间，每个房间可支持2-6人参加。


项目安装
-----------------------------------
> 下载本项目(client 端)以及 [server端 ](https://github.com/chendatony31/whoisserver)

> 通过 node install 安装服务端必须的包

> node server.js 运行socket.io服务器

> 修改 app.js 中 第二行的ip地址为你的server的ip

> 运行index.html 即可。


游戏规则
-----------------------------------
> 这是一个扑克游戏，一共28张牌，4种花色 的 1-7 

> 根据人数分给每人若干张手牌，再从剩下的牌堆里取一张为‘凶手’（游戏的目的就是猜出凶手是谁）

> 将牌堆剩余的牌亮出来 为公共牌。

> 游戏开始，由一人开始要某一个花色的牌，其他人如果有则给出其中一张，没有就算。

> 拿到牌后这个人手里如果有 同花顺的3张 或者相同数字的三张 则一定要 出3张，

> 其中一张明出来，其余两张大家不知道，如果没有以上2种的牌，则出一张并亮出来。

> 然后轮到下一个人要牌。出牌，期间轮到要牌出牌阶段的人可以猜凶手是哪张，

> 如果猜对，游戏结束； 如果猜错，此玩家的牌都要亮出，并退出比赛,其他人继续。

[游戏在线地址] (http://www.tony77.com/whois/)


[陈达的博客] (http://www.tony77.com/)


[![Bitdeli Badge](https://d2weczhvl823v0.cloudfront.net/chendatony31/whoismurderer/trend.png)](https://bitdeli.com/free "Bitdeli Badge")

