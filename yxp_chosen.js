 function init_serial_trim_model(obj) {

    var apiurl = 'http://padapi.youxinpai.com';
    var settings = {
        id:'yxp_chosen_target',//select element id
        searchbar:true, //是否显示搜索框
        footbar:true, //是否显示底部
        height:200, //默认高度
        items:[
            {
                id:'yxp_sel_serial',
                width:200,
                dataurl:apiurl+'/api_car/yxp_serial_model_trim//?jsoncallback=?&',
                params:{'type':'serial'},
                group:false,
                valuefield:'fld_serialid',
                showfield:'fld_serial',
                defaulthtml:'请选择品牌',
                searchbar_change:function(target,settings,bar){
                    var keyword = bar.val();
                    var itemindex = bar.parent().siblings('ul').attr('itemindex');
                    keyword = keyword.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
                    var params = {'k':keyword,'t':'1','type':'3'};
                    var bar1 = bar;
                    $.getJSON(apiurl+'/api/api_public/yxp_key_spell/?jsoncallback=?&', params, function(json, textStatus) {
                        bar1.parent().siblings('ul').find('li[class=group]').hide();
                        var li_list = bar1.parent().siblings('ul').find('li[class!=group]');
                        for (i = 0; i < li_list.length; i++ ) {
                            var a_text = $(li_list[i]).text();
                            if(!keyword || $.inArray(a_text, json) >= 0 ){
                                $(li_list[i]).show();
                                $(li_list[i]).prevAll('li[class=group]:first').show();
                            }else{
                                $(li_list[i]).hide();
                            }
                        };
                    });
                  

                }
            },
            {
                id:'yxp_sel_model',
                dataurl:apiurl+'/api_car/yxp_serial_model_trim/?jsoncallback=?&',
                width:200,
                group:true,
                valuefield:'carmodelid',
                showfield:'fld_model',
                params:{'type':'model'},
                defaulthtml:'请先选择车系'
            },
            {
                id:'yxp_sel_trim',
                dataurl:apiurl+'/api_car/yxp_serial_model_trim/?jsoncallback=?&',
                width:300,
                group:true,
                valuefield:'cartrimid',
                showfield:'fld_trim',
                params:{'type':'trim'},
                defaulthtml:'请先选择车型'
            }
        ]
    };
    obj.yxp_chosen(settings);
}