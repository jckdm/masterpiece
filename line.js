Papa.parse('data.csv', {
    download: true,
    header: true,
    dynamicTyping: true,
    skipEmptyLines: true,
  	step: (row) => {
      const r = row.data;

      linePieces.push({
        'x': (((monthMarks[months[r.Month]] + r.Date) - 1) * 1440) + (r.Hour * 60) + r.Minute
      })

      lineTotal++;
  	},
    complete: () => {
      console.log("Done!");

      // create SVG
      d3.select('body').append('svg').attr('id', 'line').attr('width', lw).attr('height', lh);

      const xScale = d3.scaleLinear()
        .domain([0, linePieces[lineTotal - 1].x]).range([padding, w - 15])

      d3.select('#line').selectAll('rect')
         .data(linePieces)
         .enter()
         .append('rect')
         .attr('x', (d, i) => xScale(d.x) + i * 40)
         .attr('y', (d) => 362.5)
         .attr('height', 40)
         .attr('width', 40)
         .attr('fill', '#F5F5F5')
    }
});
