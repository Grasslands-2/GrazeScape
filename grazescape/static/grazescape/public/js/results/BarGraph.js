		console.log("heeeeeeeeeeeeeee")
		console.log(data_from_django)
		var color = Chart.helpers.color;
		var barChartData = {
			labels: data_from_django['labels'],
			datasets: [{
				label: 'Farm',
				backgroundColor: color(window.chartColors.red).alpha(0.5).rgbString(),
				borderColor: window.chartColors.red,
				borderWidth: 1,
				data: data_from_django['data']
			}]

		};

		window.onload = function() {
		    console.log(data_from_django)
			var ctx = document.getElementById('canvas').getContext('2d');
			window.myBar = new Chart(ctx, {
				type: 'bar',
				data: barChartData,
				options: {
					responsive: true,
					legend: {
						position: 'top',
					},
					title: {
						display: true,
						text: 'Model Output'
					}
				}
			});

		};
