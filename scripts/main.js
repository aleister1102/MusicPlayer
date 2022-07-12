import { songs } from '../data/songs.js'

const $ = document.querySelector.bind(document)

const PLAYER_STORAGE_KEY = 'KWAN_PLAYER'

const cd = $('.cd')
const cdImage = $('.cd-image')
const player = $('.player')
const heading = $('.header h2')
const audio = $('audio')
const playButton = $('.btn-center')
const progress = $('.progress')
const nextButton = $('.btn-next')
const prevButton = $('.btn-prev')
const shuffle = $('.btn-shuffle')
const repeat = $('.btn-repeat')
const playlist = $('.playlist')

const app = {
    // -- Data --
    currentIndex: 0,
    isPlaying: false,
    shuffleMode: false,
    repeatMode: false,
    configs: JSON.parse(localStorage.getItem(PLAYER_STORAGE_KEY)) || {},
    songs,

    // -- Styles --
    setStyles: function () {
        playlist.style.marginTop = +player.clientHeight + 16 + 'px'
    },

    // -- Properties --
    defineProperties: function () {
        Object.defineProperty(this, 'currentSong', {
            get: function () {
                return this.songs[this.currentIndex]
            }
        })
    },

    // -- Events --
    handleEvents: function () {
        const cdWidth = cd.offsetWidth

        // -- CD rotating --
        const cdImageAnimation = cdImage.animate(
            [{ transform: 'rotate(360deg)' }],
            {
                duration: 10000,
                iterations: Infinity
            }
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
            playButton.classList.add('playing')
            cdImageAnimation.play()
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
            audio.play()
        }

        // -- When song progress is updated --
        audio.ontimeupdate = function () {
            if (audio.duration) {
                const duration = audio.duration
                const currentTime = audio.currentTime
                const percent = (currentTime / duration) * 100
                progress.value = percent
            }
        }

        // -- When seeking progress --
        progress.onchange = function (e) {
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
        shuffle.onclick = function () {
            shuffle.classList.toggle('btn--active')
            app.shuffleMode = !app.shuffleMode
            app.setConfigs('shuffleMode', app.shuffleMode)
        }

        // -- Repeat button --
        repeat.onclick = function () {
            repeat.classList.toggle('btn--active')
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

                app.currentIndex = songNode.dataset.index
                app.loadCurrentSong()
                audio.play()
            }
            // -- Handle option clicking --
            if (optionButton) {
                console.log('Option button is clicked')
            }
        }
    },
    // -- Functions --
    setConfigs: function (key, value) {
        this.configs[key] = value
        localStorage.setItem(PLAYER_STORAGE_KEY, JSON.stringify(this.configs))
    },
    renderSongs: function () {
        const songElements = this.songs.map((song, index) => {
            return `
        <div class="song ${
            index === this.currentIndex ? 'song--active' : ''
        }" data-index="${index}">
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
    scrollToActiveSong: function () {
        setTimeout(() => {
            $('.song--active').scrollIntoView({
                behavior: 'smooth',
                block: 'nearest'
            })
        }, 300)
    },
    loadCurrentSong: function () {
        heading.textContent = this.currentSong.name
        cdImage.style.backgroundImage = `url(${this.currentSong.image})`
        audio.src = this.currentSong.path
    },
    loadConfig: function () {
        this.shuffleMode = this.configs.shuffleMode
        this.repeatMode = this.configs.repeatMode
    },
    shuffleSong: function () {
        let newIndex
        do {
            newIndex = Math.round(Math.random() * (this.songs.length - 1))
        } while (newIndex === this.currentIndex)
        this.currentIndex = newIndex
    },
    nextSong: function () {
        this.currentIndex = (this.currentIndex + 1) % this.songs.length
    },
    prevSong: function () {
        this.currentIndex = this.currentIndex - 1
        if (this.currentIndex < 0) this.currentIndex = this.songs.length - 1
    },
    start: function () {
        // -- Set up styles --
        this.setStyles()

        // -- Initialize configurations --
        this.loadConfig()

        // -- Property definitions --
        this.defineProperties()

        // -- Event handlers --
        this.handleEvents()

        this.loadCurrentSong()
        this.renderSongs()
    }
}
app.start()
