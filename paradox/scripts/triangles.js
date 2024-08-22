    function drawTriangles() {
        const canvas = document.getElementById('triangles');
        const ctx = canvas.getContext('2d');

        // 三角形のパラメータ
        const triangleSizeRange = { min: 35, max: 100 }; // 三角形の大きさ範囲
        const triangleAlphaRange = { min: 0.3, max: 0.6}; // 三角形の透明度範囲
        const scrollSpeedRange = { min: 0.2, max: 0.5 }; // スクロール速度範囲 (ピクセル/フレーム)
        const spawnFrequencyRange = { min: 500, max: 1000 }; // 出現頻度範囲 (ミリ秒)

        // 三角形を保持する配列
        const triangles = [];

        // 三角形を作成する関数
        function createTriangle() {
            const size = Math.random() * (triangleSizeRange.max - triangleSizeRange.min) + triangleSizeRange.min;
            const alpha = Math.random() * (triangleAlphaRange.max - triangleAlphaRange.min) + triangleAlphaRange.min;
            const speed = Math.random() * (scrollSpeedRange.max - scrollSpeedRange.min) + scrollSpeedRange.min;
            const x = Math.random() * canvas.width;
            const y = canvas.height + size; // 初期位置を画面の下に設定
            triangles.push({ x, y, size, alpha, speed });
        }

        // 三角形を描画する関数
        function renderTriangle(triangle) {
            ctx.beginPath();
            ctx.moveTo(triangle.x, triangle.y);
            ctx.lineTo(triangle.x - triangle.size / 2, triangle.y + triangle.size);
            ctx.lineTo(triangle.x + triangle.size / 2, triangle.y + triangle.size);
            ctx.closePath();
            ctx.strokeStyle = `rgba(195, 235, 255, ${triangle.alpha})`; // 青い半透明の三角形
            ctx.lineWidth = 2; // 線の太さを設定
            ctx.stroke(); // 線を描画
        }

        // アニメーションループ
        function animate() {
            ctx.clearRect(0, 0, canvas.width, canvas.height); // キャンバスをクリア

            // 各三角形を更新し描画
            triangles.forEach((triangle, index) => {
                triangle.y -= triangle.speed; // 三角形を上に移動
                renderTriangle(triangle);

                // 三角形が画面の上に到達したら削除
                if (triangle.y + triangle.size < 0) {
                    triangles.splice(index, 1);
                }
            });

            requestAnimationFrame(animate);
        }

        // 一定時間ごとに三角形を作成する
        function spawnTriangles() {
            createTriangle();
            const frequency = Math.random() * (spawnFrequencyRange.max - spawnFrequencyRange.min) + spawnFrequencyRange.min;
            setTimeout(spawnTriangles, frequency);
        }

        // アニメーションを開始
        animate();
        spawnTriangles();
    }