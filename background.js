chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    console.log("Request comes from content script " + sender.tab.id);
    if (request.greeting === "close_tab") {
        chrome.tabs.remove(sender.tab.id);
    }
});