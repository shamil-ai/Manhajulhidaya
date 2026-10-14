tailwind.config = {
            theme: {
                extend: {
                    colors: {
                        'brand-green': '#0e9f6e',
                    }
                }
            }
        }

let allPhotos = [];
        let currentIndex = 0;
        let galleryData = {};

        function openLightbox(index) {
            currentIndex = index;
            updateLightbox();
            const lightbox = document.getElementById('lightbox');
            lightbox.classList.remove('hidden');
            lightbox.classList.add('flex');
        }

        function closeLightbox() {
            const lightbox = document.getElementById('lightbox');
            lightbox.classList.add('hidden');
            lightbox.classList.remove('flex');
        }

        function updateLightbox() {
            if (allPhotos.length === 0) return;
            document.getElementById('lightbox-img').src = allPhotos[currentIndex];
            document.getElementById('photo-counter').innerText = `${currentIndex + 1} / ${allPhotos.length}`;
        }

        function nextPhoto(event) {
            if (event) event.stopPropagation();
            if (allPhotos.length === 0) return;
            currentIndex = (currentIndex + 1) % allPhotos.length;
            updateLightbox();
        }

        function prevPhoto(event) {
            if (event) event.stopPropagation();
            if (allPhotos.length === 0) return;
            currentIndex = (currentIndex - 1 + allPhotos.length) % allPhotos.length;
            updateLightbox();
        }

        async function downloadSinglePhoto(imageUrl, event) {
            if (event) event.stopPropagation();
            try {
                const response = await fetch(imageUrl);
                const blob = await response.blob();
                const blobUrl = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = blobUrl;
                a.download = imageUrl.split('/').pop() || 'photo.jpg';
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(blobUrl);
            } catch (error) {
                window.open(imageUrl, '_blank');
            }
        }

        async function downloadCurrentPhoto() {
            if (allPhotos.length > 0) {
                downloadSinglePhoto(allPhotos[currentIndex]);
            }
        }

        document.getElementById('lightbox').addEventListener('click', function(e) {
            if (e.target === this) closeLightbox();
        });

        let touchStartX = 0, touchEndX = 0;
        const lightboxContainer = document.getElementById('lightbox-img-container');
        lightboxContainer.addEventListener('touchstart', e => { touchStartX = e.changedTouches[0].screenX; }, { passive: true });
        lightboxContainer.addEventListener('touchend', e => {
            touchEndX = e.changedTouches[0].screenX;
            if (touchEndX < touchStartX - 40) nextPhoto();
            else if (touchEndX > touchStartX + 40) prevPhoto();
        }, { passive: true });

        const scrollTopBtn = document.getElementById('scrollTopBtn');
        const scrollContainer = document.getElementById('gallery-scroll-container');
        if (scrollTopBtn && scrollContainer) {
            scrollTopBtn.addEventListener('click', () => scrollContainer.scrollTo({ top: 0, behavior: 'smooth' }));
        }

        function renderGallery(folderName) {
            const container = document.getElementById('gallery-container');
            container.innerHTML = '';
            allPhotos = [];

            document.querySelectorAll('.folder-tab').forEach(tab => {
                if (tab.dataset.folder === folderName) {
                    tab.classList.remove('bg-white/20', 'text-white', 'border-white/30');
                    tab.classList.add('bg-white', 'text-brand-green', 'border-white');
                } else {
                    tab.classList.remove('bg-white', 'text-brand-green', 'border-white');
                    tab.classList.add('bg-white/20', 'text-white', 'border-white/30');
                }
            });

            const images = galleryData[folderName] || [];

            if (images.length === 0) {
                container.innerHTML = '<p class="text-gray-500 col-span-full text-center py-12 text-sm">No photos found in this folder.</p>';
                return;
            }

            images.forEach(imagePath => {
                if (/\.(jpg|jpeg|png|webp)$/i.test(imagePath)) {
                    
                    let finalPath = imagePath;
                    if (!imagePath.startsWith(folderName + '/')) {
                        finalPath = `${folderName}/${imagePath}`;
                    }
                    
                    const imageUrl = `https://raw.githubusercontent.com/shamil-ai/Grs/main/${encodeURI(finalPath)}`;
                    
                    const photoIndex = allPhotos.length;
                    allPhotos.push(imageUrl);

                    const card = document.createElement('div');
                    card.className = "img-card bg-white rounded overflow-hidden shadow-sm border border-gray-200 cursor-pointer aspect-square relative group";
                    card.onclick = () => openLightbox(photoIndex);

                    const img = document.createElement('img');
                    img.src = imageUrl;
                    img.alt = "Gallery Event Photo";
                    img.className = "w-full h-full object-cover bg-gray-100";
                    img.loading = "lazy";
                    img.onerror = function() {
                        this.src = "https://via.placeholder.com/150?text=Image+Error";
                    };

                    const dlBtn = document.createElement('button');
                    dlBtn.className = "absolute bottom-1 right-1 bg-black/60 hover:bg-brand-green text-white p-1 rounded-full shadow transition z-10 flex items-center justify-center";
                    dlBtn.setAttribute('title', 'Download Photo');
                    dlBtn.innerHTML = `<svg class="w-3 h-3 fill-current" viewBox="0 0 20 20"><path d="M13 8V2H7v6H2l8 8 8-8h-5zM0 18h20v2H0v-2z"/></svg>`;
                    dlBtn.onclick = (e) => downloadSinglePhoto(imageUrl, e);

                    card.appendChild(img);
                    card.appendChild(dlBtn);
                    container.appendChild(card);
                }
            });
        }

        // Fetching Gallery Data directly from Root
        fetch('https://raw.githubusercontent.com/shamil-ai/Grs/main/gallery.json?t=' + new Date().getTime())
            .then(response => {
                if (!response.ok) throw new Error('Gallery data not found');
                return response.json();
            })
            .then(data => {
                galleryData = data;
                const tabsContainer = document.getElementById('folder-tabs');
                tabsContainer.innerHTML = '';
                
                const folders = Object.keys(data).sort().reverse();
                
                if (folders.length === 0) {
                    document.getElementById('gallery-container').innerHTML = '<p class="text-gray-500 col-span-full text-center py-12 text-sm">No valid photos uploaded yet.</p>';
                    return;
                }

                folders.forEach(folder => {
                    const btn = document.createElement('button');
                    
                    // Format Folder Names
                    let displayName = folder;
                    const lowerFolder = folder.toLowerCase();

                    if (lowerFolder.startsWith('alif-')) {
                        displayName = folder.replace(/alif-/i, 'Alif ').replace('-', '.');
                    } else if (lowerFolder.includes('alifmanhaj')) {
                        displayName = 'Alif Manhaj';
                    } else {
                        displayName = folder.charAt(0).toUpperCase() + folder.slice(1);
                    }
                    
                    btn.className = "folder-tab text-xs font-medium px-4 py-1.5 rounded-full shadow transition border hover:bg-white/40 cursor-pointer";
                    btn.innerText = displayName;
                    btn.dataset.folder = folder;
                    
                    // --- പാസ്‌വേഡ് സിസ്റ്റം (പുതുക്കിയത്) ---
                    btn.onclick = () => {
                        // പേരിൽ എവിടെയെങ്കിലും "5.0" ഉണ്ടെങ്കിൽ പാസ്‌വേഡ് ചോദിക്കില്ല
                        if (folder.includes('5.0') || displayName.includes('5.0')) {
                            renderGallery(folder); 
                        } else {
                            const userPass = prompt("Please enter the password to view " + displayName + ":");
                            if (userPass === "msa") {
                                renderGallery(folder); 
                            } else if (userPass !== null) {
                                alert("Incorrect Password! Access Denied.");
                            }
                        }
                    };
                    
                    tabsContainer.appendChild(btn);
                });

                // വെബ്സൈറ്റ് ആദ്യം ലോഡ് ആകുമ്പോൾ പാസ്‌വേഡ് ചോദിക്കാതെ Alif 5.0 (അല്ലെങ്കിൽ 5.0 ഉള്ള ഫോൾഡർ) തുറക്കാൻ:
                const alif5Folder = folders.find(f => f.includes('5.0'));
                if (alif5Folder) {
                    renderGallery(alif5Folder);
                } else {
                    document.getElementById('gallery-container').innerHTML = '<p class="text-gray-500 col-span-full text-center py-12 text-sm">Please select a folder to view photos.</p>';
                }
            })
            .catch(error => {
                console.error('Error loading gallery:', error);
                const container = document.getElementById('gallery-container');
                container.innerHTML = '<p class="text-red-500 col-span-full text-center py-12 text-sm">Failed to load photos. Please try again later.</p>';
            });