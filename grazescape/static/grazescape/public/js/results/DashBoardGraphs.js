function create_graph(data,units,title,element){
    console.log("creating graph")
    let barchart = new Chart(element, {
        type: 'bar',
        data: data,
//        data:
//        {
//        labels: ['Red', 'Blue', 'Yellow', 'Green', 'Purple', 'Orange'],
////        labels: ['Red', 'Blue'],
//        datasets: [{
//            label: '# of Votes',
//            data: [12, 19, 3, 5, 2, 3],
//            backgroundColor: [
//                'rgba(247, 148, 29, 1)',
//                'rgba(29, 48, 58, 1)',
//                'rgba(140, 156, 70, 1)',
//                'rgba(51, 72, 86, 1)',
//                'rgba(196, 213, 76, 1)',
//                'rgba(117, 76, 41, 1)'
//            ],
//            borderColor: [
//                'rgba(247, 148, 29, 1)',
//                'rgba(29, 48, 58, 1)',
//                'rgba(140, 156, 70, 1)',
//                'rgba(51, 72, 86, 1)',
//                'rgba(196, 213, 76, 1)',
//                'rgba(117, 76, 41, 1)'
//            ],
//            borderWidth: 1
//        }]
//    },/
        options: {
            responsive: true,
//            maintainAspectRatio: false,
            legend: {
                position: 'top',
            },
            title: {
                display: true,
                text: title
            },
            scales: {
                yAxes: [{
                    ticks: {
                        beginAtZero: true,
                        maxTicksLimit:5,
                    },
                    scaleLabel: {
                    display: true,
                    labelString: units
                  }
                }]
            }
        }
    });
    console.log(barchart)
    return barchart
}

