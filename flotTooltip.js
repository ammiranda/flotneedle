(function ($){
	var options = {
		tooltip: false,
		tooltipOpts: {
			xDateFormat: null,
			yDateFormat: null,
			monthNames: null,
			dayNames: null,
			tooltipClass: 'tooltip',
			tooltipXid: 'x-id',
			tooltipYclass: 'y-points'
		}
	};

	var tooltipDetails = {};

	function init(plot) {

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

			var axes = plot.getAxes();
			var pointsObj = {
				yPoint: null,
				xPoint: pos.x
			};

			if (pos.x < axes.xaxis.min || pos.x > axes.xaxis.max || pos.y < axes.yaxis.min || pos.y > axes.yaxis.max){
				return;
			}

			var i, j, dataset = plot.getData();

			for (i = 0; i < dataset.length; ++i) {
				var series = dataset[i];

				for (j = 0; j < series.data.length; ++j) {
					if (series.data[j][0] > pos.x) {
						break;
					}
				}

				var y,
					p1 = series.data[j - 1],
					p2 = series.data[j];

				if (p1 == null) {
					y = p2[1];
				} else if (p2 == null){
					y = p1[1];
				} else {
					y = p1[1] + (p2[1] - p1[1]) * (pos.x - p1[0]) / (p2[0] - p1[0]);
				}
				pointsObj.yPoint = y;

				appendXTooltip(pos);
			}

			return pointsObj;
		}

		function getXDomElement(pos){
			var $tip = $('#' + options.tooltipOpts.tooltipXid);

			if ($tip.length === 0){
				$tip = $('<div />').attr('id', options.tooltipOpts.tooltipXid);
				$tip.appendTo('body').hide().css({position: 'absolute'});

				$tip.css({
					'background': '#fff',
                    'z-index': '1040',
                    'padding': '0.4em 0.6em',
                    'border-radius': '0.5em',
                    'font-size': '0.8em',
                    'border': '1px solid #111',
                    'display': 'none',
                    'white-space': 'nowrap'
				});
			}

			return $tip;
		}

		function setXTooltipPosition(pos){
			var $tip = getXDomElement();

			var totalTipWidth = $tip.outerWidth();
			var totalTipHeight = $tip.outerHeight();

			if ((pos.x - $(window).scrollLeft()) > ($(window)[totalTipWidth])) {
				pos.x -= totalTipWidth;
			}
			if ((pos.y - $(window).scrollTop()) > ($(window)[totalTipHeight])) {
				pos.y -= totalTipHeight;
			}

			tooltipDetails.xCoord = pos.x;
			tooltipDetails.yCoord = pos.y;
		}

		function showXTooltip(target, position){
			var $tip = getXDomElement();

			var tipText = "moo";

			$tip.html(tipText);
			setXTooltipPosition({ 'x': position.pageX, 'y': position.pageY });
			$tip.css({
				left: tooltipDetails.xCoord,
				top: tooltipDetails.yCoord
			}).show();
		}

		function appendXTooltip(pos){
			var tooltip = getXDomElement();


			
		}

		function appendYTooltip(posY){

		}

		function mouseMove(e){
			var pos = {};
			pos.x = e.pageX;
			pos.y = e.pageY;

			var axis = plot.getAxes();

		}

		function hideToolTip(){
			$('.' + options.tooltipClass).remove();
		}

	}

	$.plot.plugins.push({
		init: init,
		options: options,
		name: 'tooltip',
		version: '0.0.1'
	});

})(jQuery);