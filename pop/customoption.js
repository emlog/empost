$(function () {
    // 读取存储的apikey
    chrome.storage.local.get(['postblogtoken', 'posturl','markdown'], function (result) {
        if (result.postblogtoken && result.posturl) {
            apikey = result.postblogtoken;
            apiurl = result.posturl;
            markdown = result.markdown;
            $('#apikey').val(apikey);
            $('#apiurl').val(apiurl);
            $('#markdown')[0].checked = markdown;
        }
    });
// 填写apikey
    $('#comitapikey').on('click', function () {
        if ($('#apikey').val() !== '' && $('#apiurl').val() !== '') {
            chrome.storage.local.set({'postblogtoken': $('#apikey').val()});
            chrome.storage.local.set({'posturl': $('#apiurl').val()});
            chrome.storage.local.set({'markdown': $('#markdown')[0].checked});
            chrome.runtime.sendMessage({greeting: "close_tab"});
        } else {
            layer.alert('请填写url和apikey');
        }
    });
});