    function drawTriangles() {
        const canvas = document.getElementById('triangles');
        const ctx = canvas.getContext('2d');

        const triangleSizeRange = { min: 35, max: 100 };
        const triangleAlphaRange = { min: 0.3, max: 0.6};
        const scrollSpeedRange = { min: 0.2, max: 0.5 };
        const spawnFrequencyRange = { min: 500, max: 1000 };

        const triangles = [];

        function createTriangle() {
            const size = Math.random() * (triangleSizeRange.max - triangleSizeRange.min) + triangleSizeRange.min;
            const alpha = Math.random() * (triangleAlphaRange.max - triangleAlphaRange.min) + triangleAlphaRange.min;
            const speed = Math.random() * (scrollSpeedRange.max - scrollSpeedRange.min) + scrollSpeedRange.min;
            const x = Math.random() * canvas.width;
            const y = canvas.height + size;
            triangles.push({ x, y, size, alpha, speed });
        }

        function renderTriangle(triangle) {
            ctx.beginPath();
            ctx.moveTo(triangle.x, triangle.y);
            ctx.lineTo(triangle.x - triangle.size / 2, triangle.y + triangle.size);
            ctx.lineTo(triangle.x + triangle.size / 2, triangle.y + triangle.size);
            ctx.closePath();
            ctx.strokeStyle = `rgba(195, 235, 255, ${triangle.alpha})`;
            ctx.lineWidth = 2;
            ctx.stroke();
        }

        function animate() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            triangles.forEach((triangle, index) => {
                triangle.y -= triangle.speed;
                renderTriangle(triangle);

                if (triangle.y + triangle.size < 0) {
                    triangles.splice(index, 1);
                }
            });

            requestAnimationFrame(animate);
        }

        function spawnTriangles() {
            createTriangle();
            const frequency = Math.random() * (spawnFrequencyRange.max - spawnFrequencyRange.min) + spawnFrequencyRange.min;
            setTimeout(spawnTriangles, frequency);
        }

        animate();
        spawnTriangles();
    }