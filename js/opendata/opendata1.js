/* jquery.js */

var url = 'https://data.epa.gov.tw/api/v1/aqx_p_432?format=json&limit=20&api_key=c66c3e15-d6aa-4452-a254-2988444437b1';


$('#btn_clear').click(function () {
    $('#showarea').html('');
    $('#itemlist').html('');
}); // end of click()


$('#btn1').click(function () {
    $.getJSON(url, function (data) {

        var ary = data.records;
        $('#showarea').html(JSON.stringify(ary[0]));
        func_show(ary);

    }); // end of getJSON()
}); // end of click()



$('#btn2').click(function () {
    $.getJSON(url).done(function (data) {

        var ary = data.records;
        $('#showarea').html(JSON.stringify(ary[0]));
        func_show(ary);

    }); // end of done()
}); // end of click()



$('#btn3').click(function () {
    $.ajax({
        dataType: "json",
        url: url,
        success: function (data) {
            var ary = data.records;

            console.log(ary[0]);
            $('#showarea').html(JSON.stringify(ary[0]));
            func_show(ary);
        },
        error: function () { console.log('error'); },
    }); // end of ajax()
}); // end of click()



var func_show = function (ary) {
    var items = [];
    $.each(ary, function (i, item) {

        var SiteName = item.SiteName;
        var County = item.County;
        var AQI = item.AQI;
        var PM2_5 = item["PM2.5"];
        var Status = item.Status;
        var PublishTime = item.PublishTime;

        var str = SiteName + ', ' + County + ', ' + ', ' + AQI + ', ' + PM2_5 + ', <b>' + Status + '</b>, ' + PublishTime;

        items.push('<li>' + str + '</li>');
    }); // end of each()

    $('#itemlist li').remove();
    $('#itemlist').append(items.join(''));
};



document.getElementById('source').innerHTML = '<a href="' + url + '">' + url + '</a>';
