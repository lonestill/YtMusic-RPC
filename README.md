<div align="center">

# YtMusic-RPC

**YouTube Music → Discord Rich Presence**

[![Release](https://img.shields.io/github/v/release/lonestill/YtMusic-RPC?style=flat-square&color=fc3c44)](https://github.com/lonestill/YtMusic-RPC/releases/latest)
[![Build](https://img.shields.io/github/actions/workflow/status/lonestill/YtMusic-RPC/release.yml?style=flat-square)](https://github.com/lonestill/YtMusic-RPC/actions)
[![License](https://img.shields.io/github/license/lonestill/YtMusic-RPC?style=flat-square)](LICENSE)

Shows your current YouTube Music track in Discord status — with cover art, progress bar, and a direct link to the track.

</div>

---

## Features

- **Discord Rich Presence** — cover art, track name, artist, live timer
- **GUI app** — native window, minimizes to tray, light & dark theme
- **Listening history** — full playback history with search and clear
- **Statistics** — top artists and tracks, today / this week / all time
- **Blacklist** — artists and tracks that won't appear in your Discord status
- **Telegram notifications** — sends now-playing info to your Telegram bot
- **Auto-start** on Windows login
- **Auto-update** — downloads and installs new versions automatically
- **Reconnect** — reconnect to Discord without restarting the app

## Installation

### 1. Download the app

→ [Latest release](https://github.com/lonestill/YtMusic-RPC/releases/latest)

Download the `.exe` installer and run it.

### 2. Install the browser extension

The extension sends track data from YouTube Music to the app over WebSocket.

→ [YouTube Music WebSocket Tracker on Greasy Fork](https://greasyfork.org/ru/scripts/578650-youtube-music-websocket-tracker)

You need a userscript manager: [Tampermonkey](https://www.tampermonkey.net/) (Chrome / Firefox / Edge).

## Usage

1. Launch **YtMusic-RPC** — it appears in the system tray
2. Make sure the extension is active — green **Extension** indicator in the sidebar
3. Make sure Discord is connected — green **Discord RPC** indicator in the sidebar
4. Open [YouTube Music](https://music.youtube.com/) and play a track
5. Your Discord status updates automatically

## Development

```bash
git clone https://github.com/lonestill/YtMusic-RPC
cd YtMusic-RPC
npm install
npm run dev
```

**Stack:** Electron · React · TypeScript · discord-rpc · electron-updater · ws

## Troubleshooting

| Problem | Solution |
|---|---|
| Discord status not updating | Click the **Discord RPC** indicator in the sidebar to reconnect |
| Extension not connecting | Make sure WebSocket port `5000` is not blocked by your antivirus |
| Track not showing | Check that the artist / track is not in your blacklist |
| App won't start | Try running as administrator |

## Authors

- [lonestill](https://github.com/lonestill)
- [Anfi1](https://github.com/Anfi1)

## License

[MIT](LICENSE)
