function toggleZoom(element) {
            if (element.classList.contains('zoomed')) {
                element.classList.remove('zoomed');
                document.querySelector('.zoom-overlay')?.classList.remove('active');
            } else {
                document.querySelectorAll('.article-diagram.zoomed').forEach(el => el.classList.remove('zoomed'));
                element.classList.add('zoomed');
                let overlay = document.querySelector('.zoom-overlay');
                if (!overlay) {
                    overlay = document.createElement('div');
                    overlay.className = 'zoom-overlay';
                    overlay.onclick = function() {
                        document.querySelectorAll('.article-diagram.zoomed').forEach(el => el.classList.remove('zoomed'));
                        overlay.classList.remove('active');
                    };
                    document.body.appendChild(overlay);
                }
                overlay.classList.add('active');
            }
        }
