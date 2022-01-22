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
      let vGridlines = d3.axisTop()
          .tickFormat('')
          .tickValues([0, 1440, 2880, 4320, 5760, 7200, 8640, 10080])
          .tickSize(padding - h)
          .scale(xScale);

      // vertical gridlines
      let hGridlines = d3.axisRight()
          .tickFormat('')
          .tickValues([1, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334, 365])
          .tickSize(w + padding)
          .scale(yScale);

      // vertical gridlines
      svg.append('g')
         .attr('class', 'grid')
         .call(hGridlines);

      // vertical gridlines
      svg.append('g')
        .attr('class', 'grid')
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

          let dt = (d.target.innerHTML).split(',');
          
          dt[5] = dt[5] == 0 ? '00' : dt[5];
          dt[6] = dt[6] == 0 ? '00' : dt[6];

          $('#date').html(`<text>${dt[4]}, ${dt[2]} ${dt[3]}, ${dt[5]}:${dt[6]}</text>`);

         })
         .on('mouseout', (d) => {
              d3.select('#tooltip').style('visibility', 'hidden')
         })
      }
  });
