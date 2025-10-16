var optionSet = {
    responsive: true, 
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: {
          color: 'white'
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          color: 'white'
        }
      },
      x: {
        ticks: {
          color: 'white'
        }
      }
    }
  };
  
  var ctx = document.getElementById("canvasA").getContext('2d');
  var boxC = new Chart(ctx, {
    data: {
      labels: ['Label1', 'Label2', 'Label3', 'Label4', 'Label5', 'Label6', 'Label7'],
      datasets: [
        {
          type: 'line',
          label: 'A',
          data: [30, 50, 20, 20, 30, 10, 40],
          borderColor: '#37e7ff',
          backgroundColor: '#37e7ff'
        },
        {
          type: 'bar',
          label: 'B',
          data: [10, 20, 30, 40, 30, 50, 20],
          borderColor: '#f7ff37',
          backgroundColor: '#f7ff37'
        },
        {
          type: 'bar',
          label: 'C',
          data: [10, 20, 30, 40, 30, 50, 20],
          borderColor: '#5ca8f4',
          backgroundColor: '#5ca8f4'
        }
      ]
    },
    options: optionSet
  });
  
  
  
  var canvasBCanvas = document.getElementById("canvasB");
  
  var canvasBOptions = {
    responsive: true, 
    maintainAspectRatio: false,
    plugins: {
      labels: {
        render: 'label',
        textMargin: 6,
        fontColor: '#fff',
        position: 'outside'
      }
    },
    legend: {
        display: false
    }
  };
  
  var canvasBData = {
      labels: [
          "Saudi Arabia",
          "Russia",
          "Iraq",
          "UAE",
          "Canada"
      ],
      datasets: [{
          data: [133.3, 86.2, 52.2, 51.2, 50.2],
          backgroundColor: [
              "#FF6384",
              "#ffcc00",
              "#3ab318",
              "#427eec",
              "#8463FF"
          ],
          borderColor: '#fff'
      }]
  };
  
  var pieChart = new Chart(canvasBCanvas, {
      type: 'doughnut',
      data: canvasBData,
      options: canvasBOptions
  });
  
  
  
  var ctx = document.getElementById("canvasC").getContext('2d');
  var boxC = new Chart(ctx, {
    type: 'line',
    data: {
      labels: ['Label1', 'Label2', 'Label3', 'Label4', 'Label5', 'Label6', 'Label7'],
      datasets: [
        {
          label: 'A',
          data: [10, 20, 30, 40, 30, 50, 20],
          borderColor: '#f7ff37',
          backgroundColor: '#f7ff37'
        },
        {
          label: 'B',
          data: [30, 50, 20, 20, 30, 10, 40],
          borderColor: '#37e7ff',
          backgroundColor: '#37e7ff'
        }
      ]
    },
    options: optionSet
  });
  
  