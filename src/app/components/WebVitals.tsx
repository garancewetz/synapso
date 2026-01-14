'use client';

import { useEffect } from 'react';
import { onCLS, onFID, onFCP, onLCP, onTTFB, onINP, Metric } from 'web-vitals';

type WebVitalsReport = {
  name: string;
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
  delta: number;
  id: string;
};

/**
 * Composant pour mesurer et reporter les Core Web Vitals
 * 
 * ⚡ PERFORMANCE: Mesure les métriques de performance essentielles pour mobile
 * - LCP (Largest Contentful Paint) : < 2.5s (good)
 * - FID (First Input Delay) : < 100ms (good)
 * - CLS (Cumulative Layout Shift) : < 0.1 (good)
 * - FCP (First Contentful Paint) : < 1.8s (good)
 * - TTFB (Time to First Byte) : < 800ms (good)
 * - INP (Interaction to Next Paint) : < 200ms (good)
 */
export function WebVitals() {
  useEffect(() => {
    const reportMetric = (metric: Metric) => {
      // En développement, afficher dans la console
      if (process.env.NODE_ENV === 'development') {
        const report: WebVitalsReport = {
          name: metric.name,
          value: metric.value,
          rating: metric.rating as 'good' | 'needs-improvement' | 'poor',
          delta: metric.delta,
          id: metric.id,
        };
        
        // Afficher avec un emoji selon la performance
        const emoji = report.rating === 'good' ? '✅' : report.rating === 'needs-improvement' ? '⚠️' : '❌';
        console.log(`${emoji} [Web Vitals] ${report.name}: ${Math.round(report.value)}ms (${report.rating})`);
      }

      // En production, on pourrait envoyer à un service d'analytics
      // Exemple avec Google Analytics :
      // if (typeof window !== 'undefined' && (window as any).gtag) {
      //   (window as any).gtag('event', metric.name, {
      //     value: Math.round(metric.value),
      //     metric_id: metric.id,
      //     metric_value: metric.value,
      //     metric_delta: metric.delta,
      //   });
      // }
    };

    // Mesurer toutes les métriques Core Web Vitals
    onCLS(reportMetric);
    onFID(reportMetric);
    onFCP(reportMetric);
    onLCP(reportMetric);
    onTTFB(reportMetric);
    onINP(reportMetric);
  }, []);

  return null;
}

