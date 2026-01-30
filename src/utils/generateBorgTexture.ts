export const generateBorgTexture = (): string => {
    const canvas = document.createElement('canvas');
    const size = 1024;
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');

    if (!ctx) return '';

    // Base metal
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(0, 0, size, size);

    // Random plates
    const plates = 400;
    for (let i = 0; i < plates; i++) {
        const w = Math.random() * 100 + 20;
        const h = Math.random() * 100 + 20;
        const x = Math.random() * size;
        const y = Math.random() * size;
        const gray = Math.floor(Math.random() * 40 + 20); // 20-60
        ctx.fillStyle = `rgb(${gray}, ${gray}, ${gray})`;
        ctx.fillRect(x, y, w, h);

        // Borders for depth
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 2;
        ctx.strokeRect(x, y, w, h);
    }

    // Pipes / Greebles
    const pipes = 300;
    for (let i = 0; i < pipes; i++) {
        const isHorizontal = Math.random() > 0.5;
        const length = Math.random() * 200 + 50;
        const x = Math.random() * size;
        const y = Math.random() * size;
        const thickness = Math.random() * 6 + 1;

        ctx.fillStyle = '#050505';
        if (isHorizontal) {
            ctx.fillRect(x, y, length, thickness);
        } else {
            ctx.fillRect(x, y, thickness, length);
        }
    }

    // Green Lights (few)
    const lights = 50;
    for (let i = 0; i < lights; i++) {
        const x = Math.random() * size;
        const y = Math.random() * size;
        ctx.fillStyle = '#00ff00';
        ctx.fillRect(x, y, 4, 4);
        // Glow
        ctx.shadowColor = '#00ff00';
        ctx.shadowBlur = 10;
        ctx.fillRect(x, y, 4, 4);
        ctx.shadowBlur = 0;
    }

    return canvas.toDataURL();
};
