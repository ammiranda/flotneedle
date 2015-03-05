(function ($){
	var defaultOptions = {
		tooltip: false,
		tooltipOpts: {
			xDateFormat: null,
			yDateFormat: null,
			monthNames: null,
			dayNames: null
		}
	};

	function init(plot) {

	}

	$.plot.plugins.push({
		init: init,
		options: options,
		name: 'tooltip',
		version: '0.0.1'
	});

})(jQuery);