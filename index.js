upload = () => {
  $('#modalUpload')[0].style.display = 'block';

  const yearDrop = document.getElementById('dataYear');

  if (yearDrop.childNodes.length == 0) {
    for (let i = 0; i < 29; i++) {
      let yr = 2022 + i;
      yearDrop.appendChild(new Option(yr, yr));
    }
    yearDrop.value = new Date().getFullYear();
  }
}

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
      if (data.slice(0, 26) != 'Month,Day,Date,Hour,Minute') {
        $('#uploadError')[0].innerText = "Incorrect column headers."
      }
      else {
        d3.select('#main').remove();

        document.getElementById('verticalSpans').innerHTML = '';
        document.getElementById('vmins').value = 60;
        document.getElementById('labelvmins').innerHTML = `60 minutes`;

        document.getElementById('verticalBlanks').innerHTML = '';
        document.getElementById('blank').value = 75;
        document.getElementById('labelBlank').innerHTML = '>= 75th pctl.';

        d3.select('#lineGraph').remove();

        year = parseInt(document.getElementById('dataYear').value);
        const leap = (year % 100 == 0) ? (year % 400 == 0) : (year % 4 == 0);

        if (leap) {
          DAYS = 366;
          monthMarks = [0, 31, 60, 91, 121, 152, 182, 213, 244, 274, 305, 335];
          monthLengths = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
        }

        pieces = [];
        objs = [];
        gaps = [];
        dayLine = [];
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
        graphed = false;
        colored = true;

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
    }
  });
}

toggleColor = () => {
  if (colored) { d3.selectAll('circle').style('fill', '#FFFFFF'); }
  else {
    const circles = d3.selectAll('circle')._groups[0];
    for (circle of circles) {
      circle.attributes.style.value = colors[circle.__data__.month];
    }
  }
  colored = !colored;
}

parseRow = (row) => {
  const r = row.data;

  if (r.Date >= 1 && r.Date <= 31 && r.Day in days && r.Hour >= 0 && r.Hour <= 23 && r.Minute >= 0 && r.Minute <= 59 && r.Month in months) {
    const x = (days[r.Day] * SMALLX) + (r.Hour * 60) + r.Minute;
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

    const d = new Date(YEAR, months[r.Month], r.Date, r.Hour, r.Minute);

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
  else {
    $('#uploadError')[0].innerText = `Error on row ${total} (0-index, excluding headers).`;
  }
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

  let xMax = SMALLX;
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
        bar.attributes.fill.value = '#FFFFFF'
      }
    }
  }

  let dayBars = $('#dayBar')[0].children;
  if (dayBars.length > 0) {
    for (bar of dayBars) {
      if (bar.nodeName == 'rect') {
        bar.attributes.fill.value = '#FFFFFF'
      }
    }
  }

  filteredPieces = [];

  if (daySelected == 'Week' && monthSelected == 'Year') {
    filteredPieces = JSON.parse(JSON.stringify(pieces));

    const clearBtns = document.getElementsByClassName('clear');
    clearBtns[0].disabled = false;
    clearBtns[1].disabled = false;
    document.getElementById('vmins').disabled = false;
    document.getElementById('blank').disabled = false;
  }
  if (daySelected == 'Week') {
    xMax = BIGX;
    xTickValues = [0, 1440, 2880, 4320, 5760, 7200, 8640, 10080];
    xTickFormat = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday', 'NWE'];
  }
  if (monthSelected == 'Year') {
    yMax = DAYS;
    yTickValues = [1, 31, 60, 91, 121, 152, 182, 213, 244, 274, 305, 335, 366];
    yTickFormat = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December', 'NYE'];
  }
  if (daySelected != 'Week' || monthSelected != 'Year') {

    const clearBtns = document.getElementsByClassName('clear');
    clearBtns[0].disabled = true;
    clearBtns[1].disabled = true;
    document.getElementById('vmins').disabled = true;
    document.getElementById('blank').disabled = true;

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
          .style('left', () => {
            if (d.x < 100) { return (event.pageX + 'px'); }
            else { return (event.pageX - 48.5 + 'px'); }
          })
          .style('top', () => {
            if (d.y < 150) { return (event.pageY + 25 + 'px'); }
            else { return (event.pageY - 100 + 'px'); }
          })

      const dt = (d.target.__data__);

      const hour = dt.hour.toString().length == 1 ? '0'.concat(dt.hour) : dt.hour;
      const minute = dt.minute.toString().length == 1 ? '0'.concat(dt.minute) : dt.minute;

      $('#date').html(`<text>${dt.day}</text><br><text>${dt.month} ${dt.date}</text><br><text>${hour}:${minute}</text>`);

     })
     .on('mouseout', () => { d3.select('#tooltip').style('visibility', 'hidden') })

     for (obj of objs) {
       let c = obj.count;
       if (c in dayFreqCounts) { dayFreqCounts[c] += 1; }
       else { dayFreqCounts[c] = 1; }
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
      const d1 = new Date(YEAR, months[p1.month], p1.date, p1.hour, p1.minute);
      const d2 = new Date(YEAR, months[p2.month], p2.date, p2.hour, p2.minute);

      const interval = d2 - d1;
      if (interval < shortest) {
        shortest = interval;
      }
      else if (interval > longest) {
        longest = interval;
      }
    }
    $('#shortest')[0].innerHTML = `${(shortest / 60000)} minutes`;

    const longDays = Math.floor(longest / MILLI);
    const longHours = Math.floor((longest - (longDays * MILLI)) / 3600000);
    const longMinutes = Math.floor((longest - ((longDays * MILLI) + (longHours * 3600000))) / 60000);

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
    charted = true;
  }
}

graphs = () => {
  if (graphed == false) {
    line(false);
    graphed = true;
  }
}

window.onresize = () => { line(true); };

line = (flag) => {
  const xWidth = window.innerWidth * 0.675;

  if (flag) { d3.select('#lineGraph').remove(); }
  // first time
  else {
    let d = new Date(YEAR, 0, 1);

    let index = 0;
    let zeroes = 0;

    for (let i = 0; i < objs.length; i++) {
      let obj = objs[index];
      let date = d.toLocaleString('en-US', { day: 'numeric', month: 'long' });

      if (obj.day == date) {
        dayLine.push({ day: new Date(d3.timeParse('%B %d')(obj.day).setYear(YEAR)), value: obj.count });
        index++;
      }
      else {
        dayLine.push({ day: new Date(d3.timeParse('%B %d')(date).setYear(YEAR)), value: 0 });
        zeroes++;
        i--;
      }
      d.setDate(d.getDate() + 1);
    }

    dayFreqCounts[0] = zeroes;
    freqPie();
  }

  d3.select('#lineBox')
    .append('svg')
    .attr('id', 'lineGraph')
    .attr('width', xWidth)
    .attr('height', 125);

  const svg = d3.select('#lineGraph');

  const x = d3.scaleTime()
      .domain(d3.extent(dayLine, (d) => d.day))
      .rangeRound([3, xWidth - 3]);

  const y = d3.scaleLinear()
      .domain(d3.extent(dayLine, (d) => d.value))
      .rangeRound([122, 3]);

  const line = d3.line()
      .x((d) => x(d.day))
      .y((d) => y(d.value))

  svg.append('path')
      .datum(dayLine)
      .attr('fill', 'none')
      .attr('stroke', 'white')
      .attr('stroke-width', 1)
      .attr('d', line);

  svg.selectAll('crap')
    .data(dayLine)
    .enter()
    .append('circle')
    .attr('x', (d) => d.day)
    .attr('y', (d) => d.value)
    .attr('cx', (d) => x(d.day))
    .attr('cy', (d) => y(d.value))
    .attr('r', 3)
    .attr('fill', '#FFFFFF03')
    .on('mouseover', (d) => {
        d3.select('#tooltip')
           .style('visibility', 'visible')
           .style('left', () => event.pageX - 48.5 + 'px')
           .style('top', () => event.pageY - 100 + 'px');

        const labels = d.target.attributes;
        const labelDate = new Date(labels.x.value);

        $('#date').html(`<text>${labels.y.value}x:</text><br><text>${daysForLineChart[labelDate.getDay()]}</text><br><text>${monthsForLineChart[labelDate.getMonth()]}</text><br><text>${labelDate.getDate()}</text>`)})
    .on('mouseout', () => { d3.select('#tooltip').style('visibility', 'hidden') });
}

monthBars = () => {
  let bars = d3.select('#monthBar');

  let x = d3.scaleBand()
    .range([0, 300])
    .domain(monthFreqs.map((d) => d.month))
    .padding(0.25);

  bars.append('g')
    .call(d3.axisBottom(x))
    .selectAll('text')
    .attr("transform", "translate(-13,10)rotate(-90)")
    .style("text-anchor", "end");

  let y = d3.scaleLinear()
    .range([130, 0])
    .domain([0, 130]);

  bars.append('g')
    .call(d3.axisLeft(y));

  // bars
  bars.selectAll('bar')
    .data(monthFreqs)
    .enter()
    .append('rect')
    .attr('id', (d) => d.month)
    .attr('x', (d) => x(d.month))
    .attr('y', (d) => y(d.freq))
    .attr('width', x.bandwidth())
    .attr('height', (d) => 150 - y(d.freq))
    .attr('fill', '#FFFFFF')

  if (monthSelected != 'Year') {
    document.getElementById(monthSelected).attributes.fill.value = '#808080';
  }

  // labels
  bars.selectAll('bar')
    .data(monthFreqs)
    .enter()
    .append('text')
    .attr('x', (d) => x(d.month) + (x.bandwidth() / 6))
    .attr('class', 'barLabels')
    .attr('y', (d) => y(d.freq) - 3)
    .attr('fill', '#FFFFFF')
    .text((d) => d.freq)
}

dayBars = () => {
  let bars = d3.select('#dayBar');

  let x = d3.scaleBand()
    .range([0, 300])
    .domain(dayFreqs.map((d) => d.day))
    .padding(0.25);

  bars.append('g')
    .call(d3.axisBottom(x))
    .selectAll('text')
    .attr("transform", "translate(-13,10)rotate(-90)")
    .style("text-anchor", "end");

  let y = d3.scaleLinear()
    .range([160, 0])
    .domain([0, 160]);

  bars.append('g')
    .call(d3.axisLeft(y));

  // bars
  bars.selectAll('bar')
    .data(dayFreqs)
    .enter()
    .append('rect')
    .attr('id', (d) => d.day)
    .attr('x', (d) => x(d.day))
    .attr('y', (d) => y(d.freq))
    .attr('width', x.bandwidth())
    .attr('height', (d) => 150 - y(d.freq))
    .attr('fill', '#FFFFFF')

  if (daySelected != 'Week') {
    document.getElementById(daySelected).attributes.fill.value = '#808080';
  }

  // labels
  bars.selectAll('bar')
    .data(dayFreqs)
    .enter()
    .append('text')
    .attr('x', (d) => x(d.day) + (x.bandwidth() / 4))
    .attr('class', 'barLabels')
    .attr('y', (d) => y(d.freq) - 3)
    .attr('fill', '#FFFFFF')
    .text((d) => d.freq)
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
  document.getElementById('labelBlank').innerHTML = `>= ${val}th pctl.`;

  const blankKeys = {};
  for (piece of pieces) { blankKeys[piece.x] = piece.x; }
  const blanks = Object.values(blankKeys).sort((a, b) => a - b);
  const numBlankKeys = blanks.length;

  let blankSpans = [];
  let longestBlank = 0;

  for (let i = 0; i < numBlankKeys - 1; i++) {
    let blankGap = blanks[i + 1] - blanks[i];
    blankSpans.push(blankGap);
    if (blankGap > longestBlank) { longestBlank = blankGap; }
  }

  const lastBlankGap = blanks[0] + (BIGX - blanks[numBlankKeys - 1]);
  blankSpans.push(lastBlankGap);
  if (lastBlankGap > longestBlank) { longestBlank = blankGap; }

  blankSpans = blankSpans.filter((item, index) => blankSpans.indexOf(item) === index);
  blankSpans.sort((a, b) => a - b);

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
      .style('fill', '#008AD8')
      .style('opacity', 0.1);

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
      let minX = BIGX;
      let maxX = -1;
      for (p in currV) {
        if (currV[p].x < minX) { minX = currV[p].x; }
        if (currV[p].x > maxX) { maxX = currV[p].x; }
      }
      if (maxX - minX == val) { largestVert = l; }
    }
  }

  d3.selectAll('circle').style('opacity', 0.25);
  d3.selectAll('.verticals').remove();

  xScale = d3.scaleLinear().domain([0, BIGX]).range([padding, w - 15]);

  const ranges = [];

  for (v in vals) {
    if (vals[v].length == largestVert) {
      let minX = BIGX;
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

clearBlanks = () => {
  d3.selectAll('.blanks').remove();
  $('#modalVerticals')[0].style.display = 'none';
}
