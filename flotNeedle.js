(function($){
    var options = {
        font: {
            size: 12,
            color: '#000',
            face: 'Arial'
        }
    };

    function init(plot) {
        plot.hooks.bindEvents.push(function(plot, eventHolder){
            var plotOptions = plot.getOptions();

            if(plotOptions.needle === false || typeof plotOptions.needle === 'undefined') return;

            $(plot.getPlaceholder()).bind('plothover', plothover);
        });

        plot.hooks.shutdown.push(function(plot, eventHolder){
            $(plot.getPlaceholder()).unbind('plothover', plothover);
        });

        function plothover(e, pos, item){
            console.log(e, pos, item);
            plot.triggerRedraw

        }
    }

    $.plot.plugins.push({
        init: init,
        options: options,
        name: 'needle',
        version: '1.0.0'
    });
})(jQuery);