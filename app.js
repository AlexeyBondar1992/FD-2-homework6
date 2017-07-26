(function () {
    'use strict';
    const PI = Math.PI;
    let canvasBack = document.getElementById('backgroundImage'),
        canvasActive = document.getElementById('activeField'),
        imageContainer = document.getElementById('image');
    let ctxBack = canvasBack.getContext('2d'),
        ctxActive = canvasActive.getContext('2d');
    let canvasHeight = 350, canvasWidth, cx, cy, radius;

    document.forms.fileForm.elements.file.addEventListener('change', function () {
        let file = this.files[0];
        this.blur();
        if (file) {
            let image = new Image();
            image.src = URL.createObjectURL(file);
            image.addEventListener('load', function () {
                canvasWidth = canvasBack.width = canvasActive.width = this.width * canvasHeight / this.height;
                canvasBack.height = this.height = canvasHeight;
                imageContainer.style.width = `${canvasWidth}px`;
                imageContainer.style.height = `${canvasHeight}px`;
                ctxBack.drawImage(this, 0, 0, canvasWidth, canvasHeight);
                renderActiveCanvas(cx = canvasWidth / 2, cy = canvasHeight / 2, radius = Math.min(canvasWidth, canvasHeight) / 4);
                URL.revokeObjectURL(this.src);
            });
        }
    });

    function renderActiveCanvas(cx, cy, r) {
        canvasActive.height = canvasHeight;
        ctxActive.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctxActive.fillRect(0, 0, canvasWidth, canvasHeight);
        ctxActive.fillStyle = 'rgb(255, 255, 255)';
        ctxActive.arc(cx, cy, r, 0, 2 * PI);
        ctxActive.globalCompositeOperation = 'destination-out';
        ctxActive.fill();
    }
    
    canvasActive.addEventListener('mousedown', function activation(event) {
        let bounds = this.getBoundingClientRect(),
            mouseX = event.clientX - bounds.left,
            mouseY = event.clientY - bounds.top,
            requestAnimation;
        let move = function (ev) {
            this.style.cursor = 'move';
            cx = ev.clientX - bounds.left;
            cy = ev.clientY - bounds.top;
            requestAnimation = requestAnimationFrame(renderActiveCanvas.bind(this, cx, cy, radius));
        };
        let scale = function (ev) {
            this.style.cursor = 'move';
            radius = Math.abs(ev.clientX - bounds.left - cx);
            requestAnimation = requestAnimationFrame(renderActiveCanvas.bind(this, cx, cy, radius));
        };
        if (((cx + radius - 10 <= mouseX && mouseX <= cx + radius + 10) || (cx - radius - 10 <= mouseX && mouseX <= cx - radius + 10)) && (cy - 20 <= mouseY && mouseY <= cy + 20)) {
            this.addEventListener('mousemove', scale);
            this.addEventListener('mouseup', function remove(ev) {
                removeListeners.call(this, remove);
            });
        } else {
            this.addEventListener('mousemove', move);
            this.addEventListener('mouseup', function remove(ev) {
                removeListeners.call(this, remove);
                renderActiveCanvas.call(this, cx = ev.clientX - bounds.left, cy = ev.clientY - bounds.top, radius);
            });
        }
        function removeListeners(remove) {
            this.removeEventListener('mousemove', move);
            this.removeEventListener('mousemove', scale);
            this.removeEventListener('mouseup', remove);
            cancelAnimationFrame(requestAnimation);
            this.style.cursor = 'default';
        }
    });
    document.forms.saveForm.addEventListener('submit', function (event) {
        event.preventDefault();
        let filename = this.elements.fileName.value;
        let canvasForSave = document.createElement('canvas'),
            ctxForSave = canvasForSave.getContext('2d');
        canvasForSave.height = canvasForSave.width = radius * 2;
        ctxForSave.beginPath();
        ctxForSave.arc(radius, radius, radius, 0, Math.PI*2, true);
        ctxForSave.closePath();
        ctxForSave.fill();
        ctxForSave.globalCompositeOperation = 'source-in';
        ctxForSave.drawImage(canvasBack, cx - radius, cy - radius, 2 * radius, 2 * radius, 0, 0, 2 * radius, 2 * radius,);
        canvasForSave.toBlob(function (blob) {
            let a = document.createElement('a');
            a.href = URL.createObjectURL(blob);
            a.download = filename + '.png';
            a.dispatchEvent(new MouseEvent('click'));
            URL.revokeObjectURL(a.href); //уничтожаем урл ссылку на blob и сам blob
        });
    });
}());