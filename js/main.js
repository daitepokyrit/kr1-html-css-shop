document.addEventListener('DOMContentLoaded', () => {
    // 1. Генерация звукового эффекта клика (Web Audio API)
    let audioCtx = null;

    function playClickSound() {
        try {
            if (!audioCtx) {
                audioCtx = new (window.AudioContext || window.webkitAudioContext)();
            }
            if (audioCtx.state === 'suspended') {
                audioCtx.resume();
            }
            const osc = audioCtx.createOscillator();
            const gain = audioCtx.createGain();

            osc.type = 'sine';
            osc.frequency.setValueAtTime(600, audioCtx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(150, audioCtx.currentTime + 0.06);

            gain.gain.setValueAtTime(0.12, audioCtx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.06);

            osc.connect(gain);
            gain.connect(audioCtx.destination);

            osc.start();
            osc.stop(audioCtx.currentTime + 0.06);
        } catch (e) {
            // Игнорируем в браузерах без поддержки AudioContext
        }
    }

    // Привязываем звук ко всем кнопкам и стрелке наверх
    document.querySelectorAll('.button, .scroll-top').forEach(btn => {
        btn.addEventListener('click', () => playClickSound());
    });

    // 2. Управление модальным окном заявки
    const orderDialog = document.getElementById('order-dialog');
    const orderButtons = document.querySelectorAll('.product-card__button');
    const closeDialogButton = document.getElementById('close-order-dialog');
    const selectedProductInput = document.getElementById('selected-product');
    const orderForm = document.getElementById('order-form');
    const successMessage = document.getElementById('success-message');

    if (orderDialog && orderButtons.length > 0) {
        orderButtons.forEach((button) => {
            button.addEventListener('click', () => {
                const productName = button.dataset.product;
                if (selectedProductInput && productName) {
                    selectedProductInput.value = productName;
                }
                if (typeof orderDialog.showModal === 'function') {
                    orderDialog.showModal();
                }
            });
        });

        if (closeDialogButton) {
            closeDialogButton.addEventListener('click', () => {
                orderDialog.close();
            });
        }

        orderDialog.addEventListener('click', (event) => {
            const rect = orderDialog.getBoundingClientRect();
            const inDialog =
                rect.top <= event.clientY &&
                event.clientY <= rect.top + rect.height &&
                rect.left <= event.clientX &&
                event.clientX <= rect.left + rect.width;
            if (!inDialog) {
                orderDialog.close();
            }
        });
    }

    if (orderForm) {
        orderForm.addEventListener('submit', (event) => {
            event.preventDefault();

            const formElements = Array.from(orderForm.elements);
            formElements.forEach((element) => {
                if (element.willValidate) {
                    element.removeAttribute('aria-invalid');
                }
            });

            if (!orderForm.checkValidity()) {
                formElements.forEach((element) => {
                    if (element.willValidate && !element.checkValidity()) {
                        element.setAttribute('aria-invalid', 'true');
                    }
                });
                orderForm.reportValidity();
                return;
            }

            if (successMessage) {
                successMessage.hidden = false;
            }
            orderForm.reset();
            if (orderDialog && typeof orderDialog.close === 'function') {
                orderDialog.close();
            }
        });
    }
});