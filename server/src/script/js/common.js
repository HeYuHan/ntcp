var Common = function(){


    function card(type,value,tag)
    {
        this.type = type;
        this.value = value;
        this.tag = tag;
        this.count = 1;
    }


    function pai(type,num,tag)
    {
        this.type = type;
        this.num = num;
        this.tag = tag;
        this.check = 1<<0;
        this.brother = new Array(3);
        this.parent = null;
        this.reset = function(){
            this.check= 1<<0;
            for (var i = 0; i < this.brother.length; i++)
            {
                this.brother[i] = null;
            }
            this.parent = null;
        }
    }

    var pai_list = [];
    var is_win = false;
    var last_node = null;
    var results = [];
    function reset(){
        is_win = false;
        for(var i =0;i<pai_list.length;i++)
        {
            pai_list[i].reset();
        }
    }

    
    var PaiType={
        PAI_WANG:1,
        PAI_TIAO:2,
        PAI_BING:3,   
        PAI_HONG:4,
        PAI_BAI:5,
        PAI_QIAN:6,
        PAI_XI:7
    }


    function create_pai(value){
        if(value<41){
            var ret={};
            ret.value=value%10;
            ret.type= (ret.value == 0)?PaiType.PAI_HONG:PaiType.PAI_WANG;
            return ret;
        }
        else if(value<81){
            var ret={};
            ret.value=value%10;
            ret.type= (ret.value == 0)?PaiType.PAI_BAI:PaiType.PAI_TIAO;
            return ret;
        }
        else if(value<121){
            var ret={};
            ret.value=value%10;
            ret.type= (ret.value == 0)?PaiType.PAI_QIAN:PaiType.PAI_BING;
            return ret;
        }
        else{
            var ret={};
            ret.value=value-120;
            ret.type= PaiType.PAI_XI;
            return ret;
        }
    }

    function check(p){
    
        clear_brother(p);
        switch(p.check)
        {
            case 1<<0:
                check_1(p);
                break;
            case 1<<1:
                check_2(p);
                break;
            case 1<<2:
                check_3(p);
                break;
            default:
                check_last(p);
                break;   
        }
    }
    function check_next(p)
    {
        for (var i = 0; i < pai_list.length; i++)
        {
            if (pai_list[i].check == 1<<0)
            {
                pai_list[i].parent = p;
                last_node = pai_list[i];
                check(last_node);
                return;
            }
        }
        result(true);
        last_node.check = last_node.check << 1;
        check(last_node);
    }

    function check_last(p)
    {
        clear_brother(p);
        if (p.parent != null)
        {
            p.check = 1 << 0;
            last_node = p.parent;
            check(last_node);
        }
        else
        {
            result(false);
        }
    }

    function check_1(p) {
        p.check = 1 << 1;
        check_brother(p, 1);
        if (p.brother[0] != null && p.brother[1] != null)
        {
            check_next(p);
        }
        else
        {
            check(p);
        }
    }

    function check_2(p) {
        p.check = 1 << 2;
        check_brother(p, 2);
        if (p.brother[0] != null && p.brother[1] != null)
        {
            check_next(p);
        }
        else
        {
            check(p);
        }
    }

    function check_3(p)
    {
        p.check = 1 << 3;
        check_brother(p, 3);
        if (p.brother[0] != null && p.brother[1] != null && p.brother[2] != null)
        {
            check_next(p);
        }
        else
        {
            check(p);
        }
    }

    function clear_brother(p)
    {
        for (var i = 0; i < p.brother.length; i++)
        {
            if (p.brother[i] != null)
            {
                p.brother[i].check = 1 << 0;
            }
            p.brother[i] = null;
        }
    }

    function check_brother(p,index)
    {
        switch (index)
        {
            case 1: 
                {
                    for (var i = 0; i < pai_list.length; i++)
                    {
                        if (pai_list[i].check != (1 << 0))
                            continue;
                        if (pai_list[i].type == p.type && pai_list[i].num == p.num + 1)
                        {
                            p.brother[0] = pai_list[i];
                            p.brother[0].check = 1 << 4;
                            for (var j = i+1; j < i+4; j++)
                            {
                                if (j >= pai_list.length)
                                    break;
                                if (pai_list[j].check != (1 << 0))
                                    continue;
                                if (pai_list[j].type == p.type && pai_list[j].num == p.num + 2)
                                {
                                    p.brother[1] = pai_list[j];
                                    p.brother[1].check = 1 << 4;
                                    break;
                                }
                            }
                            break;
                        }
                    }
                }
                break;
            case 2: 
                {
                    for (var i = 0; i < pai_list.length; i++)
                    {
                        if (pai_list[i].check != (1 << 0))
                            continue;
                        if (i > pai_list.length - 2)
                            break;
                        if (pai_list[i].type == p.type && pai_list[i].num == p.num)
                        {
                            if (pai_list[i + 1].type == p.type && pai_list[i + 1].num == p.num)
                            {
                                p.brother[0] = pai_list[i];
                                p.brother[0].check = 1 << 4;
                                p.brother[1] = pai_list[i+1];
                                p.brother[1].check = 1 << 4;
                                break;
                            }
                        }
                    }
                }
                break;
            case 3:
                {
                    for (var i = 0; i < pai_list.length; i++)
                    {
                        if (pai_list[i].check != (1 << 0))
                            continue;
                        if (i > pai_list.length - 3)
                            break;
                        if (pai_list[i].type == p.type && pai_list[i].num == p.num)
                        {
                            if (pai_list[i + 1].type == p.type && pai_list[i + 1].num == p.num)
                            {
                                if (pai_list[i + 2].type == p.type && pai_list[i + 2].num == p.num)
                                { 
                                    p.brother[0] = pai_list[i];
                                    p.brother[0].check = 1 << 4;
                                    p.brother[1] = pai_list[i + 1];
                                    p.brother[1].check = 1 << 4;
                                    p.brother[2] = pai_list[i + 2];
                                    p.brother[2].check = 1 << 4;
                                    break;
                                    }
                            }
                        }
                    }
                }
                break;
        }
    }


    function result(tag) {
        is_win = tag;
        var ret = [];
        if (is_win)
        {
            for (var i = 0; i < pai_list.length; i++)
            {
                var p = pai_list[i];
                if (p.brother[0] != null)
                {
                    var text = getString(p);
                    for (var j = 0; j < p.brother.length; j++)
                    {
                        if (p.brother[j] != null)
                            text += ',' + getString(p.brother[j]);
                    }
                    ret.push(text);
                }
            }
            results.push(ret);
        }
    }

    function getString(p)
    {
        return "{" + p.type + "," + p.num +","+ p.tag+"}";
    }

    
    function sort_pai_list(p1,p2){
        if(p1.type==p2.type)
        {
            if(p1.num==p2.num)
            {
                return p1.tag-p2.tag;
            }
            else
                return p1.num-p2.num;
        }
        else
            return p1.type-p2.type;
    }

    function sort_card_list(p1,p2){
        if(p1.type==p2.type)
        {
            if(p1.value==p2.value)
            {
                return p1.tag-p2.tag;
            }
            else
                return p1.value-p2.value;
        }
        else
            return p1.type-p2.type;
    }

    this.get_pai = function(value){
        var ret = create_pai(value);
        return new card(ret.type,ret.value,value);
    }

    this.get_pai_list = function(list){
        var card_list = [];
        for(var i = 0;i<list.length;i++)
        {
            var ret = create_pai(list[i]);
            card_list[i] = new card(ret.type,ret.value,list[i]);
        }
        card_list.sort(sort_card_list);
        return card_list;
    }

    this.check_win = function(list){
        pai_list = [];
        for(var i = 0;i<list.length;i++)
        {
            var ret = create_pai(list[i]);
            pai_list[i] = new pai(ret.type,ret.value,list[i]);
        }
        pai_list.sort(sort_pai_list);
        
        results=[];
        var type = 0;
        var num = 0;
        for(var i =0;i<pai_list.length;i++)
        {
            var p = pai_list[i];
            if(p.type!=type||p.num!=num)
            {
                type = p.type;
                num = p.num;
                for(var j=i+1;j<i+4;j++)
                {
                    if(j>pai_list.length-1)
                    break;
                    var p2 = pai_list[j];
                    if(p2.type == p.type&&p2.num==p.num)
                    {
                        reset();
                        p.brother[0] = p2;
                        p.check = 1<<4;
                        p2.check = 1<<4;
                        for(var k=0;k<pai_list.length;k++)
                        {
                            if(pai_list[k].check == 1<<0)
                            {
                                check(pai_list[k]);
                                break;
                            }
                        }
                        break;
                    }
                }
            }
        }
        return results;
    }

}    

module.exports = new Common();
