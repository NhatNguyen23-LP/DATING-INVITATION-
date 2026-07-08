document.addEventListener("DOMContentLoaded", function() {
    // 1. Kích hoạt hiệu ứng chữ xuất hiện mượt mà (AOS)
    AOS.init({ duration: 1000, once: false });

    // 2. Kích hoạt hoạt họa chạy chấm trên lịch (Bảo đảm chuẩn xác)
    setupRunningCalendar("nail-calendar-section", "grid-nail", 21, "running-dot-nail", "nail-reached");
    setupRunningCalendar("date-calendar-section", "grid-date", 23, "running-dot-date", "date-reached");
});

function setupRunningCalendar(sectionId, gridId, targetDayNum, dotClassName, reachedClassName) {
    const section = document.getElementById(sectionId);
    const grid = document.getElementById(gridId);
    const container = document.querySelector('.scroll-container'); // Khung cuộn mượt của ní
    let hasAnimated = false;

    if (!container || !section || !grid) return;

    // Sử dụng IntersectionObserver cao cấp, chỉ định rõ ràng root là cái khung cuộn container
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            // Khi trang lịch lọt vào tầm nhìn của khung cuộn từ 30% trở lên
            if (entry.isIntersecting && !hasAnimated) {
                hasAnimated = true;
                
                // Đợi 400ms cho màn hình bám dính (snap) ổn định rồi mới phóng chấm tròn đi cho đẹp
                setTimeout(() => {
                    startDotAnimation(grid, targetDayNum, dotClassName, reachedClassName);
                }, 400);
            }
        });
    }, {
        root: container, // BẮT BUỘC phải có dòng này để nhận diện cuộn trong scroll-container
        threshold: 0.3   // Hiện lên 30% là kích hoạt liền
    });

    observer.observe(section);
}

function startDotAnimation(grid, targetDayNum, dotClassName, reachedClassName) {
    // Tự động tạo chấm tròn động chèn vào lịch
    const dot = document.createElement("div");
    dot.className = dotClassName;
    grid.appendChild(dot);

    let currentDay = 1;
    
    function moveStep() {
        const currentElement = grid.querySelector(`[data-day="${currentDay}"]`);
        
        if (currentElement) {
            const gridRect = grid.getBoundingClientRect();
            const elemRect = currentElement.getBoundingClientRect();
            
            // Tính toán tọa độ chính xác ở tâm của từng ô số
            const targetLeft = (elemRect.left + elemRect.width / 2) - gridRect.left;
            const targetTop = (elemRect.top + elemRect.height / 2) - gridRect.top;
            
            dot.style.left = targetLeft + "px";
            dot.style.top = targetTop + "px";
        }

        if (currentDay < targetDayNum) {
            currentDay++;
            setTimeout(moveStep, 130); // Tốc độ trượt lướt qua từng ô ngày (ms)
        } else {
            // Khi chấm chạy đến ngày đích (21 hoặc 23)
            setTimeout(() => {
                const targetElement = grid.querySelector(`[data-day="${targetDayNum}"]`);
                if (targetElement) {
                    targetElement.classList.add(reachedClassName); // Đổi màu nền ô lịch
                    const popIcon = targetElement.querySelector(".pop-icon");
                    if (popIcon) popIcon.classList.add("show-pop"); // Bung icon nail/trái tim popup lên
                }
                dot.remove(); // Xóa chấm chạy tạm thời đi
            }, 150);
        }
    }
    
    moveStep();
}