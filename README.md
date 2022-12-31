# Masterpiece

## Overview
Masterpiece is a data visualization and analysis tool that identifies patterns in data of a user's habits.

Inspired by the idea of a New Year's Resolution, Masterpiece considers data within the window of one year, and frames it within the cycle of a week, allowing users to understand their habits in relation to time at large.

## Philosophy

Masterpiece is also an experiment in recognizing the bias that is implicitly packaged together with self-reported data. This bias is created in a self-fulfilling prophecy that is inextricable from manual data entry: as time progresses and data is recorded, an individual becomes accustomed to, self-aware of, and eventually hyper-aware of the habit they are tracking. `And what is the relationship between my simultaneous creation of the tool, and the data that feeds it?`

The effect is almost Pavlovian as the feeling of performing a habit becomes a necessary precursor to the feeling of recording that habit as data. By extension, it is not unreasonable to think that the order of events might flip: `could an individual perform a habit for the pleasure of recording it?` `Might an individual avoid performing a habit in order to modify the data to their liking?` Perhaps it is inevitable that as we become closer with our data, we become farther from ourselves.

`Is data any more honest, then, when it is automated?` Automation can be inaccurate, `but is it any worse than the effects of our human biases?` One year into this experiment, I find myself stuck with (what I hope is a false) binary: imperfect (and human-designed) automation, or increasingly biased self-reported data. There may not be a Goldilocks option, and I'm beginning to think that it may be impossible to collect unbiased data about the self when the very act of recording data is a form of passive data analysis.

## User Guide

### Filters
#### Year/Month
Allows a user to segment the data by an individual month, or all 12. Horizontal segmentation.

#### Week/Day
Allows a user to segment the data by an individual day, or all 7. Vertical segmentation.

### Tabs
#### count
Total count (Total number of data points), Active days (Total unique days with data), Busiest day(s) (One or more days that have the highest frequency of data), Shortest gap (Smallest amount of time between two data points), Median gap (median amount of time between two data points), Longest gap (largest amount of time between two data points)

#### visualize i
Instances Per Month (Group and count data frequency per month), Instances Per Day of Week (Group and count data frequency per day). When filtering on a Month or Day, the chosen bar(s) will highlight.

#### visualize ii
Frequency Per Day, as Percentages of the Year (Count number of days with a given data frequency, sorted in descending order), Frequency Per Day (Count frequency per day, interpolate between days, no axes so the shape can be appreciated)

#### analyze
Busiest Ranges (What is the X-minute period of the week that has the most data points, relative to all other X-minute periods?), Longest Interstices (What are the X-percentile longest periods of the week with no data, relative to all periods with no data?)

#### color
Toggles between color-coding data points by month, and all white.

#### thoughts
No user interaction.

#### data
Upload a .csv file with headers: Month,Day,Date,Hour,Minute. In the sample data file, all minutes are rounded to 0/5. Selecting the data year allows for the program to determine whether or not a year is a leap year.
