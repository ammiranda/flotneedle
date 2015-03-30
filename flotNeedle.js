(function($){
    var options = {
        needle: {
            on: null,
            fontSize: '12px',
            fontFace: 'Arial',
            lineWidth: 0,
            lineColor: 'orange',
        },
    };

    function stackAdapter(datasetIndex, datapointIndex, dataSet){
        var verticalAdjustment = 0;
        var index = datasetIndex - 1;
        for (index; index >= 0; --index){
            if (dataSet[index].data[datapointIndex]){
                verticalAdjustment += dataSet[index].data[datapointIndex][1];
            }
        }
        return verticalAdjustment;
    }

    function createDrawArray(plot){
        /**
        *   Iterate through data arrays and find if datapoints are within 20 of each other
        *   if so translate their values into a new array that the draw method will use to
        *   draw the points
        **/
        var drawArray;

        if (plot.getOptions().series.stack){
            var data = plot.getData();
            // Copy the data array into the drawArray
            drawArray = data;

            for (var i = 1; i < data.length; i = i + 2){
                var topsetIndex = i + 1 > data.length - 1 ? null : i + 1;
                var bottomsetIndex = i - 1 < 0 ? null : i - 1;

                if (topsetIndex === null && bottomsetIndex === null) break;

                for (var k = 0; k < data[i].data.length; k++){
                    var topsetPoint = topsetIndex !== null ? data[topsetIndex].data[k][1] : null;
                    var bottomsetPoint = bottomsetIndex !== null ? data[bottomsetIndex].data[k][1] : null;
                    var topDiff, bottomDiff;

                    if (topsetPoint) topDiff = data[i].data[k][1] - topsetPoint;
                    if (bottomsetPoint) bottomDiff = data[i].data[k][1] - bottomsetPoint;

                    if (Math.abs(topDiff) <= 20){
                        drawArray[topsetIndex].data[k][1] += topDiff;
                        console.log(topDiff);
                    }

                    console.log(drawArray[bottomsetIndex].data[k][1]);

                    if (Math.abs(bottomDiff) <= 20) {
                        drawArray[bottomsetIndex].data[k][1] -= bottomDiff;
                        console.log(drawArray[bottomsetIndex].data[k][1]);
                    }

                }
            }
        }

        return drawArray;
    }

    function init(plot) {
        var needle = {
            x: -1,
            y: -1
        };

        plot.hooks.bindEvents.push(function(plot, eventHolder){
            var plotOptions = plot.getOptions();

            if(plotOptions.needle === false || !plotOptions.needle) return;

            $(plot.getPlaceholder()).bind('plothover', plothover);
        });

        plot.hooks.shutdown.push(function(plot, eventHolder){
            $(plot.getPlaceholder()).unbind('plothover', plothover);
        });

        function plothover(e, pos, item){
            var offset = plot.offset();
            needle.x = Math.max(0, Math.min(pos.pageX - offset.left, plot.width()));
            needle.y = Math.max(0, Math.min(pos.pageY - offset.top, plot.height()));
            needle.axes_x = pos.x;

            plot.triggerRedrawOverlay();
        }

        function drawTooltip(series, dataset_y, drawPoint, vertFix, ctx){
            ctx.fillStyle = series.color;
            var text = dataset_y ? dataset_y : '';
            var draw_pos = plot.p2c({x: needle.axes_x, y: drawPoint + vertFix});
            if(series.needle && series.needle.label){
                text = series.needle.label(dataset_y);
            }
            var textWidth = ctx.measureText(text).width;
            ctx.fillStyle = 'rgba(255,255,255, 0.8)';
            ctx.fillRect(draw_pos.left + 4, draw_pos.top - 15, textWidth + 5, 20);
            ctx.fillStyle = series.color;
            ctx.fillText(text, draw_pos.left + 7, draw_pos.top);
        }

        plot.hooks.drawOverlay.push(function(plot, ctx){
            var op = plot.getOptions().needle;
            var stack = plot.getOptions().series.stack;
            var plotOffset = plot.getPlotOffset();

            ctx.save();
            ctx.translate(plotOffset.left, plotOffset.top);
            if (needle.x != -1) {

                ctx.strokeStyle = op.lineColor;
                ctx.lineWidth = op.lineWidth;
                ctx.lineJoin = "round";
                ctx.font = op.fontSize + ' ' + op.fontFace;

                // draw line
                var adj = op.lineWidth % 2 ? 0.5 : 0;

                ctx.beginPath();
               
                var drawX = Math.floor(needle.x) + adj;
                ctx.moveTo(drawX, 0);
                ctx.lineTo(drawX, plot.height());
               
                ctx.stroke();

                // draw dataset values
                var dataset = plot.getData();
                var drawArray = createDrawArray(plot);

                for(var i = 0; i < dataset.length; i++){
                    var series = dataset[i];
                    var drawSeries = drawArray[i];
                    var pointsArray;
                    // find the closest dataset y value to our mouses's x axes
                    var dataset_y = series.data[needle.axes_x];
                    var drawPoint = drawSeries.data[needle.axes_x];
                    if(dataset_y === undefined){
                        for (j = 0; j < series.data.length; ++j) {
                            if (series.data[j][0] > needle.axes_x) {
                                break;
                            }
                        }
                        if(series.data[j]){
                            dataset_y = series.data[j][1];
                            drawPoint = drawSeries.data[j][1];
                            if (!stack){
                                var min = series.data[j][3];
                                var max = series.data[j][4];
                                if (min !== max){
                                    pointsArray = [dataset_y, min, max];
                                }
                            }
                        } else {
                            dataset_y = 0;
                            drawPoint = 0;
                        }
                    }
                    var vertFix = stackAdapter(i, j, dataset);
                    // draw the value at the appropriate position
                    if (pointsArray){
                        for (var k = 0; k < pointsArray.length; k++){
                            drawTooltip(series, pointsArray[k], vertFix, ctx);
                        }
                    } else {
                        drawTooltip(series, dataset_y, drawPoint, vertFix, ctx);
                    }
                }
                 
                //  insanity
                // for each dataset get it's related x axis value
                // for(var i = 0; i < dataset.length; i++){
                //     var dataset_x = dataset[i].data[needle.axes_x];
                //     var ix = op.precision;
                //     var c = 1;
                //     while (dataset_x === undefined) {
                //         dataset_x = dataset[i].data[needle.axes_x + (ix * c)];
                //         dataset_x = dataset[i].data[needle.axes_x - (ix * c)];
                //         c++;
                //     }

                //     console.log(dataset_x);
                // }

            }
            ctx.restore();
        });
    }

    $.plot.plugins.push({
        init: init,
        options: options,
        name: 'needle',
        version: '1.0.0'
    });
})(jQuery);