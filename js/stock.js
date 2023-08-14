//required tags
const studentId = document.getElementById("studentId");
studentId.textContent = "200523537; Joshua Burt";
//date
const currentDate = new Date();
function formatDateToYearMonthDay(date) {
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const day = date.getDate().toString().padStart(2, "0");
  return `${year}-${month}-${day}`;
}
const formattedDate = formatDateToYearMonthDay(currentDate);

//Populate stock list from API query; source: https://polygon.io/docs/stocks/get_v3_reference_tickers
//XNAS = NASDAQ stock exchange (includes NASDAQ-100)
//TO-DO: multiple search options using API (exchanges, specific ticker, etc.)
var stockList = [];
const apiUrlSP = `https://api.polygon.io/v3/reference/tickers?type=CS&market=stocks&exchange=XNAS&active=true&limit=1000&sort=ticker&apiKey=${apiKey}`;
fetch(apiUrlSP)
  .then((response) => response.json())
  .then((data) => {
    for (let t = 0; t < data.results.length; t++) {
      stockList.push(data.results[t].ticker);
    }
    if (stockSelect2.length <= stockList.length) {
      for (let i = 0; i < stockList.length; i++) {
        var option = document.createElement("option");
        option.textContent = stockList[i];
        option.id = stockList[i];
        stockSelect2.appendChild(option);
      }
    }
  });

//User selection
const view = document.getElementById("view");
const clear = document.getElementById("clear");
const stockSelect = document.getElementById("stockSelect");
const stockSelect2 = document.querySelector("#stockSelect2");
var stockSymbol = []; //initial choice stock array
view.addEventListener("click", () => {
  const selectedOptions = Array.from(stockSelect2.selectedOptions);
  selectedOptions.forEach((option) => {
    stockSymbol.push(option.value);
  });
  console.log("Selected values array:", stockSymbol);
  chartGen();
});

//API info
//TO DO: Make choice date range
//TO DO: Make choice investment
var fetchCount = 0;

//dynamic table & chart creation
function chartGen() {
  for (i = 0; i < stockSymbol.length; i++) {
    const tablesDiv = document.createElement("div");
    tablesDiv.id = "tables";
    const stockNameHeading = document.createElement("h2");
    stockNameHeading.id = `stockName${i}`;
    const formatDiv = document.createElement("div");
    formatDiv.id = "format";
    const tableDiv = document.createElement("div");
    tableDiv.id = "table";
    const table = document.createElement("table");
    table.id = `stockTable${i}`;
    const thead = document.createElement("thead");
    const tr = document.createElement("tr");
    const headers = [
      "Date",
      "Open Price",
      "Close Price",
      "High Price",
      "Low Price",
    ];
    headers.forEach((headerText) => {
      const th = document.createElement("th");
      th.textContent = headerText;
      tr.appendChild(th);
    });
    thead.appendChild(tr);
    const tbody = document.createElement("tbody");
    table.appendChild(thead);
    table.appendChild(tbody);
    tableDiv.appendChild(table);
    const chartDiv = document.createElement("div");
    chartDiv.id = "chart";
    const canvas = document.createElement("canvas");
    canvas.id = `stockChart${i}`;
    canvas.width = 800;
    canvas.height = 400;
    chartDiv.appendChild(canvas);
    formatDiv.appendChild(tableDiv);
    formatDiv.appendChild(chartDiv);
    tablesDiv.appendChild(stockNameHeading);
    tablesDiv.appendChild(formatDiv);
    document.body.appendChild(tablesDiv);

    // TABLE & CHART GENERATION
    var datapoints = [];
    var dates = [];
    var prices = [];
    var apiUrl = `https://api.polygon.io/v2/aggs/ticker/${stockSymbol[i]}/range/1/day/2023-06-01/${formattedDate}?apiKey=${apiKey}`;
    // i does not iterate through fetch function, use different iteration counter through stock table/charts (fetchCount)
    var fetchCount = 0;
    fetch(apiUrl)
      .then((response) => response.json())
      .then((data) => {
        var ctx = document
          .getElementById(`stockChart${fetchCount}`)
          .getContext("2d");
        console.log(data);
        //H2 POPULATION
        var stockName = document.getElementById(`stockName${fetchCount}`);
        stockName.textContent = `${data.ticker} Data`;
        //TABLE POPULATION
        var tableBody = document.querySelector(
          `#stockTable${fetchCount} tbody`
        );
        data.results.forEach((result) => {
          var row = tableBody.insertRow();
          row.insertCell().textContent = new Date(
            result.t
          ).toLocaleDateString();
          row.insertCell().textContent = result.o.toFixed(2);
          row.insertCell().textContent = result.c.toFixed(2);
          row.insertCell().textContent = result.h.toFixed(2);
          row.insertCell().textContent = result.l.toFixed(2);
        });
        //CHART POPULATION
        datapoints = data.results.map((result) => ({
          x: new Date(result.t).toLocaleDateString(),
          y: result.c,
        }));

        //Extract the data fom dataPoints into Chart.js Chart instance format(x: array of dates, y: array of prices)
        for (i = 0; i < datapoints.length; i++) {
          dates.push(datapoints[i].x);
          prices.push(datapoints[i].y);
        }
        //Create a new Chart.js line chart
        window.stockChartInstance = new Chart(ctx, {
          type: "line",
          data: {
            labels: dates,
            datasets: [
              {
                label: "Price",
                data: prices,
                backgroundColor: "rgba(54, 162, 235, 0.7)",
                borderWidth: 1,
              },
            ],
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
              y: {
                beginAtZero: true,
                title: {
                  display: true,
                  text: "Price",
                },
              },
              x: {
                title: {
                  display: true,
                  text: "Date",
                },
              },
            },
          },
        });

        fetchCount++;
        prices = [];
        dates = [];
      })

      .catch((error) => {
        console.error("Error fetching data:", error);
      });

    //add to stockArray while in function
    view.addEventListener("click", () => {
      tablesDiv.remove(); //remove original tableDiv
    });

    //clear tablesDiv if user clicks clear button
    clear.addEventListener("click", () => {
      tablesDiv.remove();
      stockSymbol = [];
    });
  }
}

// //for 30 second updates (in progress)
// if (window.stockChartInstance) {
//   window.stockChartInstance.destroy();
// }
// //Fetch and update data every 30 seconds
// setInterval(chartGen, 30000);
