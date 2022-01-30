Papa.parse('data.csv', {
    download: true,
    header: true,
    dynamicTyping: true,
    skipEmptyLines: true,
  	step: (row) => {
      const r = row.data;

      const x = (days[r.Day] * 1440) + (r.Hour * 60) + r.Minute;
      const y = monthMarks[months[r.Month]] + r.Date;

      pieces.push([x, y, r.Month, r.Date, r.Day, r.Hour, r.Minute]);
  	},
    complete: () => {
      console.log("Done!");
      console.log(pieces);

      // create SVG
      d3.select('body').append('svg').attr('width', w).attr('height', h);
      scale();
    }
});
