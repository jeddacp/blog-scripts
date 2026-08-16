document.addEventListener('DOMContentLoaded', function () {
  if (window.__bearGalleryLightbox) return
  window.__bearGalleryLightbox = true
  const galleries = Array.from(document.querySelectorAll('.bear-gallery'))
  if (!galleries.length) return
  const photos = []
  galleries.forEach(function (root) {
    const imgs = Array.from(root.querySelectorAll('img'))
    const items = imgs.map(function (img) {
      const index = photos.length
      photos.push({ src: img.currentSrc || img.src, alt: img.alt || '' })
      img.loading = 'lazy'
      img.decoding = 'async'
      const btn = document.createElement('button')
      btn.type = 'button'
      btn.className = 'bear-gallery-item'
      btn.ariaLabel = img.alt ? `Open image: ${img.alt}` : 'Open image'
      btn.appendChild(img)
      btn.onclick = function () { openAt(index) }
      return btn
    })
    root.replaceChildren(...items)
  })
  if (!photos.length) return

  const dialog = document.createElement('dialog')
  dialog.className = 'bear-gallery-lightbox'
  dialog.innerHTML =
    '<button class="bear-gallery-close" type="button" aria-label="Close image">&times;</button>' +
    '<button class="bear-gallery-prev" type="button" aria-label="Previous image">&lsaquo;</button>' +
    '<button class="bear-gallery-next" type="button" aria-label="Next image">&rsaquo;</button>' +
    '<figure class="bear-gallery-figure"><img alt=""><figcaption class="bear-gallery-caption"></figcaption></figure>'
  document.body.appendChild(dialog)

  const lbImg = dialog.querySelector('img')
  const lbCaption = dialog.querySelector('figcaption')
  const closeBtn = dialog.querySelector('.bear-gallery-close')
  const prevBtn = dialog.querySelector('.bear-gallery-prev')
  const nextBtn = dialog.querySelector('.bear-gallery-next')
  let currentIndex = -1
  let lastActiveEl = null
  const preloaded = new Set()

  function preload(index) {
    const src = photos[index].src
    if (!src || preloaded.has(src)) return
    preloaded.add(src)
    const im = new Image()
    im.src = src
  }

  function updateLb(index) {
    const total = photos.length
    currentIndex = ((index % total) + total) % total
    const photo = photos[currentIndex]
    lbImg.src = photo.src
    lbImg.alt = photo.alt
    lbCaption.textContent = photo.alt
    lbCaption.hidden = !photo.alt
    dialog.setAttribute('aria-label', `Image ${currentIndex + 1} of ${total}`)
    preload((currentIndex + 1) % total)
    preload((currentIndex - 1 + total) % total)
  }

  function openAt(index) {
    lastActiveEl = document.activeElement
    updateLb(index)
    dialog.showModal()
  }

  dialog.addEventListener('close', function () {
    lbImg.removeAttribute('src')
    lbCaption.textContent = ''
    currentIndex = -1
    if (lastActiveEl && typeof lastActiveEl.focus === 'function') {
      lastActiveEl.focus({ preventScroll: true })
    }
    lastActiveEl = null
  })

  closeBtn.onclick = function () { dialog.close() }
  prevBtn.onclick = function () { updateLb(currentIndex - 1) }
  nextBtn.onclick = function () { updateLb(currentIndex + 1) }

  dialog.addEventListener('click', function (e) {
    if (e.target === dialog || e.target.classList.contains('bear-gallery-figure')) dialog.close()
  })

  dialog.addEventListener('keydown', function (e) {
    if (e.key === 'ArrowRight') updateLb(currentIndex + 1)
    if (e.key === 'ArrowLeft') updateLb(currentIndex - 1)
  })

  let touchStartX = 0
  let touchCurrentX = 0
  let isDragging = false
  let dragWidth = 0

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
    const dx = touchCurrentX - touchStartX
    lbImg.style.transform = `translateX(${dx}px)`
  }, { passive: true })

  dialog.addEventListener('touchend', function () {
    if (!isDragging) return
    isDragging = false
    const dx = touchCurrentX - touchStartX
    const threshold = dragWidth * 0.2
    lbImg.style.transition = 'transform 0.25s ease'
    if (Math.abs(dx) > threshold) {
      lbImg.style.transform = `translateX(${dx < 0 ? '-100%' : '100%'})`
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
