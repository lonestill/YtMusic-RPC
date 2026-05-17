import Store from 'electron-store'

export interface Config {
  discordClientId: string
  customButton1Label: string
  customButton1Url: string
  customButton2Label: string
  customButton2Url: string
  privateMode: boolean
  hideTrackName: boolean
  hideArtistName: boolean
  toastNotifications: boolean
  blacklistArtists: string[]
  blacklistTracks: string[]
  analyticsEnabled: boolean
  botToken: string
  chatId: string
  autostart: boolean
}

const store = new Store<Config>({
  defaults: {
    discordClientId: '1194717480627740753',
    customButton1Label: 'Listen',
    customButton1Url: '',
    customButton2Label: 'Download',
    customButton2Url: 'https://github.com/M3th4d0n/YtMusic-RPC',
    privateMode: false,
    hideTrackName: false,
    hideArtistName: false,
    toastNotifications: true,
    blacklistArtists: [],
    blacklistTracks: [],
    analyticsEnabled: false,
    botToken: '',
    chatId: '',
    autostart: false
  }
})

export default store
