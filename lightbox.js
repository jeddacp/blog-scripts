document.addEventListener('DOMContentLoaded', function () {
  if (window.__bearGalleryLightbox) return
  window.__bearGalleryLightbox = true
  var galleries = Array.prototype.slice.call(document.querySelectorAll('.bear-gallery'))
  if (!galleries.length) return
  var photos = []
  galleries.forEach(function (root) {
    var imgs = Array.prototype.slice.call(root.querySelectorAll('img'))
    var items = imgs.map(function (img) {
      var index = photos.length
      photos.push({ src: img.currentSrc || img.src, alt: img.alt || '' })
      img.loading = 'lazy'
      img.decoding = 'async'
      var btn = document.createElement('button')
      btn.type = 'button'
      btn.className = 'bear-gallery-item'
      btn.ariaLabel = img.alt ? ('Open image: ' + img.alt) : 'Open image'
      btn.appendChild(img)
      btn.onclick = function () { openAt(index) }
      return btn
    })
    root.replaceChildren.apply(root, items)
  })
  if (!photos.length) return

  var dialog = document.createElement('dialog')
  dialog.className = 'bear-gallery-lightbox'
  dialog.setAttribute('closedby', 'closerequest')
  dialog.innerHTML =
    '<button class="bear-gallery-close" type="button" aria-label="Close image">&times;</button>' +
    '<button class="bear-gallery-prev" type="button" aria-label="Previous image">&lsaquo;</button>' +
    '<button class="bear-gallery-next" type="button" aria-label="Next image">&rsaquo;</button>' +
    '<figure class="bear-gallery-figure"><img alt=""><figcaption class="bear-gallery-caption"></figcaption></figure>'
  document.body.appendChild(dialog)

  var lbImg = dialog.querySelector('img')
  var lbCaption = dialog.querySelector('figcaption')
  var closeBtn = dialog.querySelector('.bear-gallery-close')
  var prevBtn = dialog.querySelector('.bear-gallery-prev')
  var nextBtn = dialog.querySelector('.bear-gallery-next')
  var currentIndex = -1
  var lastActiveEl = null
  var preloaded = {}

  function preload(index) {
    var src = photos[index].src
    if (!src || preloaded[src]) return
    preloaded[src] = true
    var im = new Image()
    im.src = src
  }

  function updateLb(index) {
    var total = photos.length
    currentIndex = ((index % total) + total) % total
    var photo = photos[currentIndex]
    lbImg.src = photo.src
    lbImg.alt = photo.alt
    lbCaption.textContent = photo.alt
    lbCaption.hidden = !photo.alt
    dialog.setAttribute('aria-label', 'Image ' + (currentIndex + 1) + ' of ' + total)
    preload((currentIndex + 1) % total)
    preload((currentIndex - 1 + total) % total)
  }

  function lockScroll() {
    var scrollY = window.scrollY
    document.body.style.position = 'fixed'
    document.body.style.top = '-' + scrollY + 'px'
    document.body.style.left = '0'
    document.body.style.right = '0'
    document.body.dataset.scrollY = scrollY
  }

  function unlockScroll() {
    var scrollY = document.body.dataset.scrollY || '0'
    document.body.style.position = ''
    document.body.style.top = ''
    document.body.style.left = ''
    document.body.style.right = ''
    window.scrollTo(0, parseInt(scrollY, 10))
  }

  function openAt(index) {
    lastActiveEl = document.activeElement
    updateLb(index)
    dialog.showModal()
    lockScroll()
  }

  dialog.addEventListener('close', function () {
    lbImg.removeAttribute('src')
    lbCaption.textContent = ''
    currentIndex = -1
    if (lastActiveEl && typeof lastActiveEl.focus === 'function') {
      lastActiveEl.focus({ preventScroll: true })
    }
    lastActiveEl = null
    unlockScroll()
  })

  dialog.addEventListener('click', function (e) {
    if (e.target === dialog) {
      e.stopPropagation()
    }
  })

  closeBtn.onclick = function () { dialog.close() }
  prevBtn.onclick = function () { updateLb(currentIndex - 1) }
  nextBtn.onclick = function () { updateLb(currentIndex + 1) }

  dialog.addEventListener('keydown', function (e) {
    if (e.key === 'ArrowRight') updateLb(currentIndex + 1)
    if (e.key === 'ArrowLeft') updateLb(currentIndex - 1)
  })

  var touchStartX = 0
  var touchCurrentX = 0
  var isDragging = false
  var dragWidth = 0

  dialog.addEventListener('touchstart', function (e) {
    if (e.target.closest('.bear-gallery-close, .bear-gallery-prev, .bear-gallery-next')) {
      isDragging = false
      return
    }
    touchStartX = e.touches[0].clientX
    touchCurrentX = touchStartX
    isDragging = true
    dragWidth = lbImg.getBoundingClientRect().width
    lbImg.style.transition = 'none'
  }, { passive: true })

  dialog.addEventListener('touchmove', function (e) {
    if (!isDragging) return
    touchCurrentX = e.touches[0].clientX
    var dx = touchCurrentX - touchStartX
    lbImg.style.transform = 'translateX(' + dx + 'px)'
  }, { passive: true })

  dialog.addEventListener('touchend', function () {
    if (!isDragging) return
    isDragging = false
    var dx = touchCurrentX - touchStartX
    var threshold = dragWidth * 0.2
    lbImg.style.transition = 'transform 0.25s ease'
    if (Math.abs(dx) > threshold) {
      lbImg.style.transform = 'translateX(' + (dx < 0 ? '-100%' : '100%') + ')'
      setTimeout(function () {
        updateLb(currentIndex + (dx < 0 ? 1 : -1))
        lbImg.style.transition = 'none'
        lbImg.style.transform = 'translateX(0)'
      }, 200)
    } else {
      lbImg.style.transform = 'translateX(0)'
    }
  }, { passive: true })
})
