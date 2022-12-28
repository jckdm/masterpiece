Papa.parse('data.csv', {
  download: true,
  header: true,
  dynamicTyping: true,
  skipEmptyLines: true,
  step: (row) => parseRow(row),
  complete: () => {
    // create main svg
    d3.select('body').append('svg').attr('id', 'main').attr('width', w).attr('height', h);
    // initialize scatterplot but don't append data yet
    scale(false);
  }
});
