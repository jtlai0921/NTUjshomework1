

document.write(i2yesCounter.render({
    y: 'counter',
    p: 'demo2', //改成您專有的計數器名稱,注意別跟別人一樣
    v: 'www.i2yes.com', //您的網址,不對的話無法使用,也可以用沒有 www 的網址,如 i2yes.com
    d: 6, //數字位數
    r: 1, //1=不接受Reload,0=Reload會+1
    t: 'font099', //字型 font001 - font156 可用
    s: 0,  //指定大小,只能輸入數字例;100, 0為不指定尺寸(原寸)
    n: 0	//指定起始的數字
}));
