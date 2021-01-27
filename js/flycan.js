let runTimes = 1;
var pic_N = 1;
var ad_Pic = document.querySelector("#ad-pic");
function gogo() {
    pic_N = Math.ceil(Math.random() * 8);
    ad_Pic.src = "../images/Holidays-icons-" + pic_N + ".png"
    if (runTimes < 20) {
        runTimes++;
        setTimeout(gogo, 500);
    }
}
gogo();

