const stormYears = ["2yr","5yr","10yr","25yr","50yr","100yr","200yr","500yr"]
//const stormYears = ["2yr","5yr"]
function formatChartData(model, base, station){
    if (model == null || base == null){
        return null
    }
    console.log(model)
    console.log(base)
    console.log(station)
    console.log("hi!!!")

    let datasets = []
    let datasetModel = {}
    let datasetBase = {}
    let outputTable = {}
    for (let storm in stormYears){
        let year = stormYears[storm]
        console.log(year)
//      start with model
        let label = year + " Storm"
        let timeseriesModel = model[year][station]["time series"]
        let qModel = model[year][station]["Qmax"].toFixed(2)
        let wseModel = model[year][station]["WSE"].toFixed(2)

        let timeseriesBase = base[year][station]["time series"]
        let qBase = base[year][station]["Qmax"].toFixed(2)
        let wseBase = base[year][station]["WSE"].toFixed(2)

        datasetModel = {
            label: "Model " + label,
            data: timeseriesModel,
            borderColor: 'rgb(53, 162, 235)',
            backgroundColor: 'rgba(53, 162, 235, 0.5)',
            fill: false,
            pointStyle: 'none', // Remove data points
            pointRadius: 0,    // Set point radius to 0
        }
        datasetBase = {
            label: "Base " + label,
            data: timeseriesBase,
            borderColor: 'rgb(255, 99, 132)',
            backgroundColor: 'rgba(255, 99, 132, 0.5)',
            fill: false,
            pointStyle: 'none', // Remove data points
            pointRadius: 0,    // Set point radius to 0
        }
        outputTable[year] = {
            wseModel:wseModel,
            qModel:qModel,
            qBase:qBase,
            wseBase:wseBase

        }
        datasets.push(datasetModel)
        datasets.push(datasetBase)


    }
    let labels = datasetModel.data.map(() => 0);
    let minCount = 0
    for (let lab in labels){
        labels[lab] = minCount
        minCount = minCount + 5
    }

    let data = {
        labels:labels,
        datasets:datasets,
    }
    return [data, outputTable]
}
export  {formatChartData}