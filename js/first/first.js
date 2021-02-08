let runTimes = 1;
var pic_N = 1;
var ad_Pic = document.querySelector("#ad-pic");
function gogo() {
    pic_N = Math.ceil(Math.random() * 8);
    ad_Pic.src = "../images/first/Holidays-icons-" + pic_N + ".JPG"
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
}, 10000);
//印字
function Ptext(arr, id, time) {
    var arr = [];
    arr.push("大家晚上好！");
    arr.push("歡迎大家来到我的網站！");
    arr.push("哈哈哈哈！");


    var pos = 1;
    var strlen = arr[0].length;//获取数组第一个字符串长度
    var index = 0;//记录数组索引
    var len = arr.length;//记录数组长度
    var timer = null;
    var oText = document.getElementById(id);
    var p = "";
    var row = 0;//记录行数
    function printText() {
        if (row < index) {
            p = p + arr[row++] + "<br/>";
        }
        oText.innerHTML = p + arr[index].substring(0, pos);
        if (strlen == pos) {
            index++;//下一个字符串的位置
            pos = 0;
            if (index < len) {
                strlen = arr[index].length;
                timer = setTimeout(printText, time);
            } else {
                clearTimeout(timer);
            }
        } else {
            pos++;//
            timer = setTimeout(printText, time);
        }
    }
    printText();
}


Ptext(["", "adasdas", "nihaoasdsadsad"], "text", 100);
function centerHandler() {/*設定置中的函式*/
    var scrollDist = $(window).scrollTop();/*取得捲動長度*/
    var myTop = ($(window).height() - $("#popWindow").height()) / 2 + scrollDist;
    /*取得垂直中央位置*/
    var myLeft = ($(window).width() - $("#popWindow").width()) / 2;
    /*取得水平中央位置*/
    $("#popWindow").offset({ top: myTop, left: myLeft });
    /*設定區塊於水平與垂直置中*/
}

centerHandler(); /*呼叫置中函式，使廣告區塊置中*/
$(window).scroll(centerHandler); /*當網頁捲動時呼叫置中函式*/
$(window).resize(centerHandler); /*當視窗縮放時呼叫置中函式*/
console.clear()
console.log('lsakdfalskjdflnksd')

const config = {
    src: 'https://s3-us-west-2.amazonaws.com/s.cdpn.io/175711/open-peeps-sheet.png',
    rows: 15,
    cols: 7
}

// UTILS

const randomRange = (min, max) => min + Math.random() * (max - min)

const randomIndex = (array) => randomRange(0, array.length) | 0

const removeFromArray = (array, i) => array.splice(i, 1)[0]

const removeItemFromArray = (array, item) => removeFromArray(array, array.indexOf(item))

const removeRandomFromArray = (array) => removeFromArray(array, randomIndex(array))

const getRandomFromArray = (array) => (
    array[randomIndex(array) | 0]
)

// TWEEN FACTORIES

const resetPeep = ({ stage, peep }) => {
    const direction = Math.random() > 0.5 ? 1 : -1
    // using an ease function to skew random to lower values to help hide that peeps have no legs
    const offsetY = 100 - 250 * gsap.parseEase('power2.in')(Math.random())
    const startY = stage.height - peep.height + offsetY
    let startX
    let endX

    if (direction === 1) {
        startX = -peep.width
        endX = stage.width
        peep.scaleX = 1
    } else {
        startX = stage.width + peep.width
        endX = 0
        peep.scaleX = -1
    }

    peep.x = startX
    peep.y = startY
    peep.anchorY = startY

    return {
        startX,
        startY,
        endX
    }
}

const normalWalk = ({ peep, props }) => {
    const {
        startX,
        startY,
        endX
    } = props

    const xDuration = 10
    const yDuration = 0.25

    const tl = gsap.timeline()
    tl.timeScale(randomRange(0.5, 1.5))
    tl.to(peep, {
        duration: xDuration,
        x: endX,
        ease: 'none'
    }, 0)
    tl.to(peep, {
        duration: yDuration,
        repeat: xDuration / yDuration,
        yoyo: true,
        y: startY - 10
    }, 0)

    return tl
}

const walks = [
    normalWalk,
]

// CLASSES

class Peep {
    constructor({
        image,
        rect,
    }) {
        this.image = image
        this.setRect(rect)

        this.x = 0
        this.y = 0
        this.anchorY = 0
        this.scaleX = 1
        this.walk = null
    }

    setRect(rect) {
        this.rect = rect
        this.width = rect[2]
        this.height = rect[3]

        this.drawArgs = [
            this.image,
            ...rect,
            0, 0, this.width, this.height
        ]
    }

    render(ctx) {
        ctx.save()
        ctx.translate(this.x, this.y)
        ctx.scale(this.scaleX, 1)
        ctx.drawImage(...this.drawArgs)
        ctx.restore()
    }
}

// MAIN

const img = document.createElement('img')
img.onload = init
img.src = config.src

const canvas = document.querySelector('#canvas')
const ctx = canvas.getContext('2d')

const stage = {
    width: 0,
    height: 0,
}

const allPeeps = []
const availablePeeps = []
const crowd = []

function init() {
    createPeeps()

    // resize also (re)populates the stage
    resize()

    gsap.ticker.add(render)
    window.addEventListener('resize', resize)
}

function createPeeps() {
    const {
        rows,
        cols
    } = config
    const {
        naturalWidth: width,
        naturalHeight: height
    } = img
    const total = rows * cols
    const rectWidth = width / rows
    const rectHeight = height / cols

    for (let i = 0; i < total; i++) {
        allPeeps.push(new Peep({
            image: img,
            rect: [
                (i % rows) * rectWidth,
                (i / rows | 0) * rectHeight,
                rectWidth,
                rectHeight,
            ]
        }))
    }
}

function resize() {
    stage.width = canvas.clientWidth
    stage.height = canvas.clientHeight
    canvas.width = stage.width * devicePixelRatio
    canvas.height = stage.height * devicePixelRatio

    crowd.forEach((peep) => {
        peep.walk.kill()
    })

    crowd.length = 0
    availablePeeps.length = 0
    availablePeeps.push(...allPeeps)

    initCrowd()
}

function initCrowd() {
    while (availablePeeps.length) {
        // setting random tween progress spreads the peeps out
        addPeepToCrowd().walk.progress(Math.random())
    }
}

function addPeepToCrowd() {
    const peep = removeRandomFromArray(availablePeeps)
    const walk = getRandomFromArray(walks)({
        peep,
        props: resetPeep({
            peep,
            stage,
        })
    }).eventCallback('onComplete', () => {
        removePeepFromCrowd(peep)
        addPeepToCrowd()
    })

    peep.walk = walk

    crowd.push(peep)
    crowd.sort((a, b) => a.anchorY - b.anchorY)

    return peep
}

function removePeepFromCrowd(peep) {
    removeItemFromArray(crowd, peep)
    availablePeeps.push(peep)
}

function render() {
    canvas.width = canvas.width
    ctx.save()
    ctx.scale(devicePixelRatio, devicePixelRatio)

    crowd.forEach((peep) => {
        peep.render(ctx)
    })

    ctx.restore()
}
