$(document).ready(async()=>{
    // 模拟数据
    const cardsData = [
        {
            chartTitle:"RT-01",
            items: [
                { title: "機台", content: "成型機#1" },
                { title: "運行時間", content: "10", unit: "時" },
                { title: "生產次數", content: "33" },
                { title: "開機時間", content: "18", unit: "時" },
                { title: "現在機況", content: "Run" },
                { title: "稼動率", content: "78", unit: "%" },
            ],
            chartData: await (await fetch('./data/ganttData.json')).json()  // 等待解析 JSON 資料
        },
        {
            chartTitle:"RT-02",
            items: [
                { title: "機台", content: "成型機#2" },
                { title: "運行時間", content: "12", unit: "時" },
                { title: "運行生產次數", content: "40" },
                { title: "開機時間", content: "20", unit: "時" },
                { title: "現在機況", content: "Stop" },
                { title: "稼動率", content: "85", unit: "%" },
            ],
            chartData: await (await fetch('./data/ganttData.json')).json()  // 等待解析 JSON 資料
        },
        {
            chartTitle:"RT-03",
            items: [
                { title: "機台", content: "成型機#3" },
                { title: "運行時間", content: "12", unit: "時" },
                { title: "運行生產次數", content: "40" },
                { title: "開機時間", content: "20", unit: "時" },
                { title: "現在機況", content: "Stop" },
                { title: "稼動率", content: "85", unit: "%" },
            ],
            chartData: await (await fetch('./data/ganttData.json')).json()  // 等待解析 JSON 資料
        },
    ];

    const legendData = [
        { "STATUS": "Idle", "COLOR": "darkgray" },
        { "STATUS": "Adjust", "COLOR": "brown" },
        { "STATUS": "Maintain", "COLOR": "salmon" },
        { "STATUS": "Stop_Materials", "COLOR": "magenta" },
        { "STATUS": "Stop_Tool", "COLOR": "darkgreen" },
        { "STATUS": "Repair", "COLOR": "navy" },
        { "STATUS": "Run", "COLOR": "green" },
        { "STATUS": "Error", "COLOR": "orange" },
        { "STATUS": "Safety", "COLOR": "turquoise" },
        { "STATUS": "Warning", "COLOR": "lime" },
        { "STATUS": "Danger", "COLOR": "maroon" },
        { "STATUS": "Stop", "COLOR": "teal" },
        { "STATUS": "Manual", "COLOR": "purple" },
        { "STATUS": "Auto", "COLOR": "gold" },
        { "STATUS": "ReactorStart", "COLOR": "green" },
        { "STATUS": "ReactorEnd", "COLOR": "orange" }
    ];
    createCards(cardsData)
    setLegend(legendData)
})

function createCards(cardsData){
    cardsData.forEach((data)=>{
        const ganttWrapperId = generateRandomId("ganttWrapper");
        const cardHtml = `
            <div class="card p-0 mb-2">
                <div class="row g-0">
                    <div class="col-xl-4 col-lg-6">
                    <div class="card-body p-0">
                        <div class="grid-container">
                        ${data.items
                            .map(
                            (item) => `
                            <div class="grid-item">
                            <div class="item-title">${item.title}</div>
                            <div class="item-content" data-unit="${item.unit || ''}">
                                ${item.content}
                            </div>
                            </div>
                        `
                            )
                            .join("")}
                        </div>
                    </div>
                    </div>
                    <div class="col-xl-8 col-lg-6">
                    <div class="card-body p-0">
                        <div style="height:160px">
                            <div class="chart-wrapper" id="${ganttWrapperId}"></div>
                        </div>
                    </div>
                    </div>
                </div>
            </div>
        `;
        $(".main").append(cardHtml)
        loadGantt(ganttWrapperId, data.chartData, data.chartTitle)
    })
}
// 生成唯一随机 ID
function generateRandomId(prefix) {
    return `${prefix}_${Math.random().toString(36).substr(2, 9)}`;
}
function loadGantt(wrapperId,chartData,chartTitle) {
  $(`#${wrapperId}`).empty();
  $(`#${wrapperId}`).append(`<canvas id="${wrapperId}_chart"></canvas>`);
  
  gantt();
  async function gantt() {
      var ctx = $(`#${wrapperId}_chart`);
      new Chart(ctx, {
        type: "bar",
        
        data: chartData,
        options: {
            responsive: true,
            maintainAspectRatio:false,
            indexAxis: "y",
            plugins: {
                title:{
                    display: true,
                    text: chartTitle + " 機況圖",
                    color: 'black',
                    font: {
                        size: 20
                    },
                    padding: {
                        bottom: 10
                    }
                },
                tooltip: {
                    enabled: false
                },
                legend: {
                    display: false,
                }
            },
            scales: {
                x: {
                    type: "time",
                    time: {
                        unit: "hour",
                    },
                    min: "2022-01-01T00:00",
                    max: "2022-01-01T12:00",
                    grid: {
                        // color: 'grey'
                    },
                    ticks: {
                        color: 'black'
                    }
                },
                y: {
                    stacked: true,
                    beginAtZero: true,
                    grid: {
                        // color: 'grey'
                    },
                    ticks: {
                        // color: 'white',
                        // font:{
                        //     size: 18
                        // }
                        display:false
                    }
                },
            },
            layout: {
                padding: {
                    left: 20,
                    right: 20,
                    bottom: 10, // 增加圖表下方間距
                    top: 5 // 增加圖表上方間距
                }
            }
        },
      });
  };
};

function setLegend(legendData){
    legendData.forEach((legend)=>{
        let legendHtml = `
            <div class="col p-1">
                <div class="text-center text-white" style="background-color:${legend.COLOR}">${legend.STATUS}</div>
            </div>
        `
        $(".legend-container").append(legendHtml)
    })

}