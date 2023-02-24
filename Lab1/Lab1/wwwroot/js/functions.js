const error = 0.00001;
const cmykInfo = "<p>CMYK:<br>C (Cyan): 0 - 100%<br>M (Magenta): 0 - 100%<br>Y (Yellow): 0 - 100%<br>K (BlacK): 0 - 100%<\p>";
const labInfo = "<p>Lab:<br>L: 0.00 - 100.00<br>a: -128.00 - 128.00<br>b: -128.00 - 128.00<\p>";
const hsvInfo = "<p>HCV:<br>H: 0 - 360°<br>C: 0 - 100%<br>V: 0 - 100%<\p>";
const disclamer = "<p>*conversion is carried out with rounding</p>"
var picker, CMYKinputs, HSVinputs, LABinputs

function RGBtoCMYK(rgb) {
    var K = Math.min(1 - rgb.r / 255, 1 - rgb.g / 255, 1 - rgb.b / 255);

    if (Math.abs(K - 1) <= error)
        return {
            K: 100,
            C: 0,
            M: 0,
            Y: 0
        }

    return {
        K: K * 100,
        C: (1 - rgb.r / 255 - K) / (1 - K) * 100,
        M: (1 - rgb.g / 255 - K) / (1 - K) * 100,
        Y: (1 - rgb.b / 255 - K) / (1 - K) * 100
    }
}

function CMYKtoRGB(cmyk) {
    return {
        R: 255 * (1 - cmyk.C / 100) * (1 - cmyk.K / 100),
        G: 255 * (1 - cmyk.M / 100) * (1 - cmyk.K / 100),
        B: 255 * (1 - cmyk.Y / 100) * (1 - cmyk.K / 100)
    }
}

function RGBtoXYZ(rgb) {
    function F(x) {
        return x >= 0.04025 ? Math.pow((x + 0.055) / 1.055, 2.4) : x / 12.92
    }

    var coeffs = [
        [0.412453, 0.357580, 0.180423],
        [0.212671, 0.715160, 0.072169],
        [0.019334, 0.119193, 0.950227]
    ];

    var rgbn = {
        Rn: F(rgb.R / 255) * 100,
        Gn: F(rgb.G / 255) * 100,
        Bn: F(rgb.B / 255) * 100
    };

    return {
        X: coeffs[0][0] * rgbn.Rn + coeffs[0][1] * rgbn.Gn + coeffs[0][2] * rgbn.Bn,
        Y: coeffs[1][0] * rgbn.Rn + coeffs[1][1] * rgbn.Gn + coeffs[1][2] * rgbn.Bn,
        Z: coeffs[2][0] * rgbn.Rn + coeffs[2][1] * rgbn.Gn + coeffs[2][2] * rgbn.Bn
    };
}

function XYZtoLAB(xyz) {
    function F(x) {
        return x >= 0.008856 ? Math.pow(x, 1 / 3) : 7.787 * x + 4 / 29;
    }

    var xyzw = {
        Xw: 95.047,
        Yw: 100,
        Zw: 108.883
    };

    return {
        L: (116 * F(xyz.Y / xyzw.Yw) - 16),
        A: (500 * (F(xyz.X / xyzw.Xw) - F(xyz.Y / xyzw.Yw))),
        B: (200 * (F(xyz.Y / xyzw.Yw) - F(xyz.Z / xyzw.Zw)))
    };
}

function LABtoXYZ(lab) {
    function F(x) {
        return Math.pow(x, 3) >= 0.008856 ? Math.pow(x, 3) : (x - 4 / 29) / 7.787;
    }

    var xyzw = {
        Xw: 95.047,
        Yw: 100,
        Zw: 108.883
    };

    return {
        Y: (F((lab.L + 16) / 116) * xyzw.Yw),
        X: (F(lab.A / 500 + (lab.L + 16) / 116) * xyzw.Xw),
        Z: (F((lab.L + 16) / 116 - lab.B / 200) * xyzw.Zw)
    };
}


function XYZtoRGB(xyz) {
    function F(x) {
        return x >= 0.0031308 ? (1.055 * Math.pow(x, 1 / 2.4) - 0.055) : 12.92 * x;
    }

    var coeffs = [
        [3.2406, -1.5372, -0.4986],
        [-0.9689, 1.8758, 0.0415],
        [0.0557, -0.2040, 1.0570]
    ];

    var rgbn = {
        Rn: coeffs[0][0] * (xyz.X / 100) + coeffs[0][1] * (xyz.Y / 100) + coeffs[0][2] * (xyz.Z / 100),
        Gn: coeffs[1][0] * (xyz.X / 100) + coeffs[1][1] * (xyz.Y / 100) + coeffs[1][2] * (xyz.Z / 100),
        Bn: coeffs[2][0] * (xyz.X / 100) + coeffs[2][1] * (xyz.Y / 100) + coeffs[2][2] * (xyz.Z / 100)
    }

    return {
        R: F(rgbn.Rn) * 255,
        G: F(rgbn.Gn) * 255,
        B: F(rgbn.Bn) * 255
    }
}

function RGBtoHSV(rgb) {
    rgbn = {
        Rn: rgb.R / 255,
        Gn: rgb.G / 255,
        Bn: rgb.B / 255
    }

    var rgbMax = Math.max(rgbn.Rn, rgbn.Gn, rgbn.Bn);
    var rgbMin = Math.min(rgbn.Rn, rgbn.Gn, rgbn.Bn);
    var delta = rgbMax - rgbMin;

    var H, S, V = rgbMax;

    if (delta <= error)
        return {
            H: 0,
            S: 0,
            V: V * 100
        };

    if (rgbMax > 0.0) {
        S = delta / rgbMax;
    }
    else {
        return {
            H: NaN,
            S: 0,
            V: V * 100
        }
    }

    if (Math.abs(rgbn.Rn - rgbMax) <= error)
        H = (rgbn.Gn - rgbn.Bn) / delta;
    else if (Math.abs(rgbn.Gn - rgbMax) <= error)
        H = 2.0 + (rgbn.Bn - rgbn.Rn) / delta;
    else
        H = 4.0 + (rgbn.Rn - rgbn.Gn) / delta;

    H *= 60.0

    if (H < 0.0)
        H += 360.0;


    return {
        H: H,
        S: S * 100,
        V: V * 100
    };
}

function HSVtoRGB(hsv) {

    hsv = {
        H: hsv.H,
        S: hsv.S / 100,
        V: hsv.V / 100
    };

    var hh, p, q, t, ff;
    var i;

    var R, G, B;

    if (hsv.S <= 0.0) {
        return {
            R: hsv.V * 255,
            G: hsv.V * 255,
            B: hsv.V * 255
        }
    }

    hh = hsv.H;
    if (hh >= 360.0)
        hh = 0.0;

    hh /= 60.0;
    i = Math.trunc(hh);
    ff = hh - i;
    p = hsv.V * (1.0 - hsv.S);
    q = hsv.V * (1.0 - (hsv.S * ff));
    t = hsv.V * (1.0 - (hsv.S * (1.0 - ff)));

    switch (i) {
        case 0:
            R = hsv.V;
            G = t;
            B = p;
            break;
        case 1:
            R = q;
            G = hsv.V;
            B = p;
            break;
        case 2:
            R = p;
            G = hsv.V;
            B = t;
            break;
        case 3:
            R = p;
            G = q;
            B = hsv.V;
            break;
        case 4:
            R = t;
            G = p;
            B = hsv.V;
            break;
        case 5:
        default:
            R = hsv.V;
            G = p;
            B = q;
            break;
    }

    return {
        R: R * 255,
        G: G * 255,
        B: B * 255
    }
}


function setIntervalCheck(input, left, right, msgAlarmHtml) {

    input.addEventListener('input', () => {
        if (input.value > right) {
            Swal.fire({
                icon: 'warning',
                position: 'top',
                html: msgAlarmHtml,
                timer: 1200,
                showConfirmButton: true
            });
            input.value = right;
        }

        if (input.value < left) {
            Swal.fire({
                icon: 'warning',
                position: 'top',
                html: msgAlarmHtml,
                timer: 1200,
                showConfirmButton: true
            });
            input.value = right;
            input.value = left;
        }
    })
}

function setNoneNegativeIntegerInput(input) {

    input.addEventListener('keydown', event => {
        const codes = [
            '.',
            ',',
            'e',
            '-'
        ]
        if (codes.includes(event.key)) {
            event.preventDefault();
            return false;
        }
        return true;
    })
}

function setUpdatedCMYK(input) {

    input.addEventListener('change', () => {
        var cmyk = {
            C: parseFloat(CMYKinputs.C.value),
            M: parseFloat(CMYKinputs.M.value),
            Y: parseFloat(CMYKinputs.Y.value),
            K: parseFloat(CMYKinputs.K.value)
        }

        var rgb = CMYKtoRGB(cmyk);
        picker.color.rgb = {
            r: rgb.R,
            g: rgb.G,
            b: rgb.B
        };

    });
    
}

function setUpdatedHSV(input) {
    input.addEventListener("change", () => {
        picker.color.hsv = {
            h: parseFloat(HSVinputs.H.value),
            s: parseFloat(HSVinputs.S.value),
            v: parseFloat(HSVinputs.V.value)
        }
    });
}

function setDefaultValue(input, defaultValue) {
    input.addEventListener('change', () => {
        if (input.value == '')
            input.value = defaultValue;
    });
}

function setCMYKinputsConfiguration() {
    Object.values(CMYKinputs).forEach(input => { setNoneNegativeIntegerInput(input) });
    Object.values(CMYKinputs).forEach(input => { setIntervalCheck(input, 0, 100, cmykInfo) });
    Object.values(CMYKinputs).forEach(input => { setDefaultValue(input, 0) });
    Object.values(CMYKinputs).forEach(input => { setUpdatedCMYK(input) });
}

function setHSVConfiguration() {

    Object.values(HSVinputs).forEach(input => { setNoneNegativeIntegerInput(input) });

    setIntervalCheck(HSVinputs.H, 0, 360, hsvInfo);
    setIntervalCheck(HSVinputs.S, 0, 100, hsvInfo);
    setIntervalCheck(HSVinputs.V, 0, 100, hsvInfo);

    Object.values(HSVinputs).forEach(input => { setDefaultValue(input, 0) });
    Object.values(HSVinputs).forEach(input => { setUpdatedHSV(input) });
}

function setUpdatedLAB(input)
{
    input.addEventListener("change", () => {
        
        var lab = {
            L: parseFloat(LABinputs.L.value),
            A: parseFloat(LABinputs.A.value),
            B: parseFloat(LABinputs.B.value)
        };
        
        var rgb = XYZtoRGB(LABtoXYZ(lab));
        picker.color.rgb = {
            r: rgb.R,
            g: rgb.G,
            b: rgb.B
        }
    })
}
function setLABConfiguration() {

    LABinputs.L.addEventListener('keydown', event => {
        const codes = [
            '.',
            'e',
            '-'
        ]
        if (codes.includes(event.key)) {
            event.preventDefault();
            return false;
        }
        return true;
    });
    LABinputs.A.addEventListener('keydown', event => {
        const codes = [
            '.',
            'e',
        ]
        if (codes.includes(event.key)) {
            event.preventDefault();
            return false;
        }
        return true;
    });

    LABinputs.B.addEventListener('keydown', event => {
        const codes = [
            '.',
            'e',
        ]
        if (codes.includes(event.key)) {
            event.preventDefault();
            return false;
        }
        return true;
    });

    setIntervalCheck(LABinputs.L, 0.00, 100.00, labInfo);
    setIntervalCheck(LABinputs.A, -128.00, 128.00, labInfo);
    setIntervalCheck(LABinputs.B, -128.00, 128.00, labInfo);

    Object.values(LABinputs).forEach(input => { setDefaultValue(input, 0) });
    Object.values(LABinputs).forEach( input => { setUpdatedLAB(input) });
}