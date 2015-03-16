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

        plot.hooks.drawOverlay.push(function(plot, ctx){
            var op = plot.getOptions().needle;

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

                for(var i = 0; i < dataset.length; i++){
                    var series = dataset[i];

                    // find the closest dataset y value to our mouses's x axes
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


                    // draw the value at the appropriate position
                    ctx.fillStyle = series.color;
                    var draw_pos = plot.p2c({x: needle.axes_x, y: dataset_y});
                    var text = dataset_y;
                    if(series.needle && series.needle.label){
                        text = series.needle.label(dataset_y);
                    }
                    var textWidth = ctx.measureText(text).width;
                    ctx.fillStyle = '#fff';
                    ctx.globalAlpha = 0.5;
                    ctx.fillRect(draw_pos.left + 4, draw_pos.top - 15, textWidth + 5, 20);
                    ctx.fillStyle = series.color;
                    ctx.globalAlpha = 1.0;
                    ctx.fillText(text, draw_pos.left + 7, draw_pos.top);
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