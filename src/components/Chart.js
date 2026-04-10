'use client';
import { useEffect, useRef, useState } from 'react';
import { createChart, CandlestickSeries, LineSeries, createSeriesMarkers } from 'lightweight-charts';

// Component receives full OHLC data
export default function Chart({ data, setTrendInfo }) {
  const chartContainerRef = useRef();
  const [chartInstance, setChartInstance] = useState(null);

  useEffect(() => {
    if (!chartContainerRef.current || !data || data.length === 0) return;

    // Calculate HILO logic
    // Period = 5
    const period = 5;
    let isBullish = true; // Assume bullish initially
    
    const hiloLineData = [];
    const markersData = [];
    let latestSignal = null;

    for (let i = 0; i < data.length; i++) {
      if (i < period) {
        hiloLineData.push({ time: data[i].time, value: data[i].low }); // Default
        continue;
      }

      // Calculate 3-period High SMA and Low SMA
      let sumHigh = 0;
      let sumLow = 0;
      for (let j = i - period; j < i; j++) {
        sumHigh += data[j].high;
        sumLow += data[j].low;
      }
      const highSMA = sumHigh / period;
      const lowSMA = sumLow / period;

      const currentClose = data[i].close;

      if (isBullish) {
        if (currentClose < lowSMA) {
          isBullish = false;
          markersData.push({
            time: data[i].time,
            position: 'aboveBar',
            color: '#ef4444',
            shape: 'arrowDown',
            text: 'SELL',
          });
          latestSignal = { type: 'Sell', date: data[i].time, price: currentClose };
        }
      } else {
        if (currentClose > highSMA) {
          isBullish = true;
          markersData.push({
            time: data[i].time,
            position: 'belowBar',
            color: '#10b981',
            shape: 'arrowUp',
            text: 'BUY',
          });
          latestSignal = { type: 'Buy', date: data[i].time, price: currentClose };
        }
      }

      // If bullish, plot Low SMA (support). If bearish, plot High SMA (resistance).
      hiloLineData.push({
        time: data[i].time,
        value: isBullish ? lowSMA : highSMA
      });
    }

    // Pass back latest trend info
    if (setTrendInfo) {
      setTrendInfo({
        isBullish,
        latestSignal,
      });
    }

    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { color: 'transparent' },
        textColor: '#8b92a5',
      },
      grid: {
        vertLines: { color: 'rgba(42, 46, 57, 0.5)' },
        horzLines: { color: 'rgba(42, 46, 57, 0.5)' },
      },
      timeScale: {
        borderColor: 'rgba(42, 46, 57, 0.5)',
      },
      width: chartContainerRef.current.clientWidth || 600,
      height: 400,
    });

    const candlestickSeries = chart.addSeries(CandlestickSeries, {
      upColor: '#10b981',
      downColor: '#ef4444',
      borderVisible: false,
      wickUpColor: '#10b981',
      wickDownColor: '#ef4444'
    });
    candlestickSeries.setData(data);
    createSeriesMarkers(candlestickSeries, markersData);

    const hiloSeries = chart.addSeries(LineSeries, {
      color: '#3b82f6',
      lineWidth: 2,
    });
    hiloSeries.setData(hiloLineData);

    chart.timeScale().fitContent();
    setChartInstance(chart);

    const handleResize = () => {
      chart.applyOptions({ width: chartContainerRef.current.clientWidth });
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      chart.remove();
    };
  }, [data]);

  return (
    <div ref={chartContainerRef} style={{ width: '100%', height: '400px' }} />
  );
}
