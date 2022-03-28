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

      const today = `${r.Month} ${r.Date}`;
      const now = `${r.Hour} ${r.Minute}`;

      if (today == yesterday) {
        objs[uniqueDays - 1].count += 1;
        objs[uniqueDays - 1].times.push(now);
      }
      else {
        objs.push({
          'day': today,
          'count': 1,
          'times': [now]
        })
        let yesterdaysCount = objs[uniqueDays - 1]?.count;
        if (yesterdaysCount > busiest) {
          busiest = yesterdaysCount;
          busyDays = yesterday;
        }
        else if (yesterdaysCount == busiest) {
          busyDays += `, ${yesterday}`;
        }
        uniqueDays++;
      }

      yesterday = today;
  	},
    complete: () => {
      console.log("Done!");
      console.log(pieces);
      console.log(objs);

      // create SVG
      d3.select('body').append('svg').attr('width', w).attr('height', h);
      scale();
    }
});
