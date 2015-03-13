(function($){
    var options = {
        needle: {
            on: null,
            fontSize: 12,
            fontFace: 'Arial',
            lineWidth: 0,
            lineColor: 'orange'
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

            plot.triggerRedrawOverlay();
        }

        plot.hooks.drawOverlay.push(function(plot, ctx){
            var op = plot.getOptions().needle;

            var plotOffset = plot.getPlotOffset();

            ctx.save();
            ctx.translate(plotOffset.left, plotOffset.top);

            if (needle.x != -1) {
                var adj = op.lineWidth % 2 ? 0.5 : 0;

                ctx.strokeStyle = op.lineColor;
                ctx.lineWidth = op.lineWidth;
                ctx.lineJoin = "round";

                ctx.beginPath();
               
                var drawX = Math.floor(needle.x) + adj;
                ctx.moveTo(drawX, 0);
                ctx.lineTo(drawX, plot.height());
               
                ctx.stroke();
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