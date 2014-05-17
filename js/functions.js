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
                return 1 / 500 * x;
            }
          , x: {
                min: -12
              , max: 12
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
          , axes: {
                xaxis: {
                    label: "U (V)"
                  , min: currentElement.x.min
                  , max: currentElement.x.max
                  , tickOptions: {
                        formatString: "%#.2f"
                      , howGridline: false
                      , textColor: '#ffffff'
                      , fontSize: '12px'
                    }
                }
              , yaxis: {
                    label: "I (mA)"
                  , min: currentElement.y.min
                  , max: currentElement.y.max
                  , tickOptions: {
                        formatString: "%#.2f"
                      , howGridline: false
                      , textColor: '#ffffff'
                      , fontSize: '12px'
                    }
                }
            }
        });

        updateResult (0);
        $(".vol input").val("0.00");
        $(".cursor").css("top", min);
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

    SimpleDraggable(".cursor", {
        onlyY: true
      , onDrag: function (e, cEl) {

            var value = (cEl.offsetTop - min) / ((max - min) / currentElement.x.max);
            value = (degs === 0 ? 1 : -1) * value;
            if (!degs && value < 0 || degs && value > 0) {
                value = 0;
            }

            $(".vol input").val(value.toFixed(2));
            updateResult(value);

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
        // if (currentElement.name === "bulb") {
        //     value *= 3;
        // }
        var x = value
          , y = currentElement.functionLaw (value)
          ;

        if ($(".add-points input").prop("checked")) {
            var seriesObj = expGraph.series[0];
            seriesObj.data.push([x, y]);
            seriesObj.data.sort (function (a, b) {
                return a[0] - b[0];
            });

            expGraph.drawSeries({},0);
        }

        $(".amp input").val(y.toFixed(2));
    }

    $(".clear-graph").on("click", function () {
        var seriesObj = expGraph.series[0];
        seriesObj.data = [];
        expGraph.drawSeries({},0);
    });
});
