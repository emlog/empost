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
      // {
      //   id: 'postnote',
      //   visible: true,
      //   parentId: 'emloger',
      //   title: '发布笔记',
      //   contexts: ['page'],
      // },
      {
        id: 'postnoteselect',
        visible: true,
        title: '选中文字发布笔记',
        contexts: ['selection'],
      },
      {
        id: 'postarticleselect',
        visible: true,
        title: '选中文字发布文章',
        contexts: ['selection'],
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
    case 'postarticleselect': // 选中文字右键直接发布文章
      console.log('选中文字直接发布文章');
      selectTextPost(param,'/?rest-api=article_post');
      break;
    case 'postnoteselect': // 选中文字右键直接发布笔记
      console.log('选中文字直接发布笔记');
      selectTextPost(param,'/?rest-api=note_post');
      break;
    case 'emloger': // 右键打开
    openEditor();
      break;
    default:
      break;
  }
});
function openEditor() {
  // todo 打开编辑框，用于发布
  // 发布成功弹窗
  postSucces();
}
// 选中文字发布 笔记或者文章。 文章标题截取前十个字
/**
 * 选中文字发布 笔记或者文章。 文章标题截取前十个字
 * @param {*} param 右键获取参数 selection是选中文字
 * @param {string} urlpath 发布接口路径
 */
function selectTextPost(param,urlpath) {
  var apikey = '';
  var apiurl = '';
  chrome.storage.local.get(['postblogtoken', 'posturl'], function (result) {
    if (result.postblogtoken && result.posturl) {
      apikey = result.postblogtoken;
      apiurl = result.posturl;
      let req_time = new Date().getTime();
      // 计算 accesstoken
      let req_sign = md5(req_time + '' + apikey);

      fetch(apiurl + urlpath, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: 'req_time=' + req_time + '&req_sign=' + req_sign + '&t=' + param.selectionText +
        '&title=' + param.selectionText.substr(0,20) + '&content=' + param.selectionText + '&excerpt=' + param.selectionText.substr(0,40),
      }).then(function (result) {
        // 发布成功的弹窗
          postSucces();
      });
    }
  });
}
/**
 * 发布成功的弹窗
 */
function postSucces() {
  chrome.tabs.query({ currentWindow: true, active: true }, function (tabs) {
  chrome.scripting.insertCSS({
    target: { tabId: tabs[0].id },
    files: ['./layer/theme/default/layer.css',],
  });
  chrome.scripting.executeScript({
    target: { tabId: tabs[0].id },
    files: ['./jquery.min.js', './layer/layer.js', './backExeScript.js'],
  });
})
}
