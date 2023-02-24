
var infoButton = document.getElementById("info");
infoButton.addEventListener('click', () => {
    Swal.fire({
        title: 'Info',
        html: cmykInfo + "<hr>" + labInfo + "<hr>" + hsvInfo + "<hr>" + disclamer,
        text: 'hello'
    })
});

CMYKinputs = {
    C: document.getElementById("inputC"),
    M: document.getElementById("inputM"),
    Y: document.getElementById("inputY"),
    K: document.getElementById("inputK")
}
setCMYKinputsConfiguration();

HSVinputs = {
    H: document.getElementById("inputH"),
    S: document.getElementById("inputS"),
    V: document.getElementById("inputV")
}
setHSVConfiguration()

LABinputs = {
    L: document.getElementById("inputL"),
    A: document.getElementById("inputA"),
    B: document.getElementById("inputB")
}
setLABConfiguration()

picker = new iro.ColorPicker("#picker", {
    width: 300,
    color: "#ffff",
    borderColor: "white",
    borderWidth: 4,
    layout: [
        {
            component: iro.ui.Wheel,
            options: {}
        },
        {
            component: iro.ui.Slider,
            options: {
                sliderType: 'hue'
            }
        },
        {
            component: iro.ui.Slider,
            options: {
                sliderType: 'saturation'
            }
        },
        {
            component: iro.ui.Slider,
            options: {
                sliderType: 'value'
            }
        }
    ]
});


picker.on(['color:init', 'color:change'], function (color) {

    console.log(1)
    var cmyk = RGBtoCMYK(color.rgb);
    CMYKinputs.C.value = Math.round(cmyk.C);
    CMYKinputs.M.value = Math.round(cmyk.M);
    CMYKinputs.Y.value = Math.round(cmyk.Y);
    CMYKinputs.K.value = Math.round(cmyk.K);

    var lab = XYZtoLAB(RGBtoXYZ(CMYKtoRGB(cmyk)));
    LABinputs.L.value = lab.L.toFixed(2);
    LABinputs.A.value = lab.A.toFixed(2);
    LABinputs.B.value = lab.B.toFixed(2);

    // var hsv = RGBtoHSV(XYZtoRGB(LABtoXYZ(lab)));
    HSVinputs.H.value = Math.round(color.hsv.h);//Math.round(hsv.H);
    HSVinputs.S.value = Math.round(color.hsv.s);//Math.round(hsv.S);
    HSVinputs.V.value = Math.round(color.hsv.v);//Math.round(hsv.V);

    document.body.style.backgroundColor = color.hexString
});


