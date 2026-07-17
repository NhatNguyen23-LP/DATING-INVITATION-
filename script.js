document.addEventListener("DOMContentLoaded", function() {
    // 1. Kích hoạt hiệu ứng chữ xuất hiện
    AOS.init({ duration: 1000, once: false });

    // 2. Kích hoạt lịch chấm đỏ - CHẠY TỚI NGÀY 22
    setupRunningCalendar("nail-calendar-section", "grid-nail", 21, "running-dot-nail", "nail-reached");
    setupRunningCalendar("date-calendar-section", "grid-date", 22, "running-dot-date", "date-reached");

    // ==========================================
    // 3. LOGIC CHUYỂN QUẢ CẦU THÀNH VŨ TRỤ BAY TÁCH RỜI NHAU
    // ==========================================
    const globeWrapper = document.getElementById("globe-wrapper");
    const globeSphere = document.getElementById("globe-sphere");
    const globeItems = document.getElementById("globe-items");
    
    const galaxyTitle = document.getElementById("galaxy-title");
    const galaxyHint = document.getElementById("galaxy-hint");
    
    const btnReturn = document.getElementById("btn-return");
    const imageViewer = document.getElementById("image-viewer");
    const imageViewerInner = document.getElementById("image-viewer-inner");
    const heartsContainer = document.getElementById("hearts-container");
    
    if (globeWrapper) {
        
        // 🎇 TẠO QUY LUẬT TÁCH RỜI 36 ẢNH (Phân bổ rộng và có chiều sâu)
        const gItems = document.querySelectorAll(".globe-item");
        gItems.forEach((item, index) => {
            // Tính bán kính đẩy ra ngoài (văng rộng ra dần)
            let baseRadius = window.innerWidth > 768 ? 260 : 160;
            let radiusStep = window.innerWidth > 768 ? 10 : 5; // Do 36 tấm nên giảm step xuống
            let exRadius = baseRadius + (index * radiusStep); 

            // Tính độ nhấp nhô lượn sóng Y
            let waveHeight = window.innerWidth > 768 ? 250 : 150;
            let exTy = Math.sin(index * 1.5) * waveHeight; 

            // Tính độ tản ngang X
            let exTx = Math.cos(index * 2.3) * 80;

            // Đẩy dữ liệu tính toán vào CSS để bung
            item.style.setProperty('--ex-radius', `${exRadius}px`);
            item.style.setProperty('--ex-ty', `${exTy}px`);
            item.style.setProperty('--ex-tx', `${exTx}px`);
            
            // Xếp so le thời gian nhấp nhô
            let inner = item.querySelector('.globe-item-inner');
            if(inner) {
                inner.style.animationDelay = `-${index * 0.2}s`;
            }
        });

        // 🔄 LOGIC VUỐT ĐỂ XOAY CẢ DẢI NGÂN HÀ LẪN ĐỊA CẦU
        let rotY = 0;
        let rotX = 15;
        let isDragging = false;
        let hasMoved = false; 
        let startX = 0, startY = 0;
        let autoRotate = true;
        let heartInterval;

        function updateGlobe() {
            let bgX = (rotY / 360) * 600;
            if(globeSphere) globeSphere.style.backgroundPosition = `${bgX}px 0`;
            if(globeItems) globeItems.style.transform = `rotateX(${rotX}deg) rotateY(${rotY}deg)`;
        }

        // Tự quay 3D mượt mà
        function animateGlobe() {
            if (autoRotate) {
                rotY += globeWrapper.classList.contains("exploded") ? 0.08 : 0.25; 
                updateGlobe();
            }
            requestAnimationFrame(animateGlobe);
        }
        animateGlobe();

        // Xử lý Vuốt Chạm (Tay & Chuột)
        function onPointerDown(e) {
            isDragging = true;
            autoRotate = false;
            hasMoved = false;
            let clientX = e.type.includes('mouse') ? e.clientX : e.touches[0].clientX;
            let clientY = e.type.includes('mouse') ? e.clientY : e.touches[0].clientY;
            startX = clientX; startY = clientY;
        }

        function onPointerMove(e) {
            if (!isDragging) return;
            let clientX = e.type.includes('mouse') ? e.clientX : e.touches[0].clientX;
            let clientY = e.type.includes('mouse') ? e.clientY : e.touches[0].clientY;
            let deltaX = clientX - startX;
            let deltaY = clientY - startY;

            // Phân biệt Vuốt và Nhấp
            if (Math.abs(deltaX) > 3 || Math.abs(deltaY) > 3) hasMoved = true;
            
            rotY += deltaX * 0.4;
            rotX -= deltaY * 0.4; 
            rotX = Math.max(-50, Math.min(50, rotX));

            startX = clientX; startY = clientY;
            updateGlobe();
        }

        function onPointerUp(e) {
            if (!isDragging) return;
            isDragging = false;
            setTimeout(() => { if (!isDragging) autoRotate = true; }, 1500);
        }

        globeWrapper.addEventListener('mousedown', onPointerDown);
        globeWrapper.addEventListener('touchstart', onPointerDown, {passive: true});
        
        window.addEventListener('mousemove', onPointerMove);
        window.addEventListener('touchmove', function(e) {
            if(isDragging && e.target.closest("#globe-wrapper")) { 
                e.preventDefault(); 
                onPointerMove(e); 
            } else if (isDragging) {
                onPointerMove(e);
            }
        }, {passive: false});
        
        window.addEventListener('mouseup', onPointerUp);
        window.addEventListener('touchend', onPointerUp);

        // ❤️ HIỆU ỨNG THẢ TIM LIÊN TỤC DÀY ĐẶC LÚC NỔ
        function spawnHeart() {
            const heart = document.createElement("i");
            heart.className = "fa-solid fa-heart floating-heart";
            heart.style.left = (Math.random() * 90 + 5) + "vw"; 
            heart.style.animationDuration = (Math.random() * 3 + 3) + "s"; 
            heart.style.fontSize = (Math.random() * 1.5 + 0.8) + "rem"; 
            if(heartsContainer) heartsContainer.appendChild(heart);
            setTimeout(() => heart.remove(), 6000); 
        }

        // HÀM GỌI KHI NHẤP VÀO QUẢ CẦU
        function explodeGlobe() {
            globeWrapper.classList.add("exploded");
            btnReturn.classList.add("show");
            galaxyTitle.classList.add("fade-out-text");
            galaxyHint.classList.add("fade-out-text");
            
            spawnHeart();
            heartInterval = setInterval(spawnHeart, 300);
        }

        // HÀM GỌI KHI NHẤP NÚT QUAY LẠI
        function revertGlobe() {
            globeWrapper.classList.remove("exploded");
            btnReturn.classList.remove("show");
            galaxyTitle.classList.remove("fade-out-text");
            galaxyHint.classList.remove("fade-out-text");
            
            clearInterval(heartInterval);
            if(heartsContainer) heartsContainer.innerHTML = '';
        }

        // 👆 TRUNG TÂM KIỂM SOÁT NHẤP CHUỘT
        document.addEventListener("click", function(e) {
            if (!globeWrapper || !btnReturn || !imageViewer) return;

            // Bấm Nút quay lại
            if (e.target.closest("#btn-return")) {
                if (imageViewer.classList.contains("show")) {
                    imageViewer.classList.remove("show"); 
                } else {
                    revertGlobe(); 
                }
                return;
            }

            // Bấm nền đen
            if (e.target.closest("#image-viewer")) {
                imageViewer.classList.remove("show");
                return;
            }

            // Bấm vào ảnh lơ lửng -> Phóng to 
            const clickedItem = e.target.closest(".globe-item-inner");
            if (clickedItem && globeWrapper.classList.contains("exploded") && !hasMoved) {
                const bgImage = clickedItem.style.backgroundImage;
                if (bgImage && !clickedItem.classList.contains("empty-slot")) {
                    imageViewerInner.style.backgroundImage = bgImage;
                    imageViewer.classList.add("show");
                }
                return;
            }

            // Bấm vào quả cầu -> Nổ
            const clickedGlobe = e.target.closest("#globe-rotator") || e.target.closest("#globe-wrapper");
            if (clickedGlobe && !globeWrapper.classList.contains("exploded") && !hasMoved) {
                explodeGlobe();
            }
        });
    }
});

// Chạy lịch
function setupRunningCalendar(sectionId, gridId, targetDayNum, dotClassName, reachedClassName) {
    const section = document.getElementById(sectionId);
    const grid = document.getElementById(gridId);
    const container = document.querySelector('.scroll-container'); 
    let hasAnimated = false;
    if (!container || !section || !grid) return;
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting && !hasAnimated) {
                hasAnimated = true;
                setTimeout(() => { startDotAnimation(grid, targetDayNum, dotClassName, reachedClassName); }, 400);
            }
        });
    }, { root: container, threshold: 0.3 });
    observer.observe(section);
}

function startDotAnimation(grid, targetDayNum, dotClassName, reachedClassName) {
    const dot = document.createElement("div");
    dot.className = dotClassName;
    grid.appendChild(dot);
    let currentDay = 1;
    function moveStep() {
        const currentElement = grid.querySelector(`[data-day="${currentDay}"]`);
        if (currentElement) {
            const gridRect = grid.getBoundingClientRect();
            const elemRect = currentElement.getBoundingClientRect();
            const targetLeft = (elemRect.left + elemRect.width / 2) - gridRect.left;
            const targetTop = (elemRect.top + elemRect.height / 2) - gridRect.top;
            dot.style.left = targetLeft + "px";
            dot.style.top = targetTop + "px";
        }
        if (currentDay < targetDayNum) {
            currentDay++;
            setTimeout(moveStep, 130); 
        } else {
            setTimeout(() => {
                const targetElement = grid.querySelector(`[data-day="${targetDayNum}"]`);
                if (targetElement) {
                    targetElement.classList.add(reachedClassName);
                    const popIcon = targetElement.querySelector(".pop-icon");
                    if (popIcon) popIcon.classList.add("show-pop");
                }
                dot.remove(); 
            }, 150);
        }
    }
    moveStep();
}