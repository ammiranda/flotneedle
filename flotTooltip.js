(function ($){
	var options = {
		tooltip: false,
		tooltipOpts: {
			xDateFormat: null,
			yDateFormat: null,
			monthNames: null,
			dayNames: null
		}
	};

	function init(plot) {

		function appendDomElements(){
			var $x = $('#xTooltip');

			var defaultStyle = {
				'background': '#fff',
	            'z-index': '1040',
	            'padding': '0.4em 0.6em',
	            'border-radius': '0.5em',
	            'font-size': '0.8em',
	            'border': '1px solid #111',
	            'display': 'none',
	            'white-space': 'nowrap'
			}

			if ($x.length === 0){
				$x = $('<div />').attr('id', 'xTooltip');
				$x.appendTo('body').hide().css({position: 'absolute'});

				$x.css(defaultStyle);
			}
		}

		function setDomElementsPosition(pos){
			
		}

		plot.hooks.bindEvents.push(function (plot, eventHolder) {
			var plotOptions = plot.getOptions();

			if (plotOptions.tooltip === false || typeof plotOptions.tooltip === 'undefined') return;

			$(plot.getPlaceholder()).bind("plothover", plothover);

			$(eventHolder).bind('mousemove', mouseMove);
		});

		plot.hooks.shutdown.push(function (plot, eventHolder) {
			$(plot.getPlaceholder()).unbind("plothover", plothover);
			$(eventHolder).unbind("mousemove", mouseMove);
		});

		function plothover(e, pos, item){

		}

		function mouseMove(e){
			var pos = {};
			pos.x = e.pageX;
			pos.y = e.pageY;
			plot.set
		}

	}

	$.plot.plugins.push({
		init: init,
		options: options,
		name: 'tooltip',
		version: '0.0.1'
	});

})(jQuery);