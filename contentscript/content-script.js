// 选中内容 html转md到后台接收，用于发布文章
/**
 * 选中文字直接发布文章使用
 * @param {*} e 
 */
function AutocopySelection(e) {
    var selectedText = window.getSelection().toString().trim();
    console.log(e);
    if (selectedText) {
        var text = _getSelectionHtml();
        // 引入turndown插件用于转换html到markdown
        let tomd = new TurndownService();
        // plugins 里面编写 替换标签规则即可实现自定义
        tomd.use(plugins);
        // html转换为md
        text = tomd.turndown(text);
        // 将md发送到后台用于发布文章
        chrome.runtime.sendMessage({greeting: 'receivemsg',msg:text});
    }
}
/*
选中内容复制到剪贴板
*/
function copySelection(e) {
    var selectedText = window.getSelection().toString().trim();
    console.log(e);
    if (selectedText) {
        var text = _getSelectionHtml();
        // 引入turndown插件用于转换html到markdown
        let tomd = new TurndownService();
        // plugins 里面编写 替换标签规则即可实现自定义
        tomd.use(plugins);
        // html转换为md
        text = tomd.turndown(text);
        navigator.permissions.query({ name: "clipboard-write" }).then(result => {
            if (result.state === "granted" || result.state == "prompt") {
              navigator.clipboard.writeText(text)
                .then(() => {
                console.log('文本已经成功复制到剪切板'+text);
              })
                .catch(err => {
                 //如果用户没有授权，则抛出异常
                console.error('无法复制此文本：', err);
              });
            }
            else {
              console.log("当前无操作权限。请使用最新版本Chrome浏览器，并在浏览器高级设置-页面设置中允许访问剪切板");
            }
          });
    }
}
function adjustRange(range) {
    range = range.cloneRange();

    // Expand range to encompass complete element if element's text
    // is completely selected by the range
    var container = range.commonAncestorContainer;
    var parentElement = container.nodeType == 3 ?
            container.parentNode : container;

    if (parentElement.textContent == range.toString()) {
        range.selectNode(parentElement);
    }

    return range;
}
/**
 * 获取选中的html片段
 * @returns html片段
 */
function _getSelectionHtml() {
    var html = "", sel, range;
    if (typeof window.getSelection != "undefined") {
        sel = window.getSelection();
        if (sel.rangeCount) {
            var container = document.createElement("div");
            for (var i = 0, len = sel.rangeCount; i < len; ++i) {
                range = adjustRange( sel.getRangeAt(i) );
                container.appendChild(range.cloneContents());
            }
            html = container.innerHTML;
        }
    } else if (typeof document.selection != "undefined") {
        if (document.selection.type == "Text") {
            html = document.selection.createRange().htmlText;
        }
    }
    return html;
}
// document.oncopy = function(e) { 
//     let copyMsg = window.getSelection()
//     e.clipboardData.setData("Text", copyMsg);
//     debugger
//     var data = (e.clipboardData && e.clipboardData.items) || [];
// 	console.log(data)
// }

/*
选择自动复制到剪贴板
*/
document.addEventListener("mouseup", AutocopySelection);
chrome.runtime.sendMessage({greeting: 'getboolmarkdown'},function(params) {
    // 获取markdown配置
    if(params) {
            /*
            更改默认复制，将转换后的markdown写入剪贴板
            */
            document.addEventListener("copy", copySelection);
    }
});