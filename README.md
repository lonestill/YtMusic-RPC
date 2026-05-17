<div align="center">

# YtMusic-RPC

**YouTube Music → Discord Rich Presence**

[![Release](https://img.shields.io/github/v/release/lonestill/YtMusic-RPC?style=flat-square&color=fc3c44)](https://github.com/lonestill/YtMusic-RPC/releases/latest)
[![Build](https://img.shields.io/github/actions/workflow/status/lonestill/YtMusic-RPC/release.yml?style=flat-square)](https://github.com/lonestill/YtMusic-RPC/actions)
[![License](https://img.shields.io/github/license/lonestill/YtMusic-RPC?style=flat-square)](LICENSE)

Показывает текущий трек из YouTube Music в статусе Discord — с обложкой, прогресс-баром и прямой ссылкой на трек.

</div>

---

## Возможности

- **Discord Rich Presence** — обложка, название, артист, таймер
- **GUI приложение** — нативное окно, сворачивается в трей, светлая и тёмная тема
- **История треков** — все прослушанные треки с поиском и очисткой
- **Статистика** — топ артисты и треки за всё время, сегодня, за неделю
- **Blacklist** — треки и артисты которые не будут показываться в RPC
- **Telegram уведомления** — отправка текущего трека в бота
- **Автозапуск** при старте Windows
- **Автообновление** — скачивает и устанавливает новые версии само
- **Reconnect** — переподключение к Discord без перезапуска приложения

## Установка

### 1. Скачать приложение

→ [Последний релиз](https://github.com/lonestill/YtMusic-RPC/releases/latest)

Скачай `.exe` установщик и запусти.

### 2. Установить расширение для браузера

Расширение отправляет данные трека из YouTube Music в приложение через WebSocket.

→ [YouTube Music WebSocket Tracker на Greasy Fork](https://greasyfork.org/ru/scripts/515130-youtube-music-websocket-tracker)

Нужен менеджер пользовательских скриптов: [Tampermonkey](https://www.tampermonkey.net/) (Chrome/Firefox/Edge).

## Использование

1. Запусти **YtMusic-RPC** — появится в трее
2. Убедись что расширение активно (зелёный индикатор **Extension** в приложении)
3. Убедись что Discord подключён (зелёный индикатор **Discord RPC**)
4. Открой [YouTube Music](https://music.youtube.com/) и запусти трек
5. Статус в Discord обновится автоматически

## Разработка

```bash
git clone https://github.com/lonestill/YtMusic-RPC
cd YtMusic-RPC
npm install
npm run dev
```

**Стек:** Electron · React · TypeScript · discord-rpc · electron-updater · ws

## Устранение неполадок

| Проблема | Решение |
|---|---|
| Discord не обновляется | Кликни на индикатор **Discord RPC** в сайдбаре для переподключения |
| Расширение не подключается | Проверь что WebSocket порт `5000` не заблокирован антивирусом |
| Трек не отображается | Убедись что артист/трек не в blacklist |
| Приложение не запускается | Попробуй запустить от имени администратора |

## Авторы

- [lonestill](https://github.com/lonestill)
- [Anfi1](https://github.com/Anfi1)

## Лицензия

[MIT](LICENSE)
