
$(function () {
  document.onmousedown = function (e) {
    if (e.buttons == 2) {
      return false;
    }
  };
  $("#notecontent div").hide(); // 隐藏两个div
	$("#tabs li:first").attr("id","current"); // 显示第一个div
	$("#notecontent div:first").fadeIn(); // 显示第一个div 默认笔记
  $('#tabs a').click(function(e) {
    e.preventDefault();        
    $("#notecontent div").hide(); //Hide all content
    $("#tabs li").attr("id",""); //Reset id's
    $(this).parent().attr("id","current"); // Activate this
    $('#' + $(this).attr('title')).fadeIn(); // Show content for current tab
});
  var apikey = '';
  var apiurl = '';
  chrome.storage.local.get(['postblogtoken','posturl'],function(result) {
    if(result.postblogtoken&&result.posturl) {
      apikey = result.postblogtoken;
      apiurl = result.posturl;
    } else {
      alert('请填写url和apikey');
      chrome.runtime.openOptionsPage(function(){})
    }
  });
  // 重置文章
  $('#reset').on('click', function () {
    $('#title').val('');
    $('#abstrat').val('');
    $('#content').val('');
  });
  // 重置笔记
  $('#resetnote').on('click', function () {
    $('#note').val('');
  });
  // 发布文章
  $('#post').on('click', function () {
    let req_time = new Date().getTime();
    if('' == apikey) {
      alert('请填写url和apikey');
      chrome.runtime.openOptionsPage(function(){})
      return;
    }
     // 计算 accesstoken
    let req_sign = md5(req_time +''+ apikey);
    if ($('#title').val() !== '' && $('#content').val() !== '') {
      postarticle(apiurl, req_time, req_sign);
    } else {
      alert('请填写内容后再发布。');
    }
  });

   // 发布笔记
   $('#postnote').on('click', function () {
    if('' == apikey) {
      alert('请填写url和apikey');
      chrome.runtime.openOptionsPage(function(){})
      return;
    }
    if ($('#note').val() !== '') {
      postnote($('#note').val());
    } else {
      alert('请填写内容后再发布。');
    }
  });
  /**
 * 发布文章
 * @param {string} apiurl 
 * @param {string} req_time 
 * @param {string} req_sign 
 */
function postarticle(apiurl, req_time, req_sign) {
  $.ajax({
    url: apiurl + '/?rest-api=article_post',
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    async: true,
    data: 'req_time=' +
      req_time + '&req_sign=' + req_sign +
      '&title=' +
      $('#title').val() +
      '&content=' +
      $('#content').val() +
      '&excerpt=' +
      $('#abstrat').val(),
    success: function (result) {
      alert('发布成功');
      $('#title').val('');
      $('#abstrat').val('');
      $('#content').val('');
    },
  });
}

/**
 * 发布笔记
 * @param {string} apiurl url参数
 * @param {string} req_time 时间戳
 * @param {string} req_sign 签名
 * @param {string} note 笔记内容
 */
function postnote(note) {
  let req_time = new Date().getTime();
     // 计算 accesstoken
  let req_sign = md5(req_time +''+ apikey);
  $.ajax({
    url: apiurl + '/?rest-api=note_post',
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    async: true,
    data: 'req_time=' +
      req_time + '&req_sign=' + req_sign +
      '&t=' + note,
    success: function (result) {
      alert('发布成功');
      $('#note').val('');
    },
  });
}
});