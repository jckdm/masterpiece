parseUploadedFile = () => {
  $('#uploadError')[0].innerText = "";
  let fileList = $('#uploadedFile')[0].files;

  if (fileList.length < 1) {
    $('#uploadError')[0].innerText = "No file uploaded."
  }

  const file = fileList[0];

  if (file.name.split('.')[1] != 'csv') {
    $('#uploadError')[0].innerText = "Incorrect file type."
  }

  $.ajax({
    type: "GET",
    url: file.name,
    success: (data) => {
      d3.select('#main').remove();

      document.getElementById('verticalSpans').innerHTML = '';
      document.getElementById('vmins').value = 60;
      document.getElementById('labelvmins').innerHTML = `60 minutes`;

      pieces = [];
      objs = [];
      gaps = [];
      dayFreqs = [{'day': 'Monday', 'abb': 'M', 'freq': 0},{'day': 'Tuesday', 'abb': 'T', 'freq': 0},{'day': 'Wednesday', 'abb': 'W', 'freq': 0},{'day': 'Thursday', 'abb': 'Th', 'freq': 0},{'day': 'Friday', 'abb': 'F', 'freq': 0},{'day': 'Saturday', 'abb': 'S', 'freq': 0},{'day': 'Sunday', 'abb': 'Su', 'freq': 0}];
      monthFreqs = [{'month': 'January', 'freq': 0},{'month': 'February', 'freq': 0},{'month': 'March', 'freq': 0},{'month': 'April', 'freq': 0},{'month': 'May', 'freq': 0},{'month': 'June', 'freq': 0},{'month': 'July', 'freq': 0},{'month': 'August', 'freq': 0},{'month': 'September', 'freq': 0},{'month': 'October', 'freq': 0},{'month': 'November', 'freq': 0},{'month': 'December', 'freq': 0}];
      count = 0;
      lastD = null;
      yesterday = '';
      uniqueDays = 0;
      filteredPieces = [];
      monthSelected, daySelected;
      busyDays = '';
      busiest = 0;
      total = 0;
      dayFreqCounts = {};
      analyzed = false;
      charted = false;

      Papa.parse(data, {
        header: true,
        dynamicTyping: true,
        skipEmptyLines: true,
        step: (row) => parseRow(row),
        complete: () => {
          d3.select('body').append('svg')
            .attr('id', 'main')
            .attr('width', w)
            .attr('height', h);
          scale(true);
        }
      })
    }
  });
}

parseRow = (row) => {
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
    'minute': r.Minute,
    'index': total
  })

  total++;

  dayFreqs[days[r.Day]].freq += 1;
  monthFreqs[months[r.Month]].freq += 1;

  const d = new Date(2022, months[r.Month], r.Date, r.Hour, r.Minute);

  if (count != 0) {
    gaps.push(d - lastD);
    lastD = d;
    count++;
  }
  else {
    count++;
    lastD = d;
  }

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
}

scale = (flag = false) => {
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

  let monthBars = $('#monthBar')[0].children;
  if (monthBars.length > 0) {
    for (bar of monthBars) {
      if (bar.nodeName == 'rect') {
        bar.attributes.fill.value = '#000000'
      }
    }
  }

  let dayBars = $('#dayBar')[0].children;
  if (dayBars.length > 0) {
    for (bar of dayBars) {
      if (bar.nodeName == 'rect') {
        bar.attributes.fill.value = '#000000'
      }
    }
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
    if (monthSelected != 'Year' && charted == true) {
      document.getElementById(monthSelected).attributes.fill.value = '#808080';
    }
    if (daySelected != 'Week' && charted == true) {
      document.getElementById(daySelected).attributes.fill.value = '#808080';
    }
  }

  xScale = d3.scaleLinear()
    .domain([0, xMax]).range([padding, w - 15])

  const xAxis = d3.axisBottom().scale(xScale)
    .tickValues(xTickValues)
    .tickFormat((d, i) => xTickFormat[i]);

  yScale = d3.scaleLinear()
    .domain([yMax, 1]).range([h - padding, padding]);

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
  d3.select('#main').append('g')
    .attr('class', 'gridV')
    .call(vGridlines);

  // append axes
  d3.select('#main').append('g')
    .attr('class', 'xaxis')
    .attr('transform', 'translate(0,' + (h - padding) + ')')
    .call(xAxis);

  // vertical gridlines
  d3.select('#main').append('g')
     .attr('class', 'gridH')
     .call(hGridlines);

  d3.select('#main').append('g')
    .attr('class', 'yaxis')
    .attr('transform', 'translate(' + padding + ',0)')
    .call(yAxis);

  if (flag) { appendData(filteredPieces); }
}

run = () => {
  appendData(filteredPieces);
  $('#modalStart')[0].style.display = 'none';
}

appendData = (filteredPieces) => {
  // append tooltip
  d3.select('body').append('div').attr('id', 'tooltip');

  // append data!
  d3.select('#main').selectAll('circle')
     .data(filteredPieces)
     .enter()
     .append('circle')
     .attr('cx', (d) => xScale(d.x))
     .attr('cy', (d) => yScale(d.y))
     .attr('stroke', 'black')
     .attr('stroke-width', '1')
     .attr('id', (d) => `_${d.index}`)
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

     for (obj of objs) {
       let c = obj.count;
       if (c in dayFreqCounts) {
         dayFreqCounts[c] += 1;
       }
       else {
         dayFreqCounts[c] = 1;
       }
     }

     let today = new Date();
     let eoy = new Date(2023, 0, 1);

     if (today < eoy) {
      const start = new Date(2022, 0, 0);
      const diff = today - start;
      const day = Math.floor(diff / 86400000);

      dayFreqCounts[0] = day - uniqueDays;
     }
     else {
       dayFreqCounts[0] = 365 - uniqueDays;
     }
}

analyze = () => {
  if (analyzed == false) {
    analyzed = true;
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
    const longMinutes = Math.floor((longest - ((longDays * 86400000) + (longHours * 3600000))) / 60000);

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

    $('#total')[0].innerHTML = total;

    $('#active')[0].innerHTML = uniqueDays;
  }
}

charts = () => {
  if (charted == false) {
    dayBars();
    monthBars();
    freqPie();
    charted = true;
  }
}

monthBars = () => {
  let bars = d3.select('#monthBar');

  let x = d3.scaleBand()
    .range([0, 300])
    .domain(monthFreqs.map((d) => d.month ))
    .padding(0.25);

  bars.append('g')
    .call(d3.axisBottom(x))
    .selectAll('text')
    .attr("transform", "translate(-13,10)rotate(-90)")
    .style("text-anchor", "end");

  let y = d3.scaleLinear()
    .range([150, 0])
    .domain([0, 150]);

  bars.append('g')
    .call(d3.axisLeft(y));

  // bars
  bars.selectAll('bar')
    .data(monthFreqs)
    .enter()
    .append('rect')
    .attr('id', (d) => { return d.month; })
    .attr('x', (d) => { return x(d.month); })
    .attr('y', (d) => { return y(d.freq); })
    .attr('width', x.bandwidth())
    .attr('height', (d) => { return 150 - y(d.freq); })
    .attr('fill', '#000000')

  if (monthSelected != 'Year') {
    document.getElementById(monthSelected).attributes.fill.value = '#808080';
  }

  // labels
  bars.selectAll('bar')
    .data(monthFreqs)
    .enter()
    .append('text')
    .attr('x', (d) => { return x(d.month) + (x.bandwidth() / 6); })
    .attr('class', 'barLabels')
    .attr('y', (d) => { return y(d.freq) - 3; })
    .attr('fill', '#000000')
    .text((d) => { return d.freq; })
}

dayBars = () => {
  let bars = d3.select('#dayBar');

  let x = d3.scaleBand()
    .range([0, 300])
    .domain(dayFreqs.map((d) => { return d.day; }))
    .padding(0.25);

  bars.append('g')
    .call(d3.axisBottom(x))
    .selectAll('text')
    .attr("transform", "translate(-13,10)rotate(-90)")
    .style("text-anchor", "end");

  let y = d3.scaleLinear()
    .range([150, 0])
    .domain([0, 150]);

  bars.append('g')
    .call(d3.axisLeft(y));

  // bars
  bars.selectAll('bar')
    .data(dayFreqs)
    .enter()
    .append('rect')
    .attr('id', (d) => { return d.day; })
    .attr('x', (d) => { return x(d.day); })
    .attr('y', (d) => { return y(d.freq); })
    .attr('width', x.bandwidth())
    .attr('height', (d) => { return 150 - y(d.freq); })
    .attr('fill', '#000000')

  if (daySelected != 'Week') {
    document.getElementById(daySelected).attributes.fill.value = '#808080';
  }

  // labels
  bars.selectAll('bar')
    .data(dayFreqs)
    .enter()
    .append('text')
    .attr('x', (d) => { return x(d.day) + (x.bandwidth() / 4); })
    .attr('class', 'barLabels')
    .attr('y', (d) => { return y(d.freq) - 3; })
    .attr('fill', '#000000')
    .text((d) => { return d.freq; })
}

freqPie = () => {
  document.getElementById('pieKey').innerHTML = '<tr><td class="und">freq</td><td class="und">num</td><td class="und">pct</td></tr>';

  // set the color scale
  const color = d3.scaleOrdinal()
  .range(['#C9D4D5', '#CCD3E0', '#C5D5EC', '#C4D9D9', '#C8E5E2']);

  let pieChart = d3.select('#dayFreqBarChart')
  .attr('width', 200)
  .attr('height', 200)
  .append('g')
  .attr('transform', 'translate(100,100)');

  const pie = d3.pie().value(d => d[1]);
  const data_pie = pie(Object.entries(dayFreqCounts));

  const arcGen = d3.arc().innerRadius(40).outerRadius(75);

  pieChart.selectAll('pies')
  .data(data_pie)
  .join('path')
  .attr('d', d3.arc()
  .innerRadius(40)
  .outerRadius(80))
  .attr('fill', d => color(d.data[0]))
  .attr('stroke', '#808080')
  .style('stroke-width', 0.5)

  pieChart.selectAll('slices')
  .data(data_pie)
  .join('text')
  .text(d => d.data[0])
  .attr('transform', d => `translate(${arcGen.centroid(d)})`)
  .style('text-anchor', 'middle')
  .attr('class', 'pieLabels')

  let totalDayFreqCounts = 0;
  for (day in dayFreqCounts) { totalDayFreqCounts += dayFreqCounts[day]; }

  let sortedDayFreqCounts = [];

  for (day in dayFreqCounts) { sortedDayFreqCounts.push([day, dayFreqCounts[day]]); }
  sortedDayFreqCounts.sort((a, b) => b[1] - a[1]);

  for (day of sortedDayFreqCounts) {
    let tr = document.createElement('tr');
    let d = document.createElement('td');
    let dd = document.createElement('td');
    let ddd = document.createElement('td');
    d.innerText = day[0] + ':';

    let ddLen = day[1].toString().length;
    if (ddLen == 1) { dd.innerText = '00'.concat(day[1]); }
    else if (ddLen == 2) { dd.innerText = '0'.concat(day[1]); }
    else { dd.innerText = day[1]; }

    let dddPercent = (day[1] / totalDayFreqCounts * 100).toFixed(2);
    let dddLen = dddPercent.length;
    if (dddLen == 4) { ddd.innerText = '0'.concat(dddPercent) + '%'; }
    else { ddd.innerText = dddPercent + '%'; }

    tr.appendChild(d);
    tr.appendChild(dd);
    tr.appendChild(ddd);
    document.getElementById('pieKey').appendChild(tr);
  }
}

blanks = () => {
  document.getElementById('verticalBlanks').innerHTML = '';
  const val = parseInt(document.getElementById('blank').value);
  document.getElementById('labelBlank').innerHTML = `${val}%`;

  const blankKeys = {};
  for (piece of pieces) { blankKeys[piece.x] = piece.x; }
  const blanks = Object.values(blankKeys).sort((a, b) => { return a - b; });
  const numBlankKeys = blanks.length;

  let blankSpans = [];
  let longestBlank = 0;

  for (let i = 0; i < numBlankKeys - 1; i++) {
    let blankGap = blanks[i + 1] - blanks[i];
    blankSpans.push(blankGap);
    if (blankGap > longestBlank) { longestBlank = blankGap; }
  }

  const lastBlankGap = blanks[0] + (10080 - blanks[numBlankKeys - 1]);
  blankSpans.push(lastBlankGap);
  if (lastBlankGap > longestBlank) { longestBlank = blankGap; }

  blankSpans = blankSpans.filter((item, index) => blankSpans.indexOf(item) === index);
  blankSpans.sort((a, b) => { return a - b; });

  const threshold = blankSpans[Math.floor((val / 100) * blankSpans.length) - 1];

  let longestSpans = [];

  for (let i = 0; i < numBlankKeys; i++) {
    let blankGap = blanks[i + 1] - blanks[i];
    if (blankGap >= threshold) { longestSpans.push([blanks[i], blanks[i + 1]]); }
  }

  d3.selectAll('.blanks').remove();

  if (longestSpans.length > 0) {
    // more slop
    d3.select('.gridH')
      .selectAll('rect')
      .data(longestSpans)
      .enter()
      .append('rect')
      .attr('x', (d) => xScale(d[0]) + 5)
      .attr('y', padding)
      .attr('height', h - padding - padding)
      .attr('width', (d) => xScale(d[1]) - xScale(d[0]) - 10)
      .attr('class', 'blanks')
      .style('fill', 'white')
      .style('opacity', 0.1);

    // necessary?
    longestSpans.sort((a, b) => a[0] - b[0]);

    for (span of longestSpans) {
      let startDay = daysForVerticals[Math.floor((span[0] / 60) / 24)];
      let endDay = daysForVerticals[Math.floor((span[1] / 60) / 24)]

      let num24sStart = Math.floor((span[0] / 60) / 24) * 24;
      let num24sEnd = Math.floor((span[1] / 60) / 24) * 24;

      let startHours = Math.floor(span[0] / 60) - num24sStart;
      let endHours = Math.floor(span[1] / 60) - num24sEnd;

      let startMinutes = span[0] - (60 * startHours) - (num24sStart * 60);
      let endMinutes = span[1] - (60 * endHours) - (num24sEnd * 60);

      const displayStartHours = startHours.toString().length == 1 ? '0'.concat(startHours) : startHours;
      const displayEndHours = endHours.toString().length == 1 ? '0'.concat(endHours) : endHours;
      const displayStartMinutes = startMinutes.toString().length == 1 ? '0'.concat(startMinutes) : startMinutes;
      const displayEndMinutes = endMinutes.toString().length == 1 ? '0'.concat(endMinutes) : endMinutes;

      let p = document.createElement('p');
      p.innerText = `${startDay} ${displayStartHours}:${displayStartMinutes} – ${endDay} ${displayEndHours}:${displayEndMinutes}\n`;
      document.getElementById('verticalBlanks').appendChild(p);
    }
  }
}

sliderVal = () => {
  document.getElementById('verticalSpans').innerHTML = '';
  const val = parseInt(document.getElementById('vmins').value);
  document.getElementById('labelvmins').innerHTML = `${val} minutes`;

  d3.selectAll('circle').style('opacity', 1.0);

  const vals = {};

  const piecesCopy = [];
  let piecesCopyCopy = [];
  piecesCopy.push.apply(piecesCopy, pieces);
  piecesCopyCopy.push.apply(piecesCopyCopy, pieces);

  for (p1 of piecesCopyCopy) {
    for (p2 of piecesCopy) {
      let added = false;
      if (p2.x >= (p1.x - (val / 2)) && p2.x <= (p1.x + (val / 2))) {
        let key = `_${p1.x}_mid`;
        if (vals[key]) { vals[key].push(p2); }
        else { vals[key] = [p2]; }
        added = true;
      }
      if (val != 0) {
        if (p1.x - p2.x <= val && p1.x - p2.x >= 0) {
          let key = `_${p1.x}_start`;
          if (vals[key]) { vals[key].push(p2); }
          else { vals[key] = [p2]; }
          added = true;
        }
        if (p1.x - p2.x >= -val && p1.x - p2.x <= 0) {
          let key = `_${p1.x}_end`;
          if (vals[key]) { vals[key].push(p2); }
          else { vals[key] = [p2]; }
          added = true;
        }
      }
      if (added) { piecesCopy.splice(piecesCopy.indexOf(p2), 1); }
    }
  }

  let largestVert = 0;

  for (v in vals) {
    let currV = vals[v];
    let l = currV.length;
    if (l > largestVert) {
      let minX = 10080;
      let maxX = -1;
      for (p in currV) {
        if (currV[p].x < minX) { minX = currV[p].x; }
        if (currV[p].x > maxX) { maxX = currV[p].x; }
      }
      if (maxX - minX == val) {
        largestVert = l;
      }
    }
  }

  d3.selectAll('circle').style('opacity', 0.1);
  d3.selectAll('.verticals').remove();

  // TO DO: should be defined somewhere else?
  xScale = d3.scaleLinear().domain([0, 10080]).range([padding, w - 15]);

  const ranges = [];

  for (v in vals) {
    if (vals[v].length == largestVert) {
      let minX = 10080;
      let maxX = -1;
      for (p of vals[v]) {
        if (p.x < minX) { minX = p.x; }
        if (p.x > maxX) { maxX = p.x; }
      }
      // still necessary: there could be incorrectly-sized ranges with the max as well
      if (maxX - minX == val) { ranges.push([minX, maxX, vals[v].length]); }
      else { delete vals[v]; }
    }
    else { delete vals[v]; }
  }

  if (ranges.length > 0) {
    // apology for this slop: randomly selecting a G that's behind the data...
    // so that the highlighted points can be hovered on
    d3.select('.gridV')
      .selectAll('rect')
      .data(ranges)
      .enter()
      .append('rect')
      .attr('x', (d) => xScale(d[0]) - 5)
      .attr('y', padding)
      .attr('height', h - padding - padding)
      .attr('width', (d) => xScale(d[1]) - xScale(d[0]) + 10)
      .attr('class', 'verticals')
      .style('fill', 'white')
      .style('opacity', 0.1);

    ranges.sort((a, b) => a[0] - b[0]);

    for (r of ranges) {
      let startDay = daysForVerticals[Math.floor((r[0] / 60) / 24)];
      let endDay = daysForVerticals[Math.floor((r[1] / 60) / 24)]

      let num24sStart = Math.floor((r[0] / 60) / 24) * 24;
      let num24sEnd = Math.floor((r[1] / 60) / 24) * 24;

      let startHours = Math.floor(r[0] / 60) - num24sStart;
      let endHours = Math.floor(r[1] / 60) - num24sEnd;

      let startMinutes = r[0] - (60 * startHours) - (num24sStart * 60);
      let endMinutes = r[1] - (60 * endHours) - (num24sEnd * 60);

      const displayStartHours = startHours.toString().length == 1 ? '0'.concat(startHours) : startHours;
      const displayEndHours = endHours.toString().length == 1 ? '0'.concat(endHours) : endHours;
      const displayStartMinutes = startMinutes.toString().length == 1 ? '0'.concat(startMinutes) : startMinutes;
      const displayEndMinutes = endMinutes.toString().length == 1 ? '0'.concat(endMinutes) : endMinutes;

      let p = document.createElement('p');
      p.innerText = `${r[2]}x: ${startDay} ${displayStartHours}:${displayStartMinutes} – ${endDay} ${displayEndHours}:${displayEndMinutes}\n`;
      document.getElementById('verticalSpans').appendChild(p);
    }

    for (v in vals) {
      for (p of vals[v]) {
        document.getElementById(`_${p.index}`).style.opacity = 1;
      }
    }
  }
}

clearVerticals = () => {
  d3.selectAll('circle').style('opacity', 1.0);
  d3.selectAll('.verticals').remove();
  $('#modalVerticals')[0].style.display = 'none';
}
