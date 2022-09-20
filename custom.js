$(function () {
    let apikey = '';
    let apiurl = '';
    chrome.storage.local.get(['postblogtoken', 'posturl'], function (result) {
        if (result.postblogtoken && result.posturl) {
            apikey = result.postblogtoken;
            apiurl = result.posturl;
        } else {
            layer.alert('请填写url和apikey');
            chrome.runtime.openOptionsPage(function () {
            })
        }
    });

    // 重置
    $('#reset').on('click', function () {
        $('#title').val('');
        $('#abstrat').val('');
        $('#content').val('');
    });

    // 发布文章
    $('#post').on('click', function () {
        let req_time = new Date().getTime();
        if ('' === apikey) {
            layer.alert('请填写url和apikey');
            chrome.runtime.openOptionsPage(function () {
            })
            return;
        }
        // todo 计算 accesstoken
        let req_sign = md5(req_time + '' + apikey);
        if ($('#title').val() === '' || $('#content').val() === '') {
            layer.alert('请填写内容后再发布。');
        }
        $.ajax({
            url: apiurl + '/?rest-api=article_post',
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            async: true,
            data: 'req_time=' + req_time + '&req_sign=' + req_sign + '&title=' + $('#title').val() + '&content=' + $('#content').val() + '&excerpt=' + $('#abstrat').val(),
            success: function (result) {
                layer.alert('文章发布成功');
                $('#title').val('');
                $('#abstrat').val('');
                $('#content').val('');
            },
        });
    });

    // 重置
    $('#reset_note').on('click', function () {
        $('#content').val('');
    });

    // 发布笔记
    $('#post_note').on('click', function () {
        let req_time = new Date().getTime();
        if ('' === apikey) {
            layer.alert('请填写url和apikey');
            chrome.runtime.openOptionsPage(function () {
            })
            return;
        }
        if ($('#content').val() === '') {
            layer.alert('请填写内容后再发布。');
        }
        let req_sign = md5(req_time + '' + apikey);
        $.ajax({
            url: apiurl + '/?rest-api=note_post ', method: 'POST', headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            }, async: true, data: 'req_time=' + req_time + '&req_sign=' + req_sign + '&t=' + $('#content').val(), success: function (result) {
                layer.alert('笔记发布成功');
                $('#content').val('');
            },
        });

    });
});
