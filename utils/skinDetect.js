function skinDetection(image) {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    // Set canvas size to the image size
    canvas.width = image.width;
    canvas.height = image.height;

    // Draw the image on the canvas
    ctx.drawImage(image, 0, 0, image.width, image.height);

    // Get the image data
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;

    // Define the bounds for skin detection in HSV and YCrCb
    const lowerBoundHSV = {h: 0, s: 15, v: 0};
    const upperBoundHSV = {h: 17, s: 170, v: 255};
    const lowerBoundYCrCb = {y: 0, cr: 135, cb: 85};
    const upperBoundYCrCb = {y: 255, cr: 180, cb: 135};

    // Create an empty mask
    const mask = new Uint8ClampedArray(data.length / 4);

    for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];

        // Convert RGB to HSV
        const hsv = rgbToHsv(r, g, b);

        // Convert RGB to YCrCb
        const ycrcb = rgbToYCrCb(r, g, b);

        // Check if the pixel falls within the skin color range in both color spaces
        if (inRange(hsv.h, hsv.s, hsv.v, lowerBoundHSV, upperBoundHSV) &&
            inRange(ycrcb.y, ycrcb.cr, ycrcb.cb, lowerBoundYCrCb, upperBoundYCrCb)) {
            mask[i / 4] = 255; // Mark as skin pixel
        }
    }

    return mask;
}

function skinExposure(mask, width, height) {
    const skinPixels = mask.reduce((sum, value) => sum + (value > 0 ? 1 : 0), 0);
    const totalPixels = width * height;
    return skinPixels / totalPixels;
}

function rgbToHsv(r, g, b) {
    r /= 255;
    g /= 255;
    b /= 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h, s, v = max;
    const d = max - min;
    s = max === 0 ? 0 : d / max;
    if (max === min) {
        h = 0; // achromatic
    } else {
        switch (max) {
            case r: h = (g - b) / d + (g < b ? 6 : 0); break;
            case g: h = (b - r) / d + 2; break;
            case b: h = (r - g) / d + 4; break;
        }
        h /= 6;
    }
    return {h: h * 360, s: s * 100, v: v * 100};
}

function rgbToYCrCb(r, g, b) {
    const y = 0.299 * r + 0.587 * g + 0.114 * b;
    const cr = (r - y) * 0.713 + 128;
    const cb = (b - y) * 0.564 + 128;
    return {y, cr, cb};
}

function inRange(h, s, v, lowerBound, upperBound) {
    return (
        h >= lowerBound.h && h <= upperBound.h &&
        s >= lowerBound.s && s <= upperBound.s &&
        v >= lowerBound.v && v <= upperBound.v
    );
}

function inRangeYCrCb(y, cr, cb, lowerBound, upperBound) {
    return (
        y >= lowerBound.y && y <= upperBound.y &&
        cr >= lowerBound.cr && cr <= upperBound.cr &&
        cb >= lowerBound.cb && cb <= upperBound.cb
    );
}
