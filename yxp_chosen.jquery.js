(function($) {
    $.fn.yxp_chosen = function(options) {
        var opts = init_settings($.fn.yxp_chosen.defaults,options);
        $this = $(this);
        if(opts.items.length>0){
            add_container_items($(this),opts);
            change_ul($(this),opts,0,{});
        }
        $(this).bind(opts.tevent,function(){
            if(opts.enable){
                if( $("#"+opts.id).length>0 ){
                    reset_position($(this),opts);
                    $("#"+opts.id).show();

                }
            }
        });
        $this.init_text = $this.text();
        $this.get_value = function(index){
            if(typeof index == 'undefined'){
                var val = [];
                for(i=0;i<opts.items.length;i++){
                    val.push($("#"+opts.items[i].id).val());
                }
                return val;
            }
            if($("#"+opts.items[index].id).length>0){
                return $("#"+opts.items[index].id).val();
            }
            return "";
        }
        $this.get_text = function(index){
            if(typeof index == 'undefined'){
                var val = [];
                for(i=0;i<opts.items.length;i++){
                    val.push($("#"+opts.items[i].id).attr('textstr'));
                }
                return val;
            }
            if($("#"+opts.items[index].id).length>0){
                return $("#"+opts.items[index].id).attr('textstr');
            }
            return "";
        }
        $this.get_data = function(index){
            var data = "{}";
            if($("#"+opts.items[index].id).length>0){
                data = $("#"+opts.items[index].id).attr('datastr');
            }
            return  $.parseJSON(data);;
        }
        $this.enable = function(enable){
            if(typeof enable == 'undefined'){
                return opts.enable;
            }else{
                return opts.enable = enable;
            }
        }
        $this.hide = function(){
            $("#"+opts.id).hide();
        }
        $this.show = function(){
            $("#"+opts.id).show();
        }
        var data = {target:$this,settings:opts};
        $this.cancel = function(){
            chosen_hide({data:data});
            reset_chosen({data:data});
        }
        var sel_a = "#"+opts.id+' .yxp_chosen_item ul li a';
        var sel_search = "#"+opts.id+' .yxp_chosen_search_bar>input';
        $(document).on('click', sel_a ,data, function(event) {
            event.preventDefault();
            a_click(event.data.target,event.data.settings,$(this));
        });
        $(document).on('click',"#"+opts.id+" .yxp_chosen_colse",data,function(event){
            event.preventDefault();
            chosen_hide(event);
            reset_chosen(event);
        });
        $(document).on('keyup', sel_search,data, function(event) {
            event.preventDefault();
            searchbar_change(event.data.target,event.data.settings,$(this));
        });
        $(document).on('click', "#"+opts.id+" .yxp_chosen_confirm",data, function(event) {
            event.preventDefault();
            btn_confirm(event,$(this));
        });

        return $this;
    }

    $.fn.yxp_chosen.defaults = {
        id:'',//插件根容器的id，避免页面同时出现多个yxp_chosen ，如果不传入，随机生成
        tevent:'click', //插件触发的事件函数
        enable:true, //插件触发的事件函数
        position:{ }, //插件与目标元素的相对位置
        searchbar:true, //是否显示搜索框
        footbar:true, //是否显示底部footbar
        cancel:true,
        height:200, //插件整体的默认高度
        footbar_btn_callback:function(event,seltext){
            event.data.target.text(seltext);
        },
        items_default:{
            id:'yxp_chosen_0', //存储select选中值得隐藏域id
            name:'yxp_chosen_0',//存储select选中值得隐藏域name
            width:200, //每一个select框默认宽度 
            defaulthtml:'请选择', //select内容没有加载时和没有选中时的提示默认文本
            dataurl:'', // 获取数据的url ，必须返回一个json格式的数组 支持jsonp
            params:{}, // 需要附加在datarul上的参数
            group:false, // 是否分组显示，如果分组，dataurl中返回的数据多嵌套一层分组数组
            valuefield:'',//dataurl返回结果中 需要绑定到option上的value字段
            value:'',//需要设置的默认值
            showfield:'', //dataurl返回结果中 需要绑定到option上的text字段 即option中显示的文本
            click_callback:function(target,settings,option){
                //option点击时触发的事件
                //target：绑定yxp_chosen的目标对象
                //settings：当前yxp_chosen的配置信息
                //option：当前点击的option对象
            }
        },
        items:[] // 是多个以items_default为模板的数组，定义几个就会创建出几个select，具体定义参见item_default
    };
    /**
     * 创建根容器
     * @param  {[type]} target   [description]
     * @param  {[type]} settings [description]
     * @return {[type]}          [description]
     */
    function creat_container(target,settings){
        $("#"+settings.id).remove();
        var w = 0;
        for (var i = 0; i < settings.items.length; i++) {
            w += settings.items[i].width + 4;
        };
        var top = settings.position.top ? 'top:' + settings.position.top + 'px;' : '';
        var left = settings.position.left ? 'left:' + settings.position.left + 'px;' : '' ;
        var style = top + left + "width:" + w + "px;display:none;";
        var container_props = {
            'id':settings.id,
            'class':'yxp_chosen_container',
            'style': style
        };
        target.after($("<div />",container_props));
    }
    /**
     * 根据配置项添加item
     * @param {[type]} target    [description]
     * @param {[type]} settings  [description]
     * @param {[type]} itemindex [description]
     * @param {[type]} params    [description]
     */
    function add_container_items(target,settings){
        creat_container(target,settings);
        var itemlen = settings.items.length;
        for(i=0;i<itemlen;i++){
            create_item_div(target,settings,i);
        }
    }
    /**
     * 创建单个select框
     * @param  {[type]} target      [description]
     * @param  {[type]} settings    [description]
     * @param  {[type]} itemindex   [description]
     * @param  {[type]} paramarr    [description]
     * @param  {[type]} itemdefault [description]
     * @return {[type]}             [description]
     */
    function create_item_div(target,settings,itemindex){
        var item = settings.items[itemindex];
        if(!item){
            return ;
        }
        var props = {
            'id':item.id+"_container",
            'class' : 'yxp_chosen_item',
            'style' : 'height:'+(settings.height+3)+"px;width:"+ (item.width ? item.width : settings.width ) +"px;"
        }
        var div = $("<div />", props );
        if(settings.searchbar){
            div = creat_searchbar(target,settings,div);
        }
        $("#"+settings.id).append(div);
        if(itemindex == (settings.items.length-1) && $("#"+settings.id+"_foot_bar").length<=0){
            $("#"+settings.id).append(create_footbar(target,settings));
        }
        create_msgbar(target,settings);
    }
    /**
     * 创建和更新select options
     * @param  {[type]} target    [description]
     * @param  {[type]} settings  [description]
     * @param  {[type]} itemindex [description]
     * @param  {[type]} paramarr  [description]
     * @return {[type]}           [description]
     */
    function change_ul(target,settings,itemindex,paramarr){
        for(i=itemindex;i<settings.items.length;i++){
            var item = settings.items[i];
            var v_input_id = settings.items[i].id;
            var v_input_value = settings.items[i].value;
            var n_input_id = settings.items[i].name;
            var value_input = $("<input />",{'type':'hidden','value':v_input_value,'textstr':'','datastr':'{}','id':v_input_id,'name':n_input_id})
            if(i>itemindex ){
                var ul = $("<ul />",{'style':'height:'+ (settings.height - 22 )+"px;width:"+ (item.width ? item.width : settings.width ) +"px;"});
                ul.attr('itemindex',i);
                var height = settings.height-50;
                var style = {
                    'style':'height:'+height+'px;text-align:center;line-height:'+height+'px;'
                };
                var li = $("<li />",style).text(item.defaulthtml);
                $("#"+item.id+"_container ul").remove();
                $("#"+item.id+"_container").append(ul.append(li))
                if($("#"+v_input_id).length<=0){
                    $("#"+item.id+"_container").append(value_input);
                }else{
                    $("#"+v_input_id).attr({
                        value: '',
                        textstr: '',
                        datastr: '{}'
                    });
                }
            }else{
                if(!item.dataurl){
                    alert('item.dataurl is not define');
                    return false;
                }
                var params = $.extend(paramarr, item.params);
                var that1_itemindex = itemindex;
                var target1 = target;
                var settings1 = settings;
                var item1 = item;
                var value_input1 = value_input;
                $.getJSON(item1.dataurl, params , function(json, textStatus) {
                    var ul = $("<ul />",{'style':'height:'+ (settings1.height - 22 )+"px;width:"+ (item1.width ? item1.width : settings1.width ) +"px;"});
                    ul.attr('itemindex',that1_itemindex);
                    try{
                        //是否分组显示
                        if(settings1.items[that1_itemindex].group){
                            $.each(json,function(index, el) {
                                var group_li = $("<li />",{'class':'group'});
                                var group = $("<group />");
                                ul.append(group_li.append(group.text(index)));
                                $.each(el, function(key, val){
                                    var li = create_li(target1,settings1,key,val,item1);
                                    ul.append(li);
                                });
                            });
                        }else{
                            $.each(json, function(key, val){
                                var li = create_li(target1,settings1,key,val,item1);
                                ul.append(li);
                            });
                        }
                        var v_input_id = settings1.items[that1_itemindex].id;
                        var v_input_value = settings1.items[that1_itemindex].value;
                        var n_input_id = settings1.items[that1_itemindex].name;
                        var value_input = $("<input />",{'type':'hidden','value':v_input_value,'textstr':'','datastr':'{}','id':v_input_id,'name':n_input_id})
                        $("#"+item1.id+"_container ul").remove();
                        $("#"+item1.id+"_container").append(ul)
                        if($("#"+v_input_id).length<=0){
                            $("#"+item1.id+"_container").append(value_input);
                        }else{
                            $("#"+v_input_id).attr({
                                value: '',
                                textstr: '',
                                datastr: '{}'
                            });
                        }
                        //设置默认值 模拟点击
                        if(v_input_value){
                            var curr_a = $("#"+item1.id+"_container ul li[class!='group'] a[value='"+v_input_value+"']");
                            if(curr_a.length>0){
                                a_click(target1,settings1,curr_a);
                                return ;
                            }
                        }
                        change_footbar(target1,settings1,that1_itemindex,"");
                    }catch(e){
                        alert(e);
                    }
                });
            }
        }
    }
    /**
     * 创建行内li和a标签
     * @param  {[type]} target   [description]
     * @param  {[type]} settings [description]
     * @param  {[type]} key      [description]
     * @param  {[type]} val      [description]
     * @param  {[type]} item     [description]
     * @return {[type]}          [description]
     */
    function create_li(target,settings,key,val,item){
        var li = $("<li />");
        var a = $('<a />') ;
        if(typeof val == 'object'){
            $.each(val, function(k, field) {
                if(item.showfield == k ){
                    a.text(field).attr('title',field);
                }
                if(item.valuefield == k){
                    a.attr('value',field);
                }
            });
            a_data = O2String(val);
            a.attr('data',a_data);
        }else if(typeof val == 'string'){
            a.text(val).attr('title',val);
            a.attr('value',key);
            a.attr('data',"{\""+key+"\":\""+val+"\"}");
        }
        return li.append(a)
    }
    /**
     * 创建搜索框
     * @param  {[type]} target   [description]
     * @param  {[type]} settings [description]
     * @param  {[type]} item     [description]
     * @return {[type]}          [description]
     */
    function creat_searchbar(target,settings,item){
        var searchbar = $('<div />',{'class':'yxp_chosen_search_bar'});
        var searchbar_input = $('<input />',{'style':'width:'+(item.width()-50)+"px;"});
        searchbar = searchbar.prepend(searchbar_input);
        item.prepend(searchbar);
        return item;
    }
    /**
     * 搜索框事件
     * @param  {[type]} target   [description]
     * @param  {[type]} settings [description]
     * @param  {[type]} bar      [description]
     * @return {[type]}          [description]
     */
    function searchbar_change(target,settings,bar){
        var keyword = bar.val();
        var itemindex = bar.parent().siblings('ul').attr('itemindex');
        if(typeof settings.items[itemindex].searchbar_change == 'function'){
            settings.items[itemindex].searchbar_change(target,settings,bar);
        }else{
            keyword = keyword.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
            bar.parent().siblings('ul').find('li[class=group]').hide();
            var li_list = bar.parent().siblings('ul').find('li[class!=group]');
            for (i = 0; i < li_list.length; i++ ) {
                var a_text = $(li_list[i]).text();
                regex = new RegExp(keyword, 'i');
                if(regex.test(a_text)){
                    $(li_list[i]).show();
                    $(li_list[i]).prevAll('li[class=group]:first').show();
                }else{
                    $(li_list[i]).hide();
                }
            };
        }
    }
    /**
     * 点击选项事件
     * @param  {[type]} target   [description]
     * @param  {[type]} settings [description]
     * @param  {[type]} item_a   [description]
     * @return {[type]}          [description]
     */
    function a_click(target,settings,item_a){
        var ind = item_a.parent().parent().attr('itemindex');
        var attrstr = item_a.attr('data');
        var attr = $.parseJSON(attrstr) ;
        var v_input_id = settings.items[ind].id;
        $("#"+v_input_id).attr({
            value: item_a.attr('value'),
            textstr: item_a.text(),
            datastr: attrstr
        });
        item_a.parent().siblings('.yxp_chosen_curr_liitem').removeClass('yxp_chosen_curr_liitem');
        item_a.parent().addClass('yxp_chosen_curr_liitem');
        change_ul(target,settings,parseInt(ind)+1,attr);
        change_footbar(target,settings,ind,item_a.text());
        //触发回调函数
        if(typeof settings.items[ind].click_callback == 'function'){
            settings.items[ind].click_callback(target,settings,item_a);
        }
    }
    /**
     * 创建底部foot_bar
     * @param  {[type]} target   [description]
     * @param  {[type]} settings [description]
     * @return {[type]}          [description]
     */
    function create_footbar(target,settings){
        var fid = settings.id+"_foot_bar";
        var w = $("#"+settings.id).width() - 14 ;
        var footbar = $('<div />',{'id': fid,'class':'yxp_chosen_foot_bar','width':w});
        var dsp = settings.items.length>1 ? "inline" : "none";
        var footbar_text = $("<span />",{id:fid+'_text','style':'display:'+dsp}).text("当前选择：");
        footbar.append(footbar_text);
        var footbar_btn = $("<span />",{id:fid+'_btn'})
        var textstr_1 = $("<input />",{'class':'foot_bar_btn yxp_chosen_confirm','type':'button','value':'确定'});
        var textstr_2 = $("<input />",{'class':'foot_bar_btn yxp_chosen_colse','type':'button','value':'取消'});
        if(!settings.cancel){//是否显示取消按钮
            textstr_2.hide();
        }
        footbar_btn.append(textstr_1).append(textstr_2);
        footbar.append(footbar_btn);
        //是否隐藏foot_bar
        if(!settings.footbar){
            footbar.hide();
        }
        return footbar;
    }
    /**
     * 更新底部foot_bar
     * @param  {[type]} target    [description]
     * @param  {[type]} settings  [description]
     * @param  {[type]} itemindex [description]
     * @param  {[type]} a_text    [description]
     * @return {[type]}           [description]
     */
    function change_footbar(target,settings,itemindex,a_text){
        var $footbar = $("#"+settings.id+"_foot_bar");
        for(i=(settings.items.length-1);i>=itemindex;i--){
            var textid = "#" + settings.items[i].id + "_seltext";
            $(textid).remove();
        }
        var textid = settings.items[itemindex].id + "_seltext";
        var sp = itemindex == 0 ? "" : " ";
        if($("#"+textid).length<=0){
            var textstr = $("<span />",{'id':textid}).text( sp + a_text);
            $footbar.find("#"+settings.id+"_foot_bar_text").append(textstr);
        }else{
            $("#"+textid).text( sp + a_text);
        }
        return $footbar;
    }
    /**
     * 隐藏控件
     * @param  {[type]} event [description]
     * @return {[type]}       [description]
     */
    function chosen_hide(event){
        $("#"+event.data.settings.id).hide();
    }
    /**
     * 显示控件
     * @param  {[type]} event [description]
     * @return {[type]}       [description]
     */
    function chosen_show(target,settings){
        $("#"+settings.id).show();
    }
    /**
     * 创建提示框
     * @param  {[type]} target   [description]
     * @param  {[type]} settings [description]
     * @return {[type]}          [description]
     */
    function create_msgbar(target,settings){
        var msgid = settings.id+"_msg" 
        var msgbar = $("#"+msgid);
        if(msgbar.length<=0){
            msgbar = $("<div />",{'id':msgid,'class':'yxp_chosen_msg'});
        }
        $("#"+settings.id).append(msgbar);
        return msgbar;
    }
    /**
     * 显示提示框
     * @param  {[type]} event     [description]
     * @param  {[type]} itemindex [description]
     * @return {[type]}           [description]
     */
    function show_msg(event,itemindex){
        var msgid = event.data.settings.id+"_msg" 
        var msgbar = $("#"+msgid);
        msgbar.html(event.data.settings.items[itemindex].defaulthtml).show();
        var con_w = $("#"+event.data.settings.id).width();
        var left = con_w/2 - msgbar.width()/2;
        msgbar.css({left:left});
        setTimeout(function(){
            msgbar.fadeOut('fast');
        },1000)
    }
    /**
     * 选择完成之后的确定按钮事件
     * @param  {[type]} event  [description]
     * @param  {[type]} target [description]
     * @return {[type]}        [description]
     */
    function btn_confirm(event,target){
        for(var i = 0 ; i<event.data.settings.items.length;i++){
            if(!$("#" + event.data.settings.items[i].id).val()){
                show_msg(event,i);
                return false;
            }
        }
        var seltext = target.parent().prev().find('span[id$=_seltext]').text();
        event.data.settings.footbar_btn_callback(event,seltext);
        chosen_hide(event);
    }
    function O2String(O) {
        var S = [];
        var J = "";
        if (Object.prototype.toString.apply(O) === '[object Array]') {
            for (var i = 0; i < O.length; i++)
                S.push(O2String(O[i]));
            J = '[' + S.join(',') + ']';
        }
        else if (Object.prototype.toString.apply(O) === '[object Date]') {
            J = "new Date(" + O.getTime() + ")";
        }
        else if (Object.prototype.toString.apply(O) === '[object RegExp]' || Object.prototype.toString.apply(O) === '[object Function]') {
            J = O.toString();
        }
        else if (Object.prototype.toString.apply(O) === '[object Object]') {
            for (var i in O) {
                O[i] = typeof (O[i]) == 'string' ? '"' + O[i] + '"' : (typeof (O[i]) === 'object' ? O2String(O[i]) : O[i]);
                S.push('"' +i +'"' + ':' + O[i]);
            }
            J = '{' + S.join(',') + '}';
        }
        return J;
    }
    /**
     * 随机产生一个页面元素id
     * @return {[type]} [description]
     */
    function random_id(){
        var id = "yxp_chosen_"+Math.floor(Math.random() * 100000);
        while($("#"+id).length>0){
            id = "yxp_chosen_"+Math.floor(Math.random() * 100000);
        }
        return id;
    }
    /**
     * 初始化配置信息
     * @param  {[type]} defaults [description]
     * @param  {[type]} options  [description]
     * @return {[type]}          [description]
     */
    function init_settings(defaults,options){
        var opts = $.extend({}, defaults, options);
        for (var i = opts.items.length - 1; i >= 0; i--) {
            opts.items[i] = $.extend({}, defaults.items_default, opts.items[i]);
            if(!opts.items[i].id){
                opts.items[i].id = random_id();
            }
            if(!opts.items[i].name){
                opts.items[i].name = opts.items[i].id;
            }
        };
        if(!opts.id){
            opts.id = random_id();
        }
        return opts;
    }

    function reset_position(target,settings){
        var w = 0;
        for (var i = 0; i < settings.items.length; i++) {
            w += settings.items[i].width + 4;
        };
        var top = settings.position.top ? 'top:' + settings.position.top + 'px;' : '';
        var left = settings.position.left ? 'left:' + settings.position.left + 'px;' : '' ;
        var style = {'style': top + left +"width:"+w+"px;display:none;"};
        $("#"+settings.id).attr(style);
    }

    function reset_chosen(event){
        change_ul(event.data.target,event.data.settings,0,{});
        event.data.settings.footbar_btn_callback(event,event.data.target.init_text);
    }
   


})(jQuery);  