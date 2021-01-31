let runTimes = 1;
var pic_N = 1;
var ad_Pic = document.querySelector("#ad-pic");
function gogo() {
    pic_N = Math.ceil(Math.random() * 8);
    ad_Pic.src = "../images/first/Holidays-icons-" + pic_N + ".png"
    if (runTimes < 20) {
        runTimes++;
        setTimeout(gogo, 500);
    }
}
gogo();
//廣告
var div_adBox = document.querySelector("#ad-box");
window.onload = function () {
    //等待網頁內容全部下載完畢，就會馬上顯示蓋版廣告
    div_adBox.style.display = "block";

}
// parentNod 的功能就是指目前物件的父層

//等待 6 秒之後，就執行上面的 deleteAD 功能函式
setTimeout(function () {
    //透過 black_DIV 的父層，就可以把自已移除掉
    div_adBox.parentNode.removeChild(div_adBox);
}, 5000);

