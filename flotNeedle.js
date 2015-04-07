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

    function convertYp2c(ycoord, plot){
        var coordObj = {x: 0, y: ycoord};
        var convertedObj = plot.p2c(coordObj);
        return convertedObj.top;
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

        function drawTooltips(ctx, drawSet){
            var keys = Object.keys(drawSet);
            for(var i = 0; i < keys.length; i++){
                var tooltip = drawSet[keys[i]];

                var textWidth = ctx.measureText(tooltip.text).width;
                ctx.fillStyle = 'rgba(255,255,255, 0.8)';
                ctx.fillRect(needle.x + 2, keys[i] - 15, textWidth + 5, 20);
                ctx.fillStyle = tooltip.color;
                ctx.fillText(tooltip.text, needle.x + 5, keys[i]);
            }
        }

        function getPoints(plot){
            var dataset = plot.getData();
            var points = [];
            var options = plot.getOptions();

            // get points for normal dataset.
            for(var i = 0; i < dataset.length; i++){
                var series = dataset[i];
                var dataset_y = series.data[needle.axes_x];

                if(dataset_y === undefined){
                    for (j = 0; j < series.data.length; ++j) {
                        if (series.data[j][0] > needle.axes_x) {
                            break;
                        }
                    }
                    if(series.data[j]){
                        dataset_y = series.data[j][1];
                    } else {
                        dataset_y = 0;
                    }
                }
                if(series.needle && series.needle.label){
                    points.push([needle.axes_x, dataset_y, series.needle.label(dataset_y), series.color]);
                } else {
                    points.push([needle.axes_x, dataset_y, dataset_y, series.color]);
                }

                // add additional points if fill area is defined
                if (series.fillArea && series.data[j]){
                    var min = series.data[j][3];
                    var max = series.data[j][4];

                    if(series.needle && series.needle.label){
                        points.push([needle.axes_x, min, series.needle.label(min), series.color]);
                        points.push([needle.axes_x, max, series.needle.label(max), series.color]);
                    } else {
                        points.push([needle.axes_x, min, min, series.color]);
                        points.push([needle.axes_x, max, max, series.color]);
                    }

                }
            }
            return points;
        }

        function padTooltips(tooltips){
            console.log('before', tooltips);

            var distance = 20;

            var keys = Object.keys(tooltips);
            for (var j = 0; j < keys.length; j++){
                keys[j] = parseFloat(keys[j]);
            }
            keys.sort();
            keys.reverse();
            console.log('key');
            for(var k = 0; k < keys.length; k++){
                var current = keys[k];

                // check previous value if it exists
                if(keys[k-1]){

                }

                // check next if value exists
                if(keys[k+1]){
                    var next = keys[k+1];
                    console.log('current', current);
                    console.log('next', next);
                    if(current - next  < distance){
                        next = current + distance;

                        tooltip = tooltips[keys[k+1]];
                        delete tooltips[keys[k+1]];
                        keys[k+1] = next;
                        tooltips[next] = tooltip;

                    }
                }

            }

            console.log('after', tooltips);

            return tooltips;
        }

        function createDrawSet(points, plot){
            var tooltips = {};
            var options = plot.getOptions();

            // shift values up if stack is enabled
            if(options.series.stack){
                for(var i = 0; i < points.length; i++){
                    if(i - 1 >= 0){
                        points[i][1] += points[i - 1][1];
                    }
                }
            }

            // convert data array to tooltip objects;
            for(var p = 0; p < points.length; p++){
                var coords = plot.p2c({x: points[p][0], y: points[p][1]});
                var text = points[p][2];
                var color = points[p][3];
                var tooltip = {
                    text: text,
                    color: color
                };

                coords.top = parseInt(coords.top);

                if(tooltips[coords.top] === undefined){
                    tooltips[coords.top] = tooltip;
                } else {
                    var top = coords.top;
                    do{
                        top++;
                    } while (tooltips[top] !== undefined);
                    tooltips[top] = tooltip;
                }
            }

            return padTooltips(tooltips);
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
                var points = getPoints(plot);
                var drawSet = createDrawSet(points, plot);
                drawTooltips(ctx, drawSet);
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