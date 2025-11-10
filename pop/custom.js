$(function () {
    // 重置
    $('#reset').on('click', function () {
        $('#title').val('');
        $('#abstrat').val('');
        $('#content').val('');
    });

    // 发布文章
    $('#post').on('click', function () {
        chrome.storage.local.get(['postblogtoken', 'posturl'], function (result) {
            if (result.postblogtoken && result.posturl) {
                let apikey = result.postblogtoken;
                let apiurl = result.posturl;
                let req_time = new Date().getTime();
                let req_sign = md5(req_time + '' + apikey);

                if ($('#title').val() === '' || $('#content').val() === '') {
                    layer.alert('请填写内容后再发布。');
                    return;
                }

                $.ajax({
                    url: apiurl + '/?rest-api=article_post',
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                    },
                    async: true,
                    data: 'req_time=' + req_time + '&req_sign=' + req_sign + '&title=' + encodeURIComponent($('#title').val()) + '&content=' + encodeURIComponent($('#content').val()) + '&excerpt=' + encodeURIComponent($('#abstrat').val()),
                    success: function (result) {
                        layer.alert('文章发布成功');
                        $('#title').val('');
                        $('#abstrat').val('');
                        $('#content').val('');
                    },
                });
            } else {
                layer.alert('请填写url和apikey');
                chrome.runtime.openOptionsPage(function () {});
            }
        });
    });

    // 重置
    $('#reset_note').on('click', function () {
        $('#content').val('');
    });

    // 发布笔记
    $('#post_note').on('click', function () {
        chrome.storage.local.get(['postblogtoken', 'posturl'], function (result) {
            if (result.postblogtoken && result.posturl) {
                let apikey = result.postblogtoken;
                let apiurl = result.posturl;
                let req_time = new Date().getTime();

                if ($('#content').val() === '') {
                    layer.alert('请填写内容后再发布。');
                    return;
                }

                let req_sign = md5(req_time + '' + apikey);
                $.ajax({
                    url: apiurl + '/?rest-api=note_post',
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                    },
                    async: true,
                    data: 'req_time=' + req_time + '&req_sign=' + req_sign + '&t=' + encodeURIComponent($('#content').val()),
                    success: function (result) {
                        layer.alert('笔记发布成功');
                        $('#content').val('');
                    },
                });
            } else {
                layer.alert('请填写url和apikey');
                chrome.runtime.openOptionsPage(function () {});
            }
        });
    });
});
