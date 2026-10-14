{
      "@context": "https://schema.org",
      "@type": "Festival",
      "name": "Alif 2k26 - Manhaj Fest",
      "description": "The premier arts and cultural festival by Manhajul Hidaya Da'wa Campus featuring creative arts, stage events, and live result tracking.",
      "url": "https://manhajulhidaya.vercel.app/Manhajul-fest.html",
      "image": "https://manhajulhidaya.vercel.app/main/main/dars.jpg",
      "eventStatus": "https://schema.org/EventScheduled",
      "eventAttendanceMode": "https://schema.org/OfflineEventAttendanceMode",
      "location": {
        "@type": "Place",
        "name": "Manhajul Hidaya Da'wa Campus",
        "address": {
          "@type": "PostalAddress",
          "streetAddress": "Nediyiruppu",
          "addressLocality": "Malappuram",
          "addressRegion": "Kerala",
          "postalCode": "673638",
          "addressCountry": "IN"
        }
      },
      "organizer": {
        "@type": "EducationalOrganization",
        "name": "Manhajul Hidaya Islamic Academy",
        "url": "https://manhajulhidaya.vercel.app/"
      }
    }

const scrollTopBtn = document.getElementById('scrollTopBtn');
    if(scrollTopBtn) {
        scrollTopBtn.addEventListener('click', function() {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    document.addEventListener("DOMContentLoaded", function() {
        document.querySelectorAll('.slide-scroll').forEach(el => {
            const text = el.textContent.trim().replace(/\s+/g, ' ');
            el.innerHTML = '';
            text.split('').forEach(char => {
                const span = document.createElement('span');
                span.classList.add('char');
                span.textContent = char; 
                el.appendChild(span);
            });
        });

        const scrollElements = document.querySelectorAll('.slide-scroll');
        function animateTextScroll() {
            scrollElements.forEach(slide => {
                const chars = slide.querySelectorAll('.char');
                if (chars.length === 0) return;
                const rect = slide.getBoundingClientRect();
                const start = window.innerHeight * 0.90; 
                const end = window.innerHeight * 0.25;  
                let progress = (start - rect.top) / (start - end);
                progress = Math.max(0, Math.min(progress, 1)); 
                chars.forEach((char, index) => {
                    const charProgress = index / chars.length;
                    char.style.opacity = progress > charProgress ? 1 : 0.1;
                });
            });
        }

        const counters = document.querySelectorAll('.counter-item h3');
        const runCounters = (el) => {
            const target = parseInt(el.getAttribute('data-target'));
            let count = 0;
            const step = target / 30;
            const update = () => {
                if (count < target) {
                    count += step;
                    el.innerText = Math.ceil(count);
                    setTimeout(update, 40);
                } else {
                    el.innerText = target;
                }
            };
            update();
        };

        const counterSection = document.querySelector('.counter-section');
        let counted = false;
        if (counterSection) {
            const observer = new IntersectionObserver((entries) => {
                if (entries[0].isIntersecting && !counted) {
                    counters.forEach(runCounters);
                    counted = true;
                }
            }, { threshold: 0.3 });
            observer.observe(counterSection);
        }

        window.addEventListener('scroll', animateTextScroll);
        window.addEventListener('resize', animateTextScroll);
        animateTextScroll();

        verifyImagesAndInit();
    });

    const masterData = {
        "Senior": [
            { name: "Qiraath", file: "Results/senior/sn-qiraath.png" },
            { name: "Speech Malayalam", file: "Results/senior/sn-speech-mal.png" },
            { name: "Speech English", file: "Results/senior/sn-speech-eng.png" },
            { name: "Speech Arabic", file: "Results/senior/sn-speech-arb.png" },
            { name: "Va'al", file: "Results/senior/sn-vaal.png" },
            { name: "Madh Song", file: "Results/senior/sn-madh-song.png" },
            { name: "Mappilappattu", file: "Results/senior/sn-mappilappattu.png" },
            { name: "Thadrees", file: "Results/senior/sn-thadrees.png" },
            { name: "Hifz", file: "Results/senior/sn-hifz.png" },
            { name: "Essay Malayalam", file: "Results/senior/sn-essay-mal.png" },
            { name: "Essay English", file: "Results/senior/sn-essay-eng.png" },
            { name: "Essay Arabic", file: "Results/senior/sn-essay-arb.png" },
            { name: "Story Writing", file: "Results/senior/sn-story-writing.png" },
            { name: "Poem Writing", file: "Results/senior/sn-poem-writing.png" },
            { name: "Quiz", file: "Results/senior/sn-quiz.png" },
            { name: "Social Treat", file: "Results/senior/sn-social-treat.png" },
            { name: "Mushavara Alfiyya", file: "Results/senior/sn-mushavara-alfiyya.png" },
            { name: "Nahv Test", file: "Results/senior/sn-nahv-test.png" },
            { name: "E-Poster", file: "Results/senior/sn-e-poster.png" },
            { name: "Translation MAL - ARA", file: "Results/senior/sn-translation-mal-ara.png" },
            { name: "Kifayathul Avam", file: "Results/senior/sn-kifayathul-avam.png" }
        ],
        "Junior": [
            { name: "Qiraath", file: "Results/junior/jn-qiraath.png" },
            { name: "Speech Malayalam", file: "Results/junior/jn-speech-mal.png" },
            { name: "Speech English", file: "Results/junior/jn-speech-eng.png" },
            { name: "Speech Arabic", file: "Results/junior/jn-speech-arb.png" },
            { name: "Va'al", file: "Results/junior/jn-vaal.png" },
            { name: "Madh Song", file: "Results/junior/jn-madh-song.png" },
            { name: "Hifz", file: "Results/junior/jn-hifz.png" },
            { name: "Swarf Test", file: "Results/junior/jn-swarf-test.png" },
            { name: "Essay Malayalam", file: "Results/junior/jn-essay-mal.png" },
            { name: "Essay English", file: "Results/junior/jn-essay-eng.png" },
            { name: "Essay Arabic", file: "Results/junior/jn-essay-arb.png" },
            { name: "Story Writing", file: "Results/junior/jn-story-writing.png" },
            { name: "Poem Writing", file: "Results/junior/jn-poem-writing.png" },
            { name: "Spelling Bee", file: "Results/junior/jn-spelling-bee.png" },
            { name: "Calligraphy", file: "Results/junior/jn-calligraphy.png" },
            { name: "Water Colour Drawing", file: "Results/junior/jn-water-colour-drawing.png" },
            { name: "Translation ENG - MAL", file: "Results/junior/jn-translation-eng-mal.png" },
            { name: "IQ Test", file: "Results/junior/jn-iq-test.png" },
            { name: "Caption Writing", file: "Results/junior/jn-caption-writing.png" },
            { name: "Quiz", file: "Results/junior/jn-quiz.png" }, 
            { name: "Hadith musabaqa", file: "Results/junior/jn-Hadith-musabaqa.png" }
        ],
        "Sub Junior": [
            { name: "Qiraath", file: "Results/sub-junior/sj-qiraath.png" },
            { name: "Speech Malayalam", file: "Results/sub-junior/sj-speech-mal.png" },
            { name: "Speech English", file: "Results/sub-junior/sj-speech-eng.png" },
            { name: "Madh Song", file: "Results/sub-junior/sj-madh-song.png" },
            { name: "Na'at", file: "Results/sub-junior/sj-na'at.png" },
            { name: "Swarf Test", file: "Results/sub-junior/sj-swarf-test.png" },
            { name: "Essay Malayalam", file: "Results/sub-junior/sj-essay-mal.png"},
            { name: "Essay English", file: "Results/sub-junior/sj-essay-eng.png" },
            { name: "Story Writing", file: "Results/sub-junior/sj-story-writing.png"},
            { name: "Poem Writing", file: "Results/sub-junior/sj-poem-writing.png"},
            { name: "Spelling Bee", file: "Results/sub-junior/sj-spelling-bee.png"},
            { name: "Quiz", file: "Results/sub-junior/sj-quiz.png" },
            { name: "Translation MAL - ENG", file: "Results/sub-junior/sj-translaton-mal-eng.png" },
            { name: "IQ Test", file: "Results/sub-junior/sj-iq-test.png" },
            { name: "Pencil Drawing", file: "Results/sub-junior/sj-pencil-drawing.png" },
            { name: "Caption Writing", file: "Results/sub-junior/sj-caption-writing.png" }
        ],
        "General": [
            { name: "Bilingual", file: "Results/general/gn-bilingual.png" },
            { name: "Book Discussion", file: "Results/general/gn-book-discussion.png" },
            { name: "Group Song A", file: "Results/general/gn-group-song-a.png" },
            { name: "Group Song B", file: "Results/general/gn-group-song-b.png" },
            { name: "Nasheeda", file: "Results/general/gn-nasheeda.png" },
            { name: "Qavali", file: "Results/general/gn-qavali.png" },
            { name: "Kuthuba", file: "Results/general/gn-kuthuba.png" },
            { name: "Maashira", file: "Results/general/gn-maashira.png" },
            { name: "Sports Magazine A", file: "Results/general/gn-sports-magazine-a.png" },
            { name: "Sports Magazine B", file: "Results/general/gn-sports-magazine-b.png" },
            { name: "Collage A", file: "Results/general/gn-collash-a.png" },
            { name: "Collage B", file: "Results/general/gn-collash-b.png" }
        ]
    };

    let filteredData = {};
    let currentCategory = "";
    let currentItem = "";

    async function verifyImagesAndInit() {
        const catBtn = document.getElementById('categoryText');
        catBtn.innerText = "Finding Results..."; 
        catBtn.parentElement.style.pointerEvents = 'none';
        
        const promises = [];
        
        for (const cat in masterData) {
            filteredData[cat] = [];
            for (const item of masterData[cat]) {
                if (item.file) {
                    const p = new Promise((resolve) => {
                        const img = new Image();
                        img.onload = () => {
                            filteredData[cat].push(item);
                            resolve();
                        };
                        img.onerror = () => {
                            resolve(); 
                        };
                        img.src = item.file;
                    });
                    promises.push(p);
                }
            }
        }
        
        await Promise.all(promises);
        
        for (const cat in filteredData) {
            if (filteredData[cat].length === 0) {
                delete filteredData[cat];
            }
        }
        
        const availableCats = Object.keys(filteredData);
        if (availableCats.length === 0) {
            catBtn.innerText = "No Results Uploaded Yet";
            return;
        }

        catBtn.innerText = "Select Category";
        catBtn.parentElement.style.pointerEvents = 'auto'; 
        
        initCategories();
    }

    function renderOptions(dataArray, containerId, textElementId, sheetId, type) {
        const container = document.getElementById(containerId);
        container.innerHTML = ''; 

        dataArray.forEach((item, index) => {
            const div = document.createElement('div');
            div.className = 'sheet-option';
            if(index === 0) div.classList.add('selected'); 

            const textSpan = document.createElement('span');
            textSpan.innerText = item;
            
            const icon = document.createElement('i');
            icon.className = index === 0 ? 'fa-solid fa-check-circle' : 'fa-regular fa-circle';

            div.appendChild(textSpan);
            div.appendChild(icon);

            div.onclick = () => {
                if (item === "No Results Yet") return; 

                document.getElementById(textElementId).innerText = item;
                
                if (type === 'category') {
                    currentCategory = (item === "Select Category") ? "" : item;
                    populateItems(currentCategory);
                } else {
                    currentItem = (item === "Select Item") ? "" : item;
                }

                const allOptions = container.querySelectorAll('.sheet-option');
                allOptions.forEach(opt => {
                    opt.classList.remove('selected');
                    opt.querySelector('i').className = 'fa-regular fa-circle';
                });
                div.classList.add('selected');
                icon.className = 'fa-solid fa-check-circle';

                closeAllSheets();
                
                if(currentCategory && currentItem) {
                    setTimeout(checkAndShowResult, 300);
                }
            };
            container.appendChild(div);
        });
    }

    function initCategories() {
        const categories = ["Select Category", ...Object.keys(filteredData)];
        renderOptions(categories, 'categoryOptions', 'categoryText', 'categorySheet', 'category');
        populateItems(""); 
    }

    function populateItems(categoryName) {
        let items = ["Select Item"];
        if (categoryName && filteredData[categoryName]) {
            items = items.concat(filteredData[categoryName].map(i => i.name));
        }
        renderOptions(items, 'itemOptions', 'itemText', 'itemSheet', 'item');
        document.getElementById('itemText').innerText = "Select Item";
        currentItem = "";
        document.getElementById('imageDisplay').style.display = 'none';
    }

    function checkAndShowResult() {
        if (currentCategory && currentItem) {
            const categoryData = filteredData[currentCategory];
            const selectedItem = categoryData.find(i => i.name === currentItem);
            
            if (selectedItem) {
                showResult(currentCategory, selectedItem.name, selectedItem.file);
            }
        }
    }

    function showResult(category, itemName, fileName) {
        const displayDiv = document.getElementById('imageDisplay');
        const imgEl = document.getElementById('resultImage');
        const titleEl = document.getElementById('resultTitle');
        const downloadBtn = document.getElementById('downloadBtn');
        
        titleEl.innerText = `${category} - ${itemName}`;
        
        imgEl.onerror = () => {
             imgEl.src = "https://via.placeholder.com/600x400/e2e8f0/059669?text=Result+Image+Not+Found";
             downloadBtn.style.display = 'none'; 
        };
        imgEl.onload = () => {
            if(!imgEl.src.includes('placeholder.com')) {
                downloadBtn.style.display = 'inline-block';
            }
        };

        imgEl.src = fileName; 
        
        downloadBtn.href = fileName;
        downloadBtn.download = `${category}_${itemName.replace(/\s+/g, '_')}.png`;

        displayDiv.style.display = 'block';
    }

    const overlay = document.getElementById('overlay');
    function openSheet(sheetId) {
        overlay.classList.add('active');
        document.getElementById(sheetId).classList.add('active');
        document.body.style.overflow = 'hidden';
    }
    function closeAllSheets() {
        overlay.classList.remove('active');
        document.querySelectorAll('.bottom-sheet').forEach(sheet => sheet.classList.remove('active'));
        document.body.style.overflow = 'auto';
    }

    const searchInput = document.getElementById('globalSearch');
    const searchResultsDropdown = document.getElementById('searchResultsDropdown');

    searchInput.addEventListener('input', function(e) {
        const query = e.target.value.toLowerCase().trim();
        searchResultsDropdown.innerHTML = '';
        
        if (query.length === 0) {
            searchResultsDropdown.style.display = 'none';
            return;
        }
        
        let matches = [];
        for (const [cat, items] of Object.entries(filteredData)) {
            for (const item of items) {
                if (item.name.toLowerCase().includes(query) || cat.toLowerCase().includes(query)) {
                    matches.push({ cat, name: item.name, file: item.file });
                }
            }
        }

        if (matches.length > 0) {
            matches.forEach(match => {
                const div = document.createElement('div');
                div.className = 'search-result-item';
                div.innerHTML = `<span class="cat-badge">${match.cat}</span><span class="item-name">${match.name}</span>`;
                
                div.onclick = () => {
                    currentCategory = match.cat;
                    currentItem = match.name;
                    
                    document.getElementById('categoryText').innerText = match.cat;
                    populateItems(match.cat);
                    
                    document.getElementById('itemText').innerText = match.name;
                    const itemOptions = document.getElementById('itemOptions').querySelectorAll('.sheet-option');
                    itemOptions.forEach(opt => {
                        if(opt.innerText.trim() === match.name) {
                            opt.classList.add('selected');
                            opt.querySelector('i').className = 'fa-solid fa-check-circle';
                        } else {
                            opt.classList.remove('selected');
                            opt.querySelector('i').className = 'fa-regular fa-circle';
                        }
                    });

                    showResult(match.cat, match.name, match.file);
                    
                    searchResultsDropdown.style.display = 'none';
                    searchInput.value = '';
                };
                searchResultsDropdown.appendChild(div);
            });
            searchResultsDropdown.style.display = 'block';
        } else {
            const noRes = document.createElement('div');
            noRes.className = 'search-result-item';
            noRes.style.cursor = 'default';
            noRes.innerHTML = `<span class="item-name text-muted">No programs found...</span>`;
            searchResultsDropdown.appendChild(noRes);
            searchResultsDropdown.style.display = 'block';
        }
    });

    document.addEventListener('click', function(e) {
        if (!document.querySelector('.search-container').contains(e.target)) {
            searchResultsDropdown.style.display = 'none';
        }
    });