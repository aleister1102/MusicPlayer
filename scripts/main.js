import { songs } from '../data/songs.js'

const $ = document.querySelector.bind(document)
const $$ = document.querySelectorAll.bind(document)

const PLAYER_STORAGE_KEY = 'KWAN_PLAYER'
const STORAGE = sessionStorage

const cd = $('.cd')
const cdImage = $('.cd-image')
const player = $('.player')
const heading = $('.header h2')
const audio = $('audio')
const playButton = $('.btn-center')
const progressBar = $('.progress-bar')
const nextButton = $('.btn-next')
const prevButton = $('.btn-prev')
const shuffleButton = $('.btn-shuffle')
const repeatButton = $('.btn-repeat')
const playlist = $('.playlist')
const volumeBar = $('.volume-bar')
const volumeIcons = $$('.volume i')

const app = {
	// -- Data --
	currentIndex: 0,
	isPlaying: false,
	shuffleMode: false,
	repeatMode: false,
	playedSongs: new Set([]),
	songs,

	// -- Styles --
	setStyles() {
		playlist.style.marginTop = `${
			Number.parseInt(player.clientHeight) + 16
		}px`
	},

	// -- Properties --
	defineProperties() {
		this.configs = this.getConfigsFromStorage()
	},

	// -- Events --
	handleEvents() {
		const cdWidth = cd.offsetWidth

		// -- CD rotating --
		const cdImageAnimation = cdImage.animate(
			[{ transform: 'rotate(360deg)' }],
			{
				duration: 10000,
				iterations: Infinity,
			},
		)
		cdImageAnimation.pause()

		// -- CD image zooming handling --
		document.addEventListener('scroll', () => {
			const scroll = window.scrollY || document.documentElement.scrollTop
			const newCdWidth = cdWidth - scroll
			cd.style.width = newCdWidth > 0 ? newCdWidth + 'px' : 0
			cd.style.opacity = newCdWidth / cdWidth
		})

		// -- Play button handling --
		playButton.addEventListener('click', () => {
			if (app.isPlaying) audio.pause()
			else audio.play()
		})

		// -- When song is played --
		audio.onplay = function () {
			app.isPlaying = true
			app.playedSongs.add(app.currentIndex)
			playButton.classList.add('playing')
			cdImageAnimation.play()

			console.log(app)
		}

		// -- When song is paused --
		audio.onpause = function () {
			app.isPlaying = false
			playButton.classList.remove('playing')
			cdImageAnimation.pause()
		}

		// -- When song is ended --
		audio.onended = function () {
			if (!app.repeatMode) {
				if (app.shuffleMode) app.shuffleSong()
				else app.nextSong()
			}

			app.loadCurrentSong()
			app.renderSongs()
			audio.play()
		}

		// -- When song progress is updated --
		audio.ontimeupdate = function () {
			if (audio.duration) {
				const duration = audio.duration
				const currentTime = audio.currentTime
				const percent = (currentTime / duration) * 100
				progressBar.value = percent
			}
		}

		// -- When seeking progress --
		progressBar.oninput = function (e) {
			if (audio.duration) {
				const duration = audio.duration
				const currentPos = e.target.value
				const seekingTime = (currentPos * duration) / 100
				audio.currentTime = seekingTime
			}
		}

		// -- Next button --
		nextButton.onclick = function () {
			if (app.shuffleMode) app.shuffleSong()
			else app.nextSong()

			app.loadCurrentSong()
			app.renderSongs()
			app.scrollToActiveSong()
			audio.play()
		}

		// -- Previous button --
		prevButton.onclick = function () {
			if (app.shuffleMode) app.shuffleSong()
			else app.prevSong()

			app.loadCurrentSong()
			app.renderSongs()
			app.scrollToActiveSong()
			audio.play()
		}

		// -- Shuffle button --
		shuffleButton.onclick = function () {
			shuffleButton.classList.toggle('btn--active')
			app.shuffleMode = !app.shuffleMode
			app.setConfigs('shuffleMode', app.shuffleMode)
		}

		// -- Repeat button --
		repeatButton.onclick = function () {
			repeatButton.classList.toggle('btn--active')
			app.repeatMode = !app.repeatMode
			app.setConfigs('repeatMode', app.repeatMode)
		}

		// -- Playlist & Songs --
		playlist.onclick = function (e) {
			const songNode = e.target.closest('.song:not(.song--active)')
			const optionButton = e.target.closest('.song-option')
			const activeSong = $('.song--active')

			// -- Handle song clicking --
			if (songNode && !optionButton) {
				songNode.classList.add('song--active')
				activeSong.classList.remove('song--active')

				app.currentIndex = Number.parseInt(songNode.dataset.index)
				app.setConfigs('currentIndex', app.currentIndex)
				app.loadCurrentSong()
				audio.play()
			}
			// -- Handle option clicking --
			if (optionButton) {
				console.log('Option button is clicked')
			}
		}

		// -- Handle Volume Bar --
		volumeBar.oninput = function (e) {
			audio.volume = e.target.value / 100
			app.updateVolumeIcons()
		}

		// -- Handle Volume Icons --
		volumeIcons.forEach((icon) => {
			icon.addEventListener('click', () => {
				volumeBar.value = volumeBar.value != 0 ? 0 : 100
				audio.volume = volumeBar.value / 100
				app.updateVolumeIcons()
			})
		})
	},
	// -- Functions --
	getConfigsFromStorage() {
		return JSON.parse(STORAGE.getItem(PLAYER_STORAGE_KEY)) || {}
	},
	setConfigs(key, value) {
		this.configs[key] = value
		STORAGE.setItem(PLAYER_STORAGE_KEY, JSON.stringify(this.configs))
	},
	renderSongs() {
		const songElements = this.songs.map((song, index) => {
			return `
                <div 
                    class="song ${
						index === this.currentIndex ? 'song--active' : ''
					}" 
                    data-index="${index}">
                    <div class="song-thumbnail">
                        <img
                            src="${song.image}"
                            alt=""
                            class="song-img"
                        />
                    </div>
                    <div class="song-info">
                        <h3 class="song-name">${song.name}</h3>
                        <p class="song-singer">${song.singer}</p>
                    </div>
                    <div class="song-option">
                        <i class="fa-solid fa-ellipsis"></i>
                    </div>
                </div>
                `
		})
		playlist.innerHTML = songElements.join('')
	},
	scrollToActiveSong() {
		setTimeout(() => {
			$('.song--active').scrollIntoView({
				behavior: 'smooth',
				block: 'end',
			})
		}, 300)
	},
	loadCurrentSong() {
		this.currentSong = this.songs[this.currentIndex]

		heading.textContent = this.currentSong.name
		cdImage.style.backgroundImage = `url(${this.currentSong.image})`
		audio.src = this.currentSong.path
		audio.volume = volumeBar.value / 100
	},
	loadConfig() {
		this.shuffleMode = this.configs.shuffleMode
		this.repeatMode = this.configs.repeatMode
		this.currentIndex = Number.parseInt(
			this.configs.currentIndex ?? this.currentIndex,
		)
	},
	shuffleSong() {
		if (this.playedSongs.size === this.songs.length)
			this.playedSongs.clear()

		let newIndex
		do {
			newIndex = Math.round(Math.random() * (this.songs.length - 1))
		} while (
			newIndex === this.currentIndex ||
			this.playedSongs.has(newIndex)
		)

		this.setCurrentIndex(newIndex)
	},
	nextSong() {
		const newIndex = (this.currentIndex + 1) % this.songs.length

		this.setCurrentIndex(newIndex)
	},
	prevSong() {
		let newIndex = this.currentIndex - 1
		if (newIndex < 0) newIndex = this.songs.length - 1

		this.setCurrentIndex(newIndex)
	},
	setCurrentIndex(newIndex) {
		this.currentIndex = newIndex
		app.setConfigs('currentIndex', this.currentIndex.toString())
	},
	updateUserInterface() {
		if (this.shuffleMode) shuffleButton.classList.add('btn--active')
		if (this.repeatMode) repeatButton.classList.add('btn--active')
	},
	updateVolumeIcons() {
		const currentVolume = volumeBar.value / 100
		volumeIcons.forEach((icon) => {
			const iconClassList = icon.classList
			const isHighVolume = currentVolume === 1
			const isLowVolume = currentVolume > 0 && currentVolume < 1
			const isMuted = currentVolume === 0

			if (
				(iconClassList.contains('fa-volume-xmark') && isMuted) ||
				(iconClassList.contains('fa-volume-low') && isLowVolume) ||
				(iconClassList.contains('fa-volume-high') && isHighVolume)
			)
				iconClassList.remove('hidden')
			else iconClassList.add('hidden')
		})
	},
	start() {
		// -- Set up styles --
		this.setStyles()

		// -- Property definitions --
		this.defineProperties()

		// -- Initialize configurations --
		this.loadConfig()

		// -- Update user interface --
		this.updateUserInterface()

		// -- Event handlers --
		this.handleEvents()

		this.loadCurrentSong()
		this.renderSongs()
	},
}
app.start()
