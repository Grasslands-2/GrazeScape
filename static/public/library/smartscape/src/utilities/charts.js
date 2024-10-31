
export function getChartDataBar(dataBase, dataTrans){
    return {
    labels: ["Base", "Transformation"],
      datasets: [{
        axis: 'y',
        label: 'Base',
        minBarLength: 7,
        data: dataBase,
        fill: false,
        backgroundColor: [
          'rgba(238, 119, 51,.2)'


        ],
        borderColor: [
          'rgba(238, 119, 51,1)'


        ],
        borderWidth: 1
      },
      {
        axis: 'y',
        label: 'Transformation',
        data: dataTrans,
        fill: false,
        minBarLength: 7,
        backgroundColor: [

          'rgba(0, 119, 187,.2)'

        ],
        borderColor: [

          'rgba(0, 119, 187,1)',

        ],
        borderWidth: 1
      }]
    };
}

export function getChartDataBarPercent(labels, data){
    return {labels: labels,
      datasets: [{
        axis: 'y',
        minBarLength: 7,
        label: 'My First Dataset',
        data: data,
        fill: false,
        backgroundColor: [
          'rgba(255, 99, 132, 0.2)',
          'rgba(255, 159, 64, 0.2)',
          'rgba(255, 205, 86, 0.2)',
          'rgba(75, 192, 192, 0.2)',
          'rgba(54, 162, 235, 0.2)',
          'rgba(153, 102, 255, 0.2)',
          'rgba(136, 34, 85, 0.2)',
          'rgba(201, 203, 207, 0.2)',
        ],
        borderColor: [
          'rgb(255, 99, 132)',
          'rgb(255, 159, 64)',
          'rgb(255, 205, 86)',
          'rgb(75, 192, 192)',
          'rgb(54, 162, 235)',
          'rgb(153, 102, 255)',
          'rgb(136, 34, 85)',
          'rgb(201, 203, 207)',
        ],
        borderWidth: 1
      }]
    };
}

export function getChartDataRadar(labels, data){
    return {
      labels: labels,
      datasets: [
        {
          label: 'Base',
          data: data[0],
          backgroundColor: 'rgba(238, 119, 51,.2)',
          borderColor: 'rgba(238, 119, 51,1)',
          borderWidth: 1,
        },
                {
          label: 'Transformation',
          data: data[1],
          backgroundColor: 'rgba(0, 119, 187,.2)',
          borderColor: 'rgba(0, 119, 187,1)',
          borderWidth: 1,
        },
      ],
    };
}

export function getOptionsBarPercent(){
    return {
          indexAxis: 'y',
          elements: {
            bar: {
              borderWidth: 5,
            },
          },
          responsive: true,
          scales: {
            x: {
               grid: {
//                color: 'rgba(0,255,0,0.1)',
                    color: function(context) {
                        if (context.tick && context.tick.value == 0) {
                          return '#000000'
                        }
                       return 'rgb(201, 203, 207)'
                    },
                    lineWidth: function(context){
                        if (context.tick && context.tick.value == 0) {
                          return 2
                        }
                       return 1
                    }
                },
                title:{
                  display: true,
                  text: "% Change"
              },
              }
            }




    };
}

export function getOptionsBar(title, yaxisLabel){
    return {
          elements: {
            bar: {
              borderWidth: 1,
            },
          },
          devicePixelRatio:1.5,
          scales: {
            y: {
            title:{
                display: true,
                text: yaxisLabel
            },
            ticks: {
                        beginAtZero: true,
                        maxTicksLimit:5,
                    },

            }
          },
          responsive: true,
          skipNull:true,
          plugins: {
            title: {
                display: true,
                text: title,
            },
            legend: {
                display: false
              }
        },


    };
}