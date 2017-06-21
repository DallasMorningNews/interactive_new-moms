/* global window: true */

import $ from 'jquery';
import * as d3 from 'd3';
import d3tip from 'd3-tip';
import _ from 'lodash';


const leastSquares = (xSeries, ySeries) => {
  const xyObj = _.zipObject(xSeries, ySeries);

  const xMean = _.mean(xSeries);
  const yMean = _.mean(ySeries);

  const mNumerator = _.reduce(xyObj, (sum, value, key) => sum + ((key - xMean) * (value - yMean)),
    0);
  const mDemoninator = _.reduce(xSeries, (sum, n) => sum + (Math.pow(n - xMean, 2)), 0);

  const m = mNumerator / mDemoninator;
  const b = yMean - (m * xMean);

  return [m, b];
};

$(() => {
  const windowWidth = $(window).width();
  let fullWidth;
  let fullHeight;

  // responsive
  if (windowWidth >= 650) {
    fullWidth = 600;
    fullHeight = 290;
  } else if (windowWidth <= 350) {
    fullWidth = 290;
    fullHeight = 290;
  } else {
    fullWidth = windowWidth - 50;
    fullHeight = fullWidth - 50;
  }

  const margin = { top: 30, right: 20, bottom: 40, left: 40 };
  const width = fullWidth - margin.left - margin.right;
  const height = fullHeight - margin.top - margin.bottom;

  const x = d3.scaleLinear()
      .range([0, width]);

  const y = d3.scaleLinear()
      .range([height, 0]);

  const svg = d3.select('#tarrantscatter')
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
    .append('g')
      .attr('transform', `translate(${margin.left}, ${margin.top})`);

  const parseTime = d3.timeParse('%d-%m-%Y');
  const parseMonth = d3.timeParse('%m');

  // tooltip
  const tip = d3tip()
    .attr('class', 'd3tip')
    .offset(() => {
      const coords = d3.mouse(svg.node());
      if (coords[0] < 100) {
        return [-10, 100];
      } else if (coords[0] < fullWidth - 50 && coords[0] > fullWidth - 150) {
        return [-10, -100];
      } else if (coords[1] < 50) {
        return [80, 0];
      }
      return [-10, 0];
    })
    .html(d => `<span class="tip-date">${d3.timeFormat('%b')(parseMonth(d.month))} ${d.year}</span>
    <strong>Percent female: </strong><br /> <span class="fem-perct">${d3.format('.1%')(d.percFemale)}</span><strong>Total inmates: </strong> ${d3.format(',')(d.totalInmates)}`);
  svg.call(tip);

  // data
  d3.csv('assets/tarrant.csv', (t) => {
    const d = t;
    d.femaleInmates = +d.femaleInmates;
    d.totalInmates = +d.femaleInmates + +d.maleInmates;
    d.percFemale = d.perc_f;
    d.date = parseTime(`01-${d.month}-${d.year}`);
    return d;
  }, (error, data) => {
    if (error) throw error;

    x.domain([new Date(2011, 0, 1), new Date(2017, 0, 1)]);
    y.domain([0, 0.20]);

    // x and y axes
    svg.append('g')
        .attr('class', 'axis')
        .attr('transform', `translate(0, ${height})`)
        .call(d3.axisBottom(x)
          .tickValues([new Date(2011, 0, 1), new Date(2012, 0, 1),
            new Date(2013, 0, 1), new Date(2014, 0, 1), new Date(2015, 0, 1),
            new Date(2016, 0, 1), new Date(2017, 0, 1)])
          .tickFormat(d3.timeFormat('%Y')));

    svg.append('g')
        .attr('class', 'y axis')
        .call(d3.axisLeft(y)
          .tickValues([0.0, 0.05, 0.10, 0.15, 0.20])
          .tickFormat(d3.format('.0%'))
          .tickSizeInner(-width)
          .tickSizeOuter(0))
      .append('text')
        .attr('class', 'axis-title')
        .attr('x', -40)
        .attr('y', -20)
        .attr('dy', '.71em')
        .style('text-anchor', 'start')
        .text('Percent female inmates');

    svg.selectAll('.dot')
        .data(data)
      .enter().append('circle')
        .attr('class', 'dot')
        .attr('r', 5)
        .attr('cx', d => x(d.date))
        .attr('cy', d => y(d.percFemale))
        .on('mouseover', tip.show)
        .on('mouseout', tip.hide);

    // add trendline
    const xSeries = data.map(d => +d.date);
    const ySeries = data.map(d => +d.perc_f);

    const coeff = leastSquares(xSeries, ySeries);
    // console.log(xDates)
    svg.append('line')
      .attr('class', 'trendline')
      .attr('x1', x(xSeries[0]))
      .attr('y1', y((coeff[0] * xSeries[0]) + coeff[1]))
      .attr('x2', x(xSeries[xSeries.length - 1]))
      .attr('y2', y((coeff[0] * xSeries[xSeries.length - 1]) + coeff[1]));
  });

  d3.selection.prototype.moveToFront = () =>
    this.each(() => {
      this.parentNode.appendChild(this);
    });
});
