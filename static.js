const w = 1250;
const h = 725;
const padding = 60;
let pieces = [];
let objs = [];
let gaps = [];
let dayLine = [];
let dayFreqs = [{'day': 'Monday', 'abb': 'M', 'freq': 0},{'day': 'Tuesday', 'abb': 'T', 'freq': 0},{'day': 'Wednesday', 'abb': 'W', 'freq': 0},{'day': 'Thursday', 'abb': 'Th', 'freq': 0},{'day': 'Friday', 'abb': 'F', 'freq': 0},{'day': 'Saturday', 'abb': 'S', 'freq': 0},{'day': 'Sunday', 'abb': 'Su', 'freq': 0}];
let monthFreqs = [{'month': 'January', 'freq': 0},{'month': 'February', 'freq': 0},{'month': 'March', 'freq': 0},{'month': 'April', 'freq': 0},{'month': 'May', 'freq': 0},{'month': 'June', 'freq': 0},{'month': 'July', 'freq': 0},{'month': 'August', 'freq': 0},{'month': 'September', 'freq': 0},{'month': 'October', 'freq': 0},{'month': 'November', 'freq': 0},{'month': 'December', 'freq': 0}];
let count = 0;
let lastD = null;
let yesterday = '';
let uniqueDays = 0;
let filteredPieces = [];
let xScale, yScale;
let monthSelected, daySelected;
let busyDays = '';
let busiest = 0;
let total = 0;
let dayFreqCounts = {};
let analyzed = false;
let charted = false;
let graphed = false;
let colored = true;
let viewingLine = false;

const BIGX = 10080;
const SMALLX = 1440;
const MILLI = 86400000;

let YEAR = 2022;
let DAYS = 365;

const months = { 'January': 0, 'February': 1, 'March': 2, 'April': 3, 'May': 4, 'June': 5, 'July': 6, 'August': 7, 'September': 8, 'October': 9, 'November': 10, 'December': 11};
const days = { 'Monday': 0, 'Tuesday': 1, 'Wednesday': 2, 'Thursday': 3, 'Friday': 4, 'Saturday': 5, 'Sunday': 6 };

let monthMarks = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334];
let monthLengths = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

const daysForVerticals = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const daysForLineChart = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const monthsForLineChart = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

const colors = {
  'January': '#f4c8bd',
  'February': '#abaccb',
  'March': '#a9d193',
  'April': '#e9bacc',
  'May': '#a0bfdc',
  'June': '#d5e4ad',
  'July': '#d1a9b1',
  'August': '#97ccdc',
  'September': '#f9eeae',
  'October': '#b599c1',
  'November': '#84c4b4',
  'December': '#f5c47B'
};
