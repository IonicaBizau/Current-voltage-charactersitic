var arrow = [
    [ 2, 0 ],
    [ -10, -4 ],
    [ -10, 4]
];

function translateShape(shape,x,y) {
    var rv = [];
    for(p in shape)
        rv.push([ shape[p][0] + x, shape[p][1] + y ]);
    return rv;
}

function rotateShape(shape,ang) {
    var rv = [];
    for(p in shape)
        rv.push(rotatePoint(ang,shape[p][0],shape[p][1]));
    return rv;
}

function rotatePoint(ang,x,y) {
    return [
        (x * Math.cos(ang)) - (y * Math.sin(ang)),
        (x * Math.sin(ang)) + (y * Math.cos(ang))
    ];
}

function drawFilledPolygon(shape) {
    ctx.beginPath();
    ctx.moveTo(shape[0][0],shape[0][1]);

    for(p in shape)
        if (p > 0) ctx.lineTo(shape[p][0],shape[p][1]);

    ctx.lineTo(shape[0][0],shape[0][1]);
    ctx.fill();
};

function drawLineArrow(x1,y1,x2,y2) {
    ctx = $("canvas")[6].getContext('2d');
    ctx.beginPath();
    ctx.moveTo(x1,y1);
    ctx.lineTo(x2,y2);
    ctx.stroke();
    var ang = Math.atan2(y2-y1,x2-x1);
    drawFilledPolygon(translateShape(rotateShape(arrow,ang),x2,y2));
}

// simple draggable
var SimpleDraggable = function (selector, options) {

    options.onStart = options.onStart || function () {};
    options.onStop = options.onStop || function () {};
    options.onDrag = options.onDrag || function () {};

    var allElms = document.querySelectorAll (selector);
    for (var i = 0; i < allElms.length; ++i) {
        (function (cEl) {
            // document.body.appendChild(cEl);
            cEl.style.position = "absolute";
            cEl._simpleDraggable = {
               drag: false
            }

            cEl.addEventListener("mousedown", function (e) {
                cEl._simpleDraggable.drag = true;
                cEl._simpleDraggable.mousePos = {
                    x: e.clientX
                  , y: e.clientY
                }
                cEl._simpleDraggable.elPos = {
                    x: cEl.offsetLeft
                  , y: cEl.offsetTop
                }
            });

            cEl.addEventListener("mouseup", function (e) {
                cEl._simpleDraggable.drag = false;
                options.onStart.call(this, e, cEl);
            });

            document.body.addEventListener("mouseout", function (e) {
                cEl._simpleDraggable.drag = false;
                options.onStop.call(this, e, cEl);
            });

            document.body.addEventListener("mousemove", function (e) {
                if (!cEl._simpleDraggable.drag) { return; }

                if (options.onDrag.call(this, e, cEl) === false) {
                    return;
                }

                if (!options.onlyY) {
                    cEl.style.left = (cEl._simpleDraggable.elPos.x + e.clientX - cEl._simpleDraggable.mousePos.x) + "px";
                }
                if (!options.onlyX) {
                    cEl.style.top = (cEl._simpleDraggable.elPos.y + e.clientY - cEl._simpleDraggable.mousePos.y) + "px";
                }

            })
        })(allElms[i])
    }
};

/*
 *  Franck & Hertz Experiment
 *  Licensed under MIT license
 *
 * */
$(document).ready(function () {

    var initialPositions = {
        vol: {
            top: $(".physics-instrument.vol").css("top")
          , left: $(".physics-instrument.vol").css("left")
        }
      , amp: {
            top: $(".physics-instrument.amp").css("top")
          , left: $(".physics-instrument.amp").css("left")
        }
    };

    var termometer = {
        started: false
        // 206 ... 80
        // 20 .... 95
        // f (20) = 206;
        // f (95) = 80
        //
        // 20a + b = 206
        // 95a + b = 80
        // ------------
        // 75a = -126
        // a = -1.68
        // b = 239.6
      , setValue: function (deg) {
            $(".termometer-value > .v").text(deg);
            $(".termometer-level").css("top", (deg * (-1.68) + 239) + "px")
        }
      , stop: function () {
            clearInterval(termometer.interval);
            termometer.started = false;
        }
      //, handler: function () {
      //      if (termometer.started) { return; }
      //      termometer.started = true;
      //      termometer.setValue(value += 1);
      //      if (value >= 90) {
      //          clearInterval(termometer.interval);
      //      }
      //  }
    }

    $("select").on("keydown", function () {
        return false;
    });

    var degs = 0;

    $(".polarity").on("click", function () {
        if (!degs) { degs = 180; }
        else { degs = 0; }
        $(this).css ({
            "-webkit-transform": "rotateZ(" + degs + "deg)"
          , "-moz-transform": "rotateZ(" + degs + "deg)"
        });

        updateResult (0);
        $(".vol input").val("0.00");
        $(".cursor").css("top", min);
        termometer.setValue(20);
        termometer.stop();
        latest = null;
    });

    var screenVisible = true;

    // on change
    $("select.language").on("change", function () {
        // set the new language
        $.setLanguage({
            attribute: "data-lang"
          , lang: $(this).val()
        });

        if (!screenVisible) {
            $(".theory").hide();
        } else {
            $(".experiment").hide();
        }
    }).change();

    var currentElement = {};
    var values = {
        resistor: {
            name: "resistor"
          , functionLaw: function (x) {
                return 1 / 200 * x;
            }
          , x: {
                min: -12
              , max: 12
            }
          , afterInit: function () {
                var y = 145
                  , x = 178
                  ;
                drawLineArrow(0, y, 356, y);
                drawLineArrow(x, 290, x, 0);
                $(".termometer,.termistor-system").hide();
                $(".system").show();
                $(".physics-instrument.vol").css(initialPositions.vol);
                $(".physics-instrument.amp").css(initialPositions.amp);
                $(".texts>div:eq(0)").css({ top: "32px" , left: "885px" });
                $(".texts>div:eq(1)").css({ top: "142px" , left: "1000px" });
                $(".texts>div:eq(2)").css({ top: "142px" , left: "835px" });
            }
        }
      , bulb: {
            name: "bulb"
          , functionLaw: function (x) {
                if (x < 0) {
                    return -values.bulb.functionLaw (-x);
                }

                return Math.pow (x, 1/3);
            }
          , x: {
                min: -5
              , max: 5
            }
          , afterInit: function () {
                var y = 145
                  , x = 178
                  ;
                drawLineArrow(0, y, 350, y);
                drawLineArrow(x, 290, x, 0);
                $(".termometer,.termistor-system").hide();
                $(".system").show();
                $(".physics-instrument.vol").css(initialPositions.vol);
                $(".physics-instrument.amp").css(initialPositions.amp);

                $(".texts>div:eq(0)").css({ top: "32px" , left: "885px" });
                $(".texts>div:eq(1)").css({ top: "140px" , left: "1000px" });
                $(".texts>div:eq(2)").css({ top: "147px" , left: "835px" });
            }
        }
      , diode: {
            name: "diode"
          , functionLaw: function (x) {
                if (x >= 0) {
                    return Math.pow (x, 3 / 2) * 4;
                }
                if (x < 0 && x > -4) {
                    return x / 5;
                }

                return -98.50000000015939 * Math.pow(x, 2) - 796.8500000012887 * x - 1612.2000000026096;
            }
          , x: {
                min: -4.5
              , max: 4.5
            }
          , afterInit: function () {
                var y = 187
                  , x = 174
                  ;
                drawLineArrow(0, y, 350, y);
                drawLineArrow(x, 290, x, 0);
                $(".termometer,.termistor-system").hide();
                $(".system").show();
                $(".physics-instrument.vol").css(initialPositions.vol);
                $(".physics-instrument.amp").css(initialPositions.amp);

                $(".texts>div:eq(0)").css({ top: "32px" , left: "885px" });
                $(".texts>div:eq(1)").css({ top: "180px" , left: "1000px" });
                $(".texts>div:eq(2)").css({ top: "185px" , left: "835px" });
            }
        }
      , termistor: {
            name: "termistor"
          , functionLaw: function (x) {
                if (x < 3 && x > -3) {
                    termometer.setValue(20);
                    return x * 5;
                }

                function computeTermometerValue () {
                    return Math.abs(x) * (65/27) + 160/9;
                }

                termometer.setValue(computeTermometerValue().toFixed());
                return (x < 0 ? -1 : 1 ) * 15 - x / 50;
            }
          , x: {
                min: -17
              , max: 17
            }
          , y: {
                min: -30
              , max: 30
            }
          , afterInit: function () {
                var y = 145
                  , x = 174
                  ;

                drawLineArrow(0, y, 350, y);
                drawLineArrow(x, 290, x, 0);

                $(".termometer,.termistor-system").show();
                $(".system").hide();
                $(".physics-instrument.vol").css("top", "83px");
                $(".physics-instrument.amp").css({
                    top: "-20px"
                  , left: "1px"
                });

                $(".texts>div:eq(0)").css({ top: "32px" , left: "885px" });
                $(".texts>div:eq(1)").css({ top: "170px" , left: "1000px" });
                $(".texts>div:eq(2)").css({ top: "147px" , left: "835px" });
            }
        }
    };

    // attach y values
    for (var el in values) {
        values[el].y = {
            min: (values[el].y || {}).min || values[el].functionLaw(values[el].x.min)
          , max: (values[el].y || {}).max || values[el].functionLaw(values[el].x.max)
        };
    }

    $("select.changeElement").on("change", function () {
        currentElement = values[$(this).val()];

        // update elements
        $("[data-name]", ".changeableElement").hide();
        $("[data-name='" + currentElement.name + "']", ".changeableElement").show();

        $("#graph").empty();

        expGraph  = $.jqplot ('graph', [[[]]], {
            axesDefaults: {
                labelRenderer: $.jqplot.CanvasAxisLabelRenderer
            }
          , seriesDefaults: {
                showLine:false
            }
          , axes: {
                xaxis: {
                    label: " "
                  , min: currentElement.x.min
                  , max: currentElement.x.max
                  , tickOptions: {
                        formatString: "%#.2f"
                      , howGridline: false
                      , textColor: '#ffffff'
                      , fontSize: '12px'
                    }
                  , numberTicks: 11
                }
              , yaxis: {
                    label: " "
                  , min: currentElement.y.min
                  , max: currentElement.y.max
                  , tickOptions: {
                        formatString: "%#.2f"
                      , howGridline: false
                      , textColor: '#ffffff'
                      , fontSize: '12px'
                    }
                  , numberTicks: 11
                }
            }
        });

        setTimeout(function () {
        currentElement.afterInit();
        }, 100);

        updateResult (0);
        latest = null;
        $(".vol input").val("0.00");
        $(".cursor").css("top", min);
        termometer.setValue(20);
        termometer.stop();
    }).change();

    $(".add-points").css({
        "bottom": "-360px"
      , "position": "absolute"
      , "left": "855px"
      , "width": "352px"
      , "font-weight": "bold"
    });

    // initial animation
    $(".container").css("opacity", "0").animate({
        opacity: 1
      , top: "50%"
    }, 1000);

    $("div.button.theory-switch").on("click", function () {

        var $screen = $(".screen")
          , $docs   = $(".docs")
          ;

        if (screenVisible) {
            $screen.stop(true).fadeOut();
            $docs.stop(true).fadeIn();
            screenVisible = false;
            $(".experiment[data-lang='" + $("select.language").val() +"']", this).show();
            $(".theory", this).hide();
        } else {
            $screen.stop(true).fadeIn();
            $docs.stop(true).fadeOut();
            screenVisible = true;
            $(".experiment", this).hide();
            $(".theory[data-lang='" + $("select.language").val() +"']", this).show();
        }
    });

    var max = 176
      , min = 50
      ;

    $("img").on("dragstart", function () {
        return false;
    });

    var latest = null;
    SimpleDraggable(".cursor", {
        onlyY: true
      , onDrag: function (e, cEl) {

            var xMax = currentElement.x.max;

            // change x with y
            if (currentElement.name === "termistor") {
                xMax = currentElement.y.max;
            }

            var value = (cEl.offsetTop - min) / ((max - min) / xMax);
            value = (degs === 0 ? 1 : -1) * value;
            if (!degs && value < 0 || degs && value > 0) {
                value = 0;
            }

            if (latest === null) { latest = value; }
            if (value > latest) {
                for (var i = latest; i < value; i += 0.2) {
                    updateResult(i);
                }
            } else {
                for (var i = value; i < latest; i += 0.2) {
                    updateResult(i);
                }
            }

            latest = value;

            if (cEl.offsetTop > max) {
                cEl.style.top = (parseInt(cEl.style.top) - 1) + "px";
                return false;
            }

            if (cEl.offsetTop < min) {
                cEl.style.top = (parseInt(cEl.style.top) + 1) + "px";
                return false;
            }
        }
    });

    /**
     * private: updateResult
     *   This function updates the result when the voltmeter
     *   value is changed.
     *
     *    Arguments
     *      @value: the value of the voltmeter
     *
     */
    function updateResult (value) {
        var x = value
          , y = currentElement.functionLaw (value)
          ;

        // change x with y
        if (currentElement.name === "termistor") {
            var aux = x;
            x = y;
            y = aux;
        }

        if ($(".add-points input").prop("checked")) {
            var seriesObj = expGraph.series[0];
            seriesObj.data.push([x, y]);
            seriesObj.data.sort (function (a, b) {
                return a[0] - b[0];
            });

            expGraph.drawSeries({},0);
        }

        $(".vol input").val(x.toFixed(2));
        $(".amp input").val(y.toFixed(2));
    }

    $(".clear-graph").on("click", function () {
        var seriesObj = expGraph.series[0];
        seriesObj.data = [];
        expGraph.drawSeries({},0);
    });
});
