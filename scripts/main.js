import { songs } from '../data/songs.js'

const $ = document.querySelector.bind(document)
const $$ = document.querySelectorAll.bind(document)

const cd = $('.cd')
const cdImage = $('.cd-image')
const player = $('.player')
const playlist = $('.playlist')
const heading = $('.header h2')
const audio = $('audio')
const playButton = $('.btn-center')
const progress = $('.progress')
const nextButton = $('.btn-next')
const prevButton = $('.btn-prev')
const shuffle = $('.btn-shuffle')
const repeat = $('.btn-repeat')

const app = {
    // -- Data --
    currentIndex: 0,
    isPlaying: false,
    shuffleMode: false,
    repeatMode: false,
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
                else app.currentIndex += 1
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
            audio.play()
        }

        // -- Previous button --
        prevButton.onclick = function () {
            if (app.shuffleMode) app.shuffleSong()
            else app.prevSong()
            app.loadCurrentSong()
            audio.play()
        }

        // -- Shuffle button --
        shuffle.onclick = function () {
            shuffle.classList.toggle('btn--actived')
            app.shuffleMode = !app.shuffleMode
        }

        // -- Repeat button --
        repeat.onclick = function () {
            repeat.classList.toggle('btn--actived')
            app.repeatMode = !app.repeatMode
        }
    },
    // -- Functions --
    renderSongs: function () {
        const songElements = this.songs.map((song) => {
            return `
        <div class="song">
            <div class="song-thumbnail">
                <img
                    src="${song.image}"
                    alt=""
                    class="song-img"
                />
            </div>
            <div class="song-info">
                <h3>${song.name}</h3>
                <p>${song.singer}</p>
            </div>
            <div class="song-option">
                <i class="fa-solid fa-ellipsis"></i>
            </div>
        </div>
        `
        })

        playlist.innerHTML = songElements.join('')
    },
    loadCurrentSong: function () {
        heading.textContent = this.currentSong.name
        cdImage.style.backgroundImage = `url(${this.currentSong.image})`
        audio.src = this.currentSong.path
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
        this.setStyles()
        this.defineProperties()
        this.handleEvents()

        this.loadCurrentSong()
        this.renderSongs()
    }
}
app.start()
