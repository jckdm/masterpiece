const w = 1250;
const h = 500;
const padding = 60;
const pieces = [];

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

const monthmarks = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334];

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

Papa.parse('data.csv', {
    download: true,
    header: true,
    dynamicTyping: true,
    skipEmptyLines: true,
  	step: (row) => {
      const r = row.data;

      const x = (days[r.Day] * 1440) + (r.Hour * 60) + r.Minute;
      const y = monthmarks[months[r.Month]] + r.Date;

      pieces.push([x, y, r.Month, r.Date, r.Day, r.Hour, r.Minute]);
  	},
    complete: () => {
      console.log("Done!");
      console.log(pieces);

      // create SVG
      const svg = d3.select('body').append('svg').attr('width', w).attr('height', h);

      // define scales and axes
      const xScale = d3.scaleLinear()
          .domain([0, 10080]).range([padding, w - 15])
      const yScale = d3.scaleLinear()
          .domain([1, 365]).range([h - padding, padding]);

      const xAxis = d3.axisBottom().scale(xScale)
        .tickValues([0, 1440, 2880, 4320, 5760, 7200, 8640, 10080])
        .tickFormat((d, i) => ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday', 'NWE'][i]);

      const yAxis = d3.axisLeft().scale(yScale)
        .tickValues([1, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334, 365])
        .tickFormat((d, i) => ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December', 'NYE'][i]);

      // vertical gridlines
      const vGridlines = d3.axisTop()
          .tickFormat('')
          .tickValues([0, 1440, 2880, 4320, 5760, 7200, 8640, 10080])
          .tickSize(padding - h)
          .scale(xScale);

      // vertical gridlines
      const hGridlines = d3.axisRight()
          .tickFormat('')
          .tickValues([1, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334, 365])
          .tickSize(w + padding)
          .scale(yScale);

      // vertical gridlines
      svg.append('g')
         .attr('class', 'gridH')
         .call(hGridlines);

      // vertical gridlines
      svg.append('g')
        .attr('class', 'gridV')
        .call(vGridlines);

      // append axes
      svg.append('g')
        .attr('class', 'xaxis')
        .attr('transform', 'translate(0,' + (h - padding) + ')')
        .call(xAxis);

      svg.append('g')
        .attr('class', 'yaxis')
        .attr('transform', 'translate(' + padding + ',0)')
        .call(yAxis);

      // append tooltip
      d3.select('body').append('div').attr('id', 'tooltip');

      // append data!
      svg.selectAll('circle')
         .data(pieces)
         .enter()
         .append('circle')
         .attr('cx', (d) => xScale(d[0]))
         .attr('cy', (d) => yScale(d[1]))
         .attr('stroke', 'black')
         .attr('stroke-width', '1')
         .attr('fill', (d) => colors[d[2]])
         .attr('r', 5)
         .text((d) => d)
         .on('mouseover', (d) => {

           d3.select('#tooltip')
              .style('visibility', 'visible')
              .style('left', event.pageX - 100 + 'px')
              .style('top', event.pageY - 100 + 'px')

          const dt = (d.target.innerHTML).split(',');

          dt[5] = dt[5] == 0 ? '00' : dt[5];
          dt[6] = dt[6] == 0 ? '00' : dt[6];

          $('#date').html(`<text>${dt[4]}, ${dt[2]} ${dt[3]}, ${dt[5]}:${dt[6]}</text>`);

         })
         .on('mouseout', (d) => {
              d3.select('#tooltip').style('visibility', 'hidden')
         })
      }
});

scaleByDay = (day) => {
  d3.selectAll('circle').remove();
  d3.select('.xaxis').remove();
  d3.select('.gridV').remove();

  let xMax = 1440;
  let xTickValues = [0, 60, 120, 180, 240, 300, 360, 420, 480, 540, 600, 660, 720, 780, 840, 900, 960, 1020, 1080, 1140, 1200, 1260, 1320, 1380, 1439];
  let xTickFormat = ['00:00', '01:00', '02:00', '03:00', '04:00', '05:00', '06:00', '07:00', '08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00', '21:00', '22:00', '23:00', '23:59'];
  let filteredPieces = [];

  if (day == 'Week') {
    xMax = 10080;
    xTickValues = [0, 1440, 2880, 4320, 5760, 7200, 8640, 10080];
    xTickFormat = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday', 'NWE'];
    filteredPieces = JSON.parse(JSON.stringify(pieces));
  }
  else {
    for (piece of pieces) {
      if (piece[4] == day) {
        let newPiece = JSON.parse(JSON.stringify(piece));
        newPiece[0] = piece[5] * 60 + piece[6];
        filteredPieces.push(newPiece);
      }
    }
  }

  const xScale = d3.scaleLinear()
      .domain([0, xMax]).range([padding, w - 15])

  const yScale = d3.scaleLinear()
      .domain([1, 365]).range([h - padding, padding]);

  const xAxis = d3.axisBottom().scale(xScale)
    .tickValues(xTickValues)
    .tickFormat((d, i) => xTickFormat[i]);

  const yAxis = d3.axisLeft().scale(yScale)
    .tickValues([1, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334, 365])
    .tickFormat((d, i) => ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December', 'NYE'][i]);

  // vertical gridlines
  const vGridlines = d3.axisTop()
      .tickFormat('')
      .tickValues(xTickValues)
      .tickSize(padding - h)
      .scale(xScale);

  // vertical gridlines
  d3.select('svg').append('g')
    .attr('class', 'gridV')
    .call(vGridlines);

  // append axes
  d3.select('svg').append('g')
    .attr('class', 'xaxis')
    .attr('transform', 'translate(0,' + (h - padding) + ')')
    .call(xAxis);

  d3.select('svg').append('g')
    .attr('class', 'yaxis')
    .attr('transform', 'translate(' + padding + ',0)')
    .call(yAxis);

  // append data!
  d3.select('svg').selectAll('circle')
     .data(filteredPieces)
     .enter()
     .append('circle')
     .attr('cx', (d) => xScale(d[0]))
     .attr('cy', (d) => yScale(d[1]))
     .attr('stroke', 'black')
     .attr('stroke-width', '1')
     .attr('fill', (d) => colors[d[2]])
     .attr('r', 5)
     .text((d) => d)
     .on('mouseover', (d) => {

       d3.select('#tooltip')
          .style('visibility', 'visible')
          .style('left', event.pageX - 100 + 'px')
          .style('top', event.pageY - 100 + 'px')

      const dt = (d.target.innerHTML).split(',');

      dt[5] = dt[5] == 0 ? '00' : dt[5];
      dt[6] = dt[6] == 0 ? '00' : dt[6];

      $('#date').html(`<text>${dt[4]}, ${dt[2]} ${dt[3]}, ${dt[5]}:${dt[6]}</text>`);

     })
     .on('mouseout', (d) => {
          d3.select('#tooltip').style('visibility', 'hidden')
     })

}
