import md5 from './md5.js';
/**
 * 用于接收关闭配置页的方法，可以关闭当前tab页
 */
chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  console.log('Request comes from content script ' + sender.tab.id);
  if (request.greeting === 'close_tab') {
    chrome.tabs.remove(sender.tab.id);
  }
});

chrome.runtime.onInstalled.addListener(function () {
  // 浏览器页面右键菜单逻辑
  const menu = {
    menus: [
      {
        id: 'emloger',
        visible: true,
        title: 'emlog发布插件',
        contexts: ['page'], // page表示页面右键就会有这个菜单，如果想要当选中文字时才会出现此右键菜单，用：selection
      },
      {
        id: 'postnote',
        visible: true,
        parentId: 'emloger',
        title: '发布笔记',
        contexts: ['page'],
      },
      {
        id: 'postnoteselect',
        visible: true,
        title: '选中文字发布笔记',
        contexts: ['selection'],
      },
      {
        id: 'postarticle',
        visible: true,
        parentId: 'emloger',
        title: '发布文章',
        contexts: ['page'],
      },
    ],
  };

  const createMenu = () => {
    menu.menus.forEach((value) => {
      chrome.contextMenus.create(value);
    });
  };
  createMenu();
});

chrome.contextMenus.onClicked.addListener(function callback(param) {
  console.log(param);
  switch (param.menuItemId) {
    case 'postnote': // 发布笔记
    console.log('发布笔记页面弹出');
      break;
    case 'postarticle': // 发布文章
      console.log('发布文章页面弹出');
      break;
    case 'postnoteselect': // 右键选中文字直接发布笔记
      console.log('选中文字直接发布笔记');
      var apikey = '';
      var apiurl = '';
      chrome.storage.local.get(['postblogtoken', 'posturl'], function (result) {
        if (result.postblogtoken && result.posturl) {
          apikey = result.postblogtoken;
          apiurl = result.posturl;
          let req_time = new Date().getTime();
          // 计算 accesstoken
          let req_sign = md5(req_time + '' + apikey);

          fetch(apiurl + '/?rest-api=note_post', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
            },
            body:
              'req_time=' + req_time + '&req_sign=' + req_sign + '&t=' + param.selectionText,
          }).then(function (result) {
            // 待完善
            console.log('发布笔记完成弹窗');
          });
        }
      });
      break;
    default:
      break;
  }
});
