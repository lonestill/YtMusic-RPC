import Store from 'electron-store'

export interface Config {
  discordClientId: string
  customButton1Label: string
  customButton1Url: string
  customButton2Label: string
  customButton2Url: string
  toastNotifications: boolean
  blacklistArtists: string[]
  blacklistTracks: string[]
  analyticsEnabled: boolean
  botToken: string
  chatId: string
  autostart: boolean
  theme: 'dark' | 'light'
}

const store = new Store<Config>({
  defaults: {
    discordClientId: '1194717480627740753',
    customButton1Label: 'Listen',
    customButton1Url: '',
    customButton2Label: 'Download',
    customButton2Url: 'https://github.com/lonestill/YtMusic-RPC',
    toastNotifications: true,
    blacklistArtists: [],
    blacklistTracks: [],
    analyticsEnabled: false,
    botToken: '',
    chatId: '',
    autostart: false,
    theme: 'dark'
  }
})

export default store
