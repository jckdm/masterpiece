Papa.parse('data.csv', {
    download: true,
    header: true,
    dynamicTyping: true,
    skipEmptyLines: true,
  	step: (row) => {
      const r = row.data;

      const x = (days[r.Day] * 1440) + (r.Hour * 60) + r.Minute;
      const y = monthMarks[months[r.Month]] + r.Date;

      pieces.push({
        'x': x,
        'y': y,
        'month': r.Month,
        'date': r.Date,
        'day': r.Day,
        'hour': r.Hour,
        'minute': r.Minute
      })
  	},
    complete: () => {
      console.log("Done!");
      console.log(pieces);

      // create SVG
      d3.select('body').append('svg').attr('width', w).attr('height', h);
      scale();
    }
});
