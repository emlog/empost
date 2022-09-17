$(function () {
    // 读取存储的apikey
    chrome.storage.local.get(['postblogtoken', 'posturl'], function (result) {
        if (result.postblogtoken && result.posturl) {
            apikey = result.postblogtoken;
            apiurl = result.posturl;
            $('#apikey').val(apikey);
            $('#apiurl').val(apiurl);
        }
    });
// 填写apikey
    $('#comitapikey').on('click', function () {
        if ($('#apikey').val() !== '' && $('#apiurl').val() !== '') {
            chrome.storage.local.set({'postblogtoken': $('#apikey').val()});
            chrome.storage.local.set({'posturl': $('#apiurl').val()});
            chrome.runtime.sendMessage({greeting: "close_tab"});
        } else {
            alert('请填写url和apikey');
        }
    });
});