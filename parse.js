Papa.parse('data.csv', {
  download: true,
  header: true,
  dynamicTyping: true,
  skipEmptyLines: true,
  step: (row) => parseRow(row),
  complete: () => {
    d3.select('body').append('svg').attr('id', 'main').attr('width', w).attr('height', h);
    scale(false);
  }
});
