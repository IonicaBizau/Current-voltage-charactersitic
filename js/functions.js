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

    $("select.changeElement").on("change", function () {
        currentElement.name = $(this).val();
        currentElement.functionLaw = ({
            rezistor: function (x) {
                return 1 / 500 * x;
            }
          , bulb: function (x) {
                return 1 / 500 * x;
            }
          , diode: function (x) {
                if (x > 0) {
                    return Math.pow (x, 3 / 2);
                }
                if (x < 0 && x > -4) {
                    return x / 100;
                }

                return Math.pow (x, 3) / 10;
            }
        })[currentElement.name];

        // update elements
        $("[data-name]", ".changeableElement").hide();
        $("[data-name='" + currentElement.name + "']", ".changeableElement").show();

    }).change();

    $(".add-points").css({
        "bottom": "-360px"
      , "position": "absolute"
      , "left": "855px"
      , "width": "352px"
      , "font-weight": "bold"
    });

    var expGraph = $.jqplot ('graph', [[[]]], {
        axesDefaults: {
            labelRenderer: $.jqplot.CanvasAxisLabelRenderer
        }
      , axes: {
            xaxis: {
                label: "U (V)"
              , min: -4
              , max: 4.5
            }
          , yaxis: {
                label: "I (mA)"
              , min: -21.6
              , max: 190
            }
        }
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

            var value = (cEl.offsetTop - min) / 8.6;
            if (value < 0) { value = 0; }
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

    // change handler for voltmeter input
    $(".vol input").on("change", function () {
        var value = Number($(this).val());

        // max value
        if (value > 15) {
            $(this).val(15).change();
            return;
        }

        // min value
        if (value < 0 || isNaN(value)) {
            $(this).val(0).change();
            return;
        }

        document.querySelector(".cursor").style.top = value * 8.6 + min + "px";
        updateResult(value);
    }).val("0").change();
});
