const w = 1250;
const h = 725;
const padding = 60;
const pieces = [];
const objs = [];
const gaps = [];
let count = 0;
let lastD = null;
let yesterday = '';
let uniqueDays = 0;
let filteredPieces = [];
let monthSelected, daySelected;
let busyDays = '';
let busiest = 0;

const months = {
  "January": 0,
  "February": 1,
  "March": 2,
  "April": 3,
  "May": 4,
  "June": 5,
  "July": 6,
  "August": 7,
  "September": 8,
  "October": 9,
  "November": 10,
  "December": 11
}

const monthMarks = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334];
const monthLengths = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

const days = {
  "Monday": 0,
  "Tuesday": 1,
  "Wednesday": 2,
  "Thursday": 3,
  "Friday": 4,
  "Saturday": 5,
  "Sunday": 6
}

const colors = {
  "January": '#f4c8bd',
  "February": '#abaccb',
  "March": '#a9d193',
  "April": '#e9bacc',
  "May": '#a0bfdc',
  "June": '#d5e4ad',
  "July": '#d1a9b1',
  "August": '#97ccdc',
  "September": '#f9eeae',
  "October": '#b599c1',
  "November": '#84c4b4',
  "December": '#f5be6b'
}

scale = () => {
  // remove data
  d3.selectAll('circle').remove();
  // remove X
  d3.select('.xaxis').remove();
  d3.select('.gridV').remove();
  // remove Y
  d3.select('.yaxis').remove();
  d3.select('.gridH').remove();

  daySelected = $('#day')[0].value;
  monthSelected = $('#month')[0].value;

  let xMax = 1440;
  let xTickValues = [0, 60, 120, 180, 240, 300, 360, 420, 480, 540, 600, 660, 720, 780, 840, 900, 960, 1020, 1080, 1140, 1200, 1260, 1320, 1380, 1439];
  let xTickFormat = ['00:00', '01:00', '02:00', '03:00', '04:00', '05:00', '06:00', '07:00', '08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00', '21:00', '22:00', '23:00', '23:59'];

  let yMax = monthLengths[months[monthSelected]];
  let yTickValues = [];
  let yTickFormat = [];

  for (let i = 1; i <= yMax; i++) {
    yTickValues.push(i);
    yTickFormat.push(i.toString());
  }

  filteredPieces = [];

  if (daySelected == 'Week' && monthSelected == 'Year') {
    filteredPieces = JSON.parse(JSON.stringify(pieces));
  }
  if (daySelected == 'Week') {
    xMax = 10080;
    xTickValues = [0, 1440, 2880, 4320, 5760, 7200, 8640, 10080];
    xTickFormat = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday', 'NWE'];
  }
  if (monthSelected == 'Year') {
    yMax = 365;
    yTickValues = [1, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334, 365];
    yTickFormat = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December', 'NYE'];
  }
  if (daySelected != 'Week' || monthSelected != 'Year') {
    for (piece of pieces) {
      if ((piece.day == daySelected || daySelected == 'Week') && (piece.month == monthSelected || monthSelected == 'Year')) {
        let newPiece = JSON.parse(JSON.stringify(piece));
        if (daySelected != 'Week') {
          newPiece.x = piece.hour * 60 + piece.minute;
        }
        if (monthSelected != 'Year') {
          newPiece.y = piece.date;
        }
        filteredPieces.push(newPiece);
      }
    }
  }

  const xScale = d3.scaleLinear()
      .domain([0, xMax]).range([padding, w - 15])

  const xAxis = d3.axisBottom().scale(xScale)
    .tickValues(xTickValues)
    .tickFormat((d, i) => xTickFormat[i]);

  const yScale = d3.scaleLinear()
      .domain([1, yMax]).range([h - padding, padding]);

  const yAxis = d3.axisLeft().scale(yScale)
    .tickValues(yTickValues)
    .tickFormat((d, i) => yTickFormat[i]);

  // vertical gridlines
  const vGridlines = d3.axisTop()
      .tickFormat('')
      .tickValues(xTickValues)
      .tickSize(padding - h)
      .scale(xScale);

  // vertical gridlines
  const hGridlines = d3.axisRight()
      .tickFormat('')
      .tickValues(yTickValues)
      .tickSize(w + padding)
      .scale(yScale);

  // vertical gridlines
  d3.select('svg').append('g')
    .attr('class', 'gridV')
    .call(vGridlines);

  // append axes
  d3.select('svg').append('g')
    .attr('class', 'xaxis')
    .attr('transform', 'translate(0,' + (h - padding) + ')')
    .call(xAxis);

  // vertical gridlines
  d3.select('svg').append('g')
     .attr('class', 'gridH')
     .call(hGridlines);

  d3.select('svg').append('g')
    .attr('class', 'yaxis')
    .attr('transform', 'translate(' + padding + ',0)')
    .call(yAxis);

  appendData(filteredPieces, xScale, yScale)
}

appendData = (filteredPieces, xScale, yScale) => {
  // append tooltip
  d3.select('body').append('div').attr('id', 'tooltip');

  // append data!
  d3.select('svg').selectAll('circle')
     .data(filteredPieces)
     .enter()
     .append('circle')
     .attr('cx', (d) => xScale(d.x))
     .attr('cy', (d) => yScale(d.y))
     .attr('stroke', 'black')
     .attr('stroke-width', '1')
     .attr('fill', (d) => colors[d.month])
     .attr('r', 5)
     .text((d) => d)
     .on('mouseover', (d) => {

       d3.select('#tooltip')
          .style('visibility', 'visible')
          .style('left', event.pageX - 100 + 'px')
          .style('top', event.pageY - 100 + 'px')

      const dt = (d.target.__data__);

      const hour = dt.hour.toString().length == 1 ? '0'.concat(dt.hour) : dt.hour;
      const minute = dt.minute.toString().length == 1 ? '0'.concat(dt.minute) : dt.minute;

      $('#date').html(`<text>${dt.day}, ${dt.month} ${dt.date}, ${hour}:${minute}</text>`);

     })
     .on('mouseout', () => {
          d3.select('#tooltip').style('visibility', 'hidden')
     })
}

analyze = () => {
  if ($('#shortest')[0].innerHTML == '') {
    let shortest = Number.MAX_VALUE;
    let longest = Number.MIN_VALUE;

    for (let i = 0; i < pieces.length - 1; i++) {
      const p1 = pieces[i];
      const p2 = pieces[i + 1];
      const d1 = new Date(2022, months[p1.month], p1.date, p1.hour, p1.minute);
      const d2 = new Date(2022, months[p2.month], p2.date, p2.hour, p2.minute);

      const interval = d2 - d1;
      if (interval < shortest) {
        shortest = interval;
      }
      else if (interval > longest) {
        longest = interval;
      }
    }
    $('#shortest')[0].innerHTML = `${(shortest / 60000)} minutes`;

    const longDays = Math.floor(longest / 86400000);
    const longHours = Math.floor((longest - (longDays * 86400000)) / 3600000);
    const longMinutes = Math.floor ((longest - ((longDays * 86400000) + (longHours * 3600000))) / 60000);

    $('#longest')[0].innerHTML = `${longDays} days, ${longHours} hours, ${longMinutes} minutes`;

    gaps.sort(sort = (a, b) => a - b);
    let medianish = null;
    // odd
    if ((count - 1) % 2 == 1) {
      medianish = gaps[count / 2];
    }
    else {
      let middish = Math.floor((count - 1) / 2);
      medianish = (gaps[middish] + gaps[middish + 1]) / 2;
    }
    const medianHours = Math.floor(medianish / 3600000);
    const medianMinutes = (medianish - (medianHours * 3600000)) / 60000;

    $('#median')[0].innerHTML = `${medianHours} hours, ${medianMinutes} minutes`;

    $('#busiest')[0].innerHTML = `${busiest}x: ${busyDays}`;
  }
}
