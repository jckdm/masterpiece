const w = 1250;
const h = 500;
const padding = 30;
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

const days = {
  "Monday": 0,
  "Tuesay": 1,
  "Wednesday": 2,
  "Thursday": 3,
  "Friday": 4,
  "Saturday": 5,
  "Sunday": 6
}

Papa.parse('data.csv', {
    download: true,
    header: true,
    dynamicTyping: true,
  	step: (row) => {
      const r = row.data;

      const x = (days[r.Day] * 1440) + (r.Hour * 60) + r.Minute;
      const y = months[r.Month] + r.Day;

      pieces.push([x, y, r.Month, r.Date]);
  	},
    complete: () => {
      console.log("Done!");
      console.log(pieces);

      // create SVG
      const svg = d3.select('body').append('svg').attr('width', w).attr('height', h);

      // define scales and axes
      const xScale = d3.scaleLinear().domain([0, 10080]).range([padding, w - 5])
      const yScale = d3.scaleLinear().domain([1, 365]).range([h - padding, padding]);
      const xAxis = d3.axisBottom().scale(xScale).ticks(25);
      const yAxis = d3.axisLeft().scale(yScale).ticks(12);

      console.log(xScale(pieces[0][0]), yScale(pieces[0][1] - padding));

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
      // d3.select('body').append('div').attr('id', 'tooltip');

      // append data!
      svg.selectAll('circle')
         .data(pieces)
         .enter()
         .append('circle')
         .attr('cx', (d) => xScale(d[0]))
         .attr('cy', (d) => yScale(d[1]))
         .attr('stroke', 'gray')
         .attr('stroke-width', '1')
         .attr('fill', 'red')
         .attr('r', 5)
         // highlight button of selected app on hover
         // .on('mouseover', function () {
         //   d3.selectAll('.app').style('visibility', 'hidden');
         //   d3.selectAll('#' + (this).attributes.class.value).style('visibility', 'visible');
         // })
         // .on('mouseout', () => d3.selectAll('.app').style('visibility', 'visible') );
      }
  });
