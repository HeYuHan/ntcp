<!DOCTYPE html>
<html lang="en" xmlns:th="http://www.thymeleaf.org">
<head>
    <meta charset="UTF-8"/>
    <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
    <meta http-equiv="X-UA-Compatible" content="ie=edge"/>
    <title>NTCP</title>
    <link rel="stylesheet" href="../bootstrap/css/bootstrap.min.css" >
    <link href="https://cdn.bootcss.com/bootstrap-table/1.12.1/bootstrap-table.min.css" rel="stylesheet">
    <link href="https://cdn.bootcss.com/x-editable/1.5.1/bootstrap3-editable/css/bootstrap-editable.css" rel="stylesheet">
    <style>
        #main-nav {
            margin-left: 1px;
        }

        #main-nav.nav-tabs.nav-stacked > li > a {
            padding: 10px 8px;
            font-size: 12px;
            font-weight: 600;
            color: #4A515B;
            background: #E9E9E9;
            background: -moz-linear-gradient(top, #FAFAFA 0%, #E9E9E9 100%);
            background: -webkit-gradient(linear, left top, left bottom, color-stop(0%,#FAFAFA), color-stop(100%,#E9E9E9));
            background: -webkit-linear-gradient(top, #FAFAFA 0%,#E9E9E9 100%);
            background: -o-linear-gradient(top, #FAFAFA 0%,#E9E9E9 100%);
            background: -ms-linear-gradient(top, #FAFAFA 0%,#E9E9E9 100%);
            background: linear-gradient(top, #FAFAFA 0%,#E9E9E9 100%);
            filter: progid:DXImageTransform.Microsoft.gradient(startColorstr='#FAFAFA', endColorstr='#E9E9E9');
            -ms-filter: "progid:DXImageTransform.Microsoft.gradient(startColorstr='#FAFAFA', endColorstr='#E9E9E9')";
            border: 1px solid #D5D5D5;
            border-radius: 4px;
        }

        #main-nav.nav-tabs.nav-stacked > li > a > span {
            color: #4A515B;
        }

        #main-nav.nav-tabs.nav-stacked > li.active > a, #main-nav.nav-tabs.nav-stacked > li > a:hover {
            color: #FFF;
            background: #3C4049;
            background: -moz-linear-gradient(top, #4A515B 0%, #3C4049 100%);
            background: -webkit-gradient(linear, left top, left bottom, color-stop(0%,#4A515B), color-stop(100%,#3C4049));
            background: -webkit-linear-gradient(top, #4A515B 0%,#3C4049 100%);
            background: -o-linear-gradient(top, #4A515B 0%,#3C4049 100%);
            background: -ms-linear-gradient(top, #4A515B 0%,#3C4049 100%);
            background: linear-gradient(top, #4A515B 0%,#3C4049 100%);
            filter: progid:DXImageTransform.Microsoft.gradient(startColorstr='#4A515B', endColorstr='#3C4049');
            -ms-filter: "progid:DXImageTransform.Microsoft.gradient(startColorstr='#4A515B', endColorstr='#3C4049')";
            border-color: #2B2E33;
        }

        #main-nav.nav-tabs.nav-stacked > li.active > a, #main-nav.nav-tabs.nav-stacked > li > a:hover > span {
            color: #FFF;
        }

        #main-nav.nav-tabs.nav-stacked > li {
            margin-bottom: 4px;
        }

        /*定义二级菜单样式*/
        .secondmenu a {
            font-size: 10px;
            color: #4A515B;
            text-align: center;
        }

        .navbar-static-top {
            background-color: #212121;
            margin-bottom: 5px;
        }

        .navbar-brand {
            background: url('') no-repeat 10px 8px;
            display: inline-block;
            vertical-align: middle;
            padding-left: 50px;
            color: #fff;
        }
    </style>
    <script src="../js/jquery.min.js"></script>
    <script src="../bootstrap/js/bootstrap.min.js"></script>
    <script src="https://cdn.bootcss.com/bootstrap-table/1.12.1/bootstrap-table.min.js"></script>
    <script src="https://cdn.bootcss.com/bootstrap-table/1.12.1/locale/bootstrap-table-zh-CN.min.js"></script>
    
    <script src="https://cdn.bootcss.com/bootstrap-table/1.12.1/extensions/editable/bootstrap-table-editable.min.js"></script>
    <script src="https://cdn.bootcss.com/bootstrap-select/1.13.0/js/bootstrap-select.min.js"></script>
    <script src="https://cdn.bootcss.com/x-editable/1.5.1/bootstrap3-editable/js/bootstrap-editable.min.js"></script>
</head>
<body>
    <div class="navbar navbar-duomi navbar-static-top" role="navigation">
        <div class="container-fluid">
            <div class="navbar-header">
                <a class="navbar-brand" href="/admin/" id="logo">后台管理系统(${nick})
                </a>
            </div>
        </div>
    </div>
    <div class="container-fluid">
        <div class="row">
            <div class="col-md-2">
                <ul id="main-nav" class="nav nav-tabs nav-stacked" style="">
                    <li class="active">
                        <a href="#">
                            <i class="glyphicon glyphicon-th-large"></i>
                            首页
                        </a>
                    </li>
                    <li>
                        <a href="#systemSetting" class="nav-header collapsed" data-toggle="collapse">
                            <i class="glyphicon glyphicon-cog"></i>
                            系统管理
                            <span class="pull-right glyphicon glyphicon-chevron-down"></span>
                        </a>
                        <ul id="systemSetting" class="nav nav-list collapse secondmenu" style="height: 0px;">
                            <li>
                                <a href="#getProxys">
                                    <i class="glyphicon glyphicon-chevron-right"></i>代理管理</a>
                            </li>
                            <li>
                                <a href="#getUsers">
                                    <i class="glyphicon glyphicon-chevron-right"></i>用户管理</a>
                            </li>
                            <!-- <li>
                                <a href="#">
                                    <i class="glyphicon glyphicon-asterisk"></i>角色管理</a>
                            </li>
                            <li>
                                <a href="#">
                                    <i class="glyphicon glyphicon-edit"></i>修改密码</a>
                            </li>
                            <li>
                                <a href="#">
                                    <i class="glyphicon glyphicon-eye-open"></i>日志查看</a>
                            </li> -->
                        </ul>
                    </li>
                    <!-- <li>
                        <a href="./plans.html">
                            <i class="glyphicon glyphicon-credit-card"></i>
                            物料管理
                        </a>
                    </li>
                    <li>
                        <a href="./grid.html">
                            <i class="glyphicon glyphicon-globe"></i>
                            分发配置
                            <span class="label label-warning pull-right">5</span>
                        </a>
                    </li>
                    <li>
                        <a href="./charts.html">
                            <i class="glyphicon glyphicon-calendar"></i>
                            图表统计
                        </a>
                    </li> -->
                    <li>
                        <a href="#">
                            <i class="glyphicon glyphicon-fire"></i>
                            关于系统
                        </a>
                    </li>
                </ul>
            </div>
            <div class="col-md-10">
                <table class="table" id="table"></table>
                <div id="toolbar" class="btn-group">
                    <button id="btn_add" type="button" class="btn btn-default">
                        <span class="glyphicon glyphicon-plus" aria-hidden="true"></span>新增
                    </button>
                    <button id="btn_edit" type="button" class="btn btn-default">
                        <span class="glyphicon glyphicon-pencil" aria-hidden="true"></span>修改
                    </button>
                    <button id="btn_delete" type="button" class="btn btn-default">
                        <span class="glyphicon glyphicon-remove" aria-hidden="true"></span>删除
                    </button>
                </div>               
            </div>
        </div>
    </div>

    <!-- 模态框（Modal） -->
    <div class="modal fade" id="userEditModal" tabindex="-1" role="dialog" aria-labelledby="myModalLabel" aria-hidden="true">
        <div class="modal-dialog">
            <div class="modal-content">
                <div class="modal-header">
                    <button type="button" class="close" data-dismiss="modal" aria-hidden="true">×
                    </button>
                    <h4 class="modal-title" id="myModalLabel">
                            详细信息
                    </h4>
                </div>
                <div class="modal-body" id="userEditBody">
                        <table class="table">
                                <caption>ID</caption>
                                <tbody>
                                    <tr class="active">
                                        <td>昵称</td>
                                        <td id="detail_nick">FFXX</td>
                                        <td></td>
                                    </tr>
                                    <tr class="success">
                                        <td>金币</td>
                                        <td id="detail_gold">8000</td>
                                        <td>
                                            <div class="input-group" >
                                                <input type="number" class="form-control" id="change_gold">
                                                <!-- <span class="input-group-btn">
                                                    <button class="btn btn-default" type="button">
                                                        确认
                                                    </button>
                                                </span> -->
                                            </div><!-- /input-group -->
                                        </td>
                                    </tr>
                                    <tr  class="warning">
                                        <td>钻石</td>
                                        <td id="detail_diamond">100</td>
                                        <td>
                                            <div class="input-group">
                                                    <input type="number" class="form-control" id="change_diamond">
                                                    <!-- <span class="input-group-btn">
                                                        <button class="btn btn-default" type="button">
                                                            确认
                                                        </button>
                                                    </span> -->
                                            </div><!-- /input-group -->
                                        </td>
                                    </tr>
                                    <tr  class="danger">
                                        <td>代理</td>
                                        <td id="detail_proxy">是</td>
                                        <td>
                                            <div class="input-group">
                                                    <!-- <input type="text" class="form-control"> -->
                                                    <div class="input-group-btn">
                                                        <button type="button" class="btn btn-default dropdown-toggle" data-toggle="dropdown">
                                                            变更
                                                            <span class="caret"></span>
                                                        </button>
                                                        <ul class="dropdown-menu pull-right" id="change_proxy">
                                                            <li><a href="#">是</a></li>
                                                            <li><a href="#">否</a></li>
                                                        </ul>
                                                    </div><!-- /btn-group -->
                                                </div><!-- /input-group -->
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                            <table class="table">
                                <caption>变更信息</caption>
                                <tbody>
                                    <tr class="success">
                                        <td>金币</td>
                                        <td id="changed_gold_value" style="color: rgb(248, 37, 0);">未变更</td>
                                    </tr>
                                    <tr  class="warning">
                                        <td>钻石</td>
                                        <td id="changed_diamond_value" style="color: rgb(248, 37, 0);">未变更</td>
                                    </tr>
                                    <tr  class="danger">
                                        <td>代理</td>
                                        <td id="changed_proxy_value" style="color: rgb(248, 37, 0);">未变更</td>
                                    </tr>
                                </tbody>
                            </table>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-primary" id="update_user">确认</button>
                    <!-- <button type="button" class="btn btn-default" data-dismiss="modal">关闭</button> -->
                    
                </div>
            </div><!-- /.modal-content -->
        </div><!-- /.modal-dialog -->
    </div><!-- /.modal -->
    <script>
        GUser={
            account:"${account}",
            level:${level},
            nick:"${nick}"
        }
    </script>
 
    <script>
            (function () {
                function init(table,url,params,titles,editable,hasCheckbox,toolbar) {
                    $(table).bootstrapTable({
                        url: url,                           //请求后台的URL（*）
                        method: 'post',                     //请求方式（*）
                        toolbar: toolbar,                   //工具按钮用哪个容器
                        striped: true,                      //是否显示行间隔色
                        cache: false,                       //是否使用缓存，默认为true，所以一般情况下需要设置一下这个属性（*）
                        pagination: true,                   //是否显示分页（*）
                        sortable: false,                    //是否启用排序
                        sortOrder: "asc",                   //排序方式
                        queryParams: queryParams,           //传递参数（*），这里应该返回一个object，即形如{param1:val1,param2:val2}
                        sidePagination: "server",           //分页方式：client客户端分页，server服务端分页（*）
                        pageNumber:1,                       //初始化加载第一页，默认第一页
                        pageSize: 20,                       //每页的记录行数（*）
                        pageList: [20, 50, 100],            //可供选择的每页的行数（*）
                        search: true,                       //是否显示表格搜索，此搜索是客户端搜索，不会进服务端，所以，个人感觉意义不大
                        strictSearch: true,
                        showColumns: true,                  //是否显示所有的列
                        showRefresh: true,                  //是否显示刷新按钮
                        minimumCountColumns: 2,             //最少允许的列数
                        clickToSelect: true,                //是否启用点击选中行
                        //height: 500,                      //行高，如果没有设置height属性，表格自动根据记录条数觉得表格高度
                        uniqueId: "uid",                     //每一行的唯一标识，一般为主键列
                        showToggle:true,                    //是否显示详细视图和列表视图的切换按钮
                        cardView: false,                    //是否显示详细视图
                        detailView: false,                  //是否显示父子表
                        editable:true,
                        columns: createCols(params,titles,editable,hasCheckbox),
                        onEditableSave:onEditableSave,
                        onDblClickRow:onDblClickRow
                        // data: [{
                        //     id: 1,
                        //     name: 'Item 1',
                        //     price: '$1'
                        // }, {
                        //     id: 2,
                        //     name: 'Item 2',
                        //     price: '$2'
                        // }]
                    });
                }
                function onDblClickRow(row) {
                    editUser(row);
                }
                function onEditableSave(field, row, oldValue, $el)
                {
                    console.log(field,row,oldValue,$el);
                }
                function createCols(params,titles,editable,hasCheckbox) {
                    if(params.length!=titles.length||titles.length!=editable.length)
                        return null;
                    var arr = [];
                    if(hasCheckbox)
                    {
                        var objc = {};
                        objc.checkbox = true;
                        arr.push(objc);
                    }
                    for(var i = 0;i<params.length;i++)
                    {
                        var obj = {};
                        obj.field = params[i];
                        obj.title = titles[i];
                        obj.editable=editable[i];
                        arr.push(obj);
                    }
                    return arr;
                }
                //可发送给服务端的参数：limit->pageSize,offset->pageNumber,search->searchText,sort->sortName(字段),order->sortOrder('asc'或'desc')
                function queryParams(params) {
                    return {   //这里的键的名字和控制器的变量名必须一直，这边改动，控制器也需要改成一样的
                        limit: params.limit,   //页面大小
                        offset: params.offset  //页码
                        //name: $("#txt_name").val()//关键字查询
                    };
                }
                // 传'#table'
                createBootstrapTable = function (table,url,params,titles,hasCheckbox,toolbar) {
                    init(table,url,params,titles,hasCheckbox,toolbar);
                }

            })();
            function editUser(row){
                var modal=$("#userEditModal");
                modal.modal('show');
                modal.find("#detail_nick").html(row.nick);
                modal.find("#detail_gold").html(row.goldCount);
                modal.find("#detail_diamond").html(row.diamondCount);
                modal.find("#detail_proxy").html(row.isProxy?"是":"否");
                var change_gold=null;
                var change_diamond=null;
                var change_proxy=null;
                $("#change_gold").on("input",function(){      //只需要找到你点击的是哪个ul里面的就行
                    var value = parseInt($(this).val());
                    change_gold=null;
                    if(value!=0)
                    {
                        change_gold=value;
                        modal.find("#changed_gold_value").html("+"+value);
                    }
                    else{
                        modal.find("#changed_gold_value").html("未变更");
                    }
                });
                $("#change_diamond").on("input",function(){      //只需要找到你点击的是哪个ul里面的就行

                    var value = parseInt($(this).val());
                    change_diamond=null;
                    if(value!=0)
                    {
                        change_diamond=value;
                        modal.find("#changed_diamond_value").html("+"+value);
                    }
                    else{
                        modal.find("#changed_diamond_value").html("未变更");
                    }
                });
                $("ul#change_proxy").on("click","li",function(){      //只需要找到你点击的是哪个ul里面的就行
                    var isProxy=$(this).text()=="是";
                    change_proxy=null;
                    if(isProxy != row.isProxy)
                    {
                        change_proxy=isProxy;
                        modal.find("#changed_proxy_value").html($(this).text());
                    }
                    else
                    {
                        modal.find("#changed_proxy_value").html("未变更");
                    }
                });
                modal.find("#update_user").click(function(){

                });
            }
            function createDropMenu(title,select){
                var div=$('<div></div>');
                var group=$('<div class="btn-group"></div>');
                var btn = $('<button type="button" class="btn btn-primary dropdown-toggle" data-toggle="dropdown">'+title+'<span class="caret"></span> </button>');
                var ul=$('<ul class="dropdown-menu" role="menu"></ul>');
                for(var i=0;i<select.length;i++){
                    var li=$('<li><a href="#">'+select[i]+'</a></li>');
                    li.appendTo(ul);
                }
                group.appendTo(div);
                btn.appendTo(group);
                ul.appendTo(group);
                return div.html();
            }
            var proxyEdit={
                // title:"代理变更",
                // type:"select",
                // source: [
                //     {value: 1, text: '是'},
                //     {value: 2, text: '否'}
                // ],
                // display:function(value,sourceData){
                //     var switch_value=value?1:2;
                //     var colors = {1: "green", 2: "red"},
                    
                //     elem = $.grep(sourceData, function(o){return o.value == switch_value;});
                //     if(elem.length) {    
                //         $(this).text(elem[0].text).css("color", colors[switch_value]); 
                //     } else {
                //         $(this).empty(); 
                //     }
                // }
                noeditFormatter:function(value,row,index){
                    return value?"是":"否";
                }
            }
            var goldAdd={
                title:"金币充值",
                noeditFormatter:function(value, row, index){
                    return '<td>'+value+'</td><td>'+createDropMenu("充值",[50,100])+'</td>';
                }
            }
            createBootstrapTable('#table','getUsers',['uid','nick','diamondCount','goldCount','isProxy'],['ID','昵称','钻石','金币','代理'],[false,false,false,false,proxyEdit],false,'#toolbar'); 
        </script>
</body>
</html>