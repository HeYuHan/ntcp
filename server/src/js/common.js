
function start(){
    this.pai_list[0] = new pai(1,1);
    this.pai_list[1] = new pai(1,1);
    this.pai_list[2] = new pai(1,1);
    this.pai_list[3] = new pai(1,2);
    this.pai_list[4] = new pai(1,2);
    this.pai_list[5] = new pai(1,2);
    this.pai_list[6] = new pai(1,3);
    this.pai_list[7] = new pai(1,3);
    this.pai_list[8] = new pai(1,3);
    this.pai_list[9] = new pai(1,4);
    this.pai_list[10] = new pai(1,4);
    this.pai_list[11] = new pai(1,4);
    this.pai_list[12] = new pai(1,5);
    this.pai_list[13] = new pai(1,5);
    this.check_win();
}
var tagindex = {
    index:1,
}

function pai(type,num,tag)
{
    this.type = type;
    this.num = num;
    this.tag = tagindex.index;
    tagindex.index++;
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

var pai_list = new Array(); 
var is_win = false;
var last_node = null;
function reset(){
    this.is_win = false;
    for(var i =0;i<this.pai_list.length;i++)
    {
        this.pai_list[i].reset();
    }
}

function check_win(){
    var type = 0;
    var num = 0;
    for(var i =0;i<this.pai_list.length;i++)
    {
        var p = this.pai_list[i];
        if(p.type!=type||p.num!=num)
        {
            type = p.type;
            num = p.num;
            for(var j=i+1;j<i+4;j++)
            {
                if(j>this.pai_list.length-1)
                break;
                var p2 = this.pai_list[j];
                if(p2.type == p.type&&p2.num==p.num)
                {
                    this.reset();
                    p.brother[0] = p2;
                    p.check = 1<<4;
                    p2.check = 1<<4;
                    for(var k=0;k<this.pai_list.length;k++)
                    {
                        if(this.pai_list[k].check == 1<<0)
                        {
                            check(this.pai_list[k]);
                            break;
                        }
                    }
                    break;
                }
            }
        }
    }
   
}

function check(p){
   
    this.clear_brother(p);
    switch(p.check)
    {
        case 1<<0:
            this.check_1(p);
            break;
        case 1<<1:
            this.check_2(p);
            break;
        case 1<<2:
            this.check_3(p);
            break;
        default:
            this.check_last(p);
            break;   
    }
}
function check_next(p)
{
    for (var i = 0; i < this.pai_list.length; i++)
    {
        if (this.pai_list[i].check == 1<<0)
        {
            this.pai_list[i].parent = p;
            this.last_node = this.pai_list[i];
            this.check(this.last_node);
            return;
        }
    }
    this.result(true);
    this.last_node.check = this.last_node.check << 1;
    this.check(this.last_node);
}

function check_last(p)
{
    this.clear_brother(p);
    if (p.parent != null)
    {
        p.check = 1 << 0;
        this.last_node = p.parent;
        this.check(this.last_node);
    }
    else
    {
        this.result(false);
    }
}

function check_1(p) {
    p.check = 1 << 1;
    this.check_brother(p, 1);
    if (p.brother[0] != null && p.brother[1] != null)
    {
        this.check_next(p);
    }
    else
    {
        this.check(p);
    }
}

function check_2(p) {
    p.check = 1 << 2;
    this.check_brother(p, 2);
    if (p.brother[0] != null && p.brother[1] != null)
    {
        this.check_next(p);
    }
    else
    {
        this.check(p);
    }
}

function check_3(p)
{
    p.check = 1 << 3;
    this.check_brother(p, 3);
    if (p.brother[0] != null && p.brother[1] != null && p.brother[2] != null)
    {
        this.check_next(p);
    }
    else
    {
        this.check(p);
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
                for (var i = 0; i < this.pai_list.length; i++)
                {
                    if (this.pai_list[i].check != (1 << 0))
                        continue;
                    if (this.pai_list[i].type == p.type && this.pai_list[i].num == p.num + 1)
                    {
                        p.brother[0] = this.pai_list[i];
                        p.brother[0].check = 1 << 4;
                        for (var j = i+1; j < i+4; j++)
                        {
                            if (j >= this.pai_list.length)
                                break;
                            if (this.pai_list[j].check != (1 << 0))
                                continue;
                            if (this.pai_list[j].type == p.type && this.pai_list[j].num == p.num + 2)
                            {
                                p.brother[1] = this.pai_list[j];
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
                for (var i = 0; i < this.pai_list.length; i++)
                {
                    if (this.pai_list[i].check != (1 << 0))
                        continue;
                    if (i > this.pai_list.length - 2)
                        break;
                    if (this.pai_list[i].type == p.type && this.pai_list[i].num == p.num)
                    {
                        if (this.pai_list[i + 1].type == p.type && this.pai_list[i + 1].num == p.num)
                        {
                            p.brother[0] = this.pai_list[i];
                            p.brother[0].check = 1 << 4;
                            p.brother[1] = this.pai_list[i+1];
                            p.brother[1].check = 1 << 4;
                            break;
                        }
                    }
                }
            }
            break;
        case 3:
            {
                for (var i = 0; i < this.pai_list.length; i++)
                {
                    if (this.pai_list[i].check != (1 << 0))
                        continue;
                    if (i > this.pai_list.length - 3)
                        break;
                    if (this.pai_list[i].type == p.type && this.pai_list[i].num == p.num)
                    {
                        if (this.pai_list[i + 1].type == p.type && this.pai_list[i + 1].num == p.num)
                        {
                            if (this.pai_list[i + 2].type == p.type && this.pai_list[i + 2].num == p.num)
                            { 
                                p.brother[0] = this.pai_list[i];
                                p.brother[0].check = 1 << 4;
                                p.brother[1] = this.pai_list[i + 1];
                                p.brother[1].check = 1 << 4;
                                p.brother[2] = this.pai_list[i + 2];
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
    this.is_win = tag;
    console.log(this.is_win);
    if (this.is_win)
    {
        for (var i = 0; i < this.pai_list.length; i++)
        {
            var p = this.pai_list[i];
            if (p.brother[0] != null)
            {
                var text = this.getString(p);
                for (var j = 0; j < p.brother.length; j++)
                {
                    if (p.brother[j] != null)
                        text += this.getString(p.brother[j]);
                }
                console.log(text);
            }
        }
    }
}

function getString(p)
{
    return "{" + p.type + "," + p.num +"," + p.tag+"}";
}

start();
