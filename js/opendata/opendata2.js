/* jquery.js */
var url = '';  // 
var title;
var fields = [];
document.getElementById('source_json').value = url;


function change(n) {
    if (n == 1) {
        title = '空氣品質 AQI (每小時提供)';
        source = 'https://data.epa.gov.tw/dataset/aqx_p_432';
        url = 'https://data.epa.gov.tw/api/v1/aqx_p_432?format=json&limit=50&api_key=c66c3e15-d6aa-4452-a254-2988444437b1';
        fields = [
            { name: "測站名稱", field: "SiteName" },
            { name: "縣市", field: "County" },
            { name: "AQI 值", field: "AQI" },
            { name: "空氣品質", field: "Status" }
        ];
    }

    if (n == 2) {
        title = 'PM10小時值(每小時提供)';
        source = 'https://data.epa.gov.tw/dataset/aqx_p_319';
        url = 'https://data.epa.gov.tw/api/v1/aqx_p_319?format=json&limit=200&api_key=c66c3e15-d6aa-4452-a254-2988444437b1';
        fields = [
            { name: "測站名稱", field: "SiteName" },
            { name: "偵測日期", field: "MonitorDate" },
            { name: "數值", field: "Concentration" }
        ];
    }

    if (n == 3) {
        title = '日累積雨量 (每月更新)';
        source = 'https://data.epa.gov.tw/dataset/aqx_p_20';
        url = 'https://data.epa.gov.tw/api/v1/aqx_p_20?format=json&limit=200&api_key=c66c3e15-d6aa-4452-a254-2988444437b1';
        fields = [
            { name: "測站名稱", field: "SiteName" },
            { name: "偵測日期", field: "MonitorDate" },
            { name: "雨量", field: "Rainfall24hr" }
        ];
    }

    if (n == 4) {
        title = '河川水質監測資料';
        source = 'https://data.epa.gov.tw/dataset/wqx_p_01';
        url = 'https://data.epa.gov.tw/api/v1/wqx_p_01?format=json&limit=50&api_key=c66c3e15-d6aa-4452-a254-2988444437b1';
        fields = [
            { name: "測站名稱", field: "SiteName" },
            { name: "縣市", field: "County" },
            { name: "鄉鎮", field: "Township" },
            { name: "採樣日期", field: "SampleDate" },
            { name: "河川名稱", field: "River" },
            { name: "採樣名稱", field: "ItemName" },
            { name: "監測值", field: "ItemValue" }
        ];
    }

    if (n == 5) {
        title = '全國細懸浮微粒手動監測資料';
        source = 'https://data.epa.gov.tw/dataset/aqx_p_10';
        url = 'https://data.epa.gov.tw/api/v1/aqx_p_10?format=json&limit=50&api_key=c66c3e15-d6aa-4452-a254-2988444437b1';
        fields = [
            { name: "測站名稱", field: "SiteName" },
            { name: "監測日期", field: "MonitorDate" },
            { name: "細懸浮微粒監測濃度", field: "Concentration" },
            { name: "度量單位", field: "ItemUnit" }
        ];
    }


    document.getElementById('source_json').value = url;
    $('#showarea').html('請按讀取資料按鈕');
    $('#showdata').html('');
}



$('#btn').click(function () {
    $('#showarea').html('loading...');

    url = document.getElementById('source_json').value;

    $.ajax({
        dataType: "json",
        url: url,
        success: function (data) {
            $('#showarea').html('read ok');

            var output_string = '<h3>取出 ' + data.records.length + ' 筆記錄，第1筆資料範例如下</h3>';
            output_string += '<pre>';
            output_string += JSON.stringify(data.records[0], null, 4);
            output_string += '</pre>';

            $('#showarea').html(output_string);

            func_show(data);
        },
        error: function (xhr, ajaxOptions, thrownError) {
            $('#showarea').html('error: ' + xhr.status);
            //$('#showarea').html(xhr.status);
            //$('#showarea').html(thrownError);
        },
    }); // end of ajax()
}); // end of click()



var func_show = function (data) {
    var items = [];
    var datalist = data.records;
    var str = ''; // 顯示

    // 顯示表頭
    str += '<h3>' + title + '<h3>';
    str += '<p>Source: <a href="' + source + '" target="_blank">' + source + '</a></p>';
    str += '<table>';
    str += '<tr>';
    for (idx in fields) {
        str += '<th>' + fields[idx].name + '<br>' + fields[idx].field + '</th>';
    }
    str += '</tr>';

    $.each(datalist, function (i, item) {

        // 顯示資料  
        str += '<tr>';
        for (idx in fields) {
            str += '<td>' + eval('item.' + fields[idx].field) + '</td>';
        }
        str += '</tr>';

    }); // end of each()
    str += '</table>';

    $('#showdata').html(str);

}