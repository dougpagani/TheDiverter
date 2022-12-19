# Helpful documentation
- [service workers (event responders) documentation](https://developer.chrome.com/docs/extensions/mv3/service_workers/#manifest)
- [manifest.json documentation](https://developer.chrome.com/docs/extensions/mv3/manifest/)

# Permissions from other projects
I think webNavigation is the way to go. Activity watch does a heartbeat thing
where it's constantly polling as opposed to just responding to the navigation
events. We may need to use tabs as well to get info like the URL once we do
respond to the webNavigation event.
## Leechblock
```
"permissions": [
	"downloads",
	"contextMenus",
	"storage",
	"tabs",
	"unlimitedStorage",
	"webNavigation"
],
```
## ActivityWatch
```
"permissions": [
  "tabs",
  "alarms",
  "notifications",
  "activeTab",
  "storage",
  "http://localhost:5600/api/*",
  "http://localhost:5666/api/*"
]
```

# Leechblock listeners
I doubt we'll need to handle more events than they do, so this should be the
universe of things that we could be interested in.
```
if (browser.contextMenus) {
	browser.contextMenus.onClicked.addListener(handleMenuClick);
}

browser.runtime.onMessage.addListener(handleMessage);

browser.tabs.onCreated.addListener(handleTabCreated);
browser.tabs.onUpdated.addListener(handleTabUpdated);
browser.tabs.onActivated.addListener(handleTabActivated);
browser.tabs.onRemoved.addListener(handleTabRemoved);

browser.webNavigation.onBeforeNavigate.addListener(handleBeforeNavigate);

if (browser.windows) {
	//browser.windows.onFocusChanged.addListener(handleWinFocused);
}
```
